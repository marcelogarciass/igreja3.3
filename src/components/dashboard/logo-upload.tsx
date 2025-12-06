"use client"

import { Button } from '@/components/ui/button'
import { Upload, X, Loader2 } from 'lucide-react'
import { useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface LogoUploadProps {
  defaultValue?: string | null
}

export default function LogoUpload({ defaultValue }: LogoUploadProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(defaultValue || null)
  const [uploading, setUploading] = useState(false)
  const [logoUrl, setLogoUrl] = useState<string>(defaultValue || '')

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Preview immediately
    const objectUrl = URL.createObjectURL(file)
    setPreviewUrl(objectUrl)
    setUploading(true)

    try {
      const supabase = createClient()
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`
      const filePath = `${fileName}`

      // Tenta fazer upload para o bucket 'logos' (nome mais provável)
      // Se falhar, o usuário receberá um alerta
      const bucketName = 'logos' 
      
      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        console.error('Upload error details:', uploadError)
        throw uploadError
      }

      const { data } = supabase.storage.from(bucketName).getPublicUrl(filePath)
      setLogoUrl(data.publicUrl)
    } catch (error) {
      console.error('Error uploading logo:', error)
      alert('Erro ao fazer upload da logo. Verifique se o arquivo é uma imagem válida e tente novamente.')
      setPreviewUrl(defaultValue || null) // Revert on error
    } finally {
      setUploading(false)
    }
  }

  const handleRemove = () => {
    setPreviewUrl(null)
    setLogoUrl('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Logo da Igreja
      </label>
      
      {/* Hidden input to send the URL to the server action */}
      <input type="hidden" name="logo_url" value={logoUrl} />
      
      {previewUrl ? (
        <div className="relative w-full h-48 border-2 border-gray-200 rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center mb-4 group">
            <img 
              src={previewUrl} 
              alt="Logo Preview" 
              className="max-w-full max-h-full object-contain p-2" 
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Button 
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleRemove}
                className="flex items-center gap-2"
              >
                <X size={16} />
                Remover Logo
              </Button>
            </div>
        </div>
      ) : (
        <div 
            onClick={() => !uploading && fileInputRef.current?.click()}
            className={`border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer transition-colors ${uploading ? 'bg-gray-50 cursor-not-allowed' : 'hover:bg-gray-50 hover:border-blue-400'}`}
        >
            {uploading ? (
                <Loader2 className="h-12 w-12 mx-auto text-blue-500 mb-4 animate-spin" />
            ) : (
                <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            )}
            <p className="text-sm text-gray-600 mb-2">
              {uploading ? 'Enviando imagem...' : 'Clique para fazer upload ou arraste uma imagem'}
            </p>
            <p className="text-xs text-gray-500">PNG, JPG até 2MB</p>
        </div>
      )}
      
      <input 
        ref={fileInputRef} 
        type="file" 
        accept="image/*" 
        className="hidden" 
        onChange={handleFileSelect}
        disabled={uploading}
      />
      
      {!previewUrl && !uploading && (
        <Button 
            type="button" 
            variant="outline" 
            className="mt-4 w-full" 
            onClick={() => fileInputRef.current?.click()}
        >
            Selecionar Arquivo
        </Button>
      )}
    </div>
  )
}
