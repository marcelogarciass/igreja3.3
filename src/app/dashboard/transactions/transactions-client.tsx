'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowDownCircle, ArrowUpCircle, Printer, Search, X, Plus } from 'lucide-react'
import { useReactToPrint } from 'react-to-print'
import { Transaction, TransactionTable } from '@/components/transactions/transaction-table'
import { PrintableReport } from '@/components/transactions/printable-report'
import { EditTransactionDialog } from '@/components/transactions/edit-transaction-dialog'
import { DeleteTransactionDialog } from '@/components/transactions/delete-transaction-dialog'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface TransactionsClientProps {
  initialTransactions: Transaction[]
  members: { id: string; name: string }[]
}

export function TransactionsClient({ initialTransactions, members }: TransactionsClientProps) {
  const router = useRouter()
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions)
  
  // Update state if props change (revalidation from server)
  useEffect(() => {
    setTransactions(initialTransactions)
  }, [initialTransactions])

  const [filterState, setFilterState] = useState({
    type: 'all' as 'all' | 'income' | 'expense',
    startDate: '',
    endDate: '',
    search: ''
  })

  // Dialog States
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  
  // Feedback State
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const componentRef = useRef<HTMLDivElement>(null)

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: 'Relatorio_Financeiro_Nexus',
  })

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
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
  }, [transactions, filterState])

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

  // Handlers for Actions
  const onEdit = (transaction: Transaction) => {
    setSelectedTransaction(transaction)
    setIsEditOpen(true)
  }

  const onDelete = (transaction: Transaction) => {
    setSelectedTransaction(transaction)
    setIsDeleteOpen(true)
  }

  const onEditSuccess = (updatedTransaction: Transaction) => {
    // Optimistic Update
    setTransactions(prev => prev.map(t => t.id === updatedTransaction.id ? updatedTransaction : t))
    setSuccessMessage('Transação atualizada com sucesso!')
    // Clear success message after 3 seconds
    setTimeout(() => setSuccessMessage(null), 3000)
    // Ensure server sync
    router.refresh()
  }

  const onDeleteSuccess = (deletedId: string) => {
    // Optimistic Update
    setTransactions(prev => prev.filter(t => t.id !== deletedId))
    setSuccessMessage('Transação excluída com sucesso!')
    // Clear success message after 3 seconds
    setTimeout(() => setSuccessMessage(null), 3000)
    // Ensure server sync
    router.refresh()
  }

  return (
    <div className="space-y-6 relative">
      {/* Success Toast */}
      {successMessage && (
        <div className="fixed bottom-4 right-4 z-50 bg-green-600 text-white px-4 py-3 rounded shadow-lg flex items-center gap-2 animate-in slide-in-from-bottom-5">
          <span>✅ {successMessage}</span>
          <button onClick={() => setSuccessMessage(null)} className="ml-2 hover:bg-green-700 rounded p-1">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

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
          <TransactionTable 
            transactions={filteredTransactions} 
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </CardContent>
      </Card>

      {/* Hidden Print Component */}
      <div style={{ height: 0, overflow: 'hidden' }}>
        <PrintableReport 
          ref={componentRef} 
          transactions={filteredTransactions} 
          period={getPeriodLabel()}
          totals={totals}
        />
      </div>

      {/* Modals */}
      <EditTransactionDialog 
        transaction={selectedTransaction}
        isOpen={isEditOpen}
        onOpenChange={setIsEditOpen}
        onSuccess={onEditSuccess}
        members={members}
      />

      <DeleteTransactionDialog 
        transaction={selectedTransaction}
        isOpen={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        onSuccess={onDeleteSuccess}
      />
    </div>
  )
}
