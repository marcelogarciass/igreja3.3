'use server'

import { createServerSupabaseClient, getUserWithChurch } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { TRANSACTION_CATEGORIES } from '@/lib/constants/transaction-categories'

export async function updateTransaction(id: string, formData: FormData) {
  const userData = await getUserWithChurch()
  if (!userData) {
    return { success: false, message: 'Usuário não autenticado' }
  }

  const type = (formData.get('type') as string)
  const category = (formData.get('category') as string)
  const amount = Number(formData.get('amount') || 0)
  const date = (formData.get('date') as string)
  const description = (formData.get('description') as string)
  const member_id = (formData.get('member_id') as string) || null

  // Validation
  if (amount === 0) {
    return { success: false, message: 'O valor não pode ser zero.' }
  }
  if (!date) {
    return { success: false, message: 'Data inválida.' }
  }
  if (!TRANSACTION_CATEGORIES.includes(category as any)) {
    return { success: false, message: 'Categoria inválida.' }
  }

  const supabase = await createServerSupabaseClient()
  
  // Verify ownership before update (RLS handles this usually, but good to be safe/explicit if needed, 
  // though simple update with church_id filter in RLS is enough. We'll rely on RLS + church_id check implicitly via policy)
  // But let's add the church_id to the update query to be safe or just trust RLS.
  // Actually, RLS policies for 'update' should enforce church_id.

  const { error } = await supabase
    .from('transactions')
    .update({
      type,
      category,
      amount,
      date,
      description,
      member_id,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .eq('church_id', userData.church_id) // Extra safety

  if (error) {
    console.error('Erro ao atualizar transação:', error)
    return { success: false, message: 'Erro ao atualizar transação.' }
  }

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/transactions')
  
  return { success: true, message: 'Transação atualizada com sucesso!' }
}

export async function deleteTransaction(id: string) {
  const userData = await getUserWithChurch()
  if (!userData) {
    return { success: false, message: 'Usuário não autenticado' }
  }

  const supabase = await createServerSupabaseClient()

  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', id)
    .eq('church_id', userData.church_id)

  if (error) {
    console.error('Erro ao excluir transação:', error)
    return { success: false, message: 'Erro ao excluir transação.' }
  }

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/transactions')

  return { success: true, message: 'Transação excluída com sucesso!' }
}

export async function createTransaction(data: {
  type: string
  category: string
  amount: number
  date: string
  description: string
  member_id: string | null
}) {
  const userData = await getUserWithChurch()
  if (!userData) {
    return { success: false, message: 'Usuário não autenticado' }
  }

  // Validation
  if (data.amount === 0) {
    return { success: false, message: 'O valor não pode ser zero.' }
  }
  if (!data.date) {
    return { success: false, message: 'Data inválida.' }
  }
  if (!TRANSACTION_CATEGORIES.includes(data.category as any)) {
    return { success: false, message: 'Categoria inválida.' }
  }

  const supabase = await createServerSupabaseClient()

  const { error } = await supabase.from('transactions').insert({
    church_id: userData.church_id,
    type: data.type,
    category: data.category,
    amount: data.amount,
    date: data.date,
    description: data.description,
    member_id: data.member_id || null
  })

  if (error) {
    console.error('Erro ao criar transação:', error)
    return { success: false, message: 'Erro ao criar transação.' }
  }

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/transactions')

  return { success: true, message: 'Transação criada com sucesso!' }
}
