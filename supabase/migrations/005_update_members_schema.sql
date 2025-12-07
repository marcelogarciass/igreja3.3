-- Create families table
CREATE TABLE IF NOT EXISTS public.families (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    church_id UUID REFERENCES public.churches(id) NOT NULL
);

-- Enable RLS for families
ALTER TABLE public.families ENABLE ROW LEVEL SECURITY;

-- Create policy for families (similar to other tables)
CREATE POLICY "Users can view families from their church"
ON public.families FOR SELECT
USING (church_id IN (
    SELECT church_id FROM public.users WHERE id = auth.uid()
));

CREATE POLICY "Users can insert families for their church"
ON public.families FOR INSERT
WITH CHECK (church_id IN (
    SELECT church_id FROM public.users WHERE id = auth.uid()
));

CREATE POLICY "Users can update families from their church"
ON public.families FOR UPDATE
USING (church_id IN (
    SELECT church_id FROM public.users WHERE id = auth.uid()
));

CREATE POLICY "Users can delete families from their church"
ON public.families FOR DELETE
USING (church_id IN (
    SELECT church_id FROM public.users WHERE id = auth.uid()
));

-- Add new columns to members table
ALTER TABLE public.members 
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS neighborhood TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS state TEXT,
ADD COLUMN IF NOT EXISTS zip_code TEXT,
ADD COLUMN IF NOT EXISTS cpf TEXT,
ADD COLUMN IF NOT EXISTS profession TEXT,
ADD COLUMN IF NOT EXISTS baptism_date DATE,
ADD COLUMN IF NOT EXISTS spouse_name TEXT,
ADD COLUMN IF NOT EXISTS children_names JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS family_id UUID REFERENCES public.families(id),
ADD COLUMN IF NOT EXISTS photo_url TEXT;
