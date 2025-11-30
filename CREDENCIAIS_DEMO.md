# 🔐 Credenciais de Demonstração - MultiChurch Gestão

## ✅ Sistema de Login Mock Implementado

O sistema agora possui um **sistema de autenticação mock** que funciona independentemente do Supabase!

### 📧 Credenciais de Acesso
```
Email: admin@demo.com
Senha: demo123456
```

### 🚀 Como Usar
1. Acesse: http://localhost:3000/login
2. Digite as credenciais acima
3. Clique em "Entrar"
4. Você será redirecionado para o dashboard com dados de demonstração

### 🎯 Funcionalidades Disponíveis
- ✅ **Dashboard** - Visão geral com dados financeiros mock
- ✅ **Gestão de Membros** - Sistema completo de membros
- ✅ **Controle Financeiro** - Receitas e despesas
- ✅ **Configurações da Igreja** - Dados da igreja
- ✅ **Gestão de Usuários** - Controle de acesso

### 📊 Dados de Demonstração
- **Igreja**: Igreja Demonstração
- **Saldo Atual**: R$ 15.750,50
- **Receita Mensal**: R$ 8.500,00
- **Despesas Mensais**: R$ 3.200,00
- **Total de Membros**: 125

### 🔧 Como Funciona
- O sistema detecta as credenciais de demo automaticamente
- Cria uma sessão mock no localStorage e cookies
- Middleware adaptado para reconhecer autenticação mock
- Dados de demonstração são retornados em todas as páginas

### ⚠️ Importante
- Este é um sistema de demonstração
- Os dados são fictícios e não são salvos no banco
- Para uso em produção, configure o Supabase adequadamente
- O sistema ainda suporta autenticação real quando configurado

### 🔄 Logout
Para sair do sistema, limpe os cookies do navegador ou use a funcionalidade de logout quando disponível.

---
**Status**: ✅ Funcionando - Sistema de mock implementado com sucesso!