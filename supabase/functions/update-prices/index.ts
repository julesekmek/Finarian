// Supabase Edge Function to update asset prices from Yahoo Finance
// This function fetches current prices and updates the database

import { createClient } from 'jsr:@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

interface Asset {
  id: string
  symbol: string | null
  name: string
  current_price: number
}

interface YahooFinanceQuote {
  regularMarketPrice?: number
  symbol?: string
}

/**
 * Fetch price from Yahoo Finance API
 * Uses the Yahoo Finance V8 API (unofficial but reliable)
 */
async function fetchYahooPrice(symbol: string): Promise<number | null> {
  try {
    // Yahoo Finance V8 API endpoint
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}`
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Finarian App)',
      },
    })

    if (!response.ok) {
      console.error(`Yahoo Finance API error for ${symbol}: ${response.status}`)
      return null
    }

    const data = await response.json()
    
    // Extract the current price from the response
    const result = data?.chart?.result?.[0]
    const price = result?.meta?.regularMarketPrice
    
    if (typeof price === 'number' && !isNaN(price)) {
      return price
    }
    
    console.warn(`No valid price found for symbol: ${symbol}`)
    return null
  } catch (error) {
    console.error(`Error fetching price for ${symbol}:`, error)
    return null
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Initialize Supabase client with service role for admin operations
    // These env vars are automatically provided by Supabase Edge Runtime
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

    // Verify the user's token is valid
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log(`Price update requested by user: ${user.id}`)

    // Fetch all assets with symbols for this user
    const { data: assets, error: fetchError } = await supabaseAdmin
      .from('assets')
      .select('id, symbol, name, current_price')
      .eq('user_id', user.id)
      .not('symbol', 'is', null)

    if (fetchError) {
      throw new Error(`Failed to fetch assets: ${fetchError.message}`)
    }

    if (!assets || assets.length === 0) {
      return new Response(
        JSON.stringify({ 
          message: 'No assets with symbols found',
          updated: 0,
          failed: 0
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log(`Found ${assets.length} assets with symbols to update`)

    // Update prices for all assets
    const updates: Array<{ id: string; price: number; symbol: string }> = []
    const failures: Array<{ id: string; symbol: string; reason: string }> = []

    for (const asset of assets as Asset[]) {
      if (!asset.symbol) continue

      const price = await fetchYahooPrice(asset.symbol)
      
      if (price !== null && price > 0) {
        updates.push({ 
          id: asset.id, 
          price, 
          symbol: asset.symbol 
        })
      } else {
        failures.push({
          id: asset.id,
          symbol: asset.symbol,
          reason: 'Price not found or invalid'
        })
      }

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    // Batch update all successful price fetches + insert into history
    if (updates.length > 0) {
      const today = new Date().toISOString().split('T')[0] // Format: YYYY-MM-DD
      
      for (const update of updates) {
        // 1. Update current_price in assets table
        const { error: updateError } = await supabaseAdmin
          .from('assets')
          .update({
            current_price: update.price,
            last_updated: new Date().toISOString()
          })
          .eq('id', update.id)
          .eq('user_id', user.id)

        if (updateError) {
          console.error(`Failed to update asset ${update.id}:`, updateError)
          failures.push({
            id: update.id,
            symbol: update.symbol,
            reason: `Database update failed: ${updateError.message}`
          })
        } else {
          // 2. ✨ UPSERT into asset_history (1 point per day)
          // If an entry for today exists, update it; otherwise insert
          const { error: historyError } = await supabaseAdmin
            .from('asset_history')
            .upsert({
              asset_id: update.id,
              user_id: user.id,
              price: update.price,
              date: today,
              recorded_at: new Date().toISOString()
            }, {
              onConflict: 'asset_id,date', // Conflict resolution on unique constraint
              ignoreDuplicates: false // Update if exists
            })

          if (historyError) {
            console.error(`Failed to upsert history for ${update.id}:`, historyError)
            // Note: we don't fail the whole update, just log the error
          } else {
            console.log(`✓ Updated ${update.symbol}: ${update.price} (daily snapshot recorded)`)
          }
        }
      }
    }

    // Return summary
    return new Response(
      JSON.stringify({
        message: 'Price update completed',
        updated: updates.length,
        failed: failures.length,
        details: {
          successes: updates.map(u => ({ symbol: u.symbol, price: u.price })),
          failures: failures.length > 0 ? failures : undefined
        }
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Unexpected error in update-prices function:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
