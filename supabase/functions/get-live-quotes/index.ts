/**
 * Supabase Edge Function: get-live-quotes
 * 
 * Fetches real-time price quotes for multiple symbols
 * Returns current price, change, and change percentage
 * 
 * Refactored for better error handling and timeout management
 */

import { corsHeaders } from '../_shared/cors.ts';
import { formatErrorResponse, ValidationError } from '../_shared/errors.ts';
import { CONSTANTS } from '../_shared/constants.ts';
import { LiveQuotesService } from './service.ts';

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // 1. Parse and validate request
    const body = await req.json();
    const { symbols } = body;

    if (!symbols || !Array.isArray(symbols) || symbols.length === 0) {
      throw new ValidationError('symbols must be a non-empty array');
    }

    // Validate each symbol is a string
    if (!symbols.every((s) => typeof s === 'string')) {
      throw new ValidationError('All symbols must be strings');
    }

    // 2. Fetch live quotes
    const service = new LiveQuotesService();
    const results = await service.fetchLiveQuotes(symbols);

    // 3. Return results
    return new Response(JSON.stringify(results), {
      status: CONSTANTS.HTTP_STATUS.OK,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    // Handle all errors
    const { body, status } = formatErrorResponse(error);
    return new Response(body, {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
