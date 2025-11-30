-- Fix RLS policy for transactions to allow INSERTs
-- Drops the previous manage policy and recreates it with WITH CHECK

-- Ensure RLS is enabled (no-op if already enabled)
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if present
DROP POLICY IF EXISTS "Admins and treasurers can manage transactions" ON public.transactions;

-- Allow admins and treasurers to select/update/delete and insert transactions for their church
CREATE POLICY "Admins and treasurers can manage transactions"
  ON public.transactions
  FOR ALL
  USING (
    EXISTS (
      SELECT 1
      FROM public.users u
      WHERE u.id = auth.uid()
        AND u.role IN ('admin','treasurer')
        AND u.church_id = transactions.church_id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.users u
      WHERE u.id = auth.uid()
        AND u.role IN ('admin','treasurer')
        AND u.church_id = transactions.church_id
    )
  );