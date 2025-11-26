/**
 * Live Quotes Service
 * Fetches real-time price quotes for multiple symbols in parallel
 */

import { YahooFinanceClient } from '../_shared/yahoo-finance.ts';

export interface LiveQuote {
  price: number;
  change: number;
  changePercent: number;
}

export type LiveQuotesResult = Record<string, LiveQuote>;

/**
 * Live Quotes Service
 * Handles fetching live quotes for multiple symbols
 */
export class LiveQuotesService {
  private yahooClient: YahooFinanceClient;

  constructor() {
    this.yahooClient = new YahooFinanceClient();
  }

  /**
   * Fetch live quotes for multiple symbols in parallel
   */
  async fetchLiveQuotes(symbols: string[]): Promise<LiveQuotesResult> {
    const results: LiveQuotesResult = {};

    // Fetch in parallel with error handling per symbol
    await Promise.all(
      symbols.map(async (symbol) => {
        try {
          const quote = await this.fetchQuoteForSymbol(symbol);
          if (quote) {
            results[symbol] = quote;
          }
        } catch (error) {
          console.error(`Error fetching quote for ${symbol}:`, error);
          // Continue with other symbols even if one fails
        }
      })
    );

    return results;
  }

  /**
   * Fetch quote for a single symbol
   * @private
   */
  private async fetchQuoteForSymbol(
    symbol: string
  ): Promise<LiveQuote | null> {
    try {
      const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(
        symbol
      )}`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Finarian App)' },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      const result = data?.chart?.result?.[0];
      const meta = result?.meta;

      if (!meta) {
        return null;
      }

      const price = meta.regularMarketPrice;
      const prevClose = meta.previousClose || meta.chartPreviousClose;

      if (typeof price === 'number' && typeof prevClose === 'number') {
        const change = price - prevClose;
        const changePercent = (change / prevClose) * 100;

        return {
          price,
          change,
          changePercent,
        };
      }

      return null;
    } catch (error) {
      console.error(`Failed to fetch quote for ${symbol}:`, error);
      return null;
    }
  }
}
