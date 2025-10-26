import { useState, useEffect } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'
import { getAssetHistory, calculateAssetPerformance } from '../lib/portfolioHistory'

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

  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value)
  }

  // Format date for tooltip
  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('fr-FR', { 
      day: '2-digit', 
      month: 'short' 
    })
  }

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length > 0) {
      const data = payload[0].payload
      return (
        <div className="bg-white px-3 py-2 shadow-lg rounded-lg border border-gray-200">
          <p className="text-xs text-gray-600 mb-1">{formatDate(data.date)}</p>
          <p className="text-sm font-semibold text-gray-900">
            {formatCurrency(data.price)}
          </p>
        </div>
      )
    }
    return null
  }

  // Get trend color
  const getTrendColor = () => {
    if (!metrics) return '#6366f1'
    if (metrics.trend === 'positive') return '#10b981'
    if (metrics.trend === 'negative') return '#ef4444'
    return '#6366f1'
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-4 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/3 mb-3"></div>
        <div className="h-20 bg-gray-100 rounded"></div>
      </div>
    )
  }

  if (!history || history.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-semibold text-gray-900">{asset.name}</h3>
            {asset.symbol && (
              <p className="text-xs text-gray-500">{asset.symbol}</p>
            )}
          </div>
          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
            {asset.category}
          </span>
        </div>
        <p className="text-sm text-gray-500 text-center py-4">
          Aucun historique disponible
        </p>
      </div>
    )
  }

  const trendColor = getTrendColor()

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 text-lg">{asset.name}</h3>
            {asset.symbol && (
              <p className="text-sm text-gray-500">{asset.symbol}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
              {asset.category}
            </span>
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              {expanded ? '▼' : '▶'}
            </button>
          </div>
        </div>

        {/* Key metrics */}
        <div className="grid grid-cols-2 gap-3 mt-3">
          <div>
            <p className="text-xs text-gray-500">Prix actuel</p>
            <p className="text-lg font-semibold text-gray-900">
              {formatCurrency(metrics.currentPrice)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Variation ({period}J)</p>
            <p className={`text-lg font-semibold ${
              metrics.priceChangePercent >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {metrics.priceChangePercent >= 0 ? '+' : ''}
              {metrics.priceChangePercent.toFixed(2)}%
            </p>
          </div>
        </div>
      </div>

      {/* Mini chart (always visible) */}
      {!expanded && (
        <div className="h-24 px-2">
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
      {expanded && (
        <div className="p-4 space-y-4">
          {/* Detailed metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-600 mb-1">Quantité</p>
              <p className="text-sm font-semibold text-gray-900">
                {parseFloat(asset.quantity).toFixed(4)}
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-600 mb-1">Prix d'achat</p>
              <p className="text-sm font-semibold text-gray-900">
                {formatCurrency(asset.purchase_price)}
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-600 mb-1">Valeur actuelle</p>
              <p className="text-sm font-semibold text-gray-900">
                {formatCurrency(metrics.currentValue)}
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-600 mb-1">Gain/Perte</p>
              <p className={`text-sm font-semibold ${
                metrics.valueChange >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {metrics.valueChange >= 0 ? '+' : ''}
                {formatCurrency(metrics.valueChange)}
              </p>
            </div>
          </div>

          {/* Full chart */}
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={history} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(date) => {
                    const d = new Date(date)
                    return `${d.getDate()}/${d.getMonth() + 1}`
                  }}
                  stroke="#9ca3af"
                  style={{ fontSize: '11px' }}
                />
                <YAxis 
                  tickFormatter={(value) => `${value}€`}
                  stroke="#9ca3af"
                  style={{ fontSize: '11px' }}
                  width={60}
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

          {/* Performance summary */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">
                  Performance sur {period} jours
                </p>
                <p className="text-xs text-gray-600">
                  {metrics.dataPoints} points de données
                </p>
              </div>
              <div className="text-right">
                <p className={`text-2xl font-bold ${
                  metrics.valueChangePercent >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {metrics.valueChangePercent >= 0 ? '+' : ''}
                  {metrics.valueChangePercent.toFixed(2)}%
                </p>
                <p className="text-xs text-gray-600">
                  de {formatCurrency(metrics.investedValue)} investi
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

