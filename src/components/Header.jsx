import { supabase } from '../lib/supabaseClient'

export default function Header({ assets, userEmail }) {
  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) console.error('Error signing out:', error)
  }

  // Calculate totals from assets
  const totalInvested = assets.reduce((sum, asset) => {
    const quantity = parseFloat(asset.quantity) || 0
    const purchasePrice = parseFloat(asset.purchase_price) || 0
    return sum + (purchasePrice * quantity)
  }, 0)

  const totalCurrent = assets.reduce((sum, asset) => {
    const quantity = parseFloat(asset.quantity) || 0
    const currentPrice = parseFloat(asset.current_price) || parseFloat(asset.purchase_price) || 0
    return sum + (currentPrice * quantity)
  }, 0)

  const totalGain = totalCurrent - totalInvested
  const gainPercent = totalInvested > 0 ? (totalGain / totalInvested) * 100 : 0
  const isPositiveGain = totalGain >= 0

  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
    }).format(value)
  }

  return (
    <header className="bg-white rounded-2xl shadow-sm p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-800">Finarian</h1>
        <button
          onClick={handleSignOut}
          className="text-sm text-gray-600 hover:text-gray-800 font-medium"
        >
          Sign Out
        </button>
      </div>
      
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
            <p className={`text-3xl font-semibold ${isPositiveGain ? 'text-green-600' : 'text-red-600'}`}>
              {isPositiveGain ? '+' : ''}{formatCurrency(totalGain)}
            </p>
            <p className={`text-xl font-semibold ${isPositiveGain ? 'text-green-600' : 'text-red-600'}`}>
              ({isPositiveGain ? '+' : ''}{gainPercent.toFixed(2)}%)
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

