import { getUserWithChurch, createServerSupabaseClient } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { QuickEntryForm } from './quick-entry-form'

export default async function QuickEntryPage() {
  const userData = await getUserWithChurch()
  if (!userData) {
    redirect('/login')
  }

  const supabase = await createServerSupabaseClient()
  const { data: members } = await supabase
    .from('members')
    .select('id, name')
    .eq('church_id', userData.church_id)
    .eq('status', 'active')
    .order('name')

  return <QuickEntryForm members={members || []} />
}
