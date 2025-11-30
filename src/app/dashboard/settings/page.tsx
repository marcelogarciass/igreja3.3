import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getUserWithChurch, isDemoSession, createServerSupabaseClient } from '@/lib/auth'
import { Settings, Palette, Save } from 'lucide-react'
import { redirect } from 'next/navigation'
import LogoUpload from '@/components/dashboard/logo-upload'

async function updateChurchSettings(formData: FormData) {
  'use server'
  
  const userData = await getUserWithChurch()
  
  if (!userData || userData.role !== 'admin') {
    redirect('/dashboard')
  }

  // Em modo demonstração, não persistimos alterações
  if (isDemoSession()) {
    redirect('/dashboard/settings?success=true')
  }

  const supabase = await createServerSupabaseClient()

  const name = formData.get('name') as string
  const address = formData.get('address') as string
  const phone = formData.get('phone') as string
  const email = formData.get('email') as string
  const primaryColor = formData.get('primaryColor') as string
  const secondaryColor = formData.get('secondaryColor') as string

  const { error } = await supabase
    .from('churches')
    .update({
      name,
      address,
      phone,
      email,
      primary_color: primaryColor,
      secondary_color: secondaryColor,
      updated_at: new Date().toISOString()
    })
    .eq('id', userData.church_id)

  if (error) {
    console.error('Erro ao atualizar configurações:', error)
  }

  redirect('/dashboard/settings?success=true')
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
            <form action={updateChurchSettings} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Nome da Igreja
                </label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  defaultValue={church?.name || ''}
                  required
                  placeholder="Nome da sua igreja"
                />
              </div>

              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                  Endereço
                </label>
                <Input
                  id="address"
                  name="address"
                  type="text"
                  defaultValue={church?.address || ''}
                  placeholder="Endereço completo"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Telefone
                </label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  defaultValue={church?.phone || ''}
                  placeholder="(11) 99999-9999"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  E-mail
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  defaultValue={church?.email || ''}
                  placeholder="contato@igreja.com"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="primaryColor" className="block text-sm font-medium text-gray-700 mb-1">
                    Cor Primária
                  </label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="primaryColor"
                      name="primaryColor"
                      type="color"
                      defaultValue={church?.primary_color || '#3B82F6'}
                      className="w-16 h-10 p-1 border rounded"
                    />
                    <Input
                      type="text"
                      defaultValue={church?.primary_color || '#3B82F6'}
                      className="flex-1"
                      placeholder="#3B82F6"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="secondaryColor" className="block text-sm font-medium text-gray-700 mb-1">
                    Cor Secundária
                  </label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="secondaryColor"
                      name="secondaryColor"
                      type="color"
                      defaultValue={church?.secondary_color || '#10B981'}
                      className="w-16 h-10 p-1 border rounded"
                    />
                    <Input
                      type="text"
                      defaultValue={church?.secondary_color || '#10B981'}
                      className="flex-1"
                      placeholder="#10B981"
                    />
                  </div>
                </div>
              </div>

              <Button type="submit" className="w-full">
                <Save className="h-4 w-4 mr-2" />
                Salvar Configurações
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Visual Customization */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Personalização Visual
            </CardTitle>
            <CardDescription>
              Customize a aparência do sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Logo Upload */}
            <LogoUpload />

            {/* Color Preview */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prévia das Cores
              </label>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-8 h-8 rounded border"
                    style={{ backgroundColor: church?.primary_color || '#3B82F6' }}
                  ></div>
                  <span className="text-sm text-gray-600">Cor Primária</span>
                </div>
                <div className="flex items-center gap-3">
                  <div 
                    className="w-8 h-8 rounded border"
                    style={{ backgroundColor: church?.secondary_color || '#10B981' }}
                  ></div>
                  <span className="text-sm text-gray-600">Cor Secundária</span>
                </div>
              </div>
            </div>

            {/* Theme Preview */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prévia do Tema
              </label>
              <div className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-gray-900">Dashboard</h3>
                  <div 
                    className="px-3 py-1 rounded text-white text-sm"
                    style={{ backgroundColor: church?.primary_color || '#3B82F6' }}
                  >
                    Botão Primário
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-white p-3 rounded border">
                    <div className="h-2 bg-gray-200 rounded mb-2"></div>
                    <div className="h-2 bg-gray-100 rounded"></div>
                  </div>
                  <div className="bg-white p-3 rounded border">
                    <div 
                      className="h-2 rounded mb-2"
                      style={{ backgroundColor: church?.secondary_color || '#10B981' }}
                    ></div>
                    <div className="h-2 bg-gray-100 rounded"></div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}