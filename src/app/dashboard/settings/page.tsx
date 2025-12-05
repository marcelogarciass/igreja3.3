import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Save, Settings } from 'lucide-react'
import { getUserWithChurch, createServerSupabaseClient } from '@/lib/auth'
import { redirect } from 'next/navigation'
import LogoUpload from '@/components/dashboard/logo-upload'
import ColorField from '@/components/dashboard/color-field'

export async function updateChurchSettings(formData: FormData) {
  'use server'

  const userData = await getUserWithChurch()
  if (!userData) {
    redirect('/login')
  }

  const name = (formData.get('name') as string) || ''
  const address = (formData.get('address') as string) || ''
  const phone = (formData.get('phone') as string) || ''
  const email = (formData.get('email') as string) || ''
  const primary_color = (formData.get('primary_color') as string) || ''
  const secondary_color = (formData.get('secondary_color') as string) || ''

  const supabase = await createServerSupabaseClient()

  const { error } = await supabase
    .from('churches')
    .update({ name, address, phone, email, primary_color, secondary_color })
    .eq('id', userData.church_id)

  if (error) {
    console.error('Erro ao atualizar igreja:', error)
    redirect('/dashboard/settings?error=db')
  }

  redirect('/dashboard/settings?success=1')
}

export default async function SettingsPage({
  searchParams
}: {
  searchParams: { success?: string }
}) {
  const userData = await getUserWithChurch()
  
  if (!userData) {
    redirect('/login')
  }

  if (userData.role !== 'admin') {
    redirect('/dashboard')
  }

  const church = userData.churches

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Settings className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Configurações</h1>
          <p className="text-gray-600">
            Gerencie as configurações da sua igreja
          </p>
        </div>
      </div>

      {/* Success Message */}
      {searchParams.success && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="flex items-center gap-3 p-4">
            <Save className="h-5 w-5 text-green-600" />
            <p className="font-medium text-green-800">
              Configurações salvas com sucesso!
            </p>
          </CardContent>
        </Card>
      )}

      <form action={updateChurchSettings} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Church Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Informações da Igreja
            </CardTitle>
            <CardDescription>
              Configure os dados básicos da sua igreja
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Nome da Igreja
                </label>
                <Input id="name" name="name" defaultValue={church?.name} required />
              </div>

              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                  Endereço
                </label>
                <Input id="address" name="address" defaultValue={church?.address ?? ''} />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Telefone
                </label>
                <Input id="phone" name="phone" defaultValue={church?.phone ?? ''} />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  E-mail
                </label>
                <Input id="email" name="email" defaultValue={church?.email ?? ''} />
              </div>

              <Button type="submit">Salvar Alterações</Button>
            </div>
          </CardContent>
        </Card>

        {/* Visual Customization */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Personalização Visual
            </CardTitle>
            <CardDescription>
              Logo e cores do tema da sua igreja
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <LogoUpload />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ColorField
                  id="primary_color"
                  name="primary_color"
                  label="Cor Primária"
                  defaultValue={church?.primary_color ?? '#3B82F6'}
                />
                <ColorField
                  id="secondary_color"
                  name="secondary_color"
                  label="Cor Secundária"
                  defaultValue={church?.secondary_color ?? '#10B981'}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}