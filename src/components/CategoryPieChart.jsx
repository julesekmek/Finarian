/**
 * CategoryPieChart component - Répartition des actifs par catégorie en camembert
 * Affiche un pie chart interactif avec navigation vers le détail de chaque catégorie
 *
 * @param {Array} assets - Liste des actifs de l'utilisateur
 * @param {Function} onCategoryClick - Callback appelé lors du clic sur une catégorie
 */

import { motion } from "framer-motion";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { PieChartIcon, TrendingUp, TrendingDown } from "lucide-react";
import { formatCurrency, formatPercentage } from "../utils/formatters";
import { calculateCategoryMetrics } from "../utils/calculations";

// Palette de couleurs pour le pie chart
const COLORS = [
  "#F1C086",
  "#3B82F6",
  "#22C55E",
  "#EF4444",
  "#A855F7",
  "#EC4899",
  "#14B8A6",
  "#F59E0B",
];

export default function CategoryPieChart({ assets, onCategoryClick }) {
  // Calculate category metrics using centralized utility
  const categories = calculateCategoryMetrics(assets);

  if (categories.length === 0) {
    return null;
  }

  // Prepare data for pie chart with percentage calculation
  const totalValue = categories.reduce((sum, cat) => sum + cat.totalCurrent, 0);

  const pieData = categories.map((cat, index) => ({
    name: cat.name,
    value: cat.totalCurrent,
    color: COLORS[index % COLORS.length],
    percentage: totalValue > 0 ? (cat.totalCurrent / totalValue) * 100 : 0,
    categoryData: cat,
  }));

  // Custom tooltip - cleaner design like CategoryDetail
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const categoryColor = data.payload.color;
      const percentage = data.payload.percentage;

      return (
        <div className="bg-dark-card border border-border-subtle px-4 py-3 rounded-xl shadow-card">
          <p className="text-sm font-semibold text-text-primary mb-1 capitalize">
            {data.name}
          </p>
          <p
            className="text-lg font-bold mb-1"
            style={{ color: categoryColor }}
          >
            {formatCurrency(data.value)}
          </p>
          <p className="text-xs text-text-muted">{percentage.toFixed(1)}%</p>
        </div>
      );
    }
    return null;
  };

  // Handle click on pie slice
  const handlePieClick = (data) => {
    if (data && data.name && onCategoryClick) {
      onCategoryClick(data.name);
    }
  };

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
        {/* Donut Chart - improved style */}
        <div className="w-full lg:w-1/2 h-80 hidden md:block">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={120}
                innerRadius={70}
                fill="#8884d8"
                dataKey="value"
                animationDuration={800}
                onClick={handlePieClick}
                style={{ cursor: "pointer" }}
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
            const totalPortfolioValue = categories.reduce(
              (sum, cat) => sum + cat.totalCurrent,
              0
            );
            const categoryPercentage =
              totalPortfolioValue > 0
                ? (category.totalCurrent / totalPortfolioValue) * 100
                : 0;

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
                    <p className="font-medium text-text-primary capitalize">
                      {category.name}
                    </p>
                    <p className="text-xs text-text-muted">
                      {category.assetCount} actif
                      {category.assetCount > 1 ? "s" : ""} •{" "}
                      {categoryPercentage.toFixed(1)}%
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-text-primary">
                    {formatCurrency(category.totalCurrent)}
                  </p>
                  <div className="flex items-center gap-1 justify-end">
                    {category.isPositive ? (
                      <TrendingUp className="w-3 h-3 text-accent-green" />
                    ) : (
                      <TrendingDown className="w-3 h-3 text-accent-red" />
                    )}
                    <span
                      className={`text-xs ${
                        category.isPositive
                          ? "text-accent-green"
                          : "text-accent-red"
                      }`}
                    >
                      {category.isPositive ? "+" : ""}
                      {category.gainPercent.toFixed(2)}%
                    </span>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
