/**
 * Authentication utilities for Edge Functions
 * Handles user verification and service role detection
 */

import { SupabaseClient, User } from 'jsr:@supabase/supabase-js@2';
import { AuthError } from './errors.ts';

export interface AuthResult {
  user: User;
  userId: string;
  isServiceRole: boolean;
}

/**
 * Verify authentication from request header
 * Supports both user tokens and service role key
 * 
 * @param supabase - Supabase client (with service role)
 * @param authHeader - Authorization header value
 * @param serviceRoleKey - Service role key for comparison
 * @returns Authentication result with user info
 * @throws AuthError if authentication fails
 */
export async function verifyAuth(
  supabase: SupabaseClient,
  authHeader: string | null,
  serviceRoleKey: string
): Promise<AuthResult> {
  if (!authHeader) {
    throw new AuthError('Missing authorization header');
  }

  const token = authHeader.replace('Bearer ', '');

  // Check if this is a service role key (for automated workflows)
  const isServiceRole = token === serviceRoleKey;

  if (isServiceRole) {
    console.log('🤖 Service Role authentication detected');
    // For service role, we don't have a specific user
    // Return a placeholder that indicates service role access
    return {
      user: { id: 'service-role' } as User,
      userId: 'service-role',
      isServiceRole: true,
    };
  }

  // Verify user token
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser(token);

  if (authError || !user) {
    throw new AuthError('Invalid or expired token', {
      originalError: authError?.message,
    });
  }

  console.log(`👤 User authentication detected: ${user.id}`);

  return {
    user,
    userId: user.id,
    isServiceRole: false,
  };
}

/**
 * Extract and validate authorization header
 * 
 * @param req - Request object
 * @returns Authorization header value or null
 */
export function getAuthHeader(req: Request): string | null {
  return req.headers.get('Authorization');
}
