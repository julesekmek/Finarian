/**
 * Header component - Header simplifié avec actions
 * Affiche uniquement le titre et les actions (mise à jour prix, déconnexion)
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  RefreshCw,
  CheckCircle2,
  AlertCircle
} from 'lucide-react'
import { callUpdatePrices } from '../lib/updatePrices'
import { NOTIFICATION_DURATION } from '../lib/utils/constants'

export default function Header({ onPricesUpdated, userEmail }) {
  const [isUpdating, setIsUpdating] = useState(false)
  const [updateMessage, setUpdateMessage] = useState(null)

  const handleUpdatePrices = async () => {
    setIsUpdating(true)
    setUpdateMessage(null)

    const result = await callUpdatePrices()

    if (result.success) {
      const { updated, failed } = result.data
      setUpdateMessage({
        type: 'success',
        text: `${updated} prix mis à jour${failed > 0 ? `, ${failed} échec(s)` : ''}`
      })
      
      if (onPricesUpdated) {
        await onPricesUpdated()
      }
    } else {
      setUpdateMessage({
        type: 'error',
        text: `Erreur: ${result.error}`
      })
    }

    setIsUpdating(false)
    setTimeout(() => setUpdateMessage(null), NOTIFICATION_DURATION)
  }

  // Header is now empty, navigation is handled by Sidebar
  return null
}
