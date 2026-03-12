-- ==========================================
-- Triggerly Database Schema
-- Run this in your Supabase SQL editor
-- ==========================================

-- Triggers table
CREATE TABLE IF NOT EXISTS triggers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT CHECK (type IN ('crypto', 'stock', 'domain')) NOT NULL,
  name TEXT NOT NULL,
  target TEXT NOT NULL,
  condition TEXT CHECK (condition IN ('<', '>')) NOT NULL,
  value NUMERIC NOT NULL,
  frequency INTEGER DEFAULT 30 NOT NULL,
  status TEXT CHECK (status IN ('active', 'paused', 'cooldown')) DEFAULT 'active',
  cooldown_until TIMESTAMPTZ,
  last_checked TIMESTAMPTZ,
  next_check TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Alerts table
CREATE TABLE IF NOT EXISTS alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trigger_id UUID REFERENCES triggers(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  value_detected NUMERIC NOT NULL,
  triggered_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- Indexes for performance
-- ==========================================

CREATE INDEX IF NOT EXISTS idx_triggers_user_id ON triggers(user_id);
CREATE INDEX IF NOT EXISTS idx_triggers_status ON triggers(status);
CREATE INDEX IF NOT EXISTS idx_triggers_next_check ON triggers(next_check);
CREATE INDEX IF NOT EXISTS idx_alerts_user_id ON alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_alerts_trigger_id ON alerts(trigger_id);

-- ==========================================
-- Row Level Security
-- ==========================================

ALTER TABLE triggers ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

-- Users can only manage their own triggers
CREATE POLICY "Users manage own triggers"
  ON triggers FOR ALL
  USING (auth.uid() = user_id);

-- Users can only read their own alerts
CREATE POLICY "Users read own alerts"
  ON alerts FOR SELECT
  USING (auth.uid() = user_id);

-- Service role can insert alerts (worker uses service key)
CREATE POLICY "Service role inserts alerts"
  ON alerts FOR INSERT
  WITH CHECK (true);
