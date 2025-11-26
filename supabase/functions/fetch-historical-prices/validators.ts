/**
 * Request validation schemas for fetch-historical-prices
 */

export interface FetchHistoricalPricesRequest {
  assetId: string;
  symbol?: string;
  referencePrice?: number;
  isUpdate?: boolean;
}

/**
 * Validate fetch historical prices request
 * @throws Error if validation fails
 */
export function validateRequest(body: unknown): FetchHistoricalPricesRequest {
  if (!body || typeof body !== 'object') {
    throw new Error('Request body must be an object');
  }

  const req = body as Record<string, unknown>;

  // Validate assetId
  if (!req.assetId || typeof req.assetId !== 'string') {
    throw new Error('assetId is required and must be a string');
  }

  // Validate UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(req.assetId)) {
    throw new Error('assetId must be a valid UUID');
  }

  // Validate symbol (optional)
  if (req.symbol !== undefined && typeof req.symbol !== 'string') {
    throw new Error('symbol must be a string');
  }

  // Validate referencePrice (optional)
  if (req.referencePrice !== undefined) {
    if (typeof req.referencePrice !== 'number' || req.referencePrice <= 0) {
      throw new Error('referencePrice must be a positive number');
    }
  }

  // Validate isUpdate (optional)
  if (req.isUpdate !== undefined && typeof req.isUpdate !== 'boolean') {
    throw new Error('isUpdate must be a boolean');
  }

  // At least one of symbol or referencePrice must be provided
  if (!req.symbol && req.referencePrice === undefined) {
    throw new Error('Either symbol or referencePrice must be provided');
  }

  return {
    assetId: req.assetId,
    symbol: req.symbol as string | undefined,
    referencePrice: req.referencePrice as number | undefined,
    isUpdate: req.isUpdate as boolean | undefined,
  };
}
