import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getUserWithChurch, createServerSupabaseClient } from '@/lib/auth'
import { Users, UserPlus } from 'lucide-react'
import { redirect } from 'next/navigation'

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

export async function createMember(formData: FormData) {
  'use server'
  const userData = await getUserWithChurch()
  if (!userData) {
    redirect('/login')
  }

  const name = (formData.get('name') as string) || ''
  const birth_date = (formData.get('birth_date') as string) || ''
  const position = (formData.get('position') as string) || 'Membro'
  const entry_date = (formData.get('entry_date') as string) || new Date().toISOString().slice(0,10)
  const status = (formData.get('status') as string) || 'active'
  const phone = (formData.get('phone') as string) || ''
  const email = (formData.get('email') as string) || ''

  try {
    const supabase = await createServerSupabaseClient()

    // Checa duplicidade por e-mail (se informado) na mesma igreja
    if (email) {
      const { data: existingMembers, error: checkError } = await supabase
        .from('members')
        .select('id')
        .eq('church_id', userData.church_id)
        .eq('email', email)
        .limit(1)

      if (checkError) {
        console.error('Erro ao verificar duplicidade de membro:', checkError)
        redirect('/dashboard/members?error=db_check')
      }

      if (existingMembers && existingMembers.length > 0) {
        redirect('/dashboard/members?error=duplicate')
      }
    }

    const { error } = await supabase.from('members').insert({
      church_id: userData.church_id,
      name,
      birth_date,
      position,
      entry_date,
      status,
      phone,
      email,
    })

    if (error) {
      console.error('Erro ao adicionar membro:', error)
      redirect('/dashboard/members?error=db')
    }

    redirect('/dashboard/members?saved=1')
  } catch (e) {
    console.error('Erro geral na criação de membro:', e)
    redirect('/dashboard/members?error=server')
  }
}

export default async function MembersPage({ searchParams }: { searchParams?: { [key: string]: string } }) {
  const userData = await getUserWithChurch()

  if (!userData) {
    redirect('/login')
  }

  const members = await getMembers(userData.church_id)
  const saved = searchParams?.saved
  const errorCode = searchParams?.error

  const errorMessages: Record<string, string> = {
    duplicate: 'Este e-mail já está cadastrado como membro da sua igreja.',
    db: 'Erro ao salvar o membro na tabela.',
    db_check: 'Erro ao checar duplicidade no banco.',
    server: 'Erro inesperado no servidor durante a criação do membro.',
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Users className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Membros</h1>
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
          <form action={createMember} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nome</label>
              <Input name="name" placeholder="Nome completo" required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">E-mail</label>
              <Input name="email" type="email" placeholder="email@exemplo.com" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Telefone</label>
              <Input name="phone" placeholder="(11) 99999-9999" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Nascimento</label>
              <Input name="birth_date" type="date" required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Cargo/Função</label>
              <Input name="position" placeholder="Ex.: Diácono, Tesoureira" required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Entrada</label>
              <Input name="entry_date" type="date" required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <select name="status" className="border rounded-md p-2">
                <option value="active">Ativo</option>
                <option value="inactive">Inativo</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <Button type="submit">
                <UserPlus className="h-4 w-4 mr-2" /> Adicionar Membro
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
type Member = {
  id: string
  name: string
  email: string | null
  status: 'active' | 'inactive'
  entry_date: string
}
