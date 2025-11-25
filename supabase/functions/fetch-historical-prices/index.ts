// Supabase Edge Function to fetch historical prices from Yahoo Finance
// Called when a new asset is added to populate initial history

import { createClient } from "jsr:@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

interface HistoricalDataPoint {
  date: string; // YYYY-MM-DD
  price: number;
}

/**
 * Fetch historical prices from Yahoo Finance
 * Returns daily prices from start of year to today
 */
async function fetchYahooHistory(
  symbol: string
): Promise<HistoricalDataPoint[]> {
  try {
    // Fixed start date: 2025-01-02 (YTD reference)
    const startDate = new Date("2025-01-02");
    const now = new Date();
    const period1 = Math.floor(startDate.getTime() / 1000);
    const period2 = Math.floor(now.getTime() / 1000);

    // Yahoo Finance historical data endpoint
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(
      symbol
    )}?period1=${period1}&period2=${period2}&interval=1d`;

    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Finarian App)",
      },
    });

    if (!response.ok) {
      console.error(
        `Yahoo Finance API error for ${symbol}: ${response.status}`
      );
      return [];
    }

    const data = await response.json();
    const result = data?.chart?.result?.[0];

    if (!result) {
      console.warn(`No historical data found for: ${symbol}`);
      return [];
    }

    // Extract timestamps and closing prices
    const timestamps = result.timestamp || [];
    const closes = result.indicators?.quote?.[0]?.close || [];

    // Convert to our format
    const historicalData: HistoricalDataPoint[] = [];

    for (let i = 0; i < timestamps.length; i++) {
      const price = closes[i];

      // Skip null/invalid prices
      if (price === null || price === undefined || isNaN(price)) {
        continue;
      }

      // Convert timestamp to date string (YYYY-MM-DD)
      const date = new Date(timestamps[i] * 1000);
      const dateStr = date.toISOString().split("T")[0];

      historicalData.push({
        date: dateStr,
        price: Math.round(price * 100) / 100, // Round to 2 decimals
      });
    }

    console.log(
      `✓ Fetched ${historicalData.length} historical points for ${symbol}`
    );
    return historicalData;
  } catch (error) {
    console.error(`Error fetching historical data for ${symbol}:`, error);
    return [];
  }
}

/**
 * Generate all dates from start to end (inclusive)
 */
function generateDateRange(startDate: string, endDate: string): string[] {
  const dates: string[] = [];
  const current = new Date(startDate);
  const end = new Date(endDate);

  while (current <= end) {
    dates.push(current.toISOString().split("T")[0]);
    current.setDate(current.getDate() + 1); // Corrected from setDate() + 1
  }

  return dates;
}

/**
 * Fill weekends with Friday's closing price
 * Input: Array of {date, price} with weekdays only
 * Output: Array with all 7 days, weekends filled with Friday price
 */
function forwardFillWeekends(
  data: HistoricalDataPoint[],
  fillToDate?: string
): HistoricalDataPoint[] {
  if (data.length === 0) return [];

  // Create a map for quick lookup
  const priceMap = new Map<string, number>();
  data.forEach((d) => priceMap.set(d.date, d.price));

  // Get date range
  const startDate = data[0].date;
  let endDate = data[data.length - 1].date;

  // If a target fill date is provided and is later than the last data point, extend to it
  if (fillToDate && fillToDate > endDate) {
    endDate = fillToDate;
  }

  const allDates = generateDateRange(startDate, endDate);
  const filled: HistoricalDataPoint[] = [];
  let lastKnownPrice = data[0].price;

  for (const date of allDates) {
    if (priceMap.has(date)) {
      // Weekday with data
      lastKnownPrice = priceMap.get(date)!;
      filled.push({ date, price: lastKnownPrice });
    } else {
      // Weekend or missing data: use last known price
      filled.push({ date, price: lastKnownPrice });
    }
  }

  return filled;
}

/**
 * Batch upsert historical data into asset_history
 */
async function upsertHistory(
  supabaseAdmin: any,
  assetId: string,
  userId: string,
  data: HistoricalDataPoint[]
): Promise<{ inserted: number; failed: number }> {
  let inserted = 0;
  let failed = 0;

  for (const point of data) {
    const { error } = await supabaseAdmin.from("asset_history").upsert(
      {
        asset_id: assetId,
        user_id: userId,
        price: point.price,
        date: point.date,
        recorded_at: new Date().toISOString(),
      },
      {
        onConflict: "asset_id,date",
        ignoreDuplicates: false, // Update if exists
      }
    );

    if (error) {
      console.error(`Failed to upsert ${point.date}:`, error);
      failed++;
    } else {
      inserted++;
    }
  }

  return { inserted, failed };
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Get request body
    const { assetId, symbol, referencePrice, isUpdate } = await req.json();

    if (!assetId) {
      return new Response(JSON.stringify({ error: "Missing assetId" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!symbol && !referencePrice) {
      return new Response(
        JSON.stringify({ error: "Missing symbol or referencePrice" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Verify user
    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error: authError,
    } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid or expired token" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    let finalData: HistoricalDataPoint[] = [];
    let dataSource = "";

    if (symbol) {
      // Market asset: fetch from Yahoo Finance and forward-fill weekends
      console.log(
        `Fetching historical data for market asset ${assetId} (${symbol})`
      );

      const rawData = await fetchYahooHistory(symbol);

      if (rawData.length === 0) {
        return new Response(
          JSON.stringify({
            success: false,
            message: "No historical data available for this symbol",
            inserted: 0,
          }),
          {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // Fill up to today to ensure weekends and gaps are covered
      const today = new Date().toISOString().split("T")[0];
      finalData = forwardFillWeekends(rawData, today);
      dataSource = `Yahoo Finance (${symbol})`;
    } else if (referencePrice) {
      // Savings asset: generate dates with constant price
      const today = new Date().toISOString().split("T")[0];

      if (isUpdate) {
        // Modification: only update from today onwards (preserve historical values)
        console.log(
          `Updating historical data for savings asset ${assetId} from today with price ${referencePrice}`
        );

        // Only generate from today onwards
        const allDates = generateDateRange(today, today);

        finalData = allDates.map((date) => ({
          date,
          price: Math.round(referencePrice * 100) / 100,
        }));

        dataSource = `Constant price from today (${referencePrice})`;
      } else {
        // Creation: backfill entire YTD
        console.log(
          `Generating historical data for savings asset ${assetId} with price ${referencePrice}`
        );

        const allDates = generateDateRange("2025-01-02", today);

        finalData = allDates.map((date) => ({
          date,
          price: Math.round(referencePrice * 100) / 100,
        }));

        dataSource = `Constant price (${referencePrice})`;
      }
    }

    // Upsert all data points
    const { inserted, failed } = await upsertHistory(
      supabaseAdmin,
      assetId,
      user.id,
      finalData
    );

    console.log(
      `✓ Historical data import complete: ${inserted} inserted, ${failed} failed`
    );

    return new Response(
      JSON.stringify({
        success: true,
        inserted,
        failed,
        totalPoints: finalData.length,
        source: dataSource,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in fetch-historical-prices:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
