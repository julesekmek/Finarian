import { useState, useEffect } from 'react'
import { supabase } from './lib/supabaseClient'
import Auth from './components/Auth'
import Header from './components/Header'
import AssetList from './components/AssetList'
import AddAssetForm from './components/AddAssetForm'

export default function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [assets, setAssets] = useState([])

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

  // Fetch assets to calculate total wealth
  useEffect(() => {
    if (!user) {
      setAssets([])
      return
    }

    const fetchAssets = async () => {
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

    fetchAssets()

    // Subscribe to realtime changes for total wealth update
    const channel = supabase
      .channel('assets-for-wealth')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'assets' },
        () => {
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
      <div className="max-w-2xl mx-auto">
        <Header assets={assets} userEmail={user.email} />
        
        <div className="space-y-6">
          <AssetList userId={user.id} />
          <AddAssetForm userId={user.id} />
        </div>
      </div>
    </div>
  )
}

