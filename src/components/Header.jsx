/**
 * Header component
 * Displays navigation, portfolio totals, and price update button
 */

import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { callUpdatePrices } from '../lib/updatePrices'
import { formatCurrency, formatPercentage, formatWithSign } from '../lib/utils/formatters'
import { calculatePortfolioTotals } from '../lib/utils/calculations'
import { NOTIFICATION_DURATION } from '../lib/utils/constants'

export default function Header({ assets, userEmail, onPricesUpdated, currentPage, onPageChange }) {
  const [isUpdating, setIsUpdating] = useState(false)
  const [updateMessage, setUpdateMessage] = useState(null)

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) console.error('Error signing out:', error)
  }

  const handleUpdatePrices = async () => {
    setIsUpdating(true)
    setUpdateMessage(null)

    const result = await callUpdatePrices()

    if (result.success) {
      const { updated, failed } = result.data
      setUpdateMessage({
        type: 'success',
        text: `✓ ${updated} prix mis à jour${failed > 0 ? `, ${failed} échec(s)` : ''}`
      })
      
      // Refresh assets after update
      if (onPricesUpdated) {
        await onPricesUpdated()
      }
    } else {
      setUpdateMessage({
        type: 'error',
        text: `✗ Erreur: ${result.error}`
      })
    }

    setIsUpdating(false)

    // Clear message after configured duration
    setTimeout(() => setUpdateMessage(null), NOTIFICATION_DURATION)
  }

  // Calculate portfolio totals using utility function
  const { totalInvested, totalCurrent, totalGain, gainPercent, isPositive } = 
    calculatePortfolioTotals(assets)

  return (
    <header className="bg-white rounded-2xl shadow-sm p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-6">
          <h1 className="text-2xl font-bold text-gray-800">Finarian</h1>
          
          {/* Navigation */}
          <nav className="flex gap-2">
            <button
              onClick={() => onPageChange('dashboard')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                currentPage === 'dashboard'
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              🏠 Dashboard
            </button>
            <button
              onClick={() => onPageChange('performance')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                currentPage === 'performance'
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              📈 Performance
            </button>
          </nav>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={handleUpdatePrices}
            disabled={isUpdating}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
              isUpdating
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95'
            }`}
          >
            <span className={isUpdating ? 'animate-spin' : ''}>
              🔄
            </span>
            {isUpdating ? 'Mise à jour...' : 'Mettre à jour les prix'}
          </button>
          <button
            onClick={handleSignOut}
            className="text-sm text-gray-600 hover:text-gray-800 font-medium"
          >
            Sign Out
          </button>
        </div>
      </div>

      {updateMessage && (
        <div className={`mb-4 p-3 rounded-lg text-sm font-medium ${
          updateMessage.type === 'success' 
            ? 'bg-green-50 text-green-700 border border-green-200' 
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {updateMessage.text}
        </div>
      )}
      
      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-600 mb-1">Montant investi</p>
          <p className="text-3xl font-bold text-gray-800">
            {formatCurrency(totalInvested)}
          </p>
        </div>

        <div>
          <p className="text-sm text-gray-600 mb-1">Valeur actuelle</p>
          <p className="text-4xl font-bold text-blue-600">
            {formatCurrency(totalCurrent)}
          </p>
        </div>

        <div>
          <p className="text-sm text-gray-600 mb-1">Gain / Perte total</p>
          <div className="flex items-baseline gap-3">
            <p className={`text-3xl font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {formatWithSign(formatCurrency(totalGain))}
            </p>
            <p className={`text-xl font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              ({formatPercentage(gainPercent)})
            </p>
          </div>
        </div>
      </div>
      
      {userEmail && (
        <p className="text-xs text-gray-500 mt-4">
          Logged in as {userEmail}
        </p>
      )}
    </header>
  )
}

