/**
 * CategoryDetail component - Page détail d'une catégorie
 * Affiche les actifs d'une catégorie spécifique avec leurs performances
 * 
 * @param {string} categoryName - Nom de la catégorie à afficher
 * @param {Array} assets - Liste complète des actifs
 * @param {Function} onBack - Callback pour retourner à la vue précédente
 */

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, TrendingUp, TrendingDown, Wallet, Edit, Trash2 } from 'lucide-react'
import { formatCurrency, formatDate } from '../lib/utils/formatters'
import { calculateAssetMetrics, calculateCategoryMetrics } from '../lib/utils/calculations'
import EditAssetModal from './EditAssetModal'
import ConfirmDeleteModal from './ConfirmDeleteModal'

export default function CategoryDetail({ categoryName, assets, onBack }) {
  const [selectedAsset, setSelectedAsset] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  // Filter assets for this category
  const categoryAssets = assets.filter(asset => asset.category === categoryName)

  // Calculate category totals using centralized utility
  const categoryMetrics = calculateCategoryMetrics(categoryAssets)[0] || {
    totalInvested: 0,
    totalCurrent: 0,
    totalGain: 0,
    gainPercent: 0,
    isPositive: false
  }

  const { totalInvested, totalCurrent, totalGain, gainPercent, isPositive } = categoryMetrics

  // Enrich assets with their individual metrics
  const enrichedAssets = categoryAssets.map(asset => ({
    ...asset,
    metrics: calculateAssetMetrics(asset)
  }))

  // Modal handlers
  const handleOpenEdit = (asset) => {
    setSelectedAsset(asset)
    setShowEditModal(true)
  }

  const handleCloseEdit = () => {
    setShowEditModal(false)
    setSelectedAsset(null)
  }

  const handleSaveEdit = () => {
    // No need to manually update - realtime subscription in App.jsx will handle it
    handleCloseEdit()
  }

  const handleOpenDelete = (asset) => {
    setSelectedAsset(asset)
    setShowDeleteModal(true)
  }

  const handleCloseDelete = () => {
    setShowDeleteModal(false)
    setSelectedAsset(null)
  }

  const handleConfirmDelete = () => {
    // No need to manually update - realtime subscription in App.jsx will handle it
    handleCloseDelete()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          Retour
        </button>

        <h1 className="text-3xl font-bold text-text-primary mb-6 capitalize">
          {categoryName}
        </h1>

        {/* Category Totals */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-dark-hover rounded-xl p-4">
            <p className="text-xs text-text-muted uppercase tracking-wide mb-2">Investi</p>
            <p className="text-2xl font-bold text-text-secondary">
              {formatCurrency(totalInvested)}
            </p>
          </div>

          <div className="bg-dark-hover rounded-xl p-4">
            <p className="text-xs text-text-muted uppercase tracking-wide mb-2">Valeur actuelle</p>
            <p className="text-2xl font-bold text-text-primary">
              {formatCurrency(totalCurrent)}
            </p>
          </div>

          <div className="bg-dark-hover rounded-xl p-4">
            <p className="text-xs text-text-muted uppercase tracking-wide mb-2">Variation</p>
            <div className="flex items-center gap-1">
              {isPositive ? (
                <TrendingUp className="w-4 h-4 text-accent-green" />
              ) : (
                <TrendingDown className="w-4 h-4 text-accent-red" />
              )}
              <p className={`text-2xl font-bold ${
                isPositive ? 'text-accent-green' : 'text-accent-red'
              }`}>
                {isPositive ? '+' : ''}{formatCurrency(totalGain)}
              </p>
            </div>
          </div>

          <div className="bg-dark-hover rounded-xl p-4">
            <p className="text-xs text-text-muted uppercase tracking-wide mb-2">Performance</p>
            <div className="flex items-center gap-1">
              {isPositive ? (
                <TrendingUp className="w-4 h-4 text-accent-green" />
              ) : (
                <TrendingDown className="w-4 h-4 text-accent-red" />
              )}
              <p className={`text-2xl font-bold ${
                isPositive ? 'text-accent-green' : 'text-accent-red'
              }`}>
                {isPositive ? '+' : ''}{gainPercent.toFixed(2)}%
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Assets List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card"
      >
        <h2 className="text-xl font-semibold text-text-primary mb-6 flex items-center gap-2">
          <Wallet className="w-6 h-6 text-accent-primary" />
          Actifs ({enrichedAssets.length})
        </h2>

        <div className="space-y-3">
          {enrichedAssets.map((asset, index) => {
            const { metrics } = asset

            return (
              <motion.div
                key={asset.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-gradient-card border border-border-subtle rounded-xl p-5 hover:border-accent-primary/30 transition-all"
              >
                {/* Asset Header */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-text-primary text-lg">
                        {asset.name}
                      </h3>
                      {asset.symbol && (
                        <span className="text-xs bg-accent-beige/20 text-white px-2 py-1 rounded-lg font-mono">
                          {asset.symbol}
                        </span>
                      )}
                    </div>
                  </div>
                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleOpenEdit(asset)}
                      className="p-2 bg-dark-hover hover:bg-border-default text-text-secondary hover:text-text-primary rounded-lg transition-colors"
                      title="Modifier l'actif"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleOpenDelete(asset)}
                      className="p-2 bg-dark-hover hover:bg-border-default text-accent-red rounded-lg transition-colors"
                      title="Supprimer l'actif"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Asset Metrics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                  <div>
                    <p className="text-xs text-text-muted mb-1">Quantité</p>
                    <p className="font-semibold text-text-primary">{metrics.quantity.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-text-muted mb-1">Prix d'achat</p>
                    <p className="font-semibold text-text-primary">{formatCurrency(metrics.purchasePrice)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-text-muted mb-1">Prix actuel</p>
                    <p className="font-semibold text-text-primary">{formatCurrency(metrics.currentPrice)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-text-muted mb-1">Investissement</p>
                    <p className="font-semibold text-text-primary">{formatCurrency(metrics.totalPurchaseValue)}</p>
                  </div>
                </div>

                {/* Value and Performance */}
                <div className="flex justify-between items-center pt-4 border-t border-border-subtle">
                  <div>
                    <p className="text-xs text-text-muted mb-1">Valeur actuelle</p>
                    <p className="text-2xl font-bold text-accent-beige">
                      {formatCurrency(metrics.totalCurrentValue)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-text-muted mb-1">Plus/Moins-value</p>
                    <div className="flex items-center gap-1 justify-end">
                      {metrics.isPositive ? (
                        <TrendingUp className="w-5 h-5 text-accent-green" />
                      ) : (
                        <TrendingDown className="w-5 h-5 text-accent-red" />
                      )}
                      <p className={`text-xl font-bold ${
                        metrics.isPositive ? 'text-accent-green' : 'text-accent-red'
                      }`}>
                        {metrics.isPositive ? '+' : ''}{formatCurrency(metrics.unrealizedGain)}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </motion.div>

      {/* Modals */}
      {showEditModal && selectedAsset && (
        <EditAssetModal
          asset={selectedAsset}
          onClose={handleCloseEdit}
          onSave={handleSaveEdit}
        />
      )}

      {showDeleteModal && selectedAsset && (
        <ConfirmDeleteModal
          asset={selectedAsset}
          onClose={handleCloseDelete}
          onConfirm={handleConfirmDelete}
        />
      )}
    </div>
  )
}

