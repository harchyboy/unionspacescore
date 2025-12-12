-- Create storage bucket for property files (images and documents)
-- Note: This needs to be run manually in Supabase Dashboard or via CLI

-- Create the bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'property-files',
  'property-files',
  true,  -- Public bucket so images can be displayed without auth
  10485760,  -- 10MB max file size
  ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to the bucket
CREATE POLICY "Public read access for property-files"
ON storage.objects FOR SELECT
USING (bucket_id = 'property-files');

-- Allow authenticated (service role) uploads
CREATE POLICY "Service role can upload to property-files"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'property-files');

-- Allow authenticated (service role) deletes
CREATE POLICY "Service role can delete from property-files"
ON storage.objects FOR DELETE
USING (bucket_id = 'property-files');

