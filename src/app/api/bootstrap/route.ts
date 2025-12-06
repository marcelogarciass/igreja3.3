import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const token = url.searchParams.get('token') || ''
  const email = (url.searchParams.get('email') || 'admin@admin.com').toLowerCase()
  const password = url.searchParams.get('password') || 'admin123456'
  const churchName = url.searchParams.get('church') || 'Igreja Matriz'

  // Segurança: em produção exige token. Em dev permite sem token.
  const isProd = process.env.NODE_ENV === 'production'
  if (isProd) {
    const expected = process.env.BOOTSTRAP_TOKEN
    if (!expected || token !== expected) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
    }
  }

  try {
    const admin = createAdminClient()

    // 0) Garantir Bucket 'logos'
    try {
      const { data: buckets } = await admin.storage.listBuckets()
      const logosBucket = buckets?.find((b) => b.name === 'logos')
      if (!logosBucket) {
        await admin.storage.createBucket('logos', {
          public: true,
          fileSizeLimit: 5242880, // 5MB
          allowedMimeTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp'],
        })
      } else if (!logosBucket.public) {
        await admin.storage.updateBucket('logos', {
          public: true,
        })
      }
    } catch (e) {
      console.error('Erro ao verificar/criar bucket:', e)
    }

    // 1) Verificar se usuário já existe
    let userId: string | null = null
    try {
      const { data: usersList, error: listErr } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 })
      if (listErr) throw listErr
      const existing = usersList?.users?.find((u) => (u.email || '').toLowerCase() === email)
      if (existing) userId = existing.id
    } catch {
      // prosseguir com criação
    }

    // 2) Criar usuário admin se não existir
    if (!userId) {
      const { data: created, error: createErr } = await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { role: 'admin', name: 'Admin' },
      })
      if (createErr) return NextResponse.json({ error: createErr.message }, { status: 500 })
      userId = created.user?.id || null
      if (!userId) return NextResponse.json({ error: 'Falha ao obter ID do usuário criado' }, { status: 500 })
    }

    // 3) Garantir igreja
    let churchId: string | null = null
    {
      const { data: foundChurch, error: findChurchErr } = await admin
        .from('churches')
        .select('id')
        .eq('name', churchName)
        .maybeSingle()
      if (findChurchErr && findChurchErr.code !== 'PGRST116') {
        // PGRST116: No rows found for single() / maybeSingle()
        return NextResponse.json({ error: findChurchErr.message }, { status: 500 })
      }
      if (foundChurch?.id) {
        churchId = foundChurch.id
      } else {
        const { data: createdChurch, error: createChurchErr } = await admin
          .from('churches')
          .insert({ name: churchName })
          .select('id')
          .single()
        if (createChurchErr) return NextResponse.json({ error: createChurchErr.message }, { status: 500 })
        churchId = createdChurch.id
      }
    }

    // 4) Vincular usuário à igreja com papel admin na tabela public.users
    {
      const { data: existingLink, error: findLinkErr } = await admin
        .from('users')
        .select('id')
        .eq('id', userId)
        .maybeSingle()
      if (findLinkErr && findLinkErr.code !== 'PGRST116') {
        return NextResponse.json({ error: findLinkErr.message }, { status: 500 })
      }
      if (!existingLink) {
        const { error: linkErr } = await admin.from('users').insert({
          id: userId,
          email,
          name: 'Admin',
          role: 'admin',
          church_id: churchId,
        })
        if (linkErr) return NextResponse.json({ error: linkErr.message }, { status: 500 })
      }
    }

    return NextResponse.json({
      ok: true,
      email,
      churchId,
      userId,
      note: 'Admin seed verificado/criado com sucesso',
    })
  } catch (err: unknown) {
    const message = typeof err === 'object' && err && 'message' in err ? String((err as { message: unknown }).message) : 'Erro desconhecido'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
