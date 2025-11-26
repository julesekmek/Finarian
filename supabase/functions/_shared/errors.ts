/**
 * Custom error classes for Edge Functions
 * Provides structured error handling with proper HTTP status codes
 */

export class AppError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly code: string,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      error: this.message,
      code: this.code,
      ...(this.details && { details: this.details }),
    };
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 400, 'VALIDATION_ERROR', details);
  }
}

export class AuthError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 401, 'AUTH_ERROR', details);
  }
}

export class ExternalAPIError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 502, 'EXTERNAL_API_ERROR', details);
  }
}

export class DatabaseError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 500, 'DATABASE_ERROR', details);
  }
}

/**
 * Format error response for HTTP
 */
export function formatErrorResponse(error: unknown): {
  body: string;
  status: number;
} {
  if (error instanceof AppError) {
    return {
      body: JSON.stringify(error.toJSON()),
      status: error.statusCode,
    };
  }

  // Unknown error - don't expose details
  console.error('Unexpected error:', error);
  return {
    body: JSON.stringify({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
    }),
    status: 500,
  };
}
