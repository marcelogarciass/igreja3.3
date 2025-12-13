import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getUserWithChurch, createServerSupabaseClient } from '@/lib/auth'
import { Rocket } from 'lucide-react'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { TRANSACTION_CATEGORIES } from '@/lib/constants/transaction-categories'

export async function createQuickTransaction(formData: FormData) {
  'use server'
  const userData = await getUserWithChurch()
  if (!userData) {
    redirect('/login')
  }

  const type = (formData.get('type') as string) || 'income'
  const category = (formData.get('category') as string) || 'Geral'
  const amount = Number(formData.get('amount') || 0)
  const date = (formData.get('date') as string) || new Date().toISOString().slice(0, 10)
  const description = (formData.get('description') as string) || ''
  const member_id = (formData.get('member_id') as string) || null

  // Validate category
  const isValidCategory = TRANSACTION_CATEGORIES.includes(category as any)
  if (!isValidCategory) {
    // If invalid, we could default to "Diversas" or handle error. 
    // Given the previous code allowed free text, let's strictly enforce it now or default.
    // However, the user wants strict dropdown options.
    // If the form sends something else, it's a "bad request". 
    // For now, let's not block it hard but maybe default to "Diversas" if invalid, 
    // or just let it pass if we want to support legacy data (but this is CREATE).
    // Let's enforce it.
    console.error('Categoria inválida:', category)
    // We'll redirect with error if validation fails
    redirect('/dashboard?error=validation')
  }

  let errorType = null

  try {
    const supabase = await createServerSupabaseClient()
    const { error } = await supabase.from('transactions').insert({
      church_id: userData.church_id,
      type,
      category,
      amount,
      date,
      description,
      member_id: member_id || null
    })

    if (error) {
      console.error('Erro ao salvar transação:', error)
      errorType = 'transaction'
    } else {
      // Revalida dashboard e lista de transações para refletir a nova transação
      revalidatePath('/dashboard')
      revalidatePath('/dashboard/transactions')
    }
  } catch (e) {
    console.error('Erro geral ao salvar transação:', e)
    errorType = 'server'
  }

  if (errorType) {
    redirect(`/dashboard?error=${errorType}`)
  } else {
    redirect('/dashboard?saved=1')
  }
}

export default async function QuickEntryPage() {
  const userData = await getUserWithChurch()
  if (!userData) {
    redirect('/login')
  }

  const supabase = await createServerSupabaseClient()
  const { data: members } = await supabase
    .from('members')
    .select('id, name')
    .eq('church_id', userData.church_id)
    .eq('status', 'active')
    .order('name')

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Rocket className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Lançamento Rápido</h1>
          <p className="text-gray-600">Adicione uma transação de forma simples</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Novo Lançamento</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createQuickTransaction} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo</label>
              <select 
                name="type" 
                className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="income">Entrada</option>
                <option value="expense">Saída</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Categoria</label>
              <select 
                name="category" 
                className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="" disabled selected>Selecione uma categoria</option>
                {TRANSACTION_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Membro (Opcional)</label>
              <select 
                name="member_id" 
                className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Selecione um membro...</option>
                {members?.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Valor</label>
              <Input name="amount" type="number" step="0.01" required />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Data</label>
              <Input name="date" type="date" required />
            </div>

            <div className="md:col-span-2 space-y-2">
              <label className="text-sm font-medium">Descrição</label>
              <textarea 
                name="description" 
                className="flex min-h-[80px] w-full rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" 
                placeholder="Detalhes da transação" 
              />
            </div>

            <div className="md:col-span-2">
              <Button type="submit">Salvar</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}