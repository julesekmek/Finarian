/**
 * Application-wide constants
 * Centralizes all magic numbers and configuration values
 */

// Chart periods (in days)
export const CHART_PERIODS = {
  WEEK: 7,
  MONTH: 30,
  QUARTER: 90
}

export const DEFAULT_PERIOD = CHART_PERIODS.MONTH

// Currency configuration
export const CURRENCY = {
  CODE: 'EUR',
  LOCALE: 'fr-FR',
  SYMBOL: '€'
}

// Trend thresholds (percentage)
export const TREND_THRESHOLDS = {
  POSITIVE: 0.5,
  NEGATIVE: -0.5
}

// Performance trend states
export const TREND_STATES = {
  POSITIVE: 'positive',
  NEGATIVE: 'negative',
  NEUTRAL: 'neutral'
}

// Realtime channel names
export const REALTIME_CHANNELS = {
  ASSETS: 'realtime:assets',
  ASSET_HISTORY: 'realtime:asset_history'
}

// Notification duration (ms)
export const NOTIFICATION_DURATION = 5000

// API rate limiting (ms)
export const API_DELAY = 100

