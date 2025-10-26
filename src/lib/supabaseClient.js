/**
 * Supabase Client Configuration
 * Initializes and exports the Supabase client instance for the entire application
 * 
 * Environment variables required:
 * - VITE_SUPABASE_URL: Your Supabase project URL
 * - VITE_SUPABASE_KEY: Your Supabase anon/public key
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.')
}

/**
 * Supabase client instance
 * Used for authentication, database queries, and realtime subscriptions
 */
export const supabase = createClient(supabaseUrl, supabaseKey)

