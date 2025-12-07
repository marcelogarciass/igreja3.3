-- Create bucket for member photos if not exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('member-photos', 'member-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policies for member-photos bucket
-- Allow public read access to member photos
CREATE POLICY "Public Access Member Photos"
ON storage.objects FOR SELECT
USING ( bucket_id = 'member-photos' );

-- Allow authenticated users to upload photos
CREATE POLICY "Authenticated Users Upload Member Photos"
ON storage.objects FOR INSERT
WITH CHECK ( 
    bucket_id = 'member-photos' 
    AND auth.role() = 'authenticated' 
);

-- Allow authenticated users to update photos
CREATE POLICY "Authenticated Users Update Member Photos"
ON storage.objects FOR UPDATE
USING ( 
    bucket_id = 'member-photos' 
    AND auth.role() = 'authenticated' 
);

-- Allow authenticated users to delete photos
CREATE POLICY "Authenticated Users Delete Member Photos"
ON storage.objects FOR DELETE
USING ( 
    bucket_id = 'member-photos' 
    AND auth.role() = 'authenticated' 
);
