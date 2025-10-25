-- Add symbol column to assets table for Yahoo Finance integration
-- Symbol examples: AAPL, MSFT, BTC-USD, EURUSD=X, etc.

ALTER TABLE public.assets 
ADD COLUMN IF NOT EXISTS symbol TEXT;

-- Add index for faster queries when fetching assets with symbols
CREATE INDEX IF NOT EXISTS idx_assets_symbol ON public.assets(symbol) WHERE symbol IS NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.assets.symbol IS 'Yahoo Finance symbol for automatic price updates (e.g., AAPL, MSFT, BTC-USD)';

