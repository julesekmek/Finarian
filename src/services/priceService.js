/**
 * Utility to call the Supabase Edge Function for updating asset prices
 * Uses Yahoo Finance API via Edge Function to keep API logic server-side
 */

import { supabase } from "../services/supabase";

/**
 * Call the update-prices Edge Function
 * Fetches current prices from Yahoo Finance and updates the database
 *
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 */
export async function callUpdatePrices() {
  try {
    // Get the current user session
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session) {
      throw new Error("User not authenticated");
    }

    // Get the function URL from environment
    const functionUrl = `${
      import.meta.env.VITE_SUPABASE_URL
    }/functions/v1/update-prices`;

    // Call the Edge Function with the user's JWT token
    const response = await fetch(functionUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error: ${response.status}`);
    }

    const data = await response.json();

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error("Error updating prices:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Backfill historical data for an asset
 * @param {string} assetId
 * @param {string} symbol
 * @param {number} referencePrice
 * @param {Object} session
 * @returns {Promise<{success: boolean, inserted?: number, source?: string, message?: string}>}
 */
export async function backfillHistory(
  assetId,
  symbol,
  referencePrice,
  session
) {
  try {
    const body = symbol
      ? { assetId, symbol }
      : {
          assetId,
          referencePrice,
          isUpdate: true,
        };

    const response = await fetch(
      `${
        import.meta.env.VITE_SUPABASE_URL
      }/functions/v1/fetch-historical-prices`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );

    return await response.json();
  } catch (error) {
    console.error("Failed to backfill historical data:", error);
    return { success: false, message: error.message };
  }
}

/**
 * Fetch live quotes for assets
 * @param {Array<string>} symbols
 * @param {Object} session
 * @returns {Promise<Object>}
 */
export async function getLiveQuotes(symbols, session) {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-live-quotes`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${
            session?.access_token || import.meta.env.VITE_SUPABASE_ANON_KEY
          }`,
        },
        body: JSON.stringify({ symbols }),
      }
    );

    if (response.ok) {
      return await response.json();
    }
    return {};
  } catch (error) {
    console.error("Error fetching live quotes:", error);
    return {};
  }
}
