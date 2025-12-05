# igreja3.3

Sistema robusto de gestão financeira multi-tenant para igrejas, desenvolvido com Next.js, TypeScript, TailwindCSS e Supabase.

## 🚀 Funcionalidades

- ✅ **Dashboard com KPIs em tempo real** - Visualização de entradas, saídas, saldo e gráficos
- ✅ **Sistema de autenticação** - Login/registro com controle de roles (admin, tesoureiro, membro)
- ✅ **Multi-tenancy** - Cada igreja tem seus próprios dados isolados
- ✅ **Configurações da igreja** - Personalização visual com cores e informações
- 🔄 **CRUD de usuários** - Gerenciamento de usuários com controle de permissões
- 🔄 **Gestão de membros** - Cadastro e controle de membros da igreja
- 🔄 **Controle financeiro** - Cadastro de entradas e saídas financeiras
- 🔄 **Lançamento rápido** - Sistema para dízimos e ofertas

## 🛠️ Tecnologias

- **Frontend**: Next.js 15, React, TypeScript
- **Styling**: TailwindCSS, Radix UI, Lucide Icons
- **Backend**: Supabase (PostgreSQL, Auth, RLS)
- **Charts**: Recharts
- **Deployment**: Vercel (recomendado)

## 📋 Pré-requisitos

- Node.js 18+
- npm ou yarn
- Conta no Supabase

## ⚙️ Configuração

### 1. Clone o projeto
```bash
git clone https://github.com/marcelogarciass/igreja3.3.git
cd igreja3.3
```

### 2. Instale as dependências
```bash
npm install
```

### 3. Configure o Supabase

1. Crie um novo projeto no [Supabase](https://supabase.com)
2. Copie as credenciais do projeto
3. Renomeie `.env.local.example` para `.env.local`
4. Preencha as variáveis de ambiente:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### 4. Execute as migrações do banco

No painel do Supabase, vá em SQL Editor e execute o conteúdo do arquivo:
```
supabase/migrations/001_initial_schema.sql
```

### 5. Inicie o servidor de desenvolvimento
```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

## 📁 Estrutura do Projeto

```
src/
├── app/                    # App Router (Next.js 13+)
│   ├── dashboard/         # Páginas do dashboard
│   ├── login/            # Página de login
│   ├── register/         # Página de registro
│   └── layout.tsx        # Layout principal
├── components/           # Componentes reutilizáveis
│   ├── ui/              # Componentes base (Button, Card, Input)
│   ├── dashboard/       # Componentes específicos do dashboard
│   └── layout/          # Componentes de layout (Sidebar)
├── lib/                 # Utilitários e configurações
│   ├── auth.ts         # Funções de autenticação
│   ├── supabase.ts     # Cliente Supabase e tipos
│   └── utils.ts        # Utilitários gerais
└── middleware.ts       # Middleware de autenticação
```

## 🔐 Sistema de Permissões

### Roles disponíveis:
- **admin**: Acesso total ao sistema
- **treasurer**: Acesso a finanças e relatórios
- **member**: Acesso limitado a visualizações

### Páginas protegidas:
- `/dashboard/*` - Requer autenticação
- `/dashboard/settings` - Apenas admins
- `/dashboard/users` - Apenas admins
- `/dashboard/finance` - Admins e tesoureiros

## 🗄️ Schema do Banco

### Tabelas principais:
- `churches` - Dados das igrejas
- `users` - Usuários do sistema
- `members` - Membros das igrejas
- `transactions` - Transações financeiras

### Row Level Security (RLS):
Todas as tabelas possuem políticas RLS para garantir isolamento entre igrejas.

## 🚀 Deploy

### Vercel (Recomendado)
1. Conecte seu repositório no Vercel
2. Configure as variáveis de ambiente
3. Deploy automático

### Outras plataformas
O projeto é compatível com qualquer plataforma que suporte Next.js.

## 📝 Próximos Passos

1. **CRUD de Usuários** - Sistema completo de gerenciamento de usuários
2. **Gestão de Membros** - Cadastro e controle de membros
3. **Sistema Financeiro** - Controle completo de entradas e saídas
4. **Relatórios** - Relatórios financeiros detalhados
5. **Notificações** - Sistema de notificações em tempo real
6. **Mobile App** - Aplicativo mobile com React Native

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 🧩 Bootstrap de Usuário Admin

Opção A (SQL Editor do Supabase)
- Abra SQL Editor e execute `supabase/migrations/002_policies_and_initial_data.sql`.
- Ajuste o email/senha no arquivo conforme sua necessidade.
- Em produção, não execute `supabase/migrations/002_demo_data.sql`.

Opção B (Endpoint seguro)
- Defina `BOOTSTRAP_TOKEN` em `.env.local`.
- Inicie o servidor em produção (`npm run build && npm start`).
- Acesse: `GET /api/bootstrap?token=SEU_TOKEN&email=admin@admin.com&password=admin123456&church=Igreja Matriz`.
- O endpoint cria (ou garante) o usuário admin e a igreja e faz o vínculo em `public.users`.

Após o bootstrap:
- Faça login em `/login` com o email/senha definidos.
- Verifique que o dashboard carrega e que as políticas RLS funcionam.

## 📞 Suporte

Para suporte, entre em contato através do email: suporte@multichurch.com

---

Desenvolvido com ❤️ para a comunidade cristã
