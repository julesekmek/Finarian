/**
 * Sidebar component - Sidebar navigation moderne
 * Remplace la navigation horizontale avec un menu latéral fixe
 */

import { motion } from 'framer-motion'
import { 
  LayoutDashboard, 
  BarChart3,
  FolderKanban,
  TrendingUp,
  LogOut,
  Menu,
  X,
  RefreshCw
} from 'lucide-react'
import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { callUpdatePrices } from '../lib/updatePrices'

export default function Sidebar({ currentPage, onPageChange, userEmail, onPricesUpdated }) {
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) console.error('Error signing out:', error)
  }

  const handleUpdatePrices = async () => {
    setIsUpdating(true)
    
    try {
      const result = await callUpdatePrices()
      
      if (result.success && onPricesUpdated) {
        await onPricesUpdated()
      }
    } catch (err) {
      console.error('Error updating prices:', err)
    } finally {
      setIsUpdating(false)
    }
  }

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'categories', label: 'Catégories', icon: FolderKanban },
    { id: 'performance', label: 'Performance', icon: BarChart3 },
    { id: 'update', label: 'Actualiser les prix', icon: RefreshCw, action: handleUpdatePrices },
  ]

  const handleNavigation = (pageId) => {
    onPageChange(pageId)
    setIsMobileOpen(false)
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="fixed top-4 left-4 z-50 md:hidden p-3 bg-dark-card border border-border-subtle rounded-xl text-text-primary hover:bg-dark-hover transition-all"
      >
        {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen w-60 bg-dark-card border-r border-border-subtle z-40 flex flex-col transition-transform duration-300 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-border-subtle">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-primary rounded-xl shadow-glow-primary">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-text-primary">Finarian</h1>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = currentPage === item.id
            const isUpdateButton = item.id === 'update'
            
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.action) {
                    item.action()
                  } else {
                    handleNavigation(item.id)
                  }
                }}
                disabled={isUpdateButton && isUpdating}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all ${
                  isActive && !isUpdateButton
                    ? 'bg-accent-primary text-white shadow-glow-primary'
                    : 'text-text-secondary hover:text-text-primary hover:bg-dark-hover'
                } ${isUpdateButton && isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Icon className={`w-5 h-5 ${isUpdateButton && isUpdating ? 'animate-spin' : ''}`} />
                {isUpdateButton && isUpdating ? 'Mise à jour...' : item.label}
              </button>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-border-subtle">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm text-text-secondary hover:text-text-primary hover:bg-dark-hover transition-all"
          >
            <LogOut className="w-5 h-5" />
            Déconnexion
          </button>
          
          {userEmail && (
            <div className="mt-3 px-4 py-2 text-xs text-text-muted break-all">
              {userEmail}
            </div>
          )}
        </div>
      </aside>
    </>
  )
}

