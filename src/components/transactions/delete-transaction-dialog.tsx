'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Transaction } from './transaction-table'
import { deleteTransaction } from '@/app/actions/transaction-actions'

interface DeleteTransactionDialogProps {
  transaction: Transaction | null
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: (deletedTransactionId: string) => void
}

export function DeleteTransactionDialog({ 
  transaction, 
  isOpen, 
  onOpenChange, 
  onSuccess
}: DeleteTransactionDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDelete = async () => {
    if (!transaction) return

    setIsLoading(true)
    setError(null)

    const result = await deleteTransaction(transaction.id)

    setIsLoading(false)

    if (result.success) {
      onSuccess(transaction.id)
      onOpenChange(false)
    } else {
      setError(result.message || 'Erro ao excluir transação')
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Excluir Transação</DialogTitle>
          <DialogDescription>
            Tem certeza que deseja excluir esta transação? Esta ação não pode ser desfeita.
          </DialogDescription>
        </DialogHeader>
        
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm mb-4">
            {error}
          </div>
        )}

        {transaction && (
          <div className="py-4">
            <p className="text-sm text-gray-700">
              <strong>Descrição:</strong> {transaction.description}
            </p>
            <p className="text-sm text-gray-700">
              <strong>Valor:</strong> {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(transaction.amount)}
            </p>
          </div>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button type="button" variant="destructive" onClick={handleDelete} disabled={isLoading}>
            {isLoading ? 'Excluindo...' : 'Excluir'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
