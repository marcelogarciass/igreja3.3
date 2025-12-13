'use client'

import { ArrowDownCircle, ArrowUpCircle } from 'lucide-react'

export type Transaction = {
  id: string
  date: string
  description: string
  category: string
  type: 'income' | 'expense'
  amount: number
  members?: { name: string } | null
}

interface TransactionTableProps {
  transactions: Transaction[]
  isPrintMode?: boolean
}

export function TransactionTable({ transactions, isPrintMode = false }: TransactionTableProps) {
  const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

  if (transactions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>Nenhuma transação encontrada.</p>
      </div>
    )
  }

  return (
    <div className={isPrintMode ? "" : "overflow-x-auto"}>
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase">Data</th>
            <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase">Descrição</th>
            <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase">Membro</th>
            <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase">Categoria</th>
            <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase">Tipo</th>
            <th className="px-4 py-2 text-right font-medium text-gray-500 uppercase">Valor</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {transactions.map((t) => (
            <tr key={t.id} className={isPrintMode ? "break-inside-avoid" : ""}>
              <td className="px-4 py-2 whitespace-nowrap">{new Date(t.date).toLocaleDateString('pt-BR')}</td>
              <td className="px-4 py-2 whitespace-nowrap">{t.description}</td>
              <td className="px-4 py-2 whitespace-nowrap">{t.members?.name || '-'}</td>
              <td className="px-4 py-2 whitespace-nowrap">{t.category}</td>
              <td className="px-4 py-2 whitespace-nowrap">
                <span className={`inline-flex items-center gap-1 ${
                  isPrintMode 
                    ? 'text-black' 
                    : t.type === 'income' ? 'text-green-700' : 'text-red-700'
                }`}>
                  {!isPrintMode && (
                    t.type === 'income' ? <ArrowUpCircle className="h-3 w-3" /> : <ArrowDownCircle className="h-3 w-3" />
                  )}
                  {t.type === 'income' ? 'Entrada' : 'Saída'}
                </span>
              </td>
              <td className={`px-4 py-2 whitespace-nowrap text-right ${
                !isPrintMode && (t.type === 'income' ? 'text-green-700 font-medium' : 'text-red-700 font-medium')
              }`}>
                {currency.format(Number(t.amount))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
