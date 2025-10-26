/**
 * CategoryPieChart component - Répartition des actifs par catégorie en camembert
 * Affiche un pie chart interactif avec navigation vers le détail de chaque catégorie
 * 
 * @param {Array} assets - Liste des actifs de l'utilisateur
 * @param {Function} onCategoryClick - Callback appelé lors du clic sur une catégorie
 */

import { motion } from 'framer-motion'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { PieChartIcon, TrendingUp, TrendingDown } from 'lucide-react'
import { formatCurrency, formatPercentage } from '../lib/utils/formatters'
import { calculateCategoryMetrics } from '../lib/utils/calculations'

// Palette de couleurs pour le pie chart
const COLORS = ['#F1C086', '#3B82F6', '#22C55E', '#EF4444', '#A855F7', '#EC4899', '#14B8A6', '#F59E0B']

export default function CategoryPieChart({ assets, onCategoryClick }) {
  // Calculate category metrics using centralized utility
  const categories = calculateCategoryMetrics(assets)

  if (categories.length === 0) {
    return null
  }

  // Prepare data for pie chart
  const pieData = categories.map((cat, index) => ({
    name: cat.name,
    value: cat.totalCurrent,
    color: COLORS[index % COLORS.length],
    percentage: 0, // Will be calculated by Recharts
    categoryData: cat
  }))

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0]
      const category = data.payload.categoryData
      
      return (
        <div className="bg-dark-card border border-border-subtle rounded-xl p-4 shadow-card">
          <p className="font-semibold text-text-primary mb-2 capitalize">{data.name}</p>
          <div className="space-y-1 text-sm">
            <p className="text-text-secondary">
              Valeur: <span className="font-semibold text-text-primary">{formatCurrency(data.value)}</span>
            </p>
            <p className="text-text-secondary">
              Part: <span className="font-semibold text-text-primary">{data.payload.percent ? (data.payload.percent * 100).toFixed(1) : 0}%</span>
            </p>
            <p className="text-text-secondary">
              Performance: <span className={`font-semibold ${category.isPositive ? 'text-accent-green' : 'text-accent-red'}`}>
                {formatPercentage(category.gainPercent)}
              </span>
            </p>
            <p className="text-text-secondary">
              {category.assetCount} actif{category.assetCount > 1 ? 's' : ''}
            </p>
          </div>
        </div>
      )
    }
    return null
  }

  // Custom label for pie chart
  const renderLabel = (entry) => {
    return `${entry.name}: ${(entry.percent * 100).toFixed(0)}%`
  }

  // Handle click on pie slice
  const handlePieClick = (data) => {
    if (data && data.name && onCategoryClick) {
      onCategoryClick(data.name)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card"
    >
      <h2 className="text-xl font-semibold text-text-primary mb-6 flex items-center gap-2">
        <PieChartIcon className="w-6 h-6 text-accent-primary" />
        Répartition par catégorie
      </h2>

      <div className="flex flex-col lg:flex-row items-center gap-8">
        {/* Pie Chart */}
        <div className="w-full lg:w-1/2 h-80 hidden md:block">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderLabel}
                outerRadius={120}
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
                    className="hover:opacity-80 transition-opacity"
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Category List - Always visible, takes full width on mobile */}
        <div className="w-full lg:w-1/2 space-y-3">
          {categories.map((category, index) => {
            const totalPortfolioValue = categories.reduce((sum, cat) => sum + cat.totalCurrent, 0)
            const categoryPercentage = totalPortfolioValue > 0 
              ? (category.totalCurrent / totalPortfolioValue) * 100 
              : 0

            return (
              <motion.button
                key={category.name}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => onCategoryClick(category.name)}
                className="flex items-center justify-between w-full p-4 bg-dark-hover rounded-xl border border-border-subtle hover:border-accent-primary/50 transition-all duration-200 group"
              >
                <div className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded-full flex-shrink-0" 
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  ></div>
                  <div className="text-left">
                    <p className="font-medium text-text-primary capitalize">{category.name}</p>
                    <p className="text-xs text-text-muted">
                      {category.assetCount} actif{category.assetCount > 1 ? 's' : ''} • {categoryPercentage.toFixed(1)}%
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-text-primary">{formatCurrency(category.totalCurrent)}</p>
                  <div className="flex items-center gap-1 justify-end">
                    {category.isPositive ? (
                      <TrendingUp className="w-3 h-3 text-accent-green" />
                    ) : (
                      <TrendingDown className="w-3 h-3 text-accent-red" />
                    )}
                    <span className={`text-xs ${category.isPositive ? 'text-accent-green' : 'text-accent-red'}`}>
                      {category.isPositive ? '+' : ''}{category.gainPercent.toFixed(2)}%
                    </span>
                  </div>
                </div>
              </motion.button>
            )
          })}
        </div>
      </div>
    </motion.div>
  )
}

