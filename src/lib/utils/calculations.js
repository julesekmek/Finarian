/**
 * Financial calculations utilities
 * Centralizes all portfolio and asset calculations
 */

import { roundToDecimals } from './formatters'

/**
 * Calculate total portfolio metrics
 * @param {Array} assets - Array of asset objects
 * @returns {Object} Portfolio totals and gains
 */
export function calculatePortfolioTotals(assets) {
  if (!assets || assets.length === 0) {
    return {
      totalInvested: 0,
      totalCurrent: 0,
      totalGain: 0,
      gainPercent: 0,
      isPositive: false
    }
  }

  const totalInvested = assets.reduce((sum, asset) => {
    const quantity = parseFloat(asset.quantity) || 0
    const purchasePrice = parseFloat(asset.purchase_price) || 0
    return sum + (purchasePrice * quantity)
  }, 0)

  const totalCurrent = assets.reduce((sum, asset) => {
    const quantity = parseFloat(asset.quantity) || 0
    const currentPrice = parseFloat(asset.current_price) || parseFloat(asset.purchase_price) || 0
    return sum + (currentPrice * quantity)
  }, 0)

  const totalGain = totalCurrent - totalInvested
  const gainPercent = totalInvested > 0 ? (totalGain / totalInvested) * 100 : 0

  return {
    totalInvested: roundToDecimals(totalInvested),
    totalCurrent: roundToDecimals(totalCurrent),
    totalGain: roundToDecimals(totalGain),
    gainPercent: roundToDecimals(gainPercent),
    isPositive: totalGain >= 0
  }
}

/**
 * Calculate metrics for a single asset
 * @param {Object} asset - Asset object
 * @returns {Object} Asset calculations
 */
export function calculateAssetMetrics(asset) {
  const quantity = parseFloat(asset.quantity) || 0
  const purchasePrice = parseFloat(asset.purchase_price) || 0
  const currentPrice = parseFloat(asset.current_price) || purchasePrice

  const totalPurchaseValue = purchasePrice * quantity
  const totalCurrentValue = currentPrice * quantity
  const unrealizedGain = totalCurrentValue - totalPurchaseValue
  const gainPercent = totalPurchaseValue > 0 ? (unrealizedGain / totalPurchaseValue) * 100 : 0

  return {
    quantity: roundToDecimals(quantity, 4),
    purchasePrice: roundToDecimals(purchasePrice),
    currentPrice: roundToDecimals(currentPrice),
    totalPurchaseValue: roundToDecimals(totalPurchaseValue),
    totalCurrentValue: roundToDecimals(totalCurrentValue),
    unrealizedGain: roundToDecimals(unrealizedGain),
    gainPercent: roundToDecimals(gainPercent),
    isPositive: unrealizedGain >= 0
  }
}

/**
 * Calculate date from days ago
 * @param {number} days - Number of days in the past
 * @returns {string} ISO date string (YYYY-MM-DD)
 */
export function getDateDaysAgo(days) {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return date.toISOString().split('T')[0]
}

/**
 * Calculate percentage change
 * @param {number} oldValue - Initial value
 * @param {number} newValue - Final value
 * @returns {number} Percentage change
 */
export function calculatePercentageChange(oldValue, newValue) {
  if (oldValue === 0) return 0
  return ((newValue - oldValue) / oldValue) * 100
}

