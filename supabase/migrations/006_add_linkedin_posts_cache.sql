-- Add columns to cache LinkedIn posts
ALTER TABLE contacts 
ADD COLUMN IF NOT EXISTS linkedin_posts_data JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS linkedin_posts_fetched_at TIMESTAMPTZ;
