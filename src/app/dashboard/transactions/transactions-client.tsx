'use client'

import { useState, useMemo, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowDownCircle, ArrowUpCircle, Printer, Search, X } from 'lucide-react'
import { useReactToPrint } from 'react-to-print'
import { Transaction, TransactionTable } from '@/components/transactions/transaction-table'
import { PrintableReport } from '@/components/transactions/printable-report'
import Link from 'next/link'
import { Plus } from 'lucide-react'

interface TransactionsClientProps {
  initialTransactions: Transaction[]
}

export function TransactionsClient({ initialTransactions }: TransactionsClientProps) {
  const [filterState, setFilterState] = useState({
    type: 'all' as 'all' | 'income' | 'expense',
    startDate: '',
    endDate: '',
    search: ''
  })

  const componentRef = useRef<HTMLDivElement>(null)

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: 'Relatorio_Financeiro_Nexus',
  })

  const filteredTransactions = useMemo(() => {
    return initialTransactions.filter(t => {
      // Type Filter
      if (filterState.type !== 'all' && t.type !== filterState.type) return false

      // Search Filter
      if (filterState.search) {
        const searchLower = filterState.search.toLowerCase()
        const matchDescription = t.description.toLowerCase().includes(searchLower)
        const matchCategory = t.category.toLowerCase().includes(searchLower)
        const matchMember = t.members?.name?.toLowerCase().includes(searchLower)
        if (!matchDescription && !matchCategory && !matchMember) return false
      }

      // Date Filter
      if (filterState.startDate) {
        if (t.date < filterState.startDate) return false
      }
      if (filterState.endDate) {
        if (t.date > filterState.endDate) return false
      }

      return true
    })
  }, [initialTransactions, filterState])

  const totals = useMemo(() => {
    const income = filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((acc, t) => acc + Number(t.amount), 0)
    
    const expense = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => acc + Number(t.amount), 0)

    return {
      income,
      expense,
      balance: income - expense
    }
  }, [filteredTransactions])

  const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

  const handleTypeToggle = (type: 'income' | 'expense') => {
    setFilterState(prev => ({
      ...prev,
      type: prev.type === type ? 'all' : type
    }))
  }

  const getPeriodLabel = () => {
    if (filterState.startDate && filterState.endDate) {
      return `Extrato de ${new Date(filterState.startDate).toLocaleDateString('pt-BR')} a ${new Date(filterState.endDate).toLocaleDateString('pt-BR')}`
    } else if (filterState.startDate) {
      return `Extrato a partir de ${new Date(filterState.startDate).toLocaleDateString('pt-BR')}`
    } else if (filterState.endDate) {
      return `Extrato até ${new Date(filterState.endDate).toLocaleDateString('pt-BR')}`
    }
    return 'Extrato Geral'
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards / Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card 
          className={`cursor-pointer transition-all hover:shadow-md border-2 ${filterState.type === 'income' ? 'border-green-500 bg-green-50' : 'border-transparent'}`}
          onClick={() => handleTypeToggle('income')}
        >
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-green-700 text-sm font-medium">
              <ArrowUpCircle className="h-4 w-4" /> Entradas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-700">{currency.format(totals.income)}</p>
            {filterState.type === 'income' && <p className="text-xs text-green-600 mt-1">Filtro Ativo</p>}
          </CardContent>
        </Card>

        <Card 
          className={`cursor-pointer transition-all hover:shadow-md border-2 ${filterState.type === 'expense' ? 'border-red-500 bg-red-50' : 'border-transparent'}`}
          onClick={() => handleTypeToggle('expense')}
        >
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-red-700 text-sm font-medium">
              <ArrowDownCircle className="h-4 w-4" /> Saídas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-700">{currency.format(totals.expense)}</p>
            {filterState.type === 'expense' && <p className="text-xs text-red-600 mt-1">Filtro Ativo</p>}
          </CardContent>
        </Card>
      </div>

      {/* Main Content Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle>Transações</CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => handlePrint()} className="gap-2">
                <Printer className="h-4 w-4" />
                Imprimir Relatório
              </Button>
              <Link href="/dashboard/quick-entry" prefetch={false}>
                <Button size="sm" className="gap-2">
                  <Plus className="h-4 w-4" /> Nova
                </Button>
              </Link>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters Bar */}
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input 
                placeholder="Buscar descrição, categoria ou membro..." 
                className="pl-9"
                value={filterState.search}
                onChange={(e) => setFilterState(prev => ({ ...prev, search: e.target.value }))}
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500 whitespace-nowrap">De:</span>
                <Input 
                  type="date" 
                  className="w-full sm:w-auto"
                  value={filterState.startDate}
                  onChange={(e) => setFilterState(prev => ({ ...prev, startDate: e.target.value }))}
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500 whitespace-nowrap">Até:</span>
                <Input 
                  type="date" 
                  className="w-full sm:w-auto"
                  value={filterState.endDate}
                  onChange={(e) => setFilterState(prev => ({ ...prev, endDate: e.target.value }))}
                />
              </div>
              {(filterState.startDate || filterState.endDate || filterState.search || filterState.type !== 'all') && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setFilterState({ type: 'all', startDate: '', endDate: '', search: '' })}
                  title="Limpar filtros"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Table */}
          <TransactionTable transactions={filteredTransactions} />
        </CardContent>
      </Card>

      {/* Hidden Print Component - using height 0 to avoid display:none issues with react-to-print */}
      <div style={{ height: 0, overflow: 'hidden' }}>
        <PrintableReport 
          ref={componentRef} 
          transactions={filteredTransactions} 
          period={getPeriodLabel()}
          totals={totals}
        />
      </div>
    </div>
  )
}
