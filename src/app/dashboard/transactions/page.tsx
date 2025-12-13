import { getUserWithChurch, createServerSupabaseClient } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Receipt } from 'lucide-react'
import { TransactionsClient } from './transactions-client'
import { Transaction } from '@/components/transactions/transaction-table'

async function getTransactions(churchId: string): Promise<Transaction[]> {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('transactions')
    .select('*, members(name)')
    .eq('church_id', churchId)
    .order('date', { ascending: false })

  if (error) {
    console.error('Erro ao buscar transações:', error)
    return []
  }

  return (data || []) as Transaction[]
}

async function getMembers(churchId: string) {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('members')
    .select('id, name')
    .eq('church_id', churchId)
    .eq('status', 'active')
    .order('name')

  if (error) {
    console.error('Erro ao buscar membros:', error)
    return []
  }

  return data || []
}

export default async function TransactionsPage() {
  const userData = await getUserWithChurch()
  if (!userData) {
    redirect('/login')
  }

  const [transactions, members] = await Promise.all([
    getTransactions(userData.church_id),
    getMembers(userData.church_id)
  ])

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Receipt className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Transações</h1>
          <p className="text-gray-600">Entradas e saídas financeiras</p>
        </div>
      </div>

      <TransactionsClient initialTransactions={transactions} members={members} />
    </div>
  )
}
