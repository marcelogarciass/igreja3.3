import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getUserWithChurch, createServerSupabaseClient } from '@/lib/auth'
import { Users, UserPlus } from 'lucide-react'
import { redirect } from 'next/navigation'
import { MemberForm } from '@/components/members/member-form'
import { Member } from '@/lib/types'

async function getMembers(churchId: string): Promise<Member[]> {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('members')
    .select('*')
    .eq('church_id', churchId)
    .order('entry_date', { ascending: false })

  if (error) {
    console.error('Erro ao buscar membros:', error)
    return []
  }

  return (data || []) as Member[]
}

export default async function MembersPage({ searchParams }: { searchParams?: Promise<{ [key: string]: string }> }) {
  const userData = await getUserWithChurch()

  if (!userData) {
    redirect('/login')
  }

  const resolvedParams = await searchParams
  const members = await getMembers(userData.church_id)
  const saved = resolvedParams?.saved
  const errorCode = resolvedParams?.error

  const errorMessages: Record<string, string> = {
    duplicate: 'Este e-mail já está cadastrado como membro da sua igreja.',
    db: 'Erro ao salvar o membro na tabela.',
    db_check: 'Erro ao checar duplicidade no banco.',
    server: 'Erro inesperado no servidor durante a criação do membro.',
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Users className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Membros</h1>
          <p className="text-gray-600">Lista de membros da sua igreja</p>
        </div>
      </div>

      {saved && (
        <div className="rounded-md bg-green-50 border border-green-200 p-3 text-sm text-green-900">
          Membro criado com sucesso.
        </div>
      )}

      {errorCode && (
        <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-900">
          {errorMessages[errorCode] || 'Ocorreu um erro ao criar o membro.'}
        </div>
      )}

      {/* Novo Membro */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">Novo Membro</CardTitle>
        </CardHeader>
        <CardContent>
          <MemberForm />
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
              Adicionar Membro
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">E-mail</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Entrada</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {members.map((m) => (
                  <tr key={m.id}>
                    <td className="px-4 py-2 whitespace-nowrap">{m.name}</td>
                    <td className="px-4 py-2 whitespace-nowrap">{m.email}</td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <span className={
                        m.status === 'active' ? 'text-green-700' : 'text-gray-500'
                      }>{m.status === 'active' ? 'Ativo' : 'Inativo'}</span>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">{new Date(m.entry_date).toLocaleDateString('pt-BR')}</td>
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
