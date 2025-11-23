import { corsHeaders } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { symbols } = await req.json();

    if (!symbols || !Array.isArray(symbols) || symbols.length === 0) {
      return new Response(
        JSON.stringify({ error: "Missing or invalid symbols array" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const results: Record<string, any> = {};

    // Fetch in parallel
    await Promise.all(
      symbols.map(async (symbol) => {
        try {
          const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(
            symbol
          )}`;
          const response = await fetch(url, {
            headers: { "User-Agent": "Mozilla/5.0 (Finarian App)" },
          });

          if (response.ok) {
            const data = await response.json();
            const result = data?.chart?.result?.[0];
            const meta = result?.meta;

            if (meta) {
              const price = meta.regularMarketPrice;
              const prevClose = meta.previousClose || meta.chartPreviousClose;

              if (typeof price === "number" && typeof prevClose === "number") {
                const change = price - prevClose;
                const changePercent = (change / prevClose) * 100;

                results[symbol] = {
                  price,
                  change,
                  changePercent,
                };
              }
            }
          }
        } catch (e) {
          console.error(`Error fetching ${symbol}:`, e);
        }
      })
    );

    return new Response(JSON.stringify(results), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
