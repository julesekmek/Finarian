/**
 * Application-wide constants
 * Centralizes all magic numbers and configuration values
 */

// Chart periods (in days)
export const CHART_PERIODS = {
  WEEK: 7,
  MONTH: 30,
  QUARTER: 90,
  ALL: "all", // Toutes les données depuis le début
};

export const DEFAULT_PERIOD = CHART_PERIODS.MONTH;

// Currency configuration
export const CURRENCY = {
  CODE: "EUR",
  LOCALE: "fr-FR",
  SYMBOL: "€",
};

// Trend thresholds (percentage)
export const TREND_THRESHOLDS = {
  POSITIVE: 0.5,
  NEGATIVE: -0.5,
};

// Performance trend states
export const TREND_STATES = {
  POSITIVE: "positive",
  NEGATIVE: "negative",
  NEUTRAL: "neutral",
};

// Realtime channel names
export const REALTIME_CHANNELS = {
  ASSETS: "realtime:assets",
  ASSET_HISTORY: "realtime:asset_history",
};

// Notification duration (ms)
export const NOTIFICATION_DURATION = 5000;

// API rate limiting (ms)
export const API_DELAY = 100;

// Investment Objectives
export const INVESTMENT_OBJECTIVES = [
  { id: "growth", label: "Croissance du capital" },
  { id: "passive_income", label: "Revenus passifs" },
  { id: "preservation", label: "Préservation du capital" },
  { id: "diversification", label: "Diversification" },
  { id: "speculation", label: "Spéculation / Haut rendement" },
];

// Investment Horizons
export const INVESTMENT_HORIZONS = [
  { id: "short", label: "Court terme (< 2 ans)" },
  { id: "medium", label: "Moyen terme (2-5 ans)" },
  { id: "long", label: "Long terme (> 5 ans)" },
  { id: "retirement", label: "Retraite" },
];

// Investment Defaults
export const DEFAULT_MONTHLY_INVESTMENT = 500;
export const MAX_MONTHLY_INVESTMENT = 2500;
