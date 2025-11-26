/**
 * Business logic for searching Yahoo Finance symbols
 * Provides autocomplete functionality for asset creation
 */

import { createClient } from 'jsr:@supabase/supabase-js@2';
import { YahooFinanceClient, SymbolSearchResult } from '../_shared/yahoo-finance.ts';
import { ValidationError } from '../_shared/errors.ts';

/**
 * Service for searching symbols on Yahoo Finance
 */
export class SymbolSearchService {
  private supabaseClient;
  private yahooClient: YahooFinanceClient;

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabaseClient = createClient(supabaseUrl, supabaseKey);
    this.yahooClient = new YahooFinanceClient();
  }

  /**
   * Search for symbols based on query
   * @param query - Search query string
   * @returns Array of symbol search results
   */
  async searchSymbols(query: string): Promise<SymbolSearchResult[]> {
    // Validate query
    if (!query || typeof query !== 'string') {
      throw new ValidationError('Query parameter is required', { query });
    }

    const trimmedQuery = query.trim();
    
    if (trimmedQuery.length === 0) {
      throw new ValidationError('Query cannot be empty', { query });
    }

    if (trimmedQuery.length > 100) {
      throw new ValidationError('Query is too long (max 100 characters)', { query });
    }

    // Search symbols via Yahoo Finance
    const results = await this.yahooClient.searchSymbols(trimmedQuery);

    return results;
  }
}
