"use client"

import { useEffect, useMemo, useState } from 'react'
import { Input } from '@/components/ui/input'

interface ColorFieldProps {
  id: string
  name: string
  label: string
  defaultValue?: string
}

function isValidHex(value: string) {
  return /^#([0-9a-fA-F]{6})$/.test(value)
}

export default function ColorField({ id, name, label, defaultValue = '#000000' }: ColorFieldProps) {
  const [value, setValue] = useState<string>(defaultValue)

  useEffect(() => {
    setValue(defaultValue)
  }, [defaultValue])

  const colorValue = useMemo(() => (isValidHex(value) ? value : '#000000'), [value])

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <div className="flex items-center gap-3">
        <Input
          id={id}
          name={name}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="#3B82F6"
        />
        <input
          aria-label={`Selecionar ${label.toLowerCase()}`}
          type="color"
          value={colorValue}
          onChange={(e) => setValue(e.target.value)}
          className="h-10 w-12 p-0 border rounded-md"
        />
        <div
          aria-hidden
          className="h-10 w-10 rounded-md border"
          style={{ backgroundColor: colorValue }}
          title={colorValue}
        />
      </div>
    </div>
  )
}