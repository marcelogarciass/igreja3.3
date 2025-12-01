import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export async function isDemoSession() {
  const c = await cookies()
  return c.get('demo_session')?.value === '1'
}

export async function createServerSupabaseClient() {
  if (await isDemoSession()) {
    // Em modo demo, evitamos chamadas ao Supabase
    return null as unknown as ReturnType<typeof createClient>
  }
  const cookieStore = await cookies()
  return createClient(cookieStore)
}

export async function getUser() {
  // Fallback demo
  if (await isDemoSession()) {
    return {
      id: '550e8400-e29b-41d4-a716-446655440001',
      email: 'admin@demo.com',
    }
  }

  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const { data, error } = await supabase.auth.getUser()

  if (error) {
    console.error('Error getting user:', error)
    return null
  }

  return data.user
}

export async function getUserWithChurch() {
  // Fallback demo
  if (await isDemoSession()) {
    return {
      id: '550e8400-e29b-41d4-a716-446655440001',
      church_id: '550e8400-e29b-41d4-a716-446655440000',
      email: 'admin@demo.com',
      name: 'Administrador Demo',
      role: 'admin',
      churches: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'Igreja Demonstração',
        address: 'Rua Exemplo, 123 - Centro',
        phone: '(11) 99999-9999',
        email: 'contato@igrejaDemo.com',
        primary_color: '#3B82F6',
        secondary_color: '#10B981',
      },
    }
  }

  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const { data: authData, error: userError } = await supabase.auth.getUser()

  if (userError || !authData.user) {
    return null
  }

  const { data: userWithChurch, error: churchError } = await supabase
    .from('users')
    .select(
      `
      *,
      churches (*)
    `
    )
    .eq('id', authData.user.id)
    .single()

  if (churchError) {
    console.error('Error getting user with church:', churchError)
    return null
  }

  return userWithChurch
}

export async function signOut() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  await supabase.auth.signOut()
}

export type UserRole = 'admin' | 'treasurer' | 'member'

export function hasPermission(userRole: UserRole, requiredRoles: UserRole[]) {
  return requiredRoles.includes(userRole)
}