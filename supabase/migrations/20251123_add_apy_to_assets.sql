-- Add apy (Annual Percentage Yield) column to assets table
ALTER TABLE assets 
ADD COLUMN IF NOT EXISTS apy NUMERIC DEFAULT 0;

COMMENT ON COLUMN assets.apy IS 'Estimated Annual Percentage Yield for savings assets';
