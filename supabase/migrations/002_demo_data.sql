-- Migração para dados de demonstração
-- Inserir igreja de teste
INSERT INTO churches (id, name, address, phone, email, primary_color, secondary_color) 
VALUES (
    '550e8400-e29b-41d4-a716-446655440000',
    'Igreja Demonstração',
    'Rua Exemplo, 123 - Centro',
    '(11) 99999-9999',
    'contato@igrejaDemo.com',
    '#3B82F6',
    '#10B981'
) ON CONFLICT (id) DO NOTHING;

-- Inserir usuário de teste
-- Nota: Este usuário será criado com ID fixo para demonstração
-- Em produção, o ID seria gerado pelo Supabase Auth
INSERT INTO users (id, church_id, email, name, role) 
VALUES (
    '550e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440000',
    'admin@demo.com',
    'Administrador Demo',
    'admin'
) ON CONFLICT (id) DO NOTHING;

-- Inserir alguns membros de exemplo
INSERT INTO members (church_id, name, birth_date, position, entry_date, status, phone, email) 
VALUES 
(
    '550e8400-e29b-41d4-a716-446655440000',
    'João Silva',
    '1980-05-15',
    'Pastor',
    '2020-01-01',
    'active',
    '(11) 98888-8888',
    'joao@demo.com'
),
(
    '550e8400-e29b-41d4-a716-446655440000',
    'Maria Santos',
    '1985-08-22',
    'Tesoureira',
    '2020-02-01',
    'active',
    '(11) 97777-7777',
    'maria@demo.com'
),
(
    '550e8400-e29b-41d4-a716-446655440000',
    'Pedro Costa',
    '1990-12-10',
    'Diácono',
    '2021-01-15',
    'active',
    '(11) 96666-6666',
    'pedro@demo.com'
) ON CONFLICT DO NOTHING;

-- Inserir algumas transações de exemplo
INSERT INTO transactions (church_id, type, category, amount, description, date, member_id) 
VALUES 
(
    '550e8400-e29b-41d4-a716-446655440000',
    'income',
    'Dízimo',
    1500.00,
    'Dízimo do mês de Janeiro',
    '2024-01-15',
    NULL
),
(
    '550e8400-e29b-41d4-a716-446655440000',
    'income',
    'Oferta',
    800.00,
    'Oferta especial para reforma',
    '2024-01-20',
    NULL
),
(
    '550e8400-e29b-41d4-a716-446655440000',
    'expense',
    'Manutenção',
    300.00,
    'Reparo no sistema elétrico',
    '2024-01-25',
    NULL
) ON CONFLICT DO NOTHING;