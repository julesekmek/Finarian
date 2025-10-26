/**
 * AssetPerformanceCard component - Modern performance card
 * Expandable card with beautiful dark mode chart
 */

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { ChevronRight, ChevronDown, TrendingUp, TrendingDown } from 'lucide-react'
import { getAssetHistory, calculateAssetPerformance } from '../lib/portfolioHistory'
import { formatCurrency, formatShortDate } from '../lib/utils/formatters'

export default function AssetPerformanceCard({ asset, period }) {
  const [history, setHistory] = useState([])
  const [metrics, setMetrics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        const data = await getAssetHistory(asset.id, period)
        setHistory(data)
        
        const performanceMetrics = calculateAssetPerformance(data, asset)
        setMetrics(performanceMetrics)
      } catch (error) {
        console.error('Error fetching asset history:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [asset.id, period])

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length > 0) {
      const data = payload[0].payload
      const date = new Date(data.date)
      const formattedDate = date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
      return (
        <div className="bg-dark-card border border-border-subtle px-3 py-2 rounded-xl shadow-card">
          <p className="text-xs text-text-muted mb-1">{formattedDate}</p>
          <p className="text-sm font-semibold text-text-primary">
            {formatCurrency(data.price)}
          </p>
        </div>
      )
    }
    return null
  }

  // Get trend color
  const getTrendColor = () => {
    if (!metrics) return '#3B82F6'
    if (metrics.trend === 'positive') return '#F1C086'
    if (metrics.trend === 'negative') return '#EF4444'
    return '#3B82F6'
  }

  if (loading) {
    return (
      <div className="card animate-pulse">
        <div className="h-4 bg-dark-hover rounded w-1/3 mb-3"></div>
        <div className="h-24 bg-dark-hover rounded"></div>
      </div>
    )
  }

  if (!history || history.length === 0) {
    return (
      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-semibold text-text-primary">{asset.name}</h3>
            {asset.symbol && (
              <p className="text-xs text-text-muted">{asset.symbol}</p>
            )}
          </div>
          <span className="text-xs text-text-muted bg-dark-hover px-2 py-1 rounded-lg">
            {asset.category}
          </span>
        </div>
        <p className="text-sm text-text-muted text-center py-4">
          Aucun historique disponible
        </p>
      </div>
    )
  }

  const trendColor = getTrendColor()
  const isPositive = metrics.priceChangePercent >= 0

  return (
    <motion.div
      layout
                className="card hover:border-accent-primary/30 transition-all cursor-pointer"
      onClick={() => setExpanded(!expanded)}
    >
      {/* Header */}
      <div className="border-b border-border-subtle pb-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-text-primary text-lg">{asset.name}</h3>
              {asset.symbol && (
                        <span className="text-xs bg-accent-beige/20 text-white px-2 py-1 rounded-lg font-mono">
                  {asset.symbol}
                </span>
              )}
            </div>
            <p className="text-sm text-text-muted capitalize">{asset.category}</p>
          </div>
          <button className="p-2 hover:bg-dark-hover rounded-xl transition-all">
            {expanded ? (
              <ChevronDown className="w-5 h-5 text-text-muted" />
            ) : (
              <ChevronRight className="w-5 h-5 text-text-muted" />
            )}
          </button>
        </div>

        {/* Key metrics */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-dark-hover rounded-xl p-3">
            <p className="text-xs text-text-muted mb-1">Prix actuel</p>
            <p className="text-lg font-bold text-text-primary">
              {formatCurrency(metrics.currentPrice)}
            </p>
          </div>
          <div className="bg-dark-hover rounded-xl p-3">
            <p className="text-xs text-text-muted mb-1">Variation ({period === 'all' ? 'Tout' : `${period}J`})</p>
            <div className="flex items-center gap-1">
              {isPositive ? (
                <TrendingUp className="w-4 h-4 text-accent-green" />
              ) : (
                <TrendingDown className="w-4 h-4 text-accent-red" />
              )}
              <p className={`text-lg font-bold ${isPositive ? 'text-accent-green' : 'text-accent-red'}`}>
                {isPositive ? '+' : ''}
                {metrics.priceChangePercent.toFixed(2)}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Mini chart (always visible) */}
      {!expanded && (
        <div className="h-20 min-h-[80px] mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={history}>
              <Line 
                type="monotone" 
                dataKey="price" 
                stroke={trendColor}
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Expanded view */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="pt-4 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Detailed metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-dark-hover rounded-xl p-3">
                <p className="text-xs text-text-muted mb-1">Quantité</p>
                <p className="text-sm font-semibold text-text-primary">
                  {parseFloat(asset.quantity).toFixed(4)}
                </p>
              </div>
              
              <div className="bg-dark-hover rounded-xl p-3">
                <p className="text-xs text-text-muted mb-1">Prix d'achat</p>
                <p className="text-sm font-semibold text-text-primary">
                  {formatCurrency(asset.purchase_price)}
                </p>
              </div>
              
              <div className="bg-dark-hover rounded-xl p-3">
                <p className="text-xs text-text-muted mb-1">Valeur actuelle</p>
                <p className="text-sm font-semibold text-text-primary">
                  {formatCurrency(metrics.currentValue)}
                </p>
              </div>
              
              <div className="bg-dark-hover rounded-xl p-3">
                <p className="text-xs text-text-muted mb-1">Gain/Perte</p>
                <p className={`text-sm font-semibold ${
                  metrics.valueChange >= 0 ? 'text-accent-green' : 'text-accent-red'
                }`}>
                  {metrics.valueChange >= 0 ? '+' : ''}
                  {formatCurrency(metrics.valueChange)}
                </p>
              </div>
            </div>

            {/* Full chart */}
            <div className="h-56 min-h-[224px] bg-dark-hover rounded-xl p-3">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={history} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={formatShortDate}
                    stroke="#64748B"
                    style={{ fontSize: '11px' }}
                    tickLine={false}
                  />
                  <YAxis 
                    tickFormatter={(value) => `${value}€`}
                    stroke="#64748B"
                    style={{ fontSize: '11px' }}
                    width={60}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line 
                    type="monotone" 
                    dataKey="price" 
                    stroke={trendColor}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4, fill: trendColor }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
