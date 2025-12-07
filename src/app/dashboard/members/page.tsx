import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getUserWithChurch, createServerSupabaseClient } from '@/lib/auth'
import { Users, Cake, Filter } from 'lucide-react'
import { redirect } from 'next/navigation'
import { MemberForm } from '@/components/members/member-form'
import { Member } from '@/lib/types'
import Link from 'next/link'

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
  const filterBirthdays = resolvedParams?.filter === 'birthdays'

  const errorMessages: Record<string, string> = {
    duplicate: 'Este e-mail já está cadastrado como membro da sua igreja.',
    db: 'Erro ao salvar o membro na tabela.',
    db_check: 'Erro ao checar duplicidade no banco.',
    server: 'Erro inesperado no servidor durante a criação do membro.',
  }

  // Filtragem de aniversariantes
  let displayedMembers = members
  if (filterBirthdays) {
    const currentMonth = new Date().getMonth() + 1 // 1-12
    displayedMembers = members.filter(m => {
      if (!m.birth_date) return false
      // birth_date format: YYYY-MM-DD
      const parts = m.birth_date.split('-')
      if (parts.length !== 3) return false
      const month = parseInt(parts[1], 10)
      return month === currentMonth
    })
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
            
            <Link href={filterBirthdays ? '/dashboard/members' : '/dashboard/members?filter=birthdays'}>
              <Button variant={filterBirthdays ? "default" : "outline"} className={filterBirthdays ? "bg-pink-600 hover:bg-pink-700" : ""}>
                <Cake className="h-4 w-4 mr-2" />
                {filterBirthdays ? 'Limpar Filtro' : 'Aniversariantes do Mês'}
              </Button>
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">E-mail</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Nascimento</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Entrada</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {displayedMembers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                      Nenhum membro encontrado.
                    </td>
                  </tr>
                ) : (
                  displayedMembers.map((m) => (
                    <tr key={m.id}>
                      <td className="px-4 py-2 whitespace-nowrap">{m.name}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{m.email || '-'}</td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        {m.birth_date ? new Date(m.birth_date).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : '-'}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        <span className={
                          m.status === 'active' ? 'text-green-700' : 'text-gray-500'
                        }>{m.status === 'active' ? 'Ativo' : 'Inativo'}</span>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">{new Date(m.entry_date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
