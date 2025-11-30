import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getUserWithChurch, isDemoSession, createServerSupabaseClient } from '@/lib/auth'
import { Users, UserPlus } from 'lucide-react'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createAdminClient } from '@/lib/supabase/admin'

async function getUsersList(churchId: string) {
  if (isDemoSession()) {
    const base = [
      { id: 'u-001', name: 'Administrador Demo', email: 'admin@demo.com', role: 'admin' },
      { id: 'u-002', name: 'Tesoureiro Demo', email: 'tesoureiro@demo.com', role: 'treasurer' },
      { id: 'u-003', name: 'Membro Demo', email: 'membro@demo.com', role: 'member' },
    ]
    const c = cookies()
    const addedRaw = c.get('demo_users_plus')?.value
    let added: any[] = []
    try { added = addedRaw ? JSON.parse(addedRaw) : [] } catch {}
    return [...base, ...added]
  }

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

  return data || []
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

  if (isDemoSession()) {
    const c = cookies()
    const addedRaw = c.get('demo_users_plus')?.value
    let added: any[] = []
    try { added = addedRaw ? JSON.parse(addedRaw) : [] } catch {}
    added.push({ id: `demo-${Date.now()}`, name, email, role })
    c.set('demo_users_plus', JSON.stringify(added), { path: '/' })
    redirect('/dashboard/users?saved=1')
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

    // Convida o usuário por e-mail (Supabase envia e-mail para definir senha)
    const { data: inviteData, error: inviteError } = await admin.auth.admin.inviteUserByEmail(email)
    if (inviteError) {
      console.error('Erro ao convidar usuário pelo e-mail:', inviteError)
      redirect('/dashboard/users?error=invite')
    }

    const authUserId = inviteData?.user?.id
    if (!authUserId) {
      console.error('ID do usuário Auth ausente após convite.')
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
  const demo = isDemoSession()
  const saved = searchParams?.saved
  const errorCode = searchParams?.error

  const errorMessages: Record<string, string> = {
    duplicate: 'Este e-mail já está cadastrado para sua igreja.',
    invite: 'Falha ao enviar convite por e-mail. Verifique o SMTP do projeto.',
    auth_id: 'Não foi possível obter o ID do usuário Auth após o convite.',
    db: 'Erro ao salvar o usuário na tabela users.',
    db_check: 'Erro ao checar duplicidade no banco.',
    server: 'Erro inesperado no servidor durante a criação do usuário.',
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Users className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Usuários</h1>
          <p className="text-gray-600">Gerencie quem tem acesso ao sistema</p>
        </div>
      </div>

      {saved && (
        <div className="rounded-md bg-green-50 border border-green-200 p-3 text-sm text-green-900">
          Usuário convidado e criado com sucesso.
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
          {!demo && (
            <div className="rounded-md bg-yellow-50 border border-yellow-200 p-3 text-sm text-yellow-900 mb-3">
              Para produção, convide usuários via Supabase Auth. A criação automática requer a chave de serviço.
            </div>
          )}
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
              <select name="role" className="border rounded-md p-2">
                <option value="admin">Administrador</option>
                <option value="treasurer">Tesoureiro</option>
                <option value="member">Membro</option>
              </select>
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
          <div className="flex items-center gap-3 mb-4">
            <Input placeholder="Buscar por nome ou e-mail" className="max-w-sm" />
            <Button disabled={false} title={demo ? 'Em demonstração, não persiste no banco' : undefined}>
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
                {users.map((u: any) => (
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