/**
 * Portfolio History Management
 * Handles fetching and calculating portfolio evolution data from asset_history table
 * Provides aggregated views of portfolio performance over time
 */

import { supabase } from './supabaseClient'

/**
 * Fetch portfolio value history for a given period
 * Returns daily snapshots of total portfolio value by aggregating all assets
 * 
 * @param {string} userId - User ID from auth
 * @param {number|string} days - Number of days to fetch (7, 30, 90) or 'all' for all data
 * @returns {Promise<Array<{date: string, value: number}>>} Array of daily portfolio values
 * @throws {Error} If database query fails
 */
export async function getPortfolioHistory(userId, days = 30) {
  try {
    // Build the query
    let query = supabase
      .from('asset_history')
      .select('date, price, asset_id')
      .eq('user_id', userId)
      .order('date', { ascending: true })

    // If days is not 'all', filter by date
    if (days !== 'all') {
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)
      const startDateStr = startDate.toISOString().split('T')[0]
      query = query.gte('date', startDateStr)
    }

    // Fetch asset history for the period
    const { data: historyData, error: historyError } = await query

    if (historyError) throw historyError

    // Fetch current assets to get quantities
    const { data: assetsData, error: assetsError } = await supabase
      .from('assets')
      .select('id, quantity')
      .eq('user_id', userId)

    if (assetsError) throw assetsError

    // Create a map of asset quantities
    const quantityMap = {}
    assetsData.forEach(asset => {
      quantityMap[asset.id] = asset.quantity
    })

    // Group history by date and calculate total value per day
    const dailyValues = {}
    
    historyData.forEach(record => {
      const date = record.date
      const quantity = quantityMap[record.asset_id] || 0
      const value = record.price * quantity

      if (!dailyValues[date]) {
        dailyValues[date] = 0
      }
      dailyValues[date] += value
    })

    // Convert to array format for charting
    const result = Object.entries(dailyValues).map(([date, value]) => ({
      date,
      value: Math.round(value * 100) / 100 // Round to 2 decimals
    }))

    // Sort by date ascending
    result.sort((a, b) => new Date(a.date) - new Date(b.date))

    return result
  } catch (error) {
    console.error('Error fetching portfolio history:', error)
    throw error
  }
}

/**
 * Calculate performance metrics from portfolio history
 * 
 * @param {Array} history - Array of {date, value} objects
 * @returns {Object} Performance metrics
 */
export function calculatePerformanceMetrics(history) {
  if (!history || history.length === 0) {
    return {
      currentValue: 0,
      startValue: 0,
      absoluteChange: 0,
      percentChange: 0,
      trend: 'neutral'
    }
  }

  const startValue = history[0]?.value || 0
  const currentValue = history[history.length - 1]?.value || 0
  const absoluteChange = currentValue - startValue
  const percentChange = startValue > 0 
    ? ((absoluteChange / startValue) * 100) 
    : 0

  // Determine trend (positive, negative, neutral)
  let trend = 'neutral'
  if (percentChange > 0.5) trend = 'positive'
  else if (percentChange < -0.5) trend = 'negative'

  return {
    currentValue: Math.round(currentValue * 100) / 100,
    startValue: Math.round(startValue * 100) / 100,
    absoluteChange: Math.round(absoluteChange * 100) / 100,
    percentChange: Math.round(percentChange * 100) / 100,
    trend
  }
}

/**
 * Fetch history for a specific asset
 * Returns daily price snapshots for a single asset
 * 
 * @param {string} assetId - Asset ID
 * @param {number|string} days - Number of days to fetch (7, 30, 90) or 'all' for all data
 * @returns {Promise<Array>} Array of {date, price} objects
 */
export async function getAssetHistory(assetId, days = 30) {
  try {
    // Build the query
    let query = supabase
      .from('asset_history')
      .select('date, price')
      .eq('asset_id', assetId)
      .order('date', { ascending: true })

    // If days is not 'all', filter by date
    if (days !== 'all') {
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)
      const startDateStr = startDate.toISOString().split('T')[0]
      query = query.gte('date', startDateStr)
    }

    // Fetch asset history for the period
    const { data, error } = await query

    if (error) throw error

    // Format data
    const result = data.map(record => ({
      date: record.date,
      price: Math.round(record.price * 100) / 100
    }))

    return result
  } catch (error) {
    console.error('Error fetching asset history:', error)
    throw error
  }
}

/**
 * Fetch history for all user assets
 * Returns an object with asset_id as keys and history arrays as values
 * 
 * @param {string} userId - User ID
 * @param {number|string} days - Number of days to fetch (7, 30, 90) or 'all' for all data
 * @returns {Promise<Object>} Object with assetId -> [{date, price}] mapping
 */
export async function getAllAssetsHistory(userId, days = 30) {
  try {
    // Build the query
    let query = supabase
      .from('asset_history')
      .select('date, price, asset_id')
      .eq('user_id', userId)
      .order('date', { ascending: true })

    // If days is not 'all', filter by date
    if (days !== 'all') {
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)
      const startDateStr = startDate.toISOString().split('T')[0]
      query = query.gte('date', startDateStr)
    }

    // Fetch asset history for the period
    const { data, error } = await query

    if (error) throw error

    // Group by asset_id
    const assetHistories = {}
    data.forEach(record => {
      if (!assetHistories[record.asset_id]) {
        assetHistories[record.asset_id] = []
      }
      assetHistories[record.asset_id].push({
        date: record.date,
        price: Math.round(record.price * 100) / 100
      })
    })

    return assetHistories
  } catch (error) {
    console.error('Error fetching all assets history:', error)
    throw error
  }
}

/**
 * Calculate performance metrics for an asset
 * Includes current value based on quantity
 * 
 * @param {Array} history - Array of {date, price} objects
 * @param {Object} asset - Asset object with purchase_price, current_price, quantity
 * @returns {Object} Performance metrics
 */
export function calculateAssetPerformance(history, asset) {
  if (!history || history.length === 0 || !asset) {
    return {
      currentPrice: asset?.current_price || 0,
      startPrice: 0,
      currentValue: 0,
      investedValue: 0,
      priceChange: 0,
      priceChangePercent: 0,
      valueChange: 0,
      valueChangePercent: 0,
      trend: 'neutral',
      dataPoints: 0
    }
  }

  const quantity = parseFloat(asset.quantity) || 0
  const purchasePrice = parseFloat(asset.purchase_price) || 0
  const currentPrice = parseFloat(asset.current_price) || purchasePrice
  
  const startPrice = history[0]?.price || 0
  const endPrice = history[history.length - 1]?.price || currentPrice
  
  const priceChange = endPrice - startPrice
  const priceChangePercent = startPrice > 0 ? ((priceChange / startPrice) * 100) : 0
  
  const currentValue = currentPrice * quantity
  const investedValue = purchasePrice * quantity
  const valueChange = currentValue - investedValue
  const valueChangePercent = investedValue > 0 ? ((valueChange / investedValue) * 100) : 0
  
  // Determine trend based on price change over the period
  let trend = 'neutral'
  if (priceChangePercent > 0.5) trend = 'positive'
  else if (priceChangePercent < -0.5) trend = 'negative'

  return {
    currentPrice: Math.round(currentPrice * 100) / 100,
    startPrice: Math.round(startPrice * 100) / 100,
    currentValue: Math.round(currentValue * 100) / 100,
    investedValue: Math.round(investedValue * 100) / 100,
    priceChange: Math.round(priceChange * 100) / 100,
    priceChangePercent: Math.round(priceChangePercent * 100) / 100,
    valueChange: Math.round(valueChange * 100) / 100,
    valueChangePercent: Math.round(valueChangePercent * 100) / 100,
    trend,
    dataPoints: history.length
  }
}

