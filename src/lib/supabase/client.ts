import { createBrowserClient } from '@supabase/ssr'

function requireEnv(name: string) {
  const v = process.env[name]
  if (!v || typeof v !== 'string' || v.trim() === '') {
    throw new Error(`Variável de ambiente ausente: ${name}`)
  }
  return v
}

export function createClient() {
  const url = requireEnv('NEXT_PUBLIC_SUPABASE_URL')
  const key = requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY')
  return createBrowserClient(url, key)
}
