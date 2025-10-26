/**
 * PortfolioChart component
 * Displays interactive chart of portfolio value evolution
 * Shows performance metrics and allows period selection
 */

import { useState, useEffect } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { getPortfolioHistory, calculatePerformanceMetrics } from '../lib/portfolioHistory'
import { formatCurrency, formatShortDate } from '../lib/utils/formatters'
import { DEFAULT_PERIOD, CHART_PERIODS } from '../lib/utils/constants'

export default function PortfolioChart({ userId }) {
  const [period, setPeriod] = useState(DEFAULT_PERIOD)
  const [history, setHistory] = useState([])
  const [metrics, setMetrics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch portfolio history when period or userId changes
  useEffect(() => {
    if (!userId) return

    async function fetchHistory() {
      setLoading(true)
      setError(null)
      
      try {
        const data = await getPortfolioHistory(userId, period)
        setHistory(data)
        
        // Calculate performance metrics
        const performanceMetrics = calculatePerformanceMetrics(data)
        setMetrics(performanceMetrics)
      } catch (err) {
        console.error('Error loading portfolio history:', err)
        setError('Impossible de charger l\'historique')
      } finally {
        setLoading(false)
      }
    }

    fetchHistory()
  }, [userId, period])

  // Custom tooltip component
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length > 0) {
      const data = payload[0].payload
      const date = new Date(data.date)
      const formattedDate = date.toLocaleDateString('fr-FR', { 
        day: '2-digit', 
        month: 'short',
        year: 'numeric'
      })
      return (
        <div className="bg-white px-4 py-3 shadow-lg rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">{formattedDate}</p>
          <p className="text-lg font-semibold text-gray-900">
            {formatCurrency(data.value, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </p>
        </div>
      )
    }
    return null
  }

  // Render loading state
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-100 rounded"></div>
        </div>
      </div>
    )
  }

  // Render error state
  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="text-center py-8">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    )
  }

  // Render empty state
  if (!history || history.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          📊 Évolution du patrimoine
        </h2>
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg mb-2">Aucune donnée historique disponible</p>
          <p className="text-sm">
            Mettez à jour vos prix pour commencer à suivre l'évolution de votre patrimoine
          </p>
        </div>
      </div>
    )
  }

  // Determine color based on trend
  const getTrendColor = () => {
    if (!metrics) return '#6366f1'
    if (metrics.trend === 'positive') return '#10b981'
    if (metrics.trend === 'negative') return '#ef4444'
    return '#6366f1'
  }

  const trendColor = getTrendColor()

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      {/* Header with title and period selector */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 sm:mb-0">
          📊 Évolution du patrimoine
        </h2>
        
          {/* Period selector */}
          <div className="flex gap-2">
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

      {/* Performance metrics */}
      {metrics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Valeur actuelle</p>
            <p className="text-xl font-semibold text-gray-900">
              {formatCurrency(metrics.currentValue)}
            </p>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Valeur initiale</p>
            <p className="text-xl font-semibold text-gray-900">
              {formatCurrency(metrics.startValue)}
            </p>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Variation</p>
            <p className={`text-xl font-semibold ${
              metrics.absoluteChange >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {metrics.absoluteChange >= 0 ? '+' : ''}
              {formatCurrency(metrics.absoluteChange)}
            </p>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Performance</p>
            <p className={`text-xl font-semibold ${
              metrics.percentChange >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {metrics.percentChange >= 0 ? '+' : ''}
              {metrics.percentChange.toFixed(2)}%
            </p>
          </div>
        </div>
      )}

      {/* Chart */}
      <div className="w-full h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={history} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={trendColor} stopOpacity={0.3} />
                <stop offset="95%" stopColor={trendColor} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="date" 
              tickFormatter={formatShortDate}
              stroke="#9ca3af"
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              tickFormatter={(value) => formatCurrency(value, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              stroke="#9ca3af"
              style={{ fontSize: '12px' }}
              width={80}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke={trendColor}
              strokeWidth={2}
              fill="url(#colorValue)"
              dot={false}
              activeDot={{ r: 6, fill: trendColor }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Footer info */}
      <div className="mt-4 text-center">
        <p className="text-xs text-gray-500">
          Historique sur {period} jours • {history.length} points de données
        </p>
      </div>
    </div>
  )
}

