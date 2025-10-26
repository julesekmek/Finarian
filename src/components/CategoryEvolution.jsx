/**
 * CategoryEvolution component - Affiche la répartition par catégories en camembert
 * Graphique interactif avec légende cliquable pour accéder aux détails
 * 
 * @param {Array} assets - Liste des actifs de l'utilisateur
 * @param {Function} onCategoryClick - Callback appelé lors du clic sur une catégorie
 */

import { motion } from 'framer-motion'
import { PieChart as PieChartIcon, TrendingUp, TrendingDown } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { formatCurrency } from '../lib/utils/formatters'
import { calculateCategoryMetrics } from '../lib/utils/calculations'

// Palette de couleurs pour les catégories
const COLORS = [
  '#F1C086', // Primary beige
  '#3B82F6', // Blue
  '#22C55E', // Green
  '#EC4899', // Pink
  '#A855F7', // Purple
  '#F59E0B', // Amber
  '#14B8A6', // Teal
  '#EF4444', // Red
]

export default function CategoryEvolution({ assets, onCategoryClick }) {
  // Calculate category metrics using centralized utility
  const categories = calculateCategoryMetrics(assets)

  if (categories.length === 0) {
    return null
  }

  // Calculate total for percentages
  const totalValue = categories.reduce((sum, cat) => sum + cat.totalCurrent, 0)

  // Prepare data for pie chart
  const pieData = categories.map((cat, index) => ({
    name: cat.name,
    value: cat.totalCurrent,
    percentage: ((cat.totalCurrent / totalValue) * 100).toFixed(1),
    color: COLORS[index % COLORS.length],
    ...cat
  }))

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length > 0) {
      const data = payload[0].payload
      return (
        <div className="bg-dark-card border border-border-subtle px-4 py-3 rounded-xl shadow-card">
          <p className="text-sm font-semibold text-text-primary mb-2 capitalize">{data.name}</p>
          <p className="text-xs text-text-muted mb-1">Valeur: {formatCurrency(data.value)}</p>
          <p className="text-xs text-text-muted">Part: {data.percentage}%</p>
        </div>
      )
    }
    return null
  }

  // Handle pie chart click
  const handlePieClick = (data) => {
    if (data && data.name) {
      onCategoryClick(data.name)
    }
  }

  return (
    <div className="card">
      <h2 className="text-xl font-semibold text-text-primary mb-6 flex items-center gap-2">
        <PieChartIcon className="w-6 h-6 text-accent-primary" />
        Répartition par catégories
      </h2>

      <div className="flex flex-col lg:flex-row gap-6 items-center">
        {/* Pie Chart - Hidden on mobile */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full lg:w-1/2 h-64 lg:h-80 hidden md:block"
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={window.innerWidth >= 1024 ? 120 : 100}
                fill="#8884d8"
                dataKey="value"
                animationDuration={800}
                onClick={handlePieClick}
                style={{ cursor: 'pointer' }}
              >
                {pieData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color}
                    stroke={entry.color}
                    strokeWidth={2}
                    style={{ outline: 'none' }}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Legend with details */}
        <div className="w-full lg:w-1/2 space-y-3">
          {pieData.map((category, index) => {
            const isPositive = category.gainPercent >= 0

            return (
              <motion.button
                key={category.name}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => onCategoryClick(category.name)}
                className="w-full bg-gradient-card border border-border-subtle rounded-xl p-4 hover:border-accent-primary/50 transition-all text-left group"
              >
                <div className="flex items-center justify-between">
                  {/* Left: Color indicator and name */}
                  <div className="flex items-center gap-3 flex-1">
                    <div 
                      className="w-4 h-4 rounded-full flex-shrink-0"
                      style={{ backgroundColor: category.color }}
                    />
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-text-primary capitalize truncate">
                        {category.name}
                      </h3>
                      <p className="text-xs text-text-muted">
                        {category.assetCount} actif{category.assetCount > 1 ? 's' : ''} • {category.percentage}%
                      </p>
                    </div>
                  </div>

                  {/* Right: Value and performance */}
                  <div className="text-right">
                    <p className="font-bold text-text-primary">
                      {formatCurrency(category.totalCurrent)}
                    </p>
                    <div className="flex items-center gap-1 justify-end">
                      {isPositive ? (
                        <TrendingUp className="w-3 h-3 text-accent-green" />
                      ) : (
                        <TrendingDown className="w-3 h-3 text-accent-red" />
                      )}
                      <span className={`text-xs font-semibold ${
                        isPositive ? 'text-accent-green' : 'text-accent-red'
                      }`}>
                        {isPositive ? '+' : ''}{category.gainPercent.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              </motion.button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

