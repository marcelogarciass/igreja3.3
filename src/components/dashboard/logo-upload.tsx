"use client"

import { Button } from '@/components/ui/button'
import { Upload } from 'lucide-react'
import { useRef } from 'react'

export default function LogoUpload() {
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Logo da Igreja
      </label>
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
        <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
        <p className="text-sm text-gray-600 mb-2">
          Clique para fazer upload ou arraste uma imagem
        </p>
        <p className="text-xs text-gray-500">PNG, JPG até 2MB</p>
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" />
        <Button variant="outline" className="mt-4" onClick={() => fileInputRef.current?.click()}>
          Selecionar Arquivo
        </Button>
      </div>
    </div>
  )
}