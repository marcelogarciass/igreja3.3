import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { StatsCard } from '@/components/dashboard/stats-card'
import { FinancialChart } from '@/components/dashboard/financial-chart'
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Wallet,
  Users,
  AlertTriangle
} from 'lucide-react'
import { getUserWithChurch, isDemoSession, createServerSupabaseClient } from '@/lib/auth'

async function getDashboardData(churchId: string) {
  // Fallback demo imediato
  if (isDemoSession()) {
    const demoIncome = 8500
    const demoExpense = 3200
    const demoBalance = 15750.5
    const demoMembers = 125
    const demoChartData = [
      { month: 'mai', income: 7000, expense: 3000 },
      { month: 'jun', income: 8200, expense: 2800 },
      { month: 'jul', income: 7900, expense: 3100 },
      { month: 'ago', income: 8600, expense: 2900 },
      { month: 'set', income: 9000, expense: 3200 },
      { month: 'out', income: 8500, expense: 3000 },
    ]
    const demoRecent = [
      { date: '2024-10-02', description: 'Oferta especial', category: 'Oferta', type: 'income', amount: 500 },
      { date: '2024-10-05', description: 'Compra de material', category: 'Manutenção', type: 'expense', amount: 120 },
    ]
    return {
      currentIncome: demoIncome,
      currentExpense: demoExpense,
      currentBalance: demoBalance,
      incomeTrend: 12,
      expenseTrend: -5,
      balanceTrend: 8,
      membersCount: demoMembers,
      chartData: demoChartData,
      recentTransactions: demoRecent,
      yearBalance: demoBalance,
    }
  }

  const supabase = await createServerSupabaseClient()

  try {
    // Get current month transactions
    const currentDate = new Date()
    const currentMonth = currentDate.getMonth() + 1
    const currentYear = currentDate.getFullYear()
    
    const { data: transactions } = await supabase
      .from('transactions')
      .select('*')
      .eq('church_id', churchId)
      .gte('date', `${currentYear}-01-01`)
      .lte('date', `${currentYear}-12-31`)
  
    // Calculate totals
    const currentMonthTransactions = transactions?.filter(t => {
      const transactionDate = new Date(t.date)
      return transactionDate.getMonth() + 1 === currentMonth && 
             transactionDate.getFullYear() === currentYear
    }) || []
  
    const previousMonthTransactions = transactions?.filter(t => {
      const transactionDate = new Date(t.date)
      const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1
      const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear
      return transactionDate.getMonth() + 1 === prevMonth && 
             transactionDate.getFullYear() === prevYear
    }) || []
  
    const currentIncome = currentMonthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0)
  
    const currentExpense = currentMonthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0)
  
    const previousIncome = previousMonthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0)
  
    const previousExpense = previousMonthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0)
  
    const currentBalance = currentIncome - currentExpense
    const previousBalance = previousIncome - previousExpense
  
    // Saldo acumulado do ano
    const yearIncome = (transactions || [])
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0)
    const yearExpense = (transactions || [])
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0)
    const yearBalance = yearIncome - yearExpense
  
    // Calculate trends
    const incomeTrend = previousIncome > 0 ? ((currentIncome - previousIncome) / previousIncome) * 100 : 0
    const expenseTrend = previousExpense > 0 ? ((currentExpense - previousExpense) / previousExpense) * 100 : 0
    const balanceTrend = previousBalance !== 0 ? ((currentBalance - previousBalance) / Math.abs(previousBalance)) * 100 : 0
  
    // Get members count
    const { count: membersCount } = await supabase
      .from('members')
      .select('*', { count: 'exact', head: true })
      .eq('church_id', churchId)
      .eq('status', 'active')
  
    // Generate chart data for last 6 months
    const chartData = [] as { month: string; income: number; expense: number }[]
    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentYear, currentMonth - 1 - i, 1)
      const month = date.getMonth() + 1
      const year = date.getFullYear()
      
      const monthTransactions = transactions?.filter(t => {
        const transactionDate = new Date(t.date)
        return transactionDate.getMonth() + 1 === month && 
               transactionDate.getFullYear() === year
      }) || []
  
      const monthIncome = monthTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + Number(t.amount), 0)
  
      const monthExpense = monthTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + Number(t.amount), 0)
  
      chartData.push({
        month: date.toLocaleDateString('pt-BR', { month: 'short' }),
        income: monthIncome,
        expense: monthExpense
      })
    }

    // Recent transactions (últimas 5 pelo campo data)
    const recentTransactions = (transactions || [])
      .slice()
      .sort((a, b) => +new Date(b.created_at ?? b.date) - +new Date(a.created_at ?? a.date))
      .slice(0, 5)

    // Anexar nome do membro (quando houver)
    let recentTransactionsWithMember = recentTransactions
    const memberIds = recentTransactions.filter((t: any) => !!t.member_id).map((t: any) => t.member_id)
    if (memberIds.length > 0) {
      const { data: members } = await supabase
        .from('members')
        .select('id, name')
        .eq('church_id', churchId)
        .in('id', memberIds)
      const membersMap: Record<string, string> = Object.fromEntries((members || []).map((m: any) => [m.id, m.name]))
      recentTransactionsWithMember = recentTransactions.map((t: any) => ({
        ...t,
        member_name: t.member_id ? membersMap[t.member_id] ?? null : null,
      }))
    }

    return {
      currentIncome,
      currentExpense,
      currentBalance,
      incomeTrend,
      expenseTrend,
      balanceTrend,
      membersCount: membersCount || 0,
      chartData,
      recentTransactions: recentTransactionsWithMember,
    }
  } catch (err) {
    // Fallback demo em caso de erro de rede/Supabase
    const demoIncome = 8500
    const demoExpense = 3200
    const demoBalance = 15750.5
    const demoMembers = 125
    const demoChartData = [
      { month: 'mai', income: 7000, expense: 3000 },
      { month: 'jun', income: 8200, expense: 2800 },
      { month: 'jul', income: 7900, expense: 3100 },
      { month: 'ago', income: 8600, expense: 2900 },
      { month: 'set', income: 9000, expense: 3200 },
      { month: 'out', income: 8500, expense: 3000 },
    ]
    const demoRecent = [
      { date: '2024-10-02', description: 'Oferta especial', category: 'Oferta', type: 'income', amount: 500 },
      { date: '2024-10-05', description: 'Compra de material', category: 'Manutenção', type: 'expense', amount: 120 },
    ]
    return {
      currentIncome: demoIncome,
      currentExpense: demoExpense,
      currentBalance: demoBalance,
      incomeTrend: 12,
      expenseTrend: -5,
      balanceTrend: 8,
      membersCount: demoMembers,
      chartData: demoChartData,
      recentTransactions: demoRecent,
      yearBalance: demoBalance,
    }
  }
}

export default async function DashboardPage({ searchParams }: { searchParams?: { [key: string]: string } }) {
  const userData = await getUserWithChurch()
  
  if (!userData) {
    return <div>Carregando...</div>
  }

  const dashboardData = await getDashboardData(userData.church_id)

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const isLowBalance = dashboardData.currentBalance < 1000
  const saved = searchParams?.saved || searchParams?.demo_saved
  const errorCode = searchParams?.error
  const filterType = searchParams?.filter
  const errorMessages: Record<string, string> = {
    transaction: 'Erro ao salvar a transação.',
    server: 'Erro inesperado ao criar transação.',
  }

  const recent = dashboardData.recentTransactions || []
  const filteredRecent = filterType === 'income'
    ? recent.filter((t: any) => t.type === 'income')
    : filterType === 'expense'
      ? recent.filter((t: any) => t.type === 'expense')
      : recent
  const countIncome = recent.filter((t: any) => t.type === 'income').length
  const countExpense = recent.filter((t: any) => t.type === 'expense').length

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">
          Visão geral das finanças de {userData.churches?.name}
        </p>
      </div>

      {/* Success/Error Messages */}
      {saved && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <p className="font-medium text-green-800">Transação salva com sucesso.</p>
          </CardContent>
        </Card>
      )}

      {errorCode && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <p className="font-medium text-red-800">{errorMessages[errorCode] || 'Ocorreu um erro ao salvar.'}</p>
          </CardContent>
        </Card>
      )}

      {/* Alert for low balance */}
      {isLowBalance && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="flex items-center gap-3 p-4">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            <div>
              <p className="font-medium text-orange-800">Atenção: Saldo baixo</p>
              <p className="text-sm text-orange-700">
                O saldo atual está abaixo de R$ 1.000,00. Considere revisar as finanças.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Entradas do Mês"
          value={formatCurrency(dashboardData.currentIncome)}
          icon={TrendingUp}
          trend={{
            value: Math.round(dashboardData.incomeTrend),
            isPositive: dashboardData.incomeTrend >= 0
          }}
        />
        
        <StatsCard
          title="Saídas do Mês"
          value={formatCurrency(dashboardData.currentExpense)}
          icon={TrendingDown}
          trend={{
            value: Math.round(dashboardData.expenseTrend),
            isPositive: dashboardData.expenseTrend <= 0
          }}
        />
        
        <StatsCard
          title="Saldo Atual"
          value={formatCurrency(dashboardData.currentBalance)}
          icon={Wallet}
          trend={{
            value: Math.round(dashboardData.balanceTrend),
            isPositive: dashboardData.balanceTrend >= 0
          }}
          className={isLowBalance ? 'border-orange-200' : ''}
        />
        
        <StatsCard
          title="Membros Ativos"
          value={dashboardData.membersCount.toString()}
          icon={Users}
        />
      </div>
      <div className="text-sm text-gray-600">Acumulado no ano: {formatCurrency(dashboardData.yearBalance)}</div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FinancialChart data={dashboardData.chartData} type="line" />
        <FinancialChart data={dashboardData.chartData} type="bar" />
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Transações Recentes</CardTitle>
            <CardDescription>
              Últimas movimentações financeiras
            </CardDescription>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/dashboard/quick-entry" className="text-sm text-primary hover:underline">
              Novo lançamento
            </Link>
            <Link href="/dashboard/transactions" className="text-sm text-primary hover:underline">
              Ver todas
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filtro rápido */}
          <div className="flex items-center gap-2 mb-3">
            <Link href="/dashboard" className={`inline-flex items-center rounded-md px-3 py-1 text-xs font-medium ring-1 ring-inset ${!filterType ? 'bg-primary/10 text-primary ring-primary/30' : 'text-gray-700 ring-gray-300 hover:bg-gray-50'}`}>
              Todos
            </Link>
            <Link href="/dashboard?filter=income" className={`inline-flex items-center rounded-md px-3 py-1 text-xs font-medium ring-1 ring-inset ${filterType === 'income' ? 'bg-green-100 text-green-700 ring-green-600/20' : 'text-gray-700 ring-gray-300 hover:bg-gray-50'}`}>
              Entradas ({countIncome})
            </Link>
            <Link href="/dashboard?filter=expense" className={`inline-flex items-center rounded-md px-3 py-1 text-xs font-medium ring-1 ring-inset ${filterType === 'expense' ? 'bg-red-100 text-red-700 ring-red-600/20' : 'text-gray-700 ring-gray-300 hover:bg-gray-50'}`}>
              Saídas ({countExpense})
            </Link>
          </div>

          {filteredRecent && filteredRecent.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Descrição</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Categoria</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Membro</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Valor</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredRecent.map((t: any, idx: number) => (
                    <tr key={idx}>
                      <td className="px-4 py-2 whitespace-nowrap">{new Date(t.date).toLocaleDateString('pt-BR')}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{t.description}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{t.category}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{t.member_name ? <Link href="/dashboard/members" className="text-primary hover:underline">{t.member_name}</Link> : '-'}</td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${t.type === 'income' ? 'bg-green-50 text-green-700 ring-green-600/20' : 'bg-red-50 text-red-700 ring-red-600/20'}`}>
                          {t.type === 'income' ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                          {t.type === 'income' ? 'Entrada' : 'Saída'}
                        </span>
                      </td>
                      <td className={`px-4 py-2 whitespace-nowrap ${t.type === 'income' ? 'text-green-700' : 'text-red-700'}`}>
                        {t.type === 'income' ? '+' : '-'} {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(t.amount))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma transação encontrada</p>
              <p className="text-sm">As transações aparecerão aqui quando forem cadastradas</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}