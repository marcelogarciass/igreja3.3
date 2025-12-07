import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getUserWithChurch, createServerSupabaseClient } from '@/lib/auth'
import { Users, UserPlus } from 'lucide-react'
import { redirect } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'

async function getUsersList(churchId: string): Promise<UserRow[]> {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('users')
    .select('id,name,email,role')
    .eq('church_id', churchId)
    .order('name', { ascending: true })

  if (error) {
    console.error('Erro ao buscar usuários:', error)
    return []
  }

  return (data || []) as UserRow[]
}

export async function createUser(formData: FormData) {
  'use server'
  const userData = await getUserWithChurch()
  if (!userData) {
    redirect('/login')
  }

  const name = (formData.get('name') as string) || ''
  const email = (formData.get('email') as string) || ''
  const role = (formData.get('role') as string) || 'member'
  const password = (formData.get('password') as string) || ''
  const confirmPassword = (formData.get('confirm_password') as string) || ''

  // Validações básicas de senha
  if (!password || password.length < 6) {
    redirect('/dashboard/users?error=password_length')
  }
  if (password !== confirmPassword) {
    redirect('/dashboard/users?error=password_mismatch')
  }

  try {
    const admin = createAdminClient()

    // Checa duplicidade de e-mail na tabela users da mesma igreja
    const { data: existingUsers, error: existingError } = await admin
      .from('users')
      .select('id')
      .eq('church_id', userData.church_id)
      .eq('email', email)
      .limit(1)

    if (existingError) {
      console.error('Erro ao verificar duplicidade na tabela users:', existingError)
      redirect('/dashboard/users?error=db_check')
    }

    if (existingUsers && existingUsers.length > 0) {
      redirect('/dashboard/users?error=duplicate')
    }

    // Cria usuário diretamente no Auth com senha
    const { data: created, error: createError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name, role },
    })

    if (createError) {
      console.error('Erro ao criar usuário no Auth:', createError)
      redirect('/dashboard/users?error=auth_create')
    }

    const authUserId = created?.user?.id
    if (!authUserId) {
      console.error('ID do usuário Auth ausente após criação.')
      redirect('/dashboard/users?error=auth_id')
    }

    const { error: insertError } = await admin
      .from('users')
      .insert({
        id: authUserId,
        church_id: userData.church_id,
        email,
        name,
        role,
      })

    if (insertError) {
      console.error('Erro ao inserir usuário na tabela users:', insertError)
      redirect('/dashboard/users?error=db')
    }

    redirect('/dashboard/users?saved=1')
  } catch (e) {
    console.error('Erro geral na criação de usuário em produção:', e)
    redirect('/dashboard/users?error=server')
  }
}

export default async function UsersPage({ searchParams }: { searchParams?: { [key: string]: string } }) {
  const userData = await getUserWithChurch()
  if (!userData) {
    redirect('/login')
  }

  const users = await getUsersList(userData.church_id)
  const saved = searchParams?.saved
  const errorCode = searchParams?.error

  const errorMessages: Record<string, string> = {
    duplicate: 'Este e-mail já está cadastrado para sua igreja.',
    invite: 'Falha ao enviar convite por e-mail. Verifique o SMTP do projeto.',
    auth_id: 'Não foi possível obter o ID do usuário Auth.',
    auth_create: 'Erro ao criar usuário no Auth.',
    db: 'Erro ao salvar o usuário na tabela users.',
    db_check: 'Erro ao checar duplicidade no banco.',
    password_length: 'A senha deve ter pelo menos 6 caracteres.',
    password_mismatch: 'As senhas não coincidem.',
    server: 'Erro inesperado no servidor durante a criação do usuário.',
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Users className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Usuários</h1>
          <p className="text-gray-600">Gerencie quem tem acesso ao sistema</p>
        </div>
      </div>

      {saved && (
        <div className="rounded-md bg-green-50 border border-green-200 p-3 text-sm text-green-900">
          Usuário criado com sucesso e senha definida.
        </div>
      )}

      {errorCode && (
        <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-900">
          {errorMessages[errorCode] || 'Ocorreu um erro ao criar o usuário.'}
        </div>
      )}

      {/* Novo Usuário */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">Novo Usuário</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md bg-yellow-50 border border-yellow-200 p-3 text-sm text-yellow-900 mb-3">
            Para produção, é necessário a chave de serviço para criar usuários com senha.
          </div>
          <form action={createUser} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nome</label>
              <Input name="name" placeholder="Nome" required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">E-mail</label>
              <Input name="email" type="email" placeholder="email@exemplo.com" required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Papel</label>
              <select name="role" defaultValue="member" className="border rounded-md p-2">
                <option value="member">Membro</option>
                <option value="treasurer">Tesoureiro</option>
                <option value="admin">Administrador</option>
              </select>
            </div>
            {/* Senha */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Senha</label>
              <Input name="password" type="password" placeholder="Defina uma senha" required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Confirmar Senha</label>
              <Input name="confirm_password" type="password" placeholder="Repita a senha" required />
            </div>
            <div className="md:col-span-2">
              <Button type="submit">
                <UserPlus className="h-4 w-4 mr-2" /> Adicionar Usuário
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">Lista</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-4">
            <Input placeholder="Buscar por nome ou e-mail" className="max-w-full sm:max-w-sm" />
            <Button disabled={false}>
              <UserPlus className="h-4 w-4 mr-2" />
              Adicionar Usuário
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">E-mail</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Papel</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((u) => (
                  <tr key={u.id}>
                    <td className="px-4 py-2 whitespace-nowrap">{u.name}</td>
                    <td className="px-4 py-2 whitespace-nowrap">{u.email}</td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      {u.role === 'admin' ? 'Administrador' : u.role === 'treasurer' ? 'Tesoureiro' : 'Membro'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
type UserRow = {
  id: string
  name: string
  email: string
  role: 'admin' | 'treasurer' | 'member'
}
