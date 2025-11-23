-- Add region and sector columns to assets table
ALTER TABLE assets 
ADD COLUMN IF NOT EXISTS region TEXT,
ADD COLUMN IF NOT EXISTS sector TEXT;

COMMENT ON COLUMN assets.region IS 'Geographic region of the asset (e.g., Europe, US, Asia)';
COMMENT ON COLUMN assets.sector IS 'Activity sector of the asset (e.g., Technology, Healthcare, Real Estate)';
