import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function ConfirmDeleteModal({ asset, onClose, onConfirm }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

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

  const handleDelete = async () => {
    setLoading(true)
    setError('')

    try {
      const { error: deleteError } = await supabase
        .from('assets')
        .delete()
        .eq('id', asset.id)

      if (deleteError) throw deleteError

      // Call parent callback
      if (onConfirm) {
        onConfirm(asset.id)
      }

      onClose()
    } catch (err) {
      console.error('Error deleting asset:', err)
      setError(err.message || 'Erreur lors de la suppression')
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
          Confirmer la suppression
        </h2>

        <p className="text-gray-700 mb-2">
          Voulez-vous vraiment supprimer cet actif ?
        </p>
        
        <div className="bg-gray-50 rounded-lg p-3 mb-4">
          <p className="font-semibold text-gray-800">{asset.name}</p>
          <p className="text-sm text-gray-600">{asset.category}</p>
        </div>

        <p className="text-sm text-red-600 font-medium mb-6">
          ⚠️ Cette action est irréversible.
        </p>

        {error && (
          <div className="text-sm text-red-700 bg-red-50 p-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={loading}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Suppression...' : 'Supprimer'}
          </button>
        </div>
      </div>
    </div>
  )
}

