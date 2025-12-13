'use client'

import React from 'react'
import { Transaction, TransactionTable } from './transaction-table'

interface PrintableReportProps {
  transactions: Transaction[]
  period: string
  totals: {
    income: number
    expense: number
    balance: number
  }
}

export const PrintableReport = React.forwardRef<HTMLDivElement, PrintableReportProps>(
  ({ transactions, period, totals }, ref) => {
    const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

    return (
      <div ref={ref} className="p-8 bg-white text-black print:p-0">
        {/* Header */}
        <div className="mb-8 border-b pb-4">
          <div className="flex items-center gap-4 mb-2">
            {/* Placeholder Logo */}
            <div className="h-12 w-12 bg-gray-200 rounded-full flex items-center justify-center">
              <span className="text-xl font-bold text-gray-600">N</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold uppercase tracking-wide">Nexus Igreja</h1>
              <p className="text-sm text-gray-500">Relatório Financeiro</p>
            </div>
          </div>
          <div className="flex justify-between items-end mt-4">
            <h2 className="text-lg font-semibold">{period}</h2>
            <p className="text-sm text-gray-500">Gerado em: {new Date().toLocaleDateString('pt-BR')}</p>
          </div>
        </div>

        {/* Table */}
        <div className="mb-8">
          <TransactionTable transactions={transactions} isPrintMode={true} />
        </div>

        {/* Footer / Totals */}
        <div className="border-t pt-4">
          <div className="flex justify-end">
            <div className="w-64 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Total Entradas:</span>
                <span className="font-medium">{currency.format(totals.income)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Total Saídas:</span>
                <span className="font-medium">{currency.format(totals.expense)}</span>
              </div>
              <div className="flex justify-between text-base font-bold border-t border-gray-300 pt-2 mt-2">
                <span>Saldo do Período:</span>
                <span>{currency.format(totals.balance)}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Page Footer */}
        <div className="fixed bottom-4 left-0 w-full text-center text-xs text-gray-400 print:block hidden">
          Nexus Igreja - Sistema de Gestão
        </div>
      </div>
    )
  }
)

PrintableReport.displayName = 'PrintableReport'
