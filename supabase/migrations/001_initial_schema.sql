-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret-here';

-- Churches table
CREATE TABLE churches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    logo_url TEXT,
    primary_color VARCHAR(7) DEFAULT '#3B82F6',
    secondary_color VARCHAR(7) DEFAULT '#10B981',
    cnpj VARCHAR(18),
    address TEXT,
    phone VARCHAR(20),
    email VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users table (extends Supabase auth.users)
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    church_id UUID REFERENCES churches(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('admin', 'treasurer', 'member')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Members table
CREATE TABLE members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    church_id UUID REFERENCES churches(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    birth_date DATE NOT NULL,
    position VARCHAR(100) NOT NULL,
    entry_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    phone VARCHAR(20),
    email VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transactions table
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    church_id UUID REFERENCES churches(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('income', 'expense')),
    category VARCHAR(50) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    date DATE NOT NULL,
    description TEXT NOT NULL,
    member_id UUID REFERENCES members(id) ON DELETE SET NULL,
    receipt_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_users_church_id ON users(church_id);
CREATE INDEX idx_members_church_id ON members(church_id);
CREATE INDEX idx_transactions_church_id ON transactions(church_id);
CREATE INDEX idx_transactions_date ON transactions(date);
CREATE INDEX idx_transactions_type ON transactions(type);

-- Enable Row Level Security
ALTER TABLE churches ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for churches
CREATE POLICY "Users can view their own church" ON churches
    FOR SELECT USING (
        id IN (
            SELECT church_id FROM users WHERE id = auth.uid()
        )
    );

CREATE POLICY "Admins can update their church" ON churches
    FOR UPDATE USING (
        id IN (
            SELECT church_id FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- RLS Policies for users
CREATE POLICY "Users can view users from their church" ON users
    FOR SELECT USING (
        church_id IN (
            SELECT church_id FROM users WHERE id = auth.uid()
        )
    );

CREATE POLICY "Admins can manage users in their church" ON users
    FOR ALL USING (
        church_id IN (
            SELECT church_id FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- RLS Policies for members
CREATE POLICY "Users can view members from their church" ON members
    FOR SELECT USING (
        church_id IN (
            SELECT church_id FROM users WHERE id = auth.uid()
        )
    );

CREATE POLICY "Admins and treasurers can manage members" ON members
    FOR ALL USING (
        church_id IN (
            SELECT church_id FROM users 
            WHERE id = auth.uid() AND role IN ('admin', 'treasurer')
        )
    );

-- RLS Policies for transactions
CREATE POLICY "Users can view transactions from their church" ON transactions
    FOR SELECT USING (
        church_id IN (
            SELECT church_id FROM users WHERE id = auth.uid()
        )
    );

CREATE POLICY "Admins and treasurers can manage transactions" ON transactions
    FOR ALL USING (
        church_id IN (
            SELECT church_id FROM users 
            WHERE id = auth.uid() AND role IN ('admin', 'treasurer')
        )
    );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_churches_updated_at BEFORE UPDATE ON churches
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_members_updated_at BEFORE UPDATE ON members
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();