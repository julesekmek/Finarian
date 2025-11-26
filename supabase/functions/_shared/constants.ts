/**
 * Shared constants for Edge Functions
 * Centralizes all magic numbers and configuration values
 */

export const CONSTANTS = {
  // Date configuration
  YTD_START_DATE: '2025-01-02',
  
  // Yahoo Finance API
  YAHOO_FINANCE_BASE_URL: 'https://query1.finance.yahoo.com',
  YAHOO_FINANCE_USER_AGENT: 'Mozilla/5.0 (Finarian App)',
  
  // Performance tuning
  RATE_LIMIT_DELAY_MS: 100,
  REQUEST_TIMEOUT_MS: 5000,
  MAX_RETRIES: 3,
  RETRY_DELAY_MS: 1000,
  
  // Data precision
  PRICE_DECIMAL_PLACES: 2,
  
  // Batch operations
  BATCH_SIZE: 50,
  
  // HTTP Status codes
  HTTP_STATUS: {
    OK: 200,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    INTERNAL_SERVER_ERROR: 500,
  },
} as const;

export type Constants = typeof CONSTANTS;
