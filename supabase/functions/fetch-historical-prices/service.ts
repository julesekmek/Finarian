/**
 * Historical Data Service
 * Business logic for fetching and storing historical asset prices
 */

import { SupabaseClient } from 'jsr:@supabase/supabase-js@2';
import { YahooFinanceClient } from '../_shared/yahoo-finance.ts';
import {
  HistoricalDataPoint,
  forwardFillWeekends,
  generateDateRange,
  getTodayDate,
  roundToDecimals,
} from '../_shared/date-utils.ts';
import {
  batchUpsertHistory,
  convertToHistoryRecords,
} from '../_shared/database.ts';
import { CONSTANTS } from '../_shared/constants.ts';
import { ExternalAPIError } from '../_shared/errors.ts';

export interface FetchHistoricalParams {
  assetId: string;
  userId: string;
  symbol?: string;
  referencePrice?: number;
  isUpdate?: boolean;
}

export interface FetchHistoricalResult {
  success: boolean;
  inserted: number;
  failed: number;
  totalPoints: number;
  source: string;
  message?: string;
}

/**
 * Historical Data Service
 * Handles fetching and storing historical price data
 */
export class HistoricalDataService {
  private yahooClient: YahooFinanceClient;

  constructor() {
    this.yahooClient = new YahooFinanceClient();
  }

  /**
   * Fetch and store historical data for an asset
   */
  async fetchAndStore(
    supabase: SupabaseClient,
    params: FetchHistoricalParams
  ): Promise<FetchHistoricalResult> {
    const { assetId, userId, symbol, referencePrice, isUpdate } = params;

    let finalData: HistoricalDataPoint[] = [];
    let dataSource = '';

    if (symbol) {
      // Market asset: fetch from Yahoo Finance
      const result = await this.fetchMarketAssetData(symbol);
      finalData = result.data;
      dataSource = result.source;

      if (finalData.length === 0) {
        return {
          success: false,
          message: 'No historical data available for this symbol',
          inserted: 0,
          failed: 0,
          totalPoints: 0,
          source: dataSource,
        };
      }
    } else if (referencePrice !== undefined) {
      // Savings asset: generate constant price data
      const result = this.generateSavingsAssetData(referencePrice, isUpdate);
      finalData = result.data;
      dataSource = result.source;
    } else {
      throw new Error('Either symbol or referencePrice must be provided');
    }

    // Convert to history records
    const records = convertToHistoryRecords(assetId, userId, finalData);

    // Batch upsert to database
    const { inserted, failed } = await batchUpsertHistory(supabase, records);

    console.log(
      `✓ Historical data import complete: ${inserted} inserted, ${failed} failed`
    );

    return {
      success: true,
      inserted,
      failed,
      totalPoints: finalData.length,
      source: dataSource,
    };
  }

  /**
   * Fetch historical data for a market asset (with symbol)
   * @private
   */
  private async fetchMarketAssetData(symbol: string): Promise<{
    data: HistoricalDataPoint[];
    source: string;
  }> {
    console.log(`Fetching historical data for market asset (${symbol})`);

    const startDate = new Date(CONSTANTS.YTD_START_DATE);
    const endDate = new Date();

    const rawData = await this.yahooClient.fetchHistoricalPrices(
      symbol,
      startDate,
      endDate
    );

    if (rawData.length === 0) {
      return {
        data: [],
        source: `Yahoo Finance (${symbol}) - no data`,
      };
    }

    // Fill weekends and gaps up to today
    const today = getTodayDate();
    const filledData = forwardFillWeekends(rawData, today);

    return {
      data: filledData,
      source: `Yahoo Finance (${symbol})`,
    };
  }

  /**
   * Generate historical data for a savings asset (no symbol)
   * @private
   */
  private generateSavingsAssetData(
    referencePrice: number,
    isUpdate?: boolean
  ): {
    data: HistoricalDataPoint[];
    source: string;
  } {
    const today = getTodayDate();
    const roundedPrice = roundToDecimals(referencePrice, CONSTANTS.PRICE_DECIMAL_PLACES);

    if (isUpdate) {
      // Modification: only update from today onwards (preserve historical values)
      console.log(
        `Updating savings asset from today with price ${roundedPrice}`
      );

      const allDates = generateDateRange(today, today);
      const data = allDates.map((date) => ({
        date,
        price: roundedPrice,
      }));

      return {
        data,
        source: `Constant price from today (${roundedPrice})`,
      };
    } else {
      // Creation: backfill entire YTD
      console.log(
        `Generating YTD historical data for savings asset with price ${roundedPrice}`
      );

      const allDates = generateDateRange(CONSTANTS.YTD_START_DATE, today);
      const data = allDates.map((date) => ({
        date,
        price: roundedPrice,
      }));

      return {
        data,
        source: `Constant price (${roundedPrice})`,
      };
    }
  }
}
