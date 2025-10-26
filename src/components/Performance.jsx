/**
 * Performance component - Modern performance dashboard
 * Beautiful overview with sorting and comparison features
 */

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, ArrowUpDown, BarChart3 } from 'lucide-react'
import AssetPerformanceCard from './AssetPerformanceCard'
import { getAllAssetsHistory, calculateAssetPerformance } from '../lib/portfolioHistory'
import { formatCurrency } from '../lib/utils/formatters'
import { DEFAULT_PERIOD, CHART_PERIODS } from '../lib/utils/constants'

export default function Performance({ userId, assets }) {
  const [period, setPeriod] = useState(DEFAULT_PERIOD)
  const [sortBy, setSortBy] = useState('performance')
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
        const allHistory = await getAllAssetsHistory(userId, period)
        
        const enrichedAssets = assets.map(asset => {
          const history = allHistory[asset.id] || []
          const metrics = calculateAssetPerformance(history, asset)
          
          return {
            ...asset,
            history,
            metrics
          }
        }).filter(asset => asset.metrics.dataPoints > 0)

        setAssetsWithMetrics(enrichedAssets)
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

    const sortedByPerformance = [...enrichedAssets].sort(
      (a, b) => b.metrics.priceChangePercent - a.metrics.priceChangePercent
    )
    
    const bestPerformer = sortedByPerformance[0]
    const worstPerformer = sortedByPerformance[sortedByPerformance.length - 1]

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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card animate-pulse"
        >
          <div className="h-6 bg-dark-hover rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-24 bg-dark-hover rounded-xl"></div>
            <div className="h-24 bg-dark-hover rounded-xl"></div>
          </div>
        </motion.div>
      </div>
    )
  }

  if (!assets || assets.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card text-center py-12"
      >
        <div className="w-16 h-16 bg-dark-hover rounded-2xl flex items-center justify-center mx-auto mb-4">
          <BarChart3 className="w-8 h-8 text-text-muted" />
        </div>
        <p className="text-lg text-text-secondary mb-2">Aucun actif dans votre portefeuille</p>
        <p className="text-sm text-text-muted">
          Ajoutez des actifs depuis le Dashboard pour voir leurs performances
        </p>
      </motion.div>
    )
  }

  if (assetsWithMetrics.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card text-center py-12"
      >
        <div className="w-16 h-16 bg-dark-hover rounded-2xl flex items-center justify-center mx-auto mb-4">
          <TrendingUp className="w-8 h-8 text-text-muted" />
        </div>
        <p className="text-lg text-text-secondary mb-2">Aucune donnée historique</p>
        <p className="text-sm text-text-muted">
          Mettez à jour les prix pour commencer à suivre les performances
        </p>
      </motion.div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Title with Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        {/* Title */}
        <h2 className="text-xl font-semibold text-text-primary mb-6 flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-accent-primary" />
          Performance des actifs
        </h2>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Period selector */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <label className="text-sm text-text-secondary font-medium">Période :</label>
            <div className="flex gap-2 flex-wrap">
              {Object.entries(CHART_PERIODS).map(([key, days]) => (
                <button
                  key={key}
                  onClick={() => setPeriod(days)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    period === days
                      ? 'bg-accent-primary text-white shadow-glow-primary'
                      : 'bg-dark-hover text-text-secondary hover:bg-dark-hover/80'
                  }`}
                >
                  {days === 'all' ? 'Tout' : `${days}J`}
                </button>
              ))}
            </div>
          </div>

          {/* Sort controls */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <label className="text-sm text-text-secondary font-medium">Trier par :</label>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => handleSort('performance')}
                className={`flex items-center gap-1 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  sortBy === 'performance'
                    ? 'bg-accent-primary text-white shadow-glow-primary'
                    : 'bg-dark-hover text-text-secondary hover:bg-dark-hover/80'
                }`}
              >
                Performance
                {sortBy === 'performance' && (
                  <ArrowUpDown className="w-3 h-3" />
                )}
              </button>
              <button
                onClick={() => handleSort('value')}
                className={`flex items-center gap-1 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  sortBy === 'value'
                    ? 'bg-accent-primary text-white shadow-glow-primary'
                    : 'bg-dark-hover text-text-secondary hover:bg-dark-hover/80'
                }`}
              >
                Valeur
                {sortBy === 'value' && (
                  <ArrowUpDown className="w-3 h-3" />
                )}
              </button>
              <button
                onClick={() => handleSort('name')}
                className={`flex items-center gap-1 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  sortBy === 'name'
                    ? 'bg-accent-primary text-white shadow-glow-primary'
                    : 'bg-dark-hover text-text-secondary hover:bg-dark-hover/80'
                }`}
              >
                Nom
                {sortBy === 'name' && (
                  <ArrowUpDown className="w-3 h-3" />
                )}
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Assets grid - Full width for better visibility */}
      <div className="grid grid-cols-1 gap-4">
        {sortedAssets.map((asset, index) => (
          <motion.div
            key={asset.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <AssetPerformanceCard 
              asset={asset} 
              period={period}
            />
          </motion.div>
        ))}
      </div>

      {/* Footer stats */}
      <div className="text-center text-sm text-text-muted">
        {assetsWithMetrics.length} actif{assetsWithMetrics.length > 1 ? 's' : ''} avec historique • {period === 'all' ? 'Toutes les données' : `${period} jours`}
      </div>
    </div>
  )
}
