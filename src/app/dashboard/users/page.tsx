import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getUserWithChurch, createServerSupabaseClient } from '@/lib/auth'
import { Users, UserPlus } from 'lucide-react'
import { redirect } from 'next/navigation'
import { UserForm } from '@/components/users/user-form'

async function getUsersList(churchId: string): Promise<UserRow[]> {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('users')
    .select('id,name,email,role,photo_url')
    .eq('church_id', churchId)
    .order('name', { ascending: true })

  if (error) {
    console.error('Erro ao buscar usuários:', error)
    return []
  }

  return (data || []) as UserRow[]
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

      {/* Novo Usuário Form */}
      <UserForm />

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
                    <td className="px-4 py-2 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        {u.photo_url ? (
                          <div className="h-8 w-8 rounded-full overflow-hidden border">
                            <img src={u.photo_url} alt={u.name} className="h-full w-full object-cover" />
                          </div>
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs font-medium">
                            {u.name.substring(0, 2).toUpperCase()}
                          </div>
                        )}
                        <span>{u.name}</span>
                      </div>
                    </td>
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
  photo_url?: string | null
}
