import { supabase } from "./supabase";

/**
 * Service for searching Yahoo Finance symbols
 */
export const symbolSearchService = {
  /**
   * Search for symbols on Yahoo Finance
   * @param {string} query - Search query
   * @returns {Promise<Array>} Array of symbol search results
   */
  async searchSymbols(query) {
    if (!query || query.trim().length === 0) {
      return [];
    }

    try {
      const session = await supabase.auth.getSession();
      const token = session?.data?.session?.access_token;

      // In development, force using the local Edge Function
      // This solves the issue where the frontend is connected to Prod DB (via .env)
      // but the function is only running locally.
      const isDev = import.meta.env.DEV;

      if (isDev) {
        // Local development: Call local function directly
        const functionUrl = `http://localhost:54321/functions/v1/search-symbols?q=${encodeURIComponent(
          query.trim()
        )}`;

        const response = await fetch(functionUrl, {
          method: "GET",
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || "Failed to search symbols");
        }

        const result = await response.json();
        return result.results || [];
      } else {
        // Production: Use Supabase client
        const { data, error } = await supabase.functions.invoke(
          `search-symbols?q=${encodeURIComponent(query.trim())}`,
          {
            method: "GET",
          }
        );

        if (error) {
          console.error("Supabase function error:", error);
          throw new Error(error.message || "Failed to search symbols");
        }

        if (!data || !data.success) {
          throw new Error(data?.error || "Search failed");
        }

        return data.results || [];
      }
    } catch (err) {
      console.error("Error searching symbols:", err);
      throw err;
    }
  },
};
