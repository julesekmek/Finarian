/**
 * App component - Application principale avec sidebar
 * Gère l'authentification et le routing avec menu latéral
 */

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { supabase } from './lib/supabaseClient'
import Auth from './components/Auth'
import Sidebar from './components/Sidebar'
import PortfolioChart from './components/PortfolioChart'
import AddAssetForm from './components/AddAssetForm'
import Performance from './components/Performance'
import CategoryEvolution from './components/CategoryEvolution'
import CategoryDetail from './components/CategoryDetail'
import { REALTIME_CHANNELS } from './lib/utils/constants'

export default function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [assets, setAssets] = useState([])
  const [currentPage, setCurrentPage] = useState('dashboard')
  const [selectedCategory, setSelectedCategory] = useState(null)

  // Monitor auth state changes
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Fetch assets for Header totals
  const fetchAssets = async () => {
    if (!user) {
      setAssets([])
      return
    }

    try {
      const { data, error } = await supabase
        .from('assets')
        .select('*')
        .eq('user_id', user.id)

      if (error) throw error
      setAssets(data || [])
    } catch (error) {
      console.error('Error fetching assets:', error)
    }
  }

  // Fetch assets and subscribe to realtime updates
  useEffect(() => {
    if (!user) {
      setAssets([])
      return
    }

    fetchAssets()

    const channel = supabase
      .channel(`${REALTIME_CHANNELS.ASSETS}-header`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'assets', filter: `user_id=eq.${user.id}` },
        () => {
          fetchAssets()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user])

  // Handle category click
  const handleCategoryClick = (categoryName) => {
    setSelectedCategory(categoryName)
  }

  // Handle back from category detail
  const handleBackFromCategory = () => {
    setSelectedCategory(null)
  }

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page)
    setSelectedCategory(null)
  }

  // Loading state with modern spinner
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-dark flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <Loader2 className="w-12 h-12 text-accent-primary animate-spin" />
          <p className="text-text-secondary text-sm">Chargement de votre portefeuille...</p>
        </motion.div>
      </div>
    )
  }

  // Show auth screen if not logged in
  if (!user) {
    return <Auth />
  }

  // Main dashboard with sidebar
  return (
    <div className="min-h-screen bg-gradient-dark flex">
      {/* Background decorative gradients */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-accent-primary/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-accent-beige/5 rounded-full blur-3xl" />
      </div>

      {/* Sidebar */}
      <Sidebar 
        currentPage={currentPage} 
        onPageChange={handlePageChange} 
        userEmail={user.email}
        onPricesUpdated={fetchAssets}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 md:ml-60">
        {/* Page Content */}
        <main className="flex-1 px-4 md:px-8 py-6 w-full pt-20 md:pt-6">
          <div className="max-w-7xl mx-auto w-full">
            <AnimatePresence mode="wait">
              {/* Dashboard */}
              {currentPage === 'dashboard' && !selectedCategory && (
                <motion.div
                  key="dashboard"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  {/* Portfolio Chart */}
                  <PortfolioChart userId={user.id} />
                  
                  {/* Category Evolution */}
                  <CategoryEvolution assets={assets} onCategoryClick={handleCategoryClick} />

                  {/* Floating Add Button */}
                  <AddAssetForm userId={user.id} />
                </motion.div>
              )}

              {/* Categories Page */}
              {currentPage === 'categories' && !selectedCategory && (
                <motion.div
                  key="categories"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <CategoryEvolution assets={assets} onCategoryClick={handleCategoryClick} />
                </motion.div>
              )}

              {/* Category Detail */}
              {selectedCategory && (
                <motion.div
                  key="category-detail"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <CategoryDetail 
                    categoryName={selectedCategory}
                    assets={assets}
                    onBack={handleBackFromCategory}
                  />
                </motion.div>
              )}

              {/* Performance Page */}
              {currentPage === 'performance' && (
                <motion.div
                  key="performance"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Performance userId={user.id} assets={assets} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  )
}
