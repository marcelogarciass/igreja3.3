'use client'

import { useState } from 'react'
import { createUser, updateUser } from '@/app/dashboard/users/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { UserPlus, Save } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface UserFormProps {
  initialData?: any
  trigger?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function UserForm({ initialData, trigger, open, onOpenChange }: UserFormProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialData?.photo_url || null)
  const isEditing = !!initialData

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Usuário' : 'Novo Usuário'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Atualize as informações do usuário abaixo.' : 'Preencha os dados para adicionar um novo usuário ao sistema.'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="rounded-md bg-yellow-50 border border-yellow-200 p-3 text-sm text-yellow-900 mb-3">
          Para produção, é necessário a chave de serviço para criar/editar usuários com senha.
        </div>
        
        <form action={isEditing ? updateUser : createUser} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {isEditing && <input type="hidden" name="id" value={initialData.id} />}
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Nome</label>
            <Input name="name" placeholder="Nome" required defaultValue={initialData?.name} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">E-mail</label>
            <Input 
                name="email" 
                type="email" 
                placeholder="email@exemplo.com" 
                required 
                defaultValue={initialData?.email}
                disabled={isEditing} // Email usually cannot be changed easily without re-verification logic, keep simple for now
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Papel</label>
            <select 
                name="role" 
                defaultValue={initialData?.role || "member"} 
                className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="member">Membro</option>
              <option value="treasurer">Tesoureiro</option>
              <option value="admin">Administrador</option>
            </select>
          </div>
          
           {/* Foto */}
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

          {/* Senha */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Senha {isEditing && '(Opcional)'}</label>
            <Input name="password" type="password" placeholder={isEditing ? "Deixe em branco para manter" : "Defina uma senha"} required={!isEditing} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Confirmar Senha</label>
            <Input name="confirm_password" type="password" placeholder="Repita a senha" required={!isEditing} />
          </div>
          <div className="md:col-span-2 flex justify-end gap-2">
            <Button type="submit">
              {isEditing ? <Save className="h-4 w-4 mr-2" /> : <UserPlus className="h-4 w-4 mr-2" />}
              {isEditing ? 'Salvar Alterações' : 'Adicionar Usuário'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
