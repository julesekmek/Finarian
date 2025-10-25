/**
 * Utility to call the Supabase Edge Function for updating asset prices
 * Uses Yahoo Finance API via Edge Function to keep API logic server-side
 */

import { supabase } from './supabaseClient'

/**
 * Call the update-prices Edge Function
 * Fetches current prices from Yahoo Finance and updates the database
 * 
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 */
export async function callUpdatePrices() {
  try {
    // Get the current user session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError || !session) {
      throw new Error('User not authenticated')
    }

    // Get the function URL from environment
    const functionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/update-prices`
    
    // Call the Edge Function with the user's JWT token
    const response = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || `HTTP error: ${response.status}`)
    }

    const data = await response.json()
    
    return {
      success: true,
      data,
    }
  } catch (error) {
    console.error('Error updating prices:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    }
  }
}

