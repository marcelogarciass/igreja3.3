import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { type cookies } from 'next/headers'

function requireEnv(name: string) {
  const v = process.env[name]
  if (!v || typeof v !== 'string' || v.trim() === '') {
    throw new Error(`Variável de ambiente ausente: ${name}`)
  }
  return v
}

export function createClient(cookieStore: Awaited<ReturnType<typeof cookies>>) {
  return createServerClient(
    requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
    requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch {
            // The `delete` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}
