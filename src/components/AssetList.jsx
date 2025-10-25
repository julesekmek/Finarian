import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import EditAssetModal from './EditAssetModal'
import ConfirmDeleteModal from './ConfirmDeleteModal'

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

    // Subscribe to realtime changes with specific event handlers
    const channel = supabase
      .channel('realtime:assets')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'assets' },
        (payload) => {
          console.log('Realtime event:', payload.eventType, payload)
          
          // Handle different event types for better performance
          if (payload.eventType === 'INSERT') {
            // Add new asset to the list if it belongs to this user
            if (payload.new.user_id === userId) {
              setAssets((prev) => [payload.new, ...prev])
            }
          } else if (payload.eventType === 'UPDATE') {
            // Update specific asset in the list if it belongs to this user
            if (payload.new.user_id === userId) {
              setAssets((prev) =>
                prev.map((asset) =>
                  asset.id === payload.new.id ? payload.new : asset
                )
              )
            }
          } else if (payload.eventType === 'DELETE') {
            // Remove asset from the list
            setAssets((prev) => prev.filter((asset) => asset.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId])

  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
    }).format(value)
  }

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  // Open edit modal
  const handleOpenEdit = (asset) => {
    setSelectedAsset(asset)
    setShowEditModal(true)
  }

  // Close edit modal
  const handleCloseEdit = () => {
    setShowEditModal(false)
    setSelectedAsset(null)
  }

  // Handle save from edit modal
  const handleSaveEdit = (updatedAsset) => {
    // Update local state immediately for better UX
    setAssets((prevAssets) =>
      prevAssets.map((asset) =>
        asset.id === updatedAsset.id ? updatedAsset : asset
      )
    )
  }

  // Open delete modal
  const handleOpenDelete = (asset) => {
    setSelectedAsset(asset)
    setShowDeleteModal(true)
  }

  // Close delete modal
  const handleCloseDelete = () => {
    setShowDeleteModal(false)
    setSelectedAsset(null)
  }

  // Handle confirm from delete modal
  const handleConfirmDelete = (assetId) => {
    // Remove from local state immediately for better UX
    setAssets((prevAssets) => prevAssets.filter((asset) => asset.id !== assetId))
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <p className="text-center text-gray-500">Loading assets...</p>
      </div>
    )
  }

  if (assets.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Your Assets</h2>
        <p className="text-center text-gray-500 py-8">
          No assets yet. Add your first asset below!
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Your Assets</h2>
      
      <div className="space-y-3">
        {assets.map((asset) => {
          const quantity = parseFloat(asset.quantity) || 0
          const purchasePrice = parseFloat(asset.purchase_price) || 0
          const currentPrice = parseFloat(asset.current_price) || purchasePrice
          const totalPurchaseValue = purchasePrice * quantity
          const totalCurrentValue = currentPrice * quantity
          const unrealizedGain = totalCurrentValue - totalPurchaseValue
          const isPositive = unrealizedGain >= 0

          return (
            <div
              key={asset.id}
              className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 text-lg">
                    {asset.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-sm text-gray-500">
                      {asset.category}
                    </p>
                    {asset.symbol && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-mono">
                        {asset.symbol}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleOpenEdit(asset)}
                    className="px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg font-medium text-sm transition-colors flex items-center gap-1"
                    title="Modifier l'actif"
                  >
                    ✏️ Modifier
                  </button>
                  <button
                    onClick={() => handleOpenDelete(asset)}
                    className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg font-medium text-sm transition-colors flex items-center gap-1"
                    title="Supprimer l'actif"
                  >
                    🗑️ Supprimer
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-gray-500">Quantité</p>
                  <p className="font-semibold text-gray-800">{quantity.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Prix d'achat unitaire</p>
                  <p className="font-semibold text-gray-800">{formatCurrency(purchasePrice)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Prix actuel</p>
                  <p className="font-semibold text-gray-800">{formatCurrency(currentPrice)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Valeur d'achat totale</p>
                  <p className="font-semibold text-gray-800">{formatCurrency(totalPurchaseValue)}</p>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-500">Valeur actuelle totale</p>
                    <p className="text-xl font-bold text-blue-600">{formatCurrency(totalCurrentValue)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Plus-value / Moins-value</p>
                    <p className={`text-xl font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                      {isPositive ? '+' : ''}{formatCurrency(unrealizedGain)}
                    </p>
                  </div>
                </div>
              </div>

              <p className="text-xs text-gray-400 mt-3">
                Dernière mise à jour: {formatDate(asset.last_updated)}
              </p>
            </div>
          )
        })}
      </div>

      {/* Edit Modal */}
      {showEditModal && selectedAsset && (
        <EditAssetModal
          asset={selectedAsset}
          onClose={handleCloseEdit}
          onSave={handleSaveEdit}
        />
      )}

      {/* Delete Confirmation Modal */}
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

