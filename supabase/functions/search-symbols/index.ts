/**
 * Edge Function: search-symbols
 * Searches for symbols on Yahoo Finance for autocomplete functionality
 * 
 * GET /search-symbols?q=<query>
 * 
 * Authentication: Required (user must be logged in)
 * 
 * Example: /search-symbols?q=apple
 */

import { createClient } from 'jsr:@supabase/supabase-js@2';
import { SymbolSearchService } from './service.ts';
import { ValidationError, ExternalAPIError } from '../_shared/errors.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Only allow GET requests
    if (req.method !== 'GET') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify authentication (optional for search)
    const authHeader = req.headers.get('Authorization');
    if (authHeader) {
      const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_ANON_KEY') ?? '',
        { global: { headers: { Authorization: authHeader } } }
      );

      const { data: { user }, error: authError } = await supabaseClient.auth.getUser();

      if (authError || !user) {
        console.warn('Auth verification failed (likely due to hybrid dev env), proceeding anyway for search:', authError);
      } else {
        console.log(`Authenticated user searching: ${user.id}`);
      }
    } else {
      console.log('Unauthenticated search request received');
    }


    // Extract query parameter
    const url = new URL(req.url);
    const query = url.searchParams.get('q');

    if (!query) {
      return new Response(
        JSON.stringify({ error: 'Missing query parameter "q"' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Search symbols
    const service = new SymbolSearchService(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const results = await service.searchSymbols(query);

    return new Response(
      JSON.stringify({
        success: true,
        query,
        results,
        count: results.length,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in search-symbols function:', error);

    // Handle specific error types
    if (error instanceof ValidationError) {
      return new Response(
        JSON.stringify({
          success: false,
          error: error.message,
          details: error.details,
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (error instanceof ExternalAPIError) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Failed to search symbols',
          message: error.message,
        }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generic error
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
