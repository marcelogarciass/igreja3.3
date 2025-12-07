-- Add photo_url to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS photo_url TEXT;

-- Create bucket for user photos if not exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('user-photos', 'user-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS (already enabled on storage.objects, but good practice to remember)
-- ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policies for user-photos bucket
-- Allow public read access to user photos
CREATE POLICY "Public Access User Photos"
ON storage.objects FOR SELECT
USING ( bucket_id = 'user-photos' );

-- Allow authenticated users to upload photos
CREATE POLICY "Authenticated Users Upload User Photos"
ON storage.objects FOR INSERT
WITH CHECK ( 
    bucket_id = 'user-photos' 
    AND auth.role() = 'authenticated' 
);

-- Allow authenticated users to update photos
CREATE POLICY "Authenticated Users Update User Photos"
ON storage.objects FOR UPDATE
USING ( 
    bucket_id = 'user-photos' 
    AND auth.role() = 'authenticated' 
);

-- Allow authenticated users to delete photos
CREATE POLICY "Authenticated Users Delete User Photos"
ON storage.objects FOR DELETE
USING ( 
    bucket_id = 'user-photos' 
    AND auth.role() = 'authenticated' 
);
