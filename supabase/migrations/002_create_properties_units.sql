-- =====================================================
-- PROPERTIES TABLE
-- Caches property records from Zoho CRM
-- =====================================================
CREATE TABLE IF NOT EXISTS properties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  zoho_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  address_line TEXT,
  postcode TEXT,
  city TEXT,
  country TEXT DEFAULT 'United Kingdom',
  
  -- Physical specs
  total_size_sqft INTEGER,
  floor_count INTEGER,
  lifts TEXT,
  built_year INTEGER,
  refurbished_year INTEGER,
  parking TEXT,
  
  -- Marketing & Status
  marketing_status TEXT DEFAULT 'Draft', -- 'Draft', 'Broker-Ready', 'On Market'
  marketing_visibility TEXT DEFAULT 'Private', -- 'Private', 'Public'
  marketing_fit_out TEXT, -- 'Shell', 'Cat A', 'Cat A+'
  
  -- Compliance
  epc_rating TEXT,
  epc_ref TEXT,
  epc_expiry DATE,
  breeam_rating TEXT,
  
  -- Metadata
  zoho_created_at TIMESTAMPTZ,
  zoho_modified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_properties_zoho_id ON properties(zoho_id);
CREATE INDEX IF NOT EXISTS idx_properties_marketing_status ON properties(marketing_status);

-- =====================================================
-- UNITS TABLE
-- Caches unit records from Zoho CRM
-- =====================================================
CREATE TABLE IF NOT EXISTS units (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  zoho_id TEXT UNIQUE NOT NULL,
  property_zoho_id TEXT REFERENCES properties(zoho_id) ON DELETE CASCADE, -- Link via Zoho ID for easier sync
  
  code TEXT NOT NULL, -- e.g. "99B-3-A"
  floor TEXT,
  size_sqft INTEGER,
  desks INTEGER,
  
  -- Status & Financials
  status TEXT DEFAULT 'Available', -- 'Available', 'Under Offer', 'Let', 'Closed'
  fit_out TEXT, -- 'Shell', 'Cat A', 'Cat A+'
  price_psf DECIMAL(10, 2),
  price_pcm DECIMAL(10, 2),
  pipeline_stage TEXT, -- 'New', 'Viewing', 'HoTs', 'Legals', 'Closed'
  
  -- Metadata
  zoho_created_at TIMESTAMPTZ,
  zoho_modified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_units_zoho_id ON units(zoho_id);
CREATE INDEX IF NOT EXISTS idx_units_property_zoho_id ON units(property_zoho_id);
CREATE INDEX IF NOT EXISTS idx_units_status ON units(status);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_properties_updated_at ON properties;
CREATE TRIGGER update_properties_updated_at
  BEFORE UPDATE ON properties
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_units_updated_at ON units;
CREATE TRIGGER update_units_updated_at
  BEFORE UPDATE ON units
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

