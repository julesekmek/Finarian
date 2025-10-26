/**
 * PortfolioChart component - Modern portfolio evolution chart
 * Beautiful dark mode chart with smooth animations
 */

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { TrendingUp, TrendingDown, Activity } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import { getPortfolioHistory, calculatePerformanceMetrics } from '../lib/portfolioHistory'
import { formatCurrency, formatShortDate } from '../lib/utils/formatters'
import { DEFAULT_PERIOD, CHART_PERIODS } from '../lib/utils/constants'

export default function PortfolioChart({ userId }) {
  const [period, setPeriod] = useState(DEFAULT_PERIOD)
  const [history, setHistory] = useState([])
  const [metrics, setMetrics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [totalInvested, setTotalInvested] = useState(0)

  // Fetch total invested amount (real investment)
  useEffect(() => {
    if (!userId) return

    async function fetchTotalInvested() {
      try {
        const { data: assets, error } = await supabase
          .from('assets')
          .select('quantity, purchase_price')
          .eq('user_id', userId)

        if (error) throw error

        const invested = assets.reduce((sum, asset) => {
          return sum + (parseFloat(asset.quantity) * parseFloat(asset.purchase_price))
        }, 0)

        setTotalInvested(invested)
      } catch (err) {
        console.error('Error calculating total invested:', err)
      }
    }

    fetchTotalInvested()

    // Realtime subscription to update when assets change
    const channel = supabase
      .channel(`portfolio_invested_${userId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'assets', filter: `user_id=eq.${userId}` },
        () => {
          fetchTotalInvested()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId])

  // Fetch portfolio history when period or userId changes
  useEffect(() => {
    if (!userId) return

    async function fetchHistory() {
      setLoading(true)
      setError(null)
      
      try {
        const data = await getPortfolioHistory(userId, period)
        setHistory(data)
        
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
        <div className="bg-dark-card border border-border-subtle px-4 py-3 rounded-xl shadow-card">
          <p className="text-sm text-text-muted mb-1">{formattedDate}</p>
          <p className="text-lg font-semibold text-text-primary">
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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        <div className="animate-pulse">
          <div className="h-6 bg-dark-hover rounded-lg w-1/4 mb-6"></div>
          <div className="h-64 bg-dark-hover rounded-xl"></div>
        </div>
      </motion.div>
    )
  }

  // Render error state
  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        <div className="text-center py-12">
          <Activity className="w-12 h-12 text-accent-red mx-auto mb-4" />
          <p className="text-accent-red">{error}</p>
        </div>
      </motion.div>
    )
  }

  // Render empty state
  if (!history || history.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        <h2 className="text-xl font-semibold text-text-primary mb-4 flex items-center gap-2">
          <Activity className="w-6 h-6 text-accent-primary" />
          Évolution du patrimoine
        </h2>
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-dark-hover rounded-2xl flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="w-8 h-8 text-text-muted" />
          </div>
          <p className="text-lg text-text-secondary mb-2">Aucune donnée historique</p>
          <p className="text-sm text-text-muted">
            Mettez à jour vos prix pour commencer à suivre l'évolution
          </p>
        </div>
      </motion.div>
    )
  }

  // Determine color and gradient based on trend
  const getTrendColor = () => {
    if (!metrics) return { stroke: '#3B82F6', fill: 'url(#colorBlue)' }
    if (metrics.trend === 'positive') return { stroke: '#F1C086', fill: 'url(#colorPrimary)' }
    if (metrics.trend === 'negative') return { stroke: '#EF4444', fill: 'url(#colorRed)' }
    return { stroke: '#3B82F6', fill: 'url(#colorBlue)' }
  }

  const { stroke, fill } = getTrendColor()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card"
    >
      {/* Header with title and period selector */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <h2 className="text-xl font-semibold text-text-primary flex items-center gap-2">
          <Activity className="w-6 h-6 text-accent-primary" />
          Évolution du patrimoine
        </h2>
        
            {/* Period selector */}
            <div className="flex gap-2 flex-wrap">
              {Object.entries(CHART_PERIODS).map(([key, days]) => (
                <button
                  key={key}
                  onClick={() => setPeriod(days)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    period === days
                      ? 'bg-accent-primary text-white shadow-glow-primary'
                      : 'bg-dark-hover text-text-secondary hover:bg-dark-hover/80 hover:text-text-primary'
                  }`}
                >
                  {days === 'all' ? 'Tout' : `${days}J`}
                </button>
              ))}
            </div>
      </div>

      {/* Performance metrics */}
      {metrics && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-dark-hover rounded-xl p-4"
          >
            <p className="text-xs text-text-muted mb-1 uppercase tracking-wide">Valeur actuelle</p>
            <p className="text-xl font-bold text-text-primary">
              {formatCurrency(metrics.currentValue)}
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15 }}
            className="bg-dark-hover rounded-xl p-4"
          >
            <p className="text-xs text-text-muted mb-1 uppercase tracking-wide">Investi</p>
            <p className="text-xl font-bold text-text-primary">
              {formatCurrency(totalInvested)}
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-dark-hover rounded-xl p-4"
          >
            <p className="text-xs text-text-muted mb-1 uppercase tracking-wide">Variation</p>
            <div className="flex items-center gap-1">
              {(metrics.currentValue - totalInvested) >= 0 ? (
                <TrendingUp className="w-4 h-4 text-accent-green" />
              ) : (
                <TrendingDown className="w-4 h-4 text-accent-red" />
              )}
              <p className={`text-xl font-bold ${
                (metrics.currentValue - totalInvested) >= 0 ? 'text-accent-green' : 'text-accent-red'
              }`}>
                {(metrics.currentValue - totalInvested) >= 0 ? '+' : ''}
                {formatCurrency(metrics.currentValue - totalInvested)}
              </p>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.25 }}
            className="bg-dark-hover rounded-xl p-4"
          >
            <p className="text-xs text-text-muted mb-1 uppercase tracking-wide">Performance</p>
            <p className={`text-xl font-bold ${
              ((metrics.currentValue - totalInvested) / totalInvested * 100) >= 0 ? 'text-accent-green' : 'text-accent-red'
            }`}>
              {((metrics.currentValue - totalInvested) / totalInvested * 100) >= 0 ? '+' : ''}
              {totalInvested > 0 ? ((metrics.currentValue - totalInvested) / totalInvested * 100).toFixed(2) : '0.00'}%
            </p>
          </motion.div>
        </div>
      )}

      {/* Chart */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="w-full h-80 min-h-[320px]"
      >
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={history} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorPrimary" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F1C086" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#F1C086" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorRed" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorBlue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
            <XAxis 
              dataKey="date" 
              tickFormatter={formatShortDate}
              stroke="#64748B"
              style={{ fontSize: '12px' }}
              tickLine={false}
            />
            <YAxis 
              tickFormatter={(value) => formatCurrency(value, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              stroke="#64748B"
              style={{ fontSize: '12px' }}
              width={80}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke={stroke}
              strokeWidth={3}
              fill={fill}
              dot={false}
              activeDot={{ r: 6, fill: stroke, strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Footer info */}
      <div className="mt-4 text-center">
        <p className="text-xs text-text-muted">
          {period === 'all' 
            ? `Historique complet • ${history.length} points de données`
            : `${history.length} points de données • Période de ${period} jours`
          }
        </p>
      </div>
    </motion.div>
  )
}
