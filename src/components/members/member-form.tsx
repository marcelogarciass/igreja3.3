'use client'

import { useActionState, useState } from 'react'
import { createMember, updateMember } from '@/app/dashboard/members/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { UserPlus, Plus, Trash2, Save } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Member } from '@/lib/types'

const initialState = {
  message: '',
  success: false,
}

interface MemberFormProps {
  initialData?: Member | null
}

export function MemberForm({ initialData }: MemberFormProps) {
  const action = initialData ? updateMember : createMember
  const [state, formAction, isPending] = useActionState(action, initialState)
  const [childrenList, setChildrenList] = useState<string[]>(initialData?.children_names || [])
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialData?.photo_url || null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
  }

  const addChild = () => {
    setChildrenList([...childrenList, ''])
  }

  const removeChild = (index: number) => {
    const newList = [...childrenList]
    newList.splice(index, 1)
    setChildrenList(newList)
  }

  const updateChild = (index: number, value: string) => {
    const newList = [...childrenList]
    newList[index] = value
    setChildrenList(newList)
  }

  return (
    <form action={formAction}>
      <input type="hidden" name="children_names" value={JSON.stringify(childrenList)} />
      {initialData?.id && <input type="hidden" name="id" value={initialData.id} />}
      {initialData?.family_id && <input type="hidden" name="family_id" value={initialData.family_id} />}
      
      {state.message && !state.success && (
         <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-900 mb-4">
          {state.message}
        </div>
      )}

      <Tabs defaultValue="personal" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto">
          <TabsTrigger value="personal">Pessoal</TabsTrigger>
          <TabsTrigger value="address">Endereço</TabsTrigger>
          <TabsTrigger value="church">Eclesiástico</TabsTrigger>
          <TabsTrigger value="family">Família</TabsTrigger>
        </TabsList>
        
        <div className="mt-4">
          <TabsContent value="personal">
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Nome Completo</label>
                    <Input name="name" placeholder="Nome completo" required defaultValue={initialData?.name} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">CPF</label>
                    <Input name="cpf" placeholder="000.000.000-00" defaultValue={initialData?.cpf || ''} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Data de Nascimento</label>
                    <Input name="birth_date" type="date" required defaultValue={initialData?.birth_date} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Profissão</label>
                    <Input name="profession" placeholder="Ex.: Engenheiro" defaultValue={initialData?.profession || ''} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Telefone</label>
                    <Input name="phone" placeholder="(11) 99999-9999" defaultValue={initialData?.phone || ''} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">E-mail</label>
                    <Input name="email" type="email" placeholder="email@exemplo.com" defaultValue={initialData?.email || ''} />
                  </div>
                   <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium">Foto</label>
                    <div className="flex items-center gap-4">
                      {previewUrl && (
                        <div className="relative h-16 w-16 rounded-full overflow-hidden border">
                          <img src={previewUrl} alt="Preview" className="h-full w-full object-cover" />
                        </div>
                      )}
                      <Input 
                        name="photo" 
                        type="file" 
                        accept="image/*" 
                        onChange={handleFileChange}
                        className="flex-1"
                      />
                      <input type="hidden" name="existing_photo_url" value={initialData?.photo_url || ''} />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="address">
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium">Rua</label>
                    <Input name="address" placeholder="Rua das Flores, 123" defaultValue={initialData?.address || ''} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Bairro</label>
                    <Input name="neighborhood" placeholder="Centro" defaultValue={initialData?.neighborhood || ''} />
                  </div>
                   <div className="space-y-2">
                    <label className="text-sm font-medium">CEP</label>
                    <Input name="zip_code" placeholder="00000-000" defaultValue={initialData?.zip_code || ''} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Cidade</label>
                    <Input name="city" placeholder="São Paulo" defaultValue={initialData?.city || ''} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Estado</label>
                    <Input name="state" placeholder="SP" maxLength={2} defaultValue={initialData?.state || ''} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="church">
             <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div className="space-y-2">
                    <label className="text-sm font-medium">Cargo/Função</label>
                    <Input name="position" placeholder="Ex.: Diácono, Membro" required defaultValue={initialData?.position || 'Membro'} />
                  </div>
                   <div className="space-y-2">
                    <label className="text-sm font-medium">Status</label>
                    <select 
                      name="status" 
                      className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm"
                      defaultValue={initialData?.status || 'active'}
                    >
                      <option value="active">Ativo</option>
                      <option value="inactive">Inativo</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Data de Entrada</label>
                    <Input name="entry_date" type="date" required defaultValue={initialData?.entry_date} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Data de Batismo</label>
                    <Input name="baptism_date" type="date" defaultValue={initialData?.baptism_date || ''} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="family">
            <Card>
              <CardContent className="pt-6 space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Cônjuge</label>
                  <Input name="spouse_name" placeholder="Nome do cônjuge" defaultValue={initialData?.spouse_name || ''} />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Filhos</label>
                  {childrenList.map((child, index) => (
                    <div key={index} className="flex gap-2">
                      <Input 
                        value={child} 
                        onChange={(e) => updateChild(index, e.target.value)} 
                        placeholder={`Nome do filho(a) ${index + 1}`} 
                      />
                      <Button type="button" variant="destructive" size="icon" onClick={() => removeChild(index)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button type="button" variant="outline" size="sm" onClick={addChild}>
                    <Plus className="h-4 w-4 mr-2" /> Adicionar Filho
                  </Button>
                </div>

                <div className="border-t pt-4">
                   <h3 className="font-medium mb-2">Vincular Família</h3>
                   <div className="space-y-2">
                    <label className="text-sm font-medium">Criar Nova Família (Nome)</label>
                    <Input name="new_family_name" placeholder="Ex.: Família Silva" />
                    <p className="text-xs text-muted-foreground">Deixe em branco se não quiser criar um grupo familiar agora.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </div>

        <div className="mt-6 flex justify-end">
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Salvando...' : (
              <>
                {initialData ? <Save className="h-4 w-4 mr-2" /> : <UserPlus className="h-4 w-4 mr-2" />}
                {initialData ? 'Atualizar Membro' : 'Adicionar Membro'}
              </>
            )}
          </Button>
        </div>
      </Tabs>
    </form>
  )
}
