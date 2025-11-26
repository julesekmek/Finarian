/**
 * Database utility functions for Edge Functions
 * Handles batch operations and common database queries
 */

import { SupabaseClient } from 'jsr:@supabase/supabase-js@2';
import { CONSTANTS } from './constants.ts';
import { DatabaseError } from './errors.ts';
import { HistoricalDataPoint } from './date-utils.ts';

/**
 * History record for database insertion
 */
export interface HistoryRecord {
  asset_id: string;
  user_id: string;
  price: number;
  date: string;
  recorded_at: string;
}

/**
 * Batch upsert historical data into asset_history table
 * Uses batching to avoid overwhelming the database
 * 
 * @param supabase - Supabase client
 * @param records - Array of history records to upsert
 * @param batchSize - Number of records per batch (default: 50)
 * @returns Object with inserted and failed counts
 */
export async function batchUpsertHistory(
  supabase: SupabaseClient,
  records: HistoryRecord[],
  batchSize = CONSTANTS.BATCH_SIZE
): Promise<{ inserted: number; failed: number }> {
  let inserted = 0;
  let failed = 0;

  // Process in batches
  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize);

    try {
      const { error } = await supabase
        .from('asset_history')
        .upsert(batch, {
          onConflict: 'asset_id,date',
          ignoreDuplicates: false, // Update if exists
        });

      if (error) {
        console.error(`Batch upsert failed for records ${i}-${i + batch.length}:`, error);
        failed += batch.length;
      } else {
        inserted += batch.length;
      }
    } catch (error) {
      console.error(`Unexpected error during batch upsert:`, error);
      failed += batch.length;
    }
  }

  return { inserted, failed };
}

/**
 * Get the price from the previous day's asset_history
 * Used for assets without symbols (manual assets like real estate, savings, etc.)
 * 
 * @param supabase - Supabase client
 * @param assetId - Asset ID
 * @returns Previous day's price or null if not found
 */
export async function getPreviousDayPrice(
  supabase: SupabaseClient,
  assetId: string
): Promise<number | null> {
  try {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('asset_history')
      .select('price')
      .eq('asset_id', assetId)
      .eq('date', yesterdayStr)
      .single();

    if (error || !data) {
      console.warn(`No previous day price found for asset ${assetId}`);
      return null;
    }

    return data.price;
  } catch (error) {
    console.error(`Error fetching previous day price for ${assetId}:`, error);
    return null;
  }
}

/**
 * Convert historical data points to history records
 * 
 * @param assetId - Asset ID
 * @param userId - User ID
 * @param dataPoints - Array of historical data points
 * @returns Array of history records ready for database insertion
 */
export function convertToHistoryRecords(
  assetId: string,
  userId: string,
  dataPoints: HistoricalDataPoint[]
): HistoryRecord[] {
  const recordedAt = new Date().toISOString();

  return dataPoints.map((point) => ({
    asset_id: assetId,
    user_id: userId,
    price: point.price,
    date: point.date,
    recorded_at: recordedAt,
  }));
}

/**
 * Fetch all assets for a user (or all users if service role)
 * 
 * @param supabase - Supabase client
 * @param userId - User ID (optional, if null fetches all)
 * @returns Array of assets
 */
export async function fetchAssets(
  supabase: SupabaseClient,
  userId?: string | null
): Promise<any[]> {
  try {
    let query = supabase
      .from('assets')
      .select('id, symbol, name, current_price, user_id');

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;

    if (error) {
      throw new DatabaseError('Failed to fetch assets', { originalError: error.message });
    }

    return data || [];
  } catch (error) {
    if (error instanceof DatabaseError) {
      throw error;
    }
    throw new DatabaseError('Unexpected error fetching assets', {
      originalError: error instanceof Error ? error.message : String(error),
    });
  }
}

/**
 * Update asset price and last_updated timestamp
 * 
 * @param supabase - Supabase client
 * @param assetId - Asset ID
 * @param userId - User ID
 * @param price - New price
 */
export async function updateAssetPrice(
  supabase: SupabaseClient,
  assetId: string,
  userId: string,
  price: number
): Promise<void> {
  const { error } = await supabase
    .from('assets')
    .update({
      current_price: price,
      last_updated: new Date().toISOString(),
    })
    .eq('id', assetId)
    .eq('user_id', userId);

  if (error) {
    throw new DatabaseError(`Failed to update asset ${assetId}`, {
      assetId,
      userId,
      price,
      originalError: error.message,
    });
  }
}
