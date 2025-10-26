/**
 * AssetList component - Modern asset cards with animations
 * Beautiful horizontal cards with swipe actions
 */

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TrendingUp, TrendingDown, Edit, Trash2, Wallet } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import EditAssetModal from './EditAssetModal'
import ConfirmDeleteModal from './ConfirmDeleteModal'
import { formatCurrency, formatDate } from '../lib/utils/formatters'
import { calculateAssetMetrics } from '../lib/utils/calculations'
import { REALTIME_CHANNELS } from '../lib/utils/constants'

export default function AssetList({ userId }) {
  const [assets, setAssets] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedAsset, setSelectedAsset] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  // Fetch assets from Supabase
  const fetchAssets = async () => {
    try {
      const { data, error } = await supabase
        .from('assets')
        .select('*')
        .eq('user_id', userId)
        .order('last_updated', { ascending: false })

      if (error) throw error
      setAssets(data || [])
    } catch (error) {
      console.error('Error fetching assets:', error)
    } finally {
      setLoading(false)
    }
  }

  // Set up realtime subscription
  useEffect(() => {
    fetchAssets()

    const channel = supabase
      .channel(REALTIME_CHANNELS.ASSETS)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'assets' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            if (payload.new.user_id === userId) {
              setAssets((prev) => [payload.new, ...prev])
            }
          } else if (payload.eventType === 'UPDATE') {
            if (payload.new.user_id === userId) {
              setAssets((prev) =>
                prev.map((asset) =>
                  asset.id === payload.new.id ? payload.new : asset
                )
              )
            }
          } else if (payload.eventType === 'DELETE') {
            setAssets((prev) => prev.filter((asset) => asset.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId])

  const handleOpenEdit = (asset) => {
    setSelectedAsset(asset)
    setShowEditModal(true)
  }

  const handleCloseEdit = () => {
    setShowEditModal(false)
    setSelectedAsset(null)
  }

  const handleSaveEdit = (updatedAsset) => {
    setAssets((prevAssets) =>
      prevAssets.map((asset) =>
        asset.id === updatedAsset.id ? updatedAsset : asset
      )
    )
  }

  const handleOpenDelete = (asset) => {
    setSelectedAsset(asset)
    setShowDeleteModal(true)
  }

  const handleCloseDelete = () => {
    setShowDeleteModal(false)
    setSelectedAsset(null)
  }

  const handleConfirmDelete = (assetId) => {
    setAssets((prevAssets) => prevAssets.filter((asset) => asset.id !== assetId))
  }

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-dark-hover rounded-lg w-1/4"></div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-dark-hover rounded-xl"></div>
          ))}
        </div>
      </motion.div>
    )
  }

  if (assets.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        <h2 className="text-xl font-semibold text-text-primary mb-4 flex items-center gap-2">
          <Wallet className="w-6 h-6 text-accent-primary" />
          Vos actifs
        </h2>
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-dark-hover rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Wallet className="w-8 h-8 text-text-muted" />
          </div>
          <p className="text-lg text-text-secondary mb-2">Aucun actif</p>
          <p className="text-sm text-text-muted">
            Ajoutez votre premier actif ci-dessous
          </p>
        </div>
      </motion.div>
    )
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        <h2 className="text-xl font-semibold text-text-primary mb-6 flex items-center gap-2">
          <Wallet className="w-6 h-6 text-accent-primary" />
          Vos actifs
        </h2>
        
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {assets.map((asset, index) => {
              const metrics = calculateAssetMetrics(asset)

              return (
                <motion.div
                  key={asset.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.05 }}
                  className="group relative bg-gradient-card border border-border-subtle rounded-2xl p-5 hover:border-accent-primary/30 transition-all duration-300"
                >
                  {/* Asset Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-text-primary text-lg">
                          {asset.name}
                        </h3>
                        {asset.symbol && (
                          <span className="text-xs bg-accent-beige/20 text-gray-700 px-2 py-1 rounded-lg font-mono">
                            {asset.symbol}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-text-muted capitalize">
                        {asset.category}
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleOpenEdit(asset)}
                        className="p-2 bg-dark-hover hover:bg-accent-blue/20 text-accent-blue rounded-xl transition-all"
                        title="Modifier"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleOpenDelete(asset)}
                        className="p-2 bg-dark-hover hover:bg-accent-red/20 text-accent-red rounded-xl transition-all"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
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

                  {/* Last Update */}
                  <p className="text-xs text-text-muted mt-3">
                    Mis à jour: {formatDate(asset.last_updated)}
                  </p>
                </motion.div>
              )
            })}
          </AnimatePresence>
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
    </>
  )
}
