/**
 * Supabase Edge Function: update-prices
 * 
 * Updates current prices for all assets from Yahoo Finance
 * - For market assets (with symbol): fetches from Yahoo Finance
 * - For savings assets (no symbol): uses previous day's price
 * 
 * Supports both user authentication and service role (for automated workflows)
 * 
 * Refactored for better performance, error handling, and maintainability
 */

import { createClient } from 'jsr:@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
import { formatErrorResponse } from '../_shared/errors.ts';
import { verifyAuth, getAuthHeader } from '../_shared/auth.ts';
import { CONSTANTS } from '../_shared/constants.ts';
import { PriceUpdateService } from './service.ts';

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // 1. Initialize Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase environment variables');
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // 2. Verify authentication
    const authHeader = getAuthHeader(req);
    const { userId, isServiceRole } = await verifyAuth(
      supabaseAdmin,
      authHeader,
      supabaseServiceKey
    );

    // 3. Determine scope (all users or specific user)
    const targetUserId = isServiceRole ? null : userId;

    // 4. Execute price update
    const service = new PriceUpdateService();
    const result = await service.updateAllPrices(supabaseAdmin, targetUserId);

    // 5. Return success response
    return new Response(JSON.stringify(result), {
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
