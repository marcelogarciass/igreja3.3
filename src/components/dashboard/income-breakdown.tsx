'use client'

import { useState, useMemo, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { TransactionTable, Transaction } from '@/components/transactions/transaction-table'
import { useReactToPrint } from 'react-to-print'
import { Printer, Gift, Globe, HelpingHand } from 'lucide-react'
import { PrintableReport } from '@/components/transactions/printable-report'

interface IncomeBreakdownProps {
  transactions: Transaction[] // Current month transactions
}

export function IncomeBreakdown({ transactions }: IncomeBreakdownProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  
  const categories = useMemo(() => {
    // Helper to sum amount
    const sum = (txs: Transaction[]) => txs.reduce((acc, t) => acc + Number(t.amount), 0)
    
    // Filter by type 'income' first, just in case
    const incomeTxs = transactions.filter(t => t.type === 'income')

    const dizimoTxs = incomeTxs.filter(t => t.category === 'Dizimo')
    const ofertaTxs = incomeTxs.filter(t => t.category === 'Oferta')
    const missoesTxs = incomeTxs.filter(t => t.category === 'Oferta missionaria')

    return {
      Dizimo: {
        total: sum(dizimoTxs),
        transactions: dizimoTxs,
        label: 'Dízimos',
        icon: HelpingHand,
        color: 'text-blue-600',
        bgColor: 'bg-blue-100'
      },
      Oferta: {
        total: sum(ofertaTxs),
        transactions: ofertaTxs,
        label: 'Ofertas',
        icon: Gift,
        color: 'text-green-600',
        bgColor: 'bg-green-100'
      },
      'Oferta missionaria': {
        total: sum(missoesTxs),
        transactions: missoesTxs,
        label: 'Ofertas Missionárias',
        icon: Globe,
        color: 'text-purple-600',
        bgColor: 'bg-purple-100'
      }
    }
  }, [transactions])

  const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

  // Print logic
  const componentRef = useRef<HTMLDivElement>(null)
  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `Relatorio-${selectedCategory || 'Geral'}-${new Date().toISOString().split('T')[0]}`,
  })

  const currentCategoryData = selectedCategory ? categories[selectedCategory as keyof typeof categories] : null

  const modalTotals = useMemo(() => {
    if (!currentCategoryData) return { income: 0, expense: 0, balance: 0 }
    return {
      income: currentCategoryData.total,
      expense: 0,
      balance: currentCategoryData.total
    }
  }, [currentCategoryData])

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900">Detalhamento de Entradas</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {(Object.keys(categories) as Array<keyof typeof categories>).map((key) => {
          const cat = categories[key]
          const Icon = cat.icon
          return (
            <Card 
              key={key} 
              className="cursor-pointer hover:shadow-md transition-shadow border-l-4"
              style={{ borderLeftColor: key === 'Dizimo' ? '#2563eb' : key === 'Oferta' ? '#16a34a' : '#9333ea' }}
              onClick={() => setSelectedCategory(key)}
            >
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">{cat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{currency.format(cat.total)}</p>
                </div>
                <div className={`p-3 rounded-full ${cat.bgColor}`}>
                  <Icon className={`h-6 w-6 ${cat.color}`} />
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Dialog open={!!selectedCategory} onOpenChange={(open) => !open && setSelectedCategory(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Relatório de {currentCategoryData?.label}</span>
              <Button onClick={() => handlePrint()} variant="outline" size="sm" className="gap-2">
                <Printer className="h-4 w-4" />
                Imprimir Relatório
              </Button>
            </DialogTitle>
          </DialogHeader>

          {currentCategoryData && (
            <div className="mt-4">
              <TransactionTable transactions={currentCategoryData.transactions} />
              
              {/* Hidden Print Component */}
              <div style={{ height: 0, overflow: 'hidden' }}>
                <PrintableReport 
                  ref={componentRef}
                  transactions={currentCategoryData.transactions}
                  period={`Mês Atual - ${currentCategoryData.label}`}
                  totals={modalTotals}
                />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
