'use client'

import { ArrowDownCircle, ArrowUpCircle, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export type Transaction = {
  id: string
  date: string
  created_at?: string
  description: string
  category: string
  type: 'income' | 'expense'
  amount: number
  members?: { name: string } | null
  member_id?: string | null
}

interface TransactionTableProps {
  transactions: Transaction[]
  isPrintMode?: boolean
  onEdit?: (transaction: Transaction) => void
  onDelete?: (transaction: Transaction) => void
}

export function TransactionTable({ 
  transactions, 
  isPrintMode = false,
  onEdit,
  onDelete
}: TransactionTableProps) {
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
            {!isPrintMode && <th className="px-4 py-2 text-right font-medium text-gray-500 uppercase">Ações</th>}
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
              {!isPrintMode && (
                <td className="px-4 py-2 whitespace-nowrap text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Abrir menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Ações</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => onEdit?.(t)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => onDelete?.(t)} className="text-red-600">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
