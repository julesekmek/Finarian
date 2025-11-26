/**
 * Price Update Service
 * Business logic for updating asset prices from Yahoo Finance
 */

import { SupabaseClient } from 'jsr:@supabase/supabase-js@2';
import { YahooFinanceClient } from '../_shared/yahoo-finance.ts';
import {
  fetchAssets,
  updateAssetPrice,
  getPreviousDayPrice,
  batchUpsertHistory,
  convertToHistoryRecords,
} from '../_shared/database.ts';
import { CONSTANTS } from '../_shared/constants.ts';
import { getTodayDate } from '../_shared/date-utils.ts';

export interface PriceUpdate {
  id: string;
  symbol: string;
  price: number;
  user_id: string;
}

export interface UpdateResult {
  message: string;
  updated: number;
  failed: number;
  details: {
    successes: Array<{ symbol: string; price: number }>;
    failures?: Array<{ id: string; symbol: string; reason: string }>;
  };
}

/**
 * Price Update Service
 * Handles batch price updates for all assets
 */
export class PriceUpdateService {
  private yahooClient: YahooFinanceClient;

  constructor() {
    this.yahooClient = new YahooFinanceClient();
  }

  /**
   * Update prices for all assets (or specific user's assets)
   */
  async updateAllPrices(
    supabase: SupabaseClient,
    userId?: string | null
  ): Promise<UpdateResult> {
    // Fetch assets
    const assets = await fetchAssets(supabase, userId);

    if (assets.length === 0) {
      return {
        message: 'No assets found',
        updated: 0,
        failed: 0,
        details: {
          successes: [],
        },
      };
    }

    console.log(`Found ${assets.length} assets to update`);

    // Fetch prices for all assets
    const updates: PriceUpdate[] = [];
    const failures: Array<{ id: string; symbol: string; reason: string }> = [];

    for (const asset of assets) {
      try {
        const price = await this.fetchPriceForAsset(supabase, asset);

        if (price !== null && price > 0) {
          updates.push({
            id: asset.id,
            symbol: asset.symbol || asset.name,
            price,
            user_id: asset.user_id,
          });
        } else {
          failures.push({
            id: asset.id,
            symbol: asset.symbol || asset.name,
            reason: 'No valid price found',
          });
        }
      } catch (error) {
        failures.push({
          id: asset.id,
          symbol: asset.symbol || asset.name,
          reason: error instanceof Error ? error.message : 'Unknown error',
        });
      }

      // Rate limiting delay
      await new Promise((resolve) =>
        setTimeout(resolve, CONSTANTS.RATE_LIMIT_DELAY_MS)
      );
    }

    // Batch update assets and history
    if (updates.length > 0) {
      await this.batchUpdateAssets(supabase, updates);
    }

    return {
      message: 'Price update completed',
      updated: updates.length,
      failed: failures.length,
      details: {
        successes: updates.map((u) => ({ symbol: u.symbol, price: u.price })),
        failures: failures.length > 0 ? failures : undefined,
      },
    };
  }

  /**
   * Fetch price for a single asset
   * @private
   */
  private async fetchPriceForAsset(
    supabase: SupabaseClient,
    asset: any
  ): Promise<number | null> {
    if (asset.symbol) {
      // Market asset: fetch from Yahoo Finance
      console.log(`Fetching price for ${asset.symbol}...`);
      return await this.yahooClient.fetchCurrentPrice(asset.symbol);
    } else {
      // Savings asset: use previous day's price
      console.log(`Using previous day price for ${asset.name}...`);
      const previousPrice = await getPreviousDayPrice(supabase, asset.id);

      if (previousPrice !== null) {
        return previousPrice;
      }

      // Fallback: use current_price
      console.warn(`No previous price found for ${asset.name}, using current_price`);
      return asset.current_price;
    }
  }

  /**
   * Batch update assets and insert history records
   * @private
   */
  private async batchUpdateAssets(
    supabase: SupabaseClient,
    updates: PriceUpdate[]
  ): Promise<void> {
    const today = getTodayDate();
    const failures: string[] = [];

    // Update assets and create history records
    for (const update of updates) {
      try {
        // Update asset price
        await updateAssetPrice(
          supabase,
          update.id,
          update.user_id,
          update.price
        );

        // Create history record
        const historyRecords = convertToHistoryRecords(
          update.id,
          update.user_id,
          [{ date: today, price: update.price }]
        );

        // Upsert history
        await batchUpsertHistory(supabase, historyRecords, 1);

        console.log(
          `✓ Updated ${update.symbol}: ${update.price} (daily snapshot recorded)`
        );
      } catch (error) {
        console.error(`Failed to update ${update.symbol}:`, error);
        failures.push(update.id);
      }
    }

    if (failures.length > 0) {
      console.warn(`Failed to update ${failures.length} assets`);
    }
  }
}
