import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getUserWithChurch, isDemoSession, createServerSupabaseClient } from '@/lib/auth'
import { ArrowDownCircle, ArrowUpCircle, Receipt, Plus } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'

const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

async function getTransactions(churchId: string) {
  if (await isDemoSession()) {
    return [
      { id: 't-001', type: 'income', category: 'Dízimo', amount: 1500.0, description: 'Dízimo do mês de Janeiro', date: '2024-01-15' },
      { id: 't-002', type: 'income', category: 'Oferta', amount: 800.0, description: 'Oferta especial para reforma', date: '2024-01-20' },
      { id: 't-003', type: 'expense', category: 'Manutenção', amount: 300.0, description: 'Reparo no sistema elétrico', date: '2024-01-25' }
    ]
  }

  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('church_id', churchId)
    .order('date', { ascending: false })

  if (error) {
    console.error('Erro ao buscar transações:', error)
    return []
  }

  return data || []
}

export default async function TransactionsPage() {
  const userData = await getUserWithChurch()
  if (!userData) {
    redirect('/login')
  }

  const transactions = await getTransactions(userData.church_id)
  const incomeTotal = transactions.filter((t: any) => t.type === 'income').reduce((s: number, t: any) => s + Number(t.amount), 0)
  const expenseTotal = transactions.filter((t: any) => t.type === 'expense').reduce((s: number, t: any) => s + Number(t.amount), 0)

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Receipt className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Transações</h1>
          <p className="text-gray-600">Entradas e saídas financeiras</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700">
              <ArrowUpCircle className="h-5 w-5" /> Entradas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{currency.format(incomeTotal)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <ArrowDownCircle className="h-5 w-5" /> Saídas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{currency.format(expenseTotal)}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">Lista de Transações</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 mb-4">
            <Input placeholder="Buscar descrição ou categoria" className="max-w-sm" />
            <Link href="/dashboard/quick-entry">
              <Button>
                <Plus className="h-4 w-4 mr-2" /> Nova Transação
              </Button>
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Descrição</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Categoria</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Valor</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transactions.map((t: any) => (
                  <tr key={t.id}>
                    <td className="px-4 py-2 whitespace-nowrap">{new Date(t.date).toLocaleDateString('pt-BR')}</td>
                    <td className="px-4 py-2 whitespace-nowrap">{t.description}</td>
                    <td className="px-4 py-2 whitespace-nowrap">{t.category}</td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <span className={t.type === 'income' ? 'text-green-700' : 'text-red-700'}>
                        {t.type === 'income' ? 'Entrada' : 'Saída'}
                      </span>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">{currency.format(Number(t.amount))}</td>
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