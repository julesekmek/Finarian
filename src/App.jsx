/**
 * App component - Main application entry point
 * Handles authentication state and page routing
 */

import { useState, useEffect } from 'react'
import { supabase } from './lib/supabaseClient'
import Auth from './components/Auth'
import Header from './components/Header'
import PortfolioChart from './components/PortfolioChart'
import AssetList from './components/AssetList'
import AddAssetForm from './components/AddAssetForm'
import Performance from './components/Performance'
import { REALTIME_CHANNELS } from './lib/utils/constants'

export default function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [assets, setAssets] = useState([])
  const [currentPage, setCurrentPage] = useState('dashboard')

  // Monitor auth state changes
  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
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

  // Fetch assets and subscribe to realtime updates for Header
  useEffect(() => {
    if (!user) {
      setAssets([])
      return
    }

    fetchAssets()

    // Subscribe to realtime changes for Header totals
    // AssetList has its own subscription for list updates
    const channel = supabase
      .channel(`${REALTIME_CHANNELS.ASSETS}-header`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'assets', filter: `user_id=eq.${user.id}` },
        () => {
          // Only refetch for Header calculations
          fetchAssets()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user])

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  // Show auth screen if not logged in
  if (!user) {
    return <Auth />
  }

  // Show dashboard if logged in
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <Header 
          assets={assets} 
          userEmail={user.email} 
          onPricesUpdated={fetchAssets}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
        />
        
        {currentPage === 'dashboard' ? (
          <div className="space-y-6">
            {/* Portfolio evolution chart */}
            <PortfolioChart userId={user.id} />
            
            {/* Assets management */}
            <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
              <AssetList userId={user.id} />
              <AddAssetForm userId={user.id} />
            </div>
          </div>
        ) : (
          <Performance userId={user.id} assets={assets} />
        )}
      </div>
    </div>
  )
}

