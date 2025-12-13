-- Add member_id column to transactions table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'transactions' AND column_name = 'member_id') THEN
        ALTER TABLE transactions ADD COLUMN member_id UUID REFERENCES members(id) ON DELETE SET NULL;
    END IF;
END $$;
