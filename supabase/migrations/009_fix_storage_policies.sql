-- Fix storage policies to allow uploads with anon/public key
-- The previous policy only worked with service_role

-- Drop old restrictive policies if they exist
DROP POLICY IF EXISTS "Service role can upload to property-files" ON storage.objects;

-- Allow public uploads to the property-files bucket
CREATE POLICY "Allow public uploads to property-files"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'property-files');

-- Allow authenticated users to upload as well (covers both anon and authenticated)
CREATE POLICY "Allow authenticated uploads to property-files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'property-files');

-- Ensure public read access exists
DROP POLICY IF EXISTS "Public read access for property-files" ON storage.objects;
CREATE POLICY "Public read access for property-files"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'property-files');

-- Ensure delete access for management
DROP POLICY IF EXISTS "Service role can delete from property-files" ON storage.objects;
CREATE POLICY "Allow deletes from property-files"
ON storage.objects FOR DELETE
TO public
USING (bucket_id = 'property-files');
