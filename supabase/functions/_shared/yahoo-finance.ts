/**
 * Yahoo Finance API client
 * Centralizes all interactions with Yahoo Finance API
 * Includes retry logic, error handling, and rate limiting
 */

import { CONSTANTS } from './constants.ts';
import { ExternalAPIError } from './errors.ts';
import { HistoricalDataPoint, roundToDecimals } from './date-utils.ts';

/**
 * Yahoo Finance API client with retry logic and error handling
 */
export class YahooFinanceClient {
  private readonly baseUrl = CONSTANTS.YAHOO_FINANCE_BASE_URL;
  private readonly userAgent = CONSTANTS.YAHOO_FINANCE_USER_AGENT;
  private readonly timeout = CONSTANTS.REQUEST_TIMEOUT_MS;
  private readonly maxRetries = CONSTANTS.MAX_RETRIES;
  private readonly retryDelay = CONSTANTS.RETRY_DELAY_MS;

  /**
   * Fetch current price for a symbol
   * @param symbol - Stock symbol (e.g., 'AAPL', 'BTC-USD')
   * @returns Current price or null if not available
   */
  async fetchCurrentPrice(symbol: string): Promise<number | null> {
    try {
      const url = `${this.baseUrl}/v8/finance/chart/${encodeURIComponent(symbol)}`;
      const data = await this.fetchWithRetry(url);

      const result = data?.chart?.result?.[0];
      const price = result?.meta?.regularMarketPrice;

      if (typeof price === 'number' && !isNaN(price) && price > 0) {
        return roundToDecimals(price, CONSTANTS.PRICE_DECIMAL_PLACES);
      }

      console.warn(`No valid price found for symbol: ${symbol}`);
      return null;
    } catch (error) {
      console.error(`Error fetching current price for ${symbol}:`, error);
      throw new ExternalAPIError(
        `Failed to fetch price for ${symbol}`,
        { symbol, originalError: error instanceof Error ? error.message : String(error) }
      );
    }
  }

  /**
   * Fetch historical prices for a symbol
   * @param symbol - Stock symbol
   * @param startDate - Start date
   * @param endDate - End date
   * @returns Array of historical data points
   */
  async fetchHistoricalPrices(
    symbol: string,
    startDate: Date,
    endDate: Date
  ): Promise<HistoricalDataPoint[]> {
    try {
      const period1 = Math.floor(startDate.getTime() / 1000);
      const period2 = Math.floor(endDate.getTime() / 1000);

      const url = `${this.baseUrl}/v8/finance/chart/${encodeURIComponent(
        symbol
      )}?period1=${period1}&period2=${period2}&interval=1d`;

      const data = await this.fetchWithRetry(url);
      const result = data?.chart?.result?.[0];

      if (!result) {
        console.warn(`No historical data found for: ${symbol}`);
        return [];
      }

      // Extract timestamps and closing prices
      const timestamps = result.timestamp || [];
      const closes = result.indicators?.quote?.[0]?.close || [];

      // Convert to our format
      const historicalData: HistoricalDataPoint[] = [];

      for (let i = 0; i < timestamps.length; i++) {
        const price = closes[i];

        // Skip null/invalid prices
        if (price === null || price === undefined || isNaN(price) || price <= 0) {
          continue;
        }

        // Convert timestamp to date string (YYYY-MM-DD)
        const date = new Date(timestamps[i] * 1000);
        const dateStr = date.toISOString().split('T')[0];

        historicalData.push({
          date: dateStr,
          price: roundToDecimals(price, CONSTANTS.PRICE_DECIMAL_PLACES),
        });
      }

      console.log(`✓ Fetched ${historicalData.length} historical points for ${symbol}`);
      return historicalData;
    } catch (error) {
      console.error(`Error fetching historical data for ${symbol}:`, error);
      throw new ExternalAPIError(
        `Failed to fetch historical data for ${symbol}`,
        { symbol, startDate, endDate, originalError: error instanceof Error ? error.message : String(error) }
      );
    }
  }

  /**
   * Fetch with retry logic and timeout
   * @private
   */
  private async fetchWithRetry(url: string, retries = this.maxRetries): Promise<any> {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        const response = await fetch(url, {
          headers: {
            'User-Agent': this.userAgent,
          },
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return await response.json();
      } catch (error) {
        const isLastAttempt = attempt === retries;
        
        if (isLastAttempt) {
          throw error;
        }

        // Wait before retrying (exponential backoff)
        const delay = this.retryDelay * Math.pow(2, attempt - 1);
        console.warn(`Attempt ${attempt} failed, retrying in ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    throw new Error('Max retries exceeded');
  }
}
