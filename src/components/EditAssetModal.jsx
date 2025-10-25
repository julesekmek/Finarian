import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function EditAssetModal({ asset, onClose, onSave }) {
  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
  const [symbol, setSymbol] = useState('')
  const [quantity, setQuantity] = useState('')
  const [purchasePrice, setPurchasePrice] = useState('')
  const [currentPrice, setCurrentPrice] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Pre-fill form with asset data
  useEffect(() => {
    if (asset) {
      setName(asset.name || '')
      setCategory(asset.category || '')
      setSymbol(asset.symbol || '')
      setQuantity(asset.quantity?.toString() || '0')
      setPurchasePrice(asset.purchase_price?.toString() || '0')
      setCurrentPrice(asset.current_price?.toString() || '0')
    }
  }, [asset])

  // Handle clicking outside modal to close
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  // Handle ESC key to close
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [onClose])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validate inputs
    if (!name.trim() || !category.trim()) {
      setError('Le nom et la catégorie sont requis')
      return
    }

    const numericQuantity = parseFloat(quantity)
    const numericPurchasePrice = parseFloat(purchasePrice)
    const numericCurrentPrice = parseFloat(currentPrice)

    if (isNaN(numericQuantity) || numericQuantity < 0) {
      setError('Veuillez entrer une quantité valide')
      return
    }

    if (isNaN(numericPurchasePrice) || numericPurchasePrice < 0) {
      setError('Veuillez entrer un prix d\'achat valide')
      return
    }

    if (isNaN(numericCurrentPrice) || numericCurrentPrice < 0) {
      setError('Veuillez entrer un prix actuel valide')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Update Supabase and get the updated row back with .select()
      const { data, error: updateError } = await supabase
        .from('assets')
        .update({
          name: name.trim(),
          category: category.trim(),
          symbol: symbol.trim() || null,
          quantity: numericQuantity,
          purchase_price: numericPurchasePrice,
          current_price: numericCurrentPrice,
          last_updated: new Date().toISOString(),
        })
        .eq('id', asset.id)
        .select()

      if (updateError) throw updateError

      // Construct the updated asset object
      // Use returned data if available, otherwise construct manually
      const updatedAsset = (data && data.length > 0) ? data[0] : {
        ...asset,
        name: name.trim(),
        category: category.trim(),
        symbol: symbol.trim() || null,
        quantity: numericQuantity,
        purchase_price: numericPurchasePrice,
        current_price: numericCurrentPrice,
        last_updated: new Date().toISOString(),
      }

      // Call parent callback with the updated asset
      if (onSave) {
        onSave(updatedAsset)
      }

      onClose()
    } catch (err) {
      console.error('Error updating asset:', err)
      setError(err.message || 'Erreur lors de la mise à jour')
    } finally {
      setLoading(false)
    }
  }

  if (!asset) return null

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-lg">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Modifier l'actif
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom de l'actif
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ex: Actions Apple"
              className="border border-gray-300 rounded-lg p-2 w-full focus:ring-2 focus:ring-blue-200 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Catégorie
            </label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="ex: Actions, Crypto, Immobilier"
              className="border border-gray-300 rounded-lg p-2 w-full focus:ring-2 focus:ring-blue-200 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Symbole Yahoo Finance <span className="text-gray-500 text-xs">(optionnel)</span>
            </label>
            <input
              type="text"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              placeholder="ex: AAPL, MSFT, BTC-USD"
              className="border border-gray-300 rounded-lg p-2 w-full focus:ring-2 focus:ring-blue-200 focus:outline-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              📈 Pour mise à jour automatique du prix
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quantité
            </label>
            <input
              type="number"
              step="0.01"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="1.00"
              className="border border-gray-300 rounded-lg p-2 w-full focus:ring-2 focus:ring-blue-200 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Prix d'achat unitaire (€)
            </label>
            <input
              type="number"
              step="0.01"
              value={purchasePrice}
              onChange={(e) => setPurchasePrice(e.target.value)}
              placeholder="0.00"
              className="border border-gray-300 rounded-lg p-2 w-full focus:ring-2 focus:ring-blue-200 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Prix actuel (€)
            </label>
            <input
              type="number"
              step="0.01"
              value={currentPrice}
              onChange={(e) => setCurrentPrice(e.target.value)}
              placeholder="0.00"
              className="border border-gray-300 rounded-lg p-2 w-full focus:ring-2 focus:ring-blue-200 focus:outline-none"
            />
          </div>

          {error && (
            <div className="text-sm text-red-700 bg-red-50 p-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

