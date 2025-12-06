import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export async function createServerSupabaseClient() {
  const cookieStore = await cookies()
  return createClient(cookieStore)
}

export async function getUser() {
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
