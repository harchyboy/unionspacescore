ALTER TABLE properties ADD COLUMN IF NOT EXISTS submarket TEXT;
CREATE INDEX IF NOT EXISTS idx_properties_submarket ON properties(submarket);

-- Function to get submarket stats
CREATE OR REPLACE FUNCTION get_submarket_stats()
RETURNS TABLE (submarket TEXT, count BIGINT)
LANGUAGE sql
AS $$
  SELECT COALESCE(submarket, 'Unknown') as submarket, count(*) as count
  FROM properties
  GROUP BY submarket
  ORDER BY count DESC;
$$;
