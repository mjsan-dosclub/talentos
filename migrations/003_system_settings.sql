-- ==============================================================================
-- 003_system_settings.sql: Dynamic System Settings & Configurations Table
-- ==============================================================================

CREATE TABLE IF NOT EXISTS system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  settings JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Row Level Security
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public Read Settings" ON system_settings
  FOR SELECT USING (true);

CREATE POLICY "Admin Write Settings" ON system_settings
  FOR ALL USING (true) WITH CHECK (true);
