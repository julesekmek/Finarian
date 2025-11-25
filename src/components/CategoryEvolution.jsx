/**
 * CategoryEvolution component - Affiche l'évolution par catégories
 * Cartes cliquables pour chaque catégorie avec ses métriques
 *
 * @param {Array} assets - Liste des actifs de l'utilisateur
 * @param {Function} onCategoryClick - Callback appelé lors du clic sur une catégorie
 */

import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  ChevronRight,
  RefreshCw,
} from "lucide-react";
import { formatCurrency } from "../lib/utils/formatters";
import { calculateCategoryMetrics } from "../lib/utils/calculations";
import { usePullToRefresh } from "../lib/hooks/usePullToRefresh";
import { callUpdatePrices } from "../lib/updatePrices";

export default function CategoryEvolution({ assets, onCategoryClick }) {
  // Calculate category metrics using centralized utility
  const categories = calculateCategoryMetrics(assets);

  // Pull-to-refresh functionality
  const handleRefresh = async () => {
    await callUpdatePrices();
    // Assets will be updated via realtime subscription in App.jsx
  };

  const { containerRef, isPulling, isRefreshing, pullDistance, pullThreshold } =
    usePullToRefresh(handleRefresh);

  if (categories.length === 0) {
    return null;
  }

  return (
    <div ref={containerRef} className="relative">
      {/* Pull-to-refresh indicator */}
      {(isPulling || isRefreshing) && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-0 left-1/2 transform -translate-x-1/2 z-50 bg-dark-card border border-border-subtle rounded-full px-4 py-2 shadow-glow-primary flex items-center gap-2"
          style={{ marginTop: `${Math.min(pullDistance * 0.5, 40)}px` }}
        >
          <RefreshCw
            className={`w-4 h-4 text-accent-primary ${
              isRefreshing ? "animate-spin" : ""
            }`}
          />
          <span className="text-xs font-medium text-text-primary">
            {isRefreshing
              ? "Actualisation..."
              : pullDistance >= pullThreshold
              ? "Relâcher pour actualiser"
              : "Tirer pour actualiser"}
          </span>
        </motion.div>
      )}

      <div className="card">
        <h2 className="text-xl font-semibold text-text-primary mb-6 flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-accent-primary" />
          Évolution par catégories
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category, index) => {
            const isPositive = category.gainPercent >= 0;

            return (
              <motion.button
                key={category.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => onCategoryClick(category.name)}
                className="bg-gradient-card border border-border-subtle rounded-xl p-5 hover:border-accent-primary/50 transition-all text-left group"
              >
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-text-primary text-lg capitalize mb-1">
                      {category.name}
                    </h3>
                    <p className="text-sm text-text-muted">
                      {category.assetCount} actif
                      {category.assetCount > 1 ? "s" : ""}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-text-muted group-hover:text-accent-primary transition-colors" />
                </div>

                {/* Metrics */}
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-text-muted mb-1">Investi</p>
                    <p className="text-lg font-semibold text-text-secondary">
                      {formatCurrency(category.totalInvested)}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-text-muted mb-1">
                      Valeur actuelle
                    </p>
                    <p className="text-2xl font-bold text-text-primary">
                      {formatCurrency(category.totalCurrent)}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-border-subtle">
                    <p className="text-xs text-text-muted mb-1">Performance</p>
                    <div className="flex items-center gap-2">
                      {isPositive ? (
                        <TrendingUp className="w-4 h-4 text-accent-green" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-accent-red" />
                      )}
                      <p
                        className={`text-xl font-bold ${
                          isPositive ? "text-accent-green" : "text-accent-red"
                        }`}
                      >
                        {isPositive ? "+" : ""}
                        {category.gainPercent.toFixed(2)}%
                      </p>
                    </div>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
