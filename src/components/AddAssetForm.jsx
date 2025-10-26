/**
 * AddAssetForm component
 * Form for adding new assets to the portfolio
 */

import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function AddAssetForm({ userId }) {
  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
  const [symbol, setSymbol] = useState('')
  const [quantity, setQuantity] = useState('')
  const [purchasePrice, setPurchasePrice] = useState('')
  const [currentPrice, setCurrentPrice] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validate inputs
    if (!name.trim() || !category.trim() || !quantity || !purchasePrice) {
      setError('Please fill in all required fields')
      return
    }

    const numericQuantity = parseFloat(quantity)
    const numericPurchasePrice = parseFloat(purchasePrice)
    const numericCurrentPrice = currentPrice ? parseFloat(currentPrice) : numericPurchasePrice

    if (isNaN(numericQuantity) || numericQuantity <= 0) {
      setError('Please enter a valid positive number for quantity')
      return
    }

    if (isNaN(numericPurchasePrice) || numericPurchasePrice < 0) {
      setError('Please enter a valid positive number for purchase price')
      return
    }

    if (currentPrice && (isNaN(numericCurrentPrice) || numericCurrentPrice < 0)) {
      setError('Please enter a valid positive number for current price')
      return
    }

    setLoading(true)
    setError('')

    try {
      const { error: insertError } = await supabase.from('assets').insert({
        name: name.trim(),
        category: category.trim(),
        symbol: symbol.trim() || null,
        quantity: numericQuantity,
        purchase_price: numericPurchasePrice,
        current_price: numericCurrentPrice,
        user_id: userId,
      })

      if (insertError) throw insertError

      // Reset form
      setName('')
      setCategory('')
      setSymbol('')
      setQuantity('')
      setPurchasePrice('')
      setCurrentPrice('')
    } catch (err) {
      console.error('Error adding asset:', err)
      setError(err.message || 'Failed to add asset')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Add New Asset</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Asset Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Savings Account, Stock Portfolio"
            className="border rounded-lg p-2 w-full focus:ring focus:ring-blue-200 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="e.g., Cash, Stocks, Real Estate"
            className="border rounded-lg p-2 w-full focus:ring focus:ring-blue-200 focus:outline-none"
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
            placeholder="e.g., AAPL, MSFT, BTC-USD, ^FCHI"
            className="border rounded-lg p-2 w-full focus:ring focus:ring-blue-200 focus:outline-none"
          />
          <p className="text-xs text-gray-500 mt-1">
            📈 Si renseigné, le prix pourra être mis à jour automatiquement
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
            className="border rounded-lg p-2 w-full focus:ring focus:ring-blue-200 focus:outline-none"
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
            className="border rounded-lg p-2 w-full focus:ring focus:ring-blue-200 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Prix actuel (€) <span className="text-gray-500 text-xs">(optionnel)</span>
          </label>
          <input
            type="number"
            step="0.01"
            value={currentPrice}
            onChange={(e) => setCurrentPrice(e.target.value)}
            placeholder="0.00"
            className="border rounded-lg p-2 w-full focus:ring focus:ring-blue-200 focus:outline-none"
          />
        </div>

        {error && (
          <div className="text-sm text-red-700 bg-red-50 p-3 rounded-lg">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Adding...' : 'Add Asset'}
        </button>
      </form>
    </div>
  )
}

