-- =====================================================
-- UNION Spaces Core - Supabase Database Schema
-- Zoho CRM Data Cache with Webhook Sync
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- CONTACTS TABLE
-- Caches contact records from Zoho CRM
-- =====================================================
CREATE TABLE IF NOT EXISTS contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  zoho_id TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL DEFAULT '',
  last_name TEXT NOT NULL DEFAULT '',
  full_name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  phone TEXT,
  mobile TEXT,
  role TEXT,
  company_name TEXT,
  account_id TEXT, -- References accounts.zoho_id
  contact_type TEXT DEFAULT 'Broker',
  territory TEXT,
  relationship_health TEXT DEFAULT 'good',
  relationship_health_score INTEGER,
  description TEXT,
  zoho_created_at TIMESTAMPTZ,
  zoho_modified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for contacts
CREATE INDEX IF NOT EXISTS idx_contacts_zoho_id ON contacts(zoho_id);
CREATE INDEX IF NOT EXISTS idx_contacts_account_id ON contacts(account_id);
CREATE INDEX IF NOT EXISTS idx_contacts_contact_type ON contacts(contact_type);
CREATE INDEX IF NOT EXISTS idx_contacts_relationship_health ON contacts(relationship_health);
CREATE INDEX IF NOT EXISTS idx_contacts_full_name ON contacts(full_name);
CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email);
CREATE INDEX IF NOT EXISTS idx_contacts_updated_at ON contacts(updated_at);

-- =====================================================
-- ACCOUNTS TABLE
-- Caches account/company records from Zoho CRM
-- =====================================================
CREATE TABLE IF NOT EXISTS accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  zoho_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  account_type TEXT,
  industry TEXT,
  address TEXT,
  city TEXT,
  postcode TEXT,
  country TEXT,
  website TEXT,
  phone TEXT,
  employee_count INTEGER,
  annual_revenue DECIMAL(15, 2),
  description TEXT,
  zoho_created_at TIMESTAMPTZ,
  zoho_modified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for accounts
CREATE INDEX IF NOT EXISTS idx_accounts_zoho_id ON accounts(zoho_id);
CREATE INDEX IF NOT EXISTS idx_accounts_name ON accounts(name);
CREATE INDEX IF NOT EXISTS idx_accounts_account_type ON accounts(account_type);
CREATE INDEX IF NOT EXISTS idx_accounts_city ON accounts(city);
CREATE INDEX IF NOT EXISTS idx_accounts_updated_at ON accounts(updated_at);

-- =====================================================
-- SYNC STATUS TABLE
-- Tracks sync operations for monitoring
-- =====================================================
CREATE TABLE IF NOT EXISTS sync_status (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_type TEXT NOT NULL, -- 'contacts' or 'accounts'
  last_sync_at TIMESTAMPTZ DEFAULT NOW(),
  records_synced INTEGER DEFAULT 0,
  status TEXT DEFAULT 'success', -- 'success', 'error', 'in_progress'
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sync_status_entity_type ON sync_status(entity_type);
CREATE INDEX IF NOT EXISTS idx_sync_status_last_sync_at ON sync_status(last_sync_at DESC);

-- =====================================================
-- WEBHOOK LOGS TABLE
-- Tracks incoming webhooks from Zoho
-- =====================================================
CREATE TABLE IF NOT EXISTS webhook_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type TEXT NOT NULL, -- 'create', 'update', 'delete'
  module TEXT NOT NULL, -- 'Contacts', 'Accounts'
  zoho_id TEXT NOT NULL,
  payload JSONB,
  processed_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'success',
  error_message TEXT
);

CREATE INDEX IF NOT EXISTS idx_webhook_logs_module ON webhook_logs(module);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_processed_at ON webhook_logs(processed_at DESC);

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to auto-update updated_at
DROP TRIGGER IF EXISTS update_contacts_updated_at ON contacts;
CREATE TRIGGER update_contacts_updated_at
  BEFORE UPDATE ON contacts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_accounts_updated_at ON accounts;
CREATE TRIGGER update_accounts_updated_at
  BEFORE UPDATE ON accounts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (Optional - enable if needed)
-- =====================================================
-- ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE sync_status ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE webhook_logs ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- VIEWS
-- =====================================================

-- View: Contacts with their account names
CREATE OR REPLACE VIEW contacts_with_accounts AS
SELECT 
  c.*,
  a.name as account_name,
  a.city as account_city
FROM contacts c
LEFT JOIN accounts a ON c.account_id = a.zoho_id;

-- View: Account with contact count
CREATE OR REPLACE VIEW accounts_with_contact_count AS
SELECT 
  a.*,
  COALESCE(contact_counts.count, 0) as contact_count
FROM accounts a
LEFT JOIN (
  SELECT account_id, COUNT(*) as count
  FROM contacts
  GROUP BY account_id
) contact_counts ON a.zoho_id = contact_counts.account_id;

