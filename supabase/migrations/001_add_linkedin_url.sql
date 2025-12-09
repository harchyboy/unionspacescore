-- Migration: Add LinkedIn URL field to contacts table
-- Run this in your Supabase SQL Editor

ALTER TABLE contacts 
ADD COLUMN IF NOT EXISTS linkedin_url TEXT;

-- Add index for LinkedIn URL lookups
CREATE INDEX IF NOT EXISTS idx_contacts_linkedin_url ON contacts(linkedin_url);

-- Optional: Add a column to track enrichment status
ALTER TABLE contacts 
ADD COLUMN IF NOT EXISTS enrichment_status TEXT DEFAULT 'pending';
-- Values: 'pending', 'enriched', 'not_found', 'error'

ALTER TABLE contacts 
ADD COLUMN IF NOT EXISTS enriched_at TIMESTAMPTZ;

