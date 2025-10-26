/**
 * Performance component
 * Displays detailed performance analysis for all assets
 * Includes comparison and sorting capabilities
 */

import { useState, useEffect } from 'react'
import AssetPerformanceCard from './AssetPerformanceCard'
import { getAllAssetsHistory, calculateAssetPerformance } from '../lib/portfolioHistory'
import { formatCurrency } from '../lib/utils/formatters'
import { DEFAULT_PERIOD, CHART_PERIODS } from '../lib/utils/constants'

export default function Performance({ userId, assets }) {
  const [period, setPeriod] = useState(DEFAULT_PERIOD)
  const [sortBy, setSortBy] = useState('performance') // performance, name, value
  const [sortDirection, setSortDirection] = useState('desc')
  const [assetsWithMetrics, setAssetsWithMetrics] = useState([])
  const [loading, setLoading] = useState(true)
  const [comparison, setComparison] = useState(null)

  // Fetch all assets history and calculate metrics
  useEffect(() => {
    async function fetchData() {
      if (!assets || assets.length === 0) {
        setAssetsWithMetrics([])
        setLoading(false)
        return
      }

      setLoading(true)
      try {
        // Get history for all assets
        const allHistory = await getAllAssetsHistory(userId, period)
        
        // Calculate metrics for each asset
        const enrichedAssets = assets.map(asset => {
          const history = allHistory[asset.id] || []
          const metrics = calculateAssetPerformance(history, asset)
          
          return {
            ...asset,
            history,
            metrics
          }
        }).filter(asset => asset.metrics.dataPoints > 0) // Only show assets with history

        setAssetsWithMetrics(enrichedAssets)
        
        // Calculate comparison stats
        calculateComparison(enrichedAssets)
      } catch (error) {
        console.error('Error fetching performance data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [userId, assets, period])

  // Calculate comparison statistics
  const calculateComparison = (enrichedAssets) => {
    if (enrichedAssets.length === 0) {
      setComparison(null)
      return
    }

    const totalValue = enrichedAssets.reduce((sum, a) => sum + a.metrics.currentValue, 0)
    const totalInvested = enrichedAssets.reduce((sum, a) => sum + a.metrics.investedValue, 0)
    const totalGain = totalValue - totalInvested
    const totalGainPercent = totalInvested > 0 ? (totalGain / totalInvested) * 100 : 0

    // Find best and worst performers
    const sortedByPerformance = [...enrichedAssets].sort(
      (a, b) => b.metrics.priceChangePercent - a.metrics.priceChangePercent
    )
    
    const bestPerformer = sortedByPerformance[0]
    const worstPerformer = sortedByPerformance[sortedByPerformance.length - 1]

    // Count positive/negative performers
    const positiveCount = enrichedAssets.filter(a => a.metrics.priceChangePercent > 0).length
    const negativeCount = enrichedAssets.filter(a => a.metrics.priceChangePercent < 0).length
    const neutralCount = enrichedAssets.length - positiveCount - negativeCount

    setComparison({
      totalValue,
      totalInvested,
      totalGain,
      totalGainPercent,
      bestPerformer,
      worstPerformer,
      positiveCount,
      negativeCount,
      neutralCount,
      totalAssets: enrichedAssets.length
    })
  }

  // Sort assets
  const sortedAssets = [...assetsWithMetrics].sort((a, b) => {
    let aValue, bValue

    switch (sortBy) {
      case 'performance':
        aValue = a.metrics.priceChangePercent
        bValue = b.metrics.priceChangePercent
        break
      case 'value':
        aValue = a.metrics.currentValue
        bValue = b.metrics.currentValue
        break
      case 'name':
        aValue = a.name.toLowerCase()
        bValue = b.name.toLowerCase()
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue)
      default:
        return 0
    }

    return sortDirection === 'asc' ? aValue - bValue : bValue - aValue
  })

  // Toggle sort direction
  const handleSort = (newSortBy) => {
    if (sortBy === newSortBy) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
      } else {
      setSortBy(newSortBy)
      setSortDirection('desc')
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-20 bg-gray-100 rounded"></div>
            <div className="h-20 bg-gray-100 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!assets || assets.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-12 text-center">
        <p className="text-gray-500 text-lg mb-2">Aucun actif dans votre portefeuille</p>
        <p className="text-gray-400 text-sm">
          Ajoutez des actifs depuis le Dashboard pour voir leurs performances
        </p>
      </div>
    )
  }

  if (assetsWithMetrics.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-12 text-center">
        <p className="text-gray-500 text-lg mb-2">Aucune donnée historique disponible</p>
        <p className="text-gray-400 text-sm">
          Mettez à jour les prix pour commencer à suivre les performances
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Comparison overview */}
      {comparison && (
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg p-6 text-white">
          <h2 className="text-2xl font-bold mb-6">📊 Vue d'ensemble</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white/10 backdrop-blur rounded-lg p-4">
              <p className="text-sm opacity-90 mb-1">Valeur totale</p>
              <p className="text-2xl font-bold">{formatCurrency(comparison.totalValue, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur rounded-lg p-4">
              <p className="text-sm opacity-90 mb-1">Investissement total</p>
              <p className="text-2xl font-bold">{formatCurrency(comparison.totalInvested, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur rounded-lg p-4">
              <p className="text-sm opacity-90 mb-1">Performance globale</p>
              <p className={`text-2xl font-bold ${
                comparison.totalGainPercent >= 0 ? 'text-green-300' : 'text-red-300'
              }`}>
                {comparison.totalGainPercent >= 0 ? '+' : ''}
                {comparison.totalGainPercent.toFixed(2)}%
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Best performer */}
            <div className="bg-white/10 backdrop-blur rounded-lg p-4">
              <p className="text-sm opacity-90 mb-2">🏆 Meilleure performance</p>
              <p className="font-semibold text-lg">{comparison.bestPerformer.name}</p>
              <p className="text-green-300 text-xl font-bold">
                +{comparison.bestPerformer.metrics.priceChangePercent.toFixed(2)}%
              </p>
            </div>

            {/* Worst performer */}
            <div className="bg-white/10 backdrop-blur rounded-lg p-4">
              <p className="text-sm opacity-90 mb-2">📉 Plus faible performance</p>
              <p className="font-semibold text-lg">{comparison.worstPerformer.name}</p>
              <p className="text-red-300 text-xl font-bold">
                {comparison.worstPerformer.metrics.priceChangePercent.toFixed(2)}%
              </p>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-green-300">🟢</span>
              <span>{comparison.positiveCount} en hausse</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-red-300">🔴</span>
              <span>{comparison.negativeCount} en baisse</span>
            </div>
            {comparison.neutralCount > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-blue-300">🔵</span>
                <span>{comparison.neutralCount} stable</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Period selector */}
          <div>
            <label className="text-sm text-gray-600 mr-3">Période :</label>
            <div className="inline-flex gap-2">
              {Object.values(CHART_PERIODS).map((days) => (
                <button
                  key={days}
                  onClick={() => setPeriod(days)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    period === days
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {days}J
                </button>
              ))}
            </div>
          </div>

          {/* Sort controls */}
          <div>
            <label className="text-sm text-gray-600 mr-3">Trier par :</label>
            <div className="inline-flex gap-2">
              <button
                onClick={() => handleSort('performance')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  sortBy === 'performance'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Performance {sortBy === 'performance' && (sortDirection === 'desc' ? '↓' : '↑')}
              </button>
              <button
                onClick={() => handleSort('value')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  sortBy === 'value'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Valeur {sortBy === 'value' && (sortDirection === 'desc' ? '↓' : '↑')}
              </button>
                <button
                onClick={() => handleSort('name')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  sortBy === 'name'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                Nom {sortBy === 'name' && (sortDirection === 'desc' ? '↓' : '↑')}
                </button>
            </div>
          </div>
        </div>
      </div>

      {/* Assets grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {sortedAssets.map((asset) => (
          <AssetPerformanceCard 
            key={asset.id} 
            asset={asset} 
            period={period}
          />
        ))}
      </div>

      {/* Footer stats */}
      <div className="text-center text-sm text-gray-500">
        {assetsWithMetrics.length} actif{assetsWithMetrics.length > 1 ? 's' : ''} avec historique sur {period} jours
      </div>
    </div>
  )
}
