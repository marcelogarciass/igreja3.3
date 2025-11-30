-- 1. Habilitar RLS para a tabela de igrejas
ALTER TABLE public.churches ENABLE ROW LEVEL SECURITY;

-- 2. Permitir que usuários autenticados criem novas igrejas
CREATE POLICY "Allow authenticated users to create churches" ON public.churches
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- 3. Permitir que usuários vejam apenas as igrejas às quais pertencem
CREATE POLICY "Allow users to see their own church" ON public.churches
  FOR SELECT
  USING (id = (SELECT church_id FROM public.users WHERE id = auth.uid()));

-- 4. Inserir o primeiro usuário administrador (substitua com dados reais se necessário)
-- Este usuário será usado para fazer o login inicial e configurar o sistema.
-- A senha é 'admin123456', que deve ser alterada após o primeiro login.
INSERT INTO auth.users (id, email, encrypted_password, role, aud, instance_id, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
VALUES ('00000000-0000-0000-0000-000000000001', 'admin@admin.com', crypt('admin123456', gen_salt('bf')), 'authenticated', 'authenticated', '00000000-0000-0000-0000-000000000000',
'{"provider":"email","providers":["email"]}',
'{"name":"Admin","role":"admin"}',
NOW(), NOW());

-- 5. Inserir a primeira igreja
INSERT INTO public.churches (id, name, created_at)
VALUES ('10000000-0000-0000-0000-000000000001', 'Igreja Matriz', NOW());

-- 6. Associar o usuário administrador à igreja matriz
INSERT INTO public.users (id, name, email, role, church_id, created_at)
VALUES ('00000000-0000-0000-0000-000000000001', 'Admin', 'admin@admin.com', 'admin', '10000000-0000-0000-0000-000000000001', NOW());