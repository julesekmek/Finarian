-- Migration: Create asset_history table (1 point per day per asset)
-- Date: 2025-10-26
-- Purpose: Store historical daily price snapshots for portfolio evolution tracking

-- Create asset_history table
CREATE TABLE asset_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  price NUMERIC(15, 2) NOT NULL,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  
  -- ✨ Unique constraint: only 1 snapshot per asset per day
  CONSTRAINT unique_asset_daily_history UNIQUE (asset_id, date),
  CONSTRAINT asset_history_price_positive CHECK (price >= 0)
);

-- Indexes for efficient queries
CREATE INDEX idx_asset_history_asset_id ON asset_history(asset_id);
CREATE INDEX idx_asset_history_date ON asset_history(date DESC);
CREATE INDEX idx_asset_history_user_asset_date ON asset_history(user_id, asset_id, date DESC);

-- Enable Row Level Security
ALTER TABLE asset_history ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only view their own history
CREATE POLICY "Users can view their own asset history"
  ON asset_history FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policy: Users can insert their own history
CREATE POLICY "Users can insert their own asset history"
  ON asset_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can update their own history (needed for UPSERT)
CREATE POLICY "Users can update their own asset history"
  ON asset_history FOR UPDATE
  USING (auth.uid() = user_id);

-- Enable realtime (optional)
ALTER PUBLICATION supabase_realtime ADD TABLE asset_history;

-- Add documentation
COMMENT ON TABLE asset_history IS 'Stores one daily price snapshot per asset for portfolio evolution tracking. Updated automatically during daily price updates.';
COMMENT ON COLUMN asset_history.date IS 'Date of the snapshot (used for uniqueness constraint)';
COMMENT ON COLUMN asset_history.recorded_at IS 'Exact timestamp when the price was recorded';
COMMENT ON COLUMN asset_history.price IS 'Asset price at the time of recording (current_price value)';

