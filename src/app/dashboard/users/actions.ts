'use server'

import { getUserWithChurch } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'

export async function createUser(formData: FormData) {
  const userData = await getUserWithChurch()
  if (!userData) {
    redirect('/login')
  }

  const name = (formData.get('name') as string) || ''
  const email = (formData.get('email') as string) || ''
  const role = (formData.get('role') as string) || 'member'
  const password = (formData.get('password') as string) || ''
  const confirmPassword = (formData.get('confirm_password') as string) || ''
  const photoFile = formData.get('photo') as File

  // Validações básicas de senha
  if (!password || password.length < 6) {
    redirect('/dashboard/users?error=password_length')
  }
  if (password !== confirmPassword) {
    redirect('/dashboard/users?error=password_mismatch')
  }

  let photo_url = ''

  try {
    const admin = createAdminClient()

    // 0. Upload Photo (if exists)
    if (photoFile && photoFile.size > 0 && photoFile.name !== 'undefined') {
        try {
            const fileExt = photoFile.name.split('.').pop()
            const fileName = `${userData.church_id}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`
            
            const { error: uploadError } = await admin.storage
              .from('user-photos')
              .upload(fileName, photoFile, {
                  contentType: photoFile.type,
                  upsert: true
              })

            if (uploadError) {
              console.error('Erro ao fazer upload da foto:', uploadError)
            } else {
              const { data: { publicUrl } } = admin.storage
                .from('user-photos')
                .getPublicUrl(fileName)
              photo_url = publicUrl
            }
        } catch (e) {
            console.error('Erro no processamento da foto:', e)
        }
    }

    // 1. Checa duplicidade de e-mail na tabela users da mesma igreja
    const { data: existingUsers, error: existingError } = await admin
      .from('users')
      .select('id')
      .eq('church_id', userData.church_id)
      .eq('email', email)
      .limit(1)

    if (existingError) {
      console.error('Erro ao verificar duplicidade na tabela users:', existingError)
      return redirect('/dashboard/users?error=db_check')
    }

    if (existingUsers && existingUsers.length > 0) {
      return redirect('/dashboard/users?error=duplicate')
    }

    // 2. Cria usuário diretamente no Auth com senha
    const { data: created, error: createError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name, role, photo_url },
    })

    if (createError) {
      console.error('Erro ao criar usuário no Auth:', createError)
      return redirect('/dashboard/users?error=auth_create')
    }

    const authUserId = created?.user?.id
    if (!authUserId) {
      console.error('ID do usuário Auth ausente após criação.')
      return redirect('/dashboard/users?error=auth_id')
    }

    // 3. Insert into public.users
    const { error: insertError } = await admin
      .from('users')
      .insert({
        id: authUserId,
        church_id: userData.church_id,
        email,
        name,
        role,
        photo_url: photo_url || null
      })

    if (insertError) {
      console.error('Erro ao inserir usuário na tabela users:', insertError)
      return redirect('/dashboard/users?error=db')
    }

  } catch (e) {
    if ((e as any)?.digest?.startsWith('NEXT_REDIRECT')) {
        throw e
    }
    console.error('Erro geral na criação de usuário em produção:', e)
    redirect('/dashboard/users?error=server')
  }

  redirect('/dashboard/users?saved=1')
}

export async function updateUser(formData: FormData) {
  const userData = await getUserWithChurch()
  if (!userData) {
    redirect('/login')
  }

  const id = formData.get('id') as string
  if (!id) return redirect('/dashboard/users?error=missing_id')

  const name = (formData.get('name') as string) || ''
  const role = (formData.get('role') as string) || 'member'
  const password = (formData.get('password') as string) || ''
  const confirmPassword = (formData.get('confirm_password') as string) || ''
  const photoFile = formData.get('photo') as File
  const existing_photo_url = formData.get('existing_photo_url') as string

  // Password Update Logic (Optional)
  if (password) {
    if (password.length < 6) {
      redirect('/dashboard/users?error=password_length')
    }
    if (password !== confirmPassword) {
      redirect('/dashboard/users?error=password_mismatch')
    }
  }

  let photo_url = existing_photo_url

  try {
    const admin = createAdminClient()

    // 0. Upload Photo (if new file exists)
    if (photoFile && photoFile.size > 0 && photoFile.name !== 'undefined') {
        try {
            const fileExt = photoFile.name.split('.').pop()
            const fileName = `${userData.church_id}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`
            
            const { error: uploadError } = await admin.storage
              .from('user-photos')
              .upload(fileName, photoFile, {
                  contentType: photoFile.type,
                  upsert: true
              })

            if (uploadError) {
              console.error('Erro ao fazer upload da foto:', uploadError)
            } else {
              const { data: { publicUrl } } = admin.storage
                .from('user-photos')
                .getPublicUrl(fileName)
              photo_url = publicUrl
            }
        } catch (e) {
            console.error('Erro no processamento da foto:', e)
        }
    }

    // 1. Update Auth User (Metadata & Password if provided)
    const updateAttrs: any = {
      user_metadata: { name, role, photo_url }
    }
    if (password) {
      updateAttrs.password = password
    }

    const { error: authError } = await admin.auth.admin.updateUserById(id, updateAttrs)

    if (authError) {
      console.error('Erro ao atualizar usuário no Auth:', authError)
      return redirect('/dashboard/users?error=auth_update')
    }

    // 2. Update public.users
    const { error: dbError } = await admin
      .from('users')
      .update({
        name,
        role,
        photo_url: photo_url || null
      })
      .eq('id', id)
      .eq('church_id', userData.church_id)

    if (dbError) {
      console.error('Erro ao atualizar usuário na tabela users:', dbError)
      return redirect('/dashboard/users?error=db_update')
    }

  } catch (e) {
    if ((e as any)?.digest?.startsWith('NEXT_REDIRECT')) {
        throw e
    }
    console.error('Erro geral na atualização de usuário:', e)
    redirect('/dashboard/users?error=server')
  }

  redirect('/dashboard/users?updated=1')
}

export async function deleteUser(id: string) {
  const userData = await getUserWithChurch()
  if (!userData) {
    redirect('/login')
  }

  if (!id) return redirect('/dashboard/users?error=missing_id')

  // Don't allow deleting yourself
  if (id === userData.id) {
    return redirect('/dashboard/users?error=delete_self')
  }

  try {
    const admin = createAdminClient()

    // 1. Delete from Auth (Cascade should handle public.users, but let's be safe)
    const { error: authError } = await admin.auth.admin.deleteUser(id)

    if (authError) {
        console.error('Erro ao deletar usuário do Auth:', authError)
        return redirect('/dashboard/users?error=auth_delete')
    }
    
    // Note: Due to ON DELETE CASCADE on public.users referencing auth.users, 
    // the user row in public.users should be deleted automatically.
    
  } catch (e) {
    if ((e as any)?.digest?.startsWith('NEXT_REDIRECT')) {
        throw e
    }
    console.error('Erro geral na deleção de usuário:', e)
    redirect('/dashboard/users?error=server')
  }

  redirect('/dashboard/users?deleted=1')
}
