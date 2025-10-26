// Supabase Edge Function to fetch historical prices from Yahoo Finance
// Called when a new asset is added to populate initial history

import { createClient } from 'jsr:@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

interface HistoricalDataPoint {
  date: string // YYYY-MM-DD
  price: number
}

/**
 * Fetch historical prices from Yahoo Finance
 * Returns daily prices from start of year to today
 */
async function fetchYahooHistory(symbol: string): Promise<HistoricalDataPoint[]> {
  try {
    // Get timestamp for start of current year
    const now = new Date()
    const startOfYear = new Date(now.getFullYear(), 0, 1)
    const period1 = Math.floor(startOfYear.getTime() / 1000)
    const period2 = Math.floor(now.getTime() / 1000)

    // Yahoo Finance historical data endpoint
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?period1=${period1}&period2=${period2}&interval=1d`
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Finarian App)',
      },
    })

    if (!response.ok) {
      console.error(`Yahoo Finance API error for ${symbol}: ${response.status}`)
      return []
    }

    const data = await response.json()
    const result = data?.chart?.result?.[0]
    
    if (!result) {
      console.warn(`No historical data found for: ${symbol}`)
      return []
    }

    // Extract timestamps and closing prices
    const timestamps = result.timestamp || []
    const closes = result.indicators?.quote?.[0]?.close || []

    // Convert to our format
    const historicalData: HistoricalDataPoint[] = []
    
    for (let i = 0; i < timestamps.length; i++) {
      const price = closes[i]
      
      // Skip null/invalid prices
      if (price === null || price === undefined || isNaN(price)) {
        continue
      }

      // Convert timestamp to date string (YYYY-MM-DD)
      const date = new Date(timestamps[i] * 1000)
      const dateStr = date.toISOString().split('T')[0]
      
      historicalData.push({
        date: dateStr,
        price: Math.round(price * 100) / 100 // Round to 2 decimals
      })
    }

    console.log(`✓ Fetched ${historicalData.length} historical points for ${symbol}`)
    return historicalData
  } catch (error) {
    console.error(`Error fetching historical data for ${symbol}:`, error)
    return []
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight
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

    // Get request body
    const { assetId, symbol } = await req.json()

    if (!assetId || !symbol) {
      return new Response(
        JSON.stringify({ error: 'Missing assetId or symbol' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

    // Verify user
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

    console.log(`Historical data requested for asset ${assetId} (${symbol}) by user ${user.id}`)

    // Fetch historical prices
    const historicalData = await fetchYahooHistory(symbol)

    if (historicalData.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'No historical data available for this symbol',
          inserted: 0
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Insert all historical points into asset_history
    let inserted = 0
    let failed = 0

    for (const dataPoint of historicalData) {
      const { error: insertError } = await supabaseAdmin
        .from('asset_history')
        .upsert({
          asset_id: assetId,
          user_id: user.id,
          price: dataPoint.price,
          date: dataPoint.date,
          recorded_at: new Date().toISOString()
        }, {
          onConflict: 'asset_id,date',
          ignoreDuplicates: false
        })

      if (insertError) {
        console.error(`Failed to insert history for ${dataPoint.date}:`, insertError)
        failed++
      } else {
        inserted++
      }
    }

    console.log(`✓ Historical data import complete: ${inserted} inserted, ${failed} failed`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        inserted,
        failed,
        totalPoints: historicalData.length
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in fetch-historical-prices:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

