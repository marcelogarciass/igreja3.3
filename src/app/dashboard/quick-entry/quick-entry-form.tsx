'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Rocket, Plus, Trash2, Loader2, Save } from 'lucide-react'
import { TRANSACTION_CATEGORIES } from '@/lib/constants/transaction-categories'
import { createTransaction } from '@/app/actions/transaction-actions'
import { useRouter } from 'next/navigation'

interface Member {
  id: string
  name: string
}

interface QuickEntryFormProps {
  members: Member[]
}

export function QuickEntryForm({ members }: QuickEntryFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  
  // Header Fields
  const [type, setType] = useState('income')
  const [memberId, setMemberId] = useState<string>('')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [description, setDescription] = useState('')

  // Dynamic Items
  const [items, setItems] = useState([{ id: '1', category: '', amount: '' }])

  const addItem = () => {
    setItems([...items, { id: crypto.randomUUID(), category: '', amount: '' }])
  }

  const removeItem = (id: string) => {
    if (items.length === 1) return
    setItems(items.filter(item => item.id !== id))
  }

  const updateItem = (id: string, field: 'category' | 'amount', value: string) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ))
  }

  const total = items.reduce((acc, item) => acc + (Number(item.amount) || 0), 0)
  const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Basic Validation
    if (!date) return alert('Selecione uma data')
    if (items.some(i => !i.category || !i.amount)) return alert('Preencha todos os campos dos itens')

    setIsLoading(true)

    try {
      const promises = items.map(item => createTransaction({
        type,
        category: item.category,
        amount: Number(item.amount),
        date,
        description,
        member_id: memberId || null
      }))

      const results = await Promise.all(promises)
      
      const errors = results.filter(r => !r.success)
      if (errors.length > 0) {
        alert(`Erro ao salvar ${errors.length} itens. Verifique os dados.`)
      } else {
        router.push('/dashboard?saved=1')
        router.refresh()
      }
    } catch (error) {
      console.error('Error submitting:', error)
      alert('Erro inesperado ao salvar transações.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Rocket className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Lançamento Rápido</h1>
          <p className="text-gray-600">Adicione múltiplas transações de forma simples</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Novo Lançamento</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Top Fixed Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg border">
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
                <label className="text-sm font-medium">Membro (Opcional)</label>
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

              <div className="space-y-2">
                <label className="text-sm font-medium">Data</label>
                <Input 
                  type="date" 
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required 
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Descrição Geral</label>
                <Input 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detalhes da transação" 
                />
              </div>
            </div>

            {/* Dynamic Items List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Itens</h3>
                <Button type="button" onClick={addItem} variant="outline" size="sm" className="gap-2">
                  <Plus className="h-4 w-4" /> Adicionar Item
                </Button>
              </div>

              <div className="space-y-3">
                {items.map((item, index) => (
                  <div key={item.id} className="flex flex-col sm:flex-row gap-3 items-end bg-white p-3 rounded-md border shadow-sm animate-in fade-in slide-in-from-top-2">
                    <div className="w-full sm:flex-1 space-y-2">
                      <label className="text-xs font-medium text-gray-500">Categoria</label>
                      <select 
                        value={item.category}
                        onChange={(e) => updateItem(item.id, 'category', e.target.value)}
                        required
                        className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      >
                        <option value="" disabled>Selecione...</option>
                        {TRANSACTION_CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>

                    <div className="w-full sm:w-48 space-y-2">
                      <label className="text-xs font-medium text-gray-500">Valor</label>
                      <Input 
                        type="number" 
                        step="0.01" 
                        value={item.amount}
                        onChange={(e) => updateItem(item.id, 'amount', e.target.value)}
                        required
                        placeholder="0,00"
                      />
                    </div>

                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon"
                      onClick={() => removeItem(item.id)}
                      disabled={items.length === 1}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer / Total */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t">
              <div className="text-xl font-bold text-gray-900">
                Total Total: <span className="text-blue-600">{currency.format(total)}</span>
              </div>
              
              <Button type="submit" disabled={isLoading} className="w-full sm:w-auto min-w-[150px] gap-2">
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Salvar Todos
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
