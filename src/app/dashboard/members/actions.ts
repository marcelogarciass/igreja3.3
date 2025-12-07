'use server'

import { getUserWithChurch, createServerSupabaseClient } from '@/lib/auth'
import { redirect } from 'next/navigation'

export async function createMember(prevState: any, formData: FormData) {
  const userData = await getUserWithChurch()
  if (!userData) {
    redirect('/login')
  }

  // Basic Fields
  const name = (formData.get('name') as string) || ''
  const email = (formData.get('email') as string) || ''
  const phone = (formData.get('phone') as string) || ''
  const birth_date = (formData.get('birth_date') as string) || null
  const profession = (formData.get('profession') as string) || ''
  const cpf = (formData.get('cpf') as string) || ''
  
  // Photo Handling
  let photo_url = (formData.get('existing_photo_url') as string) || ''
  const photoFile = formData.get('photo') as File
  const supabase = await createServerSupabaseClient()

  if (photoFile && photoFile.size > 0 && photoFile.name !== 'undefined') {
    try {
      const fileExt = photoFile.name.split('.').pop()
      const fileName = `${userData.church_id}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`
      
      const { error: uploadError } = await supabase.storage
        .from('member-photos')
        .upload(fileName, photoFile)

      if (uploadError) {
        console.error('Erro ao fazer upload da foto:', uploadError)
      } else {
        const { data: { publicUrl } } = supabase.storage
          .from('member-photos')
          .getPublicUrl(fileName)
        photo_url = publicUrl
      }
    } catch (e) {
      console.error('Erro no processamento da foto:', e)
    }
  }

  // Address
  const address = (formData.get('address') as string) || ''
  const neighborhood = (formData.get('neighborhood') as string) || ''
  const city = (formData.get('city') as string) || ''
  const state = (formData.get('state') as string) || ''
  const zip_code = (formData.get('zip_code') as string) || ''

  // Ecclesiastical
  const position = (formData.get('position') as string) || 'Membro'
  const entry_date = (formData.get('entry_date') as string) || new Date().toISOString().slice(0, 10)
  const baptism_date = (formData.get('baptism_date') as string) || null
  const status = (formData.get('status') as string) || 'active'

  // Family
  const spouse_name = (formData.get('spouse_name') as string) || ''
  const children_json = (formData.get('children_names') as string) || '[]'
  let children_names: string[] = []
  try {
    children_names = JSON.parse(children_json)
  } catch {
    children_names = []
  }

  const new_family_name = (formData.get('new_family_name') as string) || ''
  let family_id = (formData.get('family_id') as string) || null

  try {
    // 1. Create Family if needed
    if (new_family_name) {
      const { data: familyData, error: familyError } = await supabase
        .from('families')
        .insert({
          name: new_family_name,
          church_id: userData.church_id
        })
        .select('id')
        .single()

      if (familyError) {
        console.error('Erro ao criar família:', familyError)
        return { message: 'Erro ao criar família', success: false }
      } else if (familyData) {
        family_id = familyData.id
      }
    }

    // 2. Check Duplicates (Email)
    if (email) {
      const { data: existingMembers, error: checkError } = await supabase
        .from('members')
        .select('id')
        .eq('church_id', userData.church_id)
        .eq('email', email)
        .limit(1)

      if (checkError) {
        return { message: 'Erro ao verificar duplicidade', success: false }
      }

      if (existingMembers && existingMembers.length > 0) {
        return { message: 'E-mail já cadastrado', success: false }
      }
    }

    // 3. Insert Member
    const { error } = await supabase.from('members').insert({
      church_id: userData.church_id,
      name,
      email: email || null,
      phone,
      birth_date: birth_date || null,
      profession,
      cpf,
      photo_url,
      
      address,
      neighborhood,
      city,
      state,
      zip_code,
      
      position, // church_role
      entry_date,
      baptism_date: baptism_date || null,
      status,
      
      spouse_name,
      children_names, // Supabase handles JSONB
      family_id: family_id || null
    })

    if (error) {
      console.error('Erro ao adicionar membro:', error)
      return { message: 'Erro ao salvar membro no banco de dados', success: false }
    }

  } catch (e) {
    console.error('Erro geral:', e)
    return { message: 'Erro interno do servidor', success: false }
  }

  redirect('/dashboard/members?saved=1')
}

export async function updateMember(prevState: any, formData: FormData) {
  const userData = await getUserWithChurch()
  if (!userData) {
    redirect('/login')
  }

  const id = formData.get('id') as string
  if (!id) {
    return { message: 'ID do membro não fornecido', success: false }
  }

  // Basic Fields
  const name = (formData.get('name') as string) || ''
  const email = (formData.get('email') as string) || ''
  const phone = (formData.get('phone') as string) || ''
  const birth_date = (formData.get('birth_date') as string) || null
  const profession = (formData.get('profession') as string) || ''
  const cpf = (formData.get('cpf') as string) || ''
  
  // Photo Handling
  let photo_url = (formData.get('existing_photo_url') as string) || ''
  const photoFile = formData.get('photo') as File
  const supabase = await createServerSupabaseClient()

  if (photoFile && photoFile.size > 0 && photoFile.name !== 'undefined') {
    try {
      const fileExt = photoFile.name.split('.').pop()
      const fileName = `${userData.church_id}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`
      
      const { error: uploadError } = await supabase.storage
        .from('member-photos')
        .upload(fileName, photoFile)

      if (uploadError) {
        console.error('Erro ao fazer upload da foto:', uploadError)
      } else {
        const { data: { publicUrl } } = supabase.storage
          .from('member-photos')
          .getPublicUrl(fileName)
        photo_url = publicUrl
      }
    } catch (e) {
      console.error('Erro no processamento da foto:', e)
    }
  }

  // Address
  const address = (formData.get('address') as string) || ''
  const neighborhood = (formData.get('neighborhood') as string) || ''
  const city = (formData.get('city') as string) || ''
  const state = (formData.get('state') as string) || ''
  const zip_code = (formData.get('zip_code') as string) || ''

  // Ecclesiastical
  const position = (formData.get('position') as string) || 'Membro'
  const entry_date = (formData.get('entry_date') as string) || new Date().toISOString().slice(0, 10)
  const baptism_date = (formData.get('baptism_date') as string) || null
  const status = (formData.get('status') as string) || 'active'

  // Family
  const spouse_name = (formData.get('spouse_name') as string) || ''
  const children_json = (formData.get('children_names') as string) || '[]'
  let children_names: string[] = []
  try {
    children_names = JSON.parse(children_json)
  } catch {
    children_names = []
  }

  const new_family_name = (formData.get('new_family_name') as string) || ''
  let family_id = (formData.get('family_id') as string) || null

  try {
    // 1. Create Family if needed
    if (new_family_name) {
      const { data: familyData, error: familyError } = await supabase
        .from('families')
        .insert({
          name: new_family_name,
          church_id: userData.church_id
        })
        .select('id')
        .single()

      if (familyError) {
        console.error('Erro ao criar família:', familyError)
        return { message: 'Erro ao criar família', success: false }
      } else if (familyData) {
        family_id = familyData.id
      }
    }

    // 2. Check Duplicates (Email) - excluding current member
    if (email) {
      const { data: existingMembers, error: checkError } = await supabase
        .from('members')
        .select('id')
        .eq('church_id', userData.church_id)
        .eq('email', email)
        .neq('id', id)
        .limit(1)

      if (checkError) {
        return { message: 'Erro ao verificar duplicidade', success: false }
      }

      if (existingMembers && existingMembers.length > 0) {
        return { message: 'E-mail já cadastrado para outro membro', success: false }
      }
    }

    // 3. Update Member
    let final_family_id = family_id // from new family creation
    if (!final_family_id) {
       const formFamilyId = formData.get('family_id') as string
       if (formFamilyId) {
          final_family_id = formFamilyId
       }
    }

    const { error } = await supabase.from('members').update({
      church_id: userData.church_id,
      name,
      email: email || null,
      phone,
      birth_date: birth_date || null,
      profession,
      cpf,
      photo_url,
      
      address,
      neighborhood,
      city,
      state,
      zip_code,
      
      position, // church_role
      entry_date,
      baptism_date: baptism_date || null,
      status,
      
      spouse_name,
      children_names, // Supabase handles JSONB
      family_id: final_family_id
    })
    .eq('id', id)
    .eq('church_id', userData.church_id)

    if (error) {
      console.error('Erro ao atualizar membro:', error)
      return { message: 'Erro ao salvar membro no banco de dados', success: false }
    }

  } catch (e) {
    console.error('Erro geral:', e)
    return { message: 'Erro interno do servidor', success: false }
  }

  redirect('/dashboard/members?updated=1')
}
