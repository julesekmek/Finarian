/**
 * Supabase Edge Function: fetch-historical-prices
 * 
 * Fetches and stores historical price data for assets
 * - For market assets (with symbol): fetches from Yahoo Finance
 * - For savings assets (no symbol): generates constant price data
 * 
 * Refactored for better maintainability, error handling, and performance
 */

import { createClient } from 'jsr:@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
import { formatErrorResponse, ValidationError } from '../_shared/errors.ts';
import { verifyAuth, getAuthHeader } from '../_shared/auth.ts';
import { CONSTANTS } from '../_shared/constants.ts';
import { validateRequest } from './validators.ts';
import { HistoricalDataService } from './service.ts';

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // 1. Parse and validate request body
    const body = await req.json();
    const validatedRequest = validateRequest(body);

    // 2. Initialize Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase environment variables');
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // 3. Verify authentication
    const authHeader = getAuthHeader(req);
    const { userId } = await verifyAuth(
      supabaseAdmin,
      authHeader,
      supabaseServiceKey
    );

    // 4. Execute business logic
    const service = new HistoricalDataService();
    const result = await service.fetchAndStore(supabaseAdmin, {
      assetId: validatedRequest.assetId,
      userId,
      symbol: validatedRequest.symbol,
      referencePrice: validatedRequest.referencePrice,
      isUpdate: validatedRequest.isUpdate,
    });

    // 5. Return success response
    return new Response(JSON.stringify(result), {
      status: CONSTANTS.HTTP_STATUS.OK,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    // Handle validation errors specifically
    if (error instanceof Error && error.message.includes('must be')) {
      const validationError = new ValidationError(error.message);
      const { body, status } = formatErrorResponse(validationError);
      return new Response(body, {
        status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Handle all other errors
    const { body, status } = formatErrorResponse(error);
    return new Response(body, {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
