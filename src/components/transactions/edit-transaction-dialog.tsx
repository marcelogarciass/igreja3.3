'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Transaction } from './transaction-table'
import { TRANSACTION_CATEGORIES } from '@/lib/constants/transaction-categories'
import { updateTransaction } from '@/app/actions/transaction-actions'

interface EditTransactionDialogProps {
  transaction: Transaction | null
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: (updatedTransaction: Transaction) => void
  members: { id: string; name: string }[]
}

export function EditTransactionDialog({ 
  transaction, 
  isOpen, 
  onOpenChange, 
  onSuccess,
  members 
}: EditTransactionDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form states
  const [type, setType] = useState('income')
  const [category, setCategory] = useState('')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState('')
  const [description, setDescription] = useState('')
  const [memberId, setMemberId] = useState('')

  useEffect(() => {
    if (transaction) {
      setType(transaction.type)
      setCategory(transaction.category)
      setAmount(transaction.amount.toString())
      // Format date to YYYY-MM-DD for input[type=date]
      // Assuming transaction.date is ISO string or similar
      const d = new Date(transaction.date)
      const formattedDate = d.toISOString().split('T')[0]
      setDate(formattedDate)
      setDescription(transaction.description)
      // Check if transaction has member info. 
      // The transaction object from getTransactions has members: { name: string } | null.
      // It DOES NOT have member_id directly in the type definition in transaction-table.tsx?
      // Wait, getTransactions selects *, so member_id should be there, but the Type might need update.
      // I will update the type in transaction-table.tsx later.
      // For now, I'll assume member_id is present in the object even if not in type (TS might complain).
      // I'll cast it or fix the type.
      setMemberId((transaction as any).member_id || '')
    }
  }, [transaction])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!transaction) return

    setIsLoading(true)
    setError(null)

    const formData = new FormData()
    formData.append('type', type)
    formData.append('category', category)
    formData.append('amount', amount)
    formData.append('date', date)
    formData.append('description', description)
    formData.append('member_id', memberId)

    const result = await updateTransaction(transaction.id, formData)

    setIsLoading(false)

    if (result.success) {
      // Construct the updated transaction object for optimistic/client update
      // We need to find the member name if memberId changed
      const memberName = members.find(m => m.id === memberId)?.name || undefined
      const updatedMember = memberId ? { name: memberName! } : null

      const updatedTransaction: Transaction = {
        ...transaction,
        type: type as 'income' | 'expense',
        category,
        amount: Number(amount),
        date,
        description,
        members: updatedMember,
        // We also need to ensure member_id is updated for future edits
        // @ts-ignore
        member_id: memberId || null
      }
      
      onSuccess(updatedTransaction)
      onOpenChange(false)
    } else {
      setError(result.message || 'Erro ao atualizar transação')
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Editar Transação</DialogTitle>
        </DialogHeader>
        
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo</label>
              <select 
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="income">Entrada</option>
                <option value="expense">Saída</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Categoria</label>
              <select 
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                {TRANSACTION_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Membro</label>
            <select 
              value={memberId}
              onChange={(e) => setMemberId(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="">Selecione um membro...</option>
              {members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Valor</label>
              <Input 
                type="number" 
                step="0.01" 
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Data</label>
              <Input 
                type="date" 
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required 
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Descrição</label>
            <Input 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detalhes da transação"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
