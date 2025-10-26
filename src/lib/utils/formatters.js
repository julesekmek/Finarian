/**
 * Formatting utilities for currency, dates, and numbers
 * Centralizes all display formatting logic
 */

import { CURRENCY } from './constants'

/**
 * Format a number as currency
 * @param {number} value - The numeric value to format
 * @param {Object} options - Optional formatting options
 * @returns {string} Formatted currency string
 */
export function formatCurrency(value, options = {}) {
  const {
    locale = CURRENCY.LOCALE,
    currency = CURRENCY.CODE,
    minimumFractionDigits = 2,
    maximumFractionDigits = 2
  } = options

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits,
    maximumFractionDigits
  }).format(value)
}

/**
 * Format a date string for display
 * @param {string|Date} dateInput - Date string or Date object
 * @param {Object} options - Optional formatting options
 * @returns {string} Formatted date string
 */
export function formatDate(dateInput, options = {}) {
  const {
    locale = CURRENCY.LOCALE,
    year = 'numeric',
    month = 'short',
    day = 'numeric'
  } = options

  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput

  return date.toLocaleDateString(locale, { year, month, day })
}

/**
 * Format a short date for chart axis (DD/MM)
 * @param {string|Date} dateInput - Date string or Date object
 * @returns {string} Formatted date string (e.g., "15/01")
 */
export function formatShortDate(dateInput) {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput
  return `${date.getDate()}/${date.getMonth() + 1}`
}

/**
 * Round a number to specified decimal places
 * @param {number} value - The number to round
 * @param {number} decimals - Number of decimal places (default: 2)
 * @returns {number} Rounded number
 */
export function roundToDecimals(value, decimals = 2) {
  const multiplier = Math.pow(10, decimals)
  return Math.round(value * multiplier) / multiplier
}

/**
 * Format a number with a sign (+ or -)
 * @param {number} value - The number to format
 * @returns {string} Number with sign prefix
 */
export function formatWithSign(value) {
  return value >= 0 ? `+${value}` : `${value}`
}

/**
 * Format percentage
 * @param {number} value - The percentage value
 * @param {number} decimals - Number of decimal places (default: 2)
 * @returns {string} Formatted percentage string
 */
export function formatPercentage(value, decimals = 2) {
  return `${formatWithSign(value.toFixed(decimals))}%`
}

