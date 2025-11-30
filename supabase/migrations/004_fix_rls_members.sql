-- Fix RLS policy for members to allow INSERTs with proper checks

-- Ensure RLS is enabled (no-op if already enabled)
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if present
DROP POLICY IF EXISTS "Admins and treasurers can manage members" ON public.members;

-- Allow admins and treasurers to select/update/delete and insert members for their church
CREATE POLICY "Admins and treasurers can manage members"
  ON public.members
  FOR ALL
  USING (
    EXISTS (
      SELECT 1
      FROM public.users u
      WHERE u.id = auth.uid()
        AND u.role IN ('admin','treasurer')
        AND u.church_id = members.church_id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.users u
      WHERE u.id = auth.uid()
        AND u.role IN ('admin','treasurer')
        AND u.church_id = members.church_id
    )
  );