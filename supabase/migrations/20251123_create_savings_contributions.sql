-- Create savings_contributions table for tracking biweekly contributions
-- Used by the savings account simulator interface

CREATE TABLE IF NOT EXISTS savings_contributions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  amount DECIMAL(12, 2) NOT NULL CHECK (amount >= 0),
  yield_rate DECIMAL(5, 2) CHECK (yield_rate >= 0), -- Annual yield rate for this contribution (%)
  interest DECIMAL(12, 2) DEFAULT 0, -- Calculated interest
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(asset_id, date)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_savings_contributions_asset ON savings_contributions(asset_id);
CREATE INDEX IF NOT EXISTS idx_savings_contributions_user ON savings_contributions(user_id);
CREATE INDEX IF NOT EXISTS idx_savings_contributions_date ON savings_contributions(date);

-- Enable Row Level Security
ALTER TABLE savings_contributions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own contributions"
  ON savings_contributions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own contributions"
  ON savings_contributions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own contributions"
  ON savings_contributions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own contributions"
  ON savings_contributions FOR DELETE
  USING (auth.uid() = user_id);

-- Add comment
COMMENT ON TABLE savings_contributions IS 'Stores biweekly contributions for savings accounts with individual yield rates';
