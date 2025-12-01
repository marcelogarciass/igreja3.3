import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getUserWithChurch, isDemoSession, createServerSupabaseClient } from '@/lib/auth'
import { Rocket } from 'lucide-react'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

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

  if (await isDemoSession()) {
    // Em modo demo, não persiste, mas sinaliza sucesso e retorna ao dashboard
    redirect('/dashboard?demo_saved=1')
  }

  try {
    const supabase = await createServerSupabaseClient()
    const { error } = await supabase.from('transactions').insert({
      church_id: userData.church_id,
      type,
      category,
      amount,
      date,
      description,
      member_id: null,
    })

    if (error) {
      console.error('Erro ao salvar transação:', error)
      // Mesmo em erro, revalida páginas relacionadas para evitar cache obsoleto
      revalidatePath('/dashboard')
      revalidatePath('/dashboard/transactions')
      redirect('/dashboard?error=transaction')
    }

    // Revalida dashboard e lista de transações para refletir a nova transação
    revalidatePath('/dashboard')
    revalidatePath('/dashboard/transactions')

    // Redireciona ao dashboard com sucesso
    redirect('/dashboard?saved=1')
  } catch (e) {
    console.error('Erro geral ao salvar transação:', e)
    revalidatePath('/dashboard')
    revalidatePath('/dashboard/transactions')
    redirect('/dashboard?error=server')
  }
}

export default async function QuickEntryPage() {
  const userData = await getUserWithChurch()
  if (!userData) {
    redirect('/login')
  }

  const demo = await isDemoSession()

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Rocket className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Lançamento Rápido</h1>
          <p className="text-gray-600">Adicione uma transação de forma simples</p>
        </div>
      </div>

      {demo && (
        <div className="rounded-md bg-blue-50 border border-blue-200 p-3 text-sm text-blue-900">
          Modo demonstração ativo: os dados não serão persistidos.
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Novo Lançamento</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createQuickTransaction} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo</label>
              <select name="type" className="border rounded-md p-2">
                <option value="income">Entrada</option>
                <option value="expense">Saída</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Categoria</label>
              <Input name="category" placeholder="Ex.: Dízimo, Oferta, Manutenção" required />
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
              <textarea name="description" className="border rounded-md p-2 h-28" placeholder="Detalhes da transação" />
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