'use server'

import { createAdminClient } from '@/lib/supabase/admin'

export async function uploadLogoAction(formData: FormData) {
  const file = formData.get('file') as File
  if (!file) {
    return { error: 'Nenhum arquivo enviado' }
  }

  const admin = createAdminClient()
  const fileExt = file.name.split('.').pop()
  const fileName = `${Date.now()}.${fileExt}`
  const filePath = `${fileName}`

  const { error: uploadError } = await admin.storage
    .from('logos')
    .upload(filePath, file, {
      contentType: file.type,
      upsert: false
    })

  if (uploadError) {
    console.error('Upload error:', uploadError)
    return { error: uploadError.message }
  }

  const { data } = admin.storage.from('logos').getPublicUrl(filePath)
  return { url: data.publicUrl }
}
