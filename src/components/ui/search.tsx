'use client'

import { Input } from '@/components/ui/input'
import { useRouter, useSearchParams } from 'next/navigation'
import { useDebouncedCallback } from 'use-debounce'

export function Search({ placeholder }: { placeholder: string }) {
  const searchParams = useSearchParams()
  const { replace } = useRouter()

  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams)
    if (term) {
      params.set('q', term)
    } else {
      params.delete('q')
    }
    replace(`?${params.toString()}`)
  }, 300)

  return (
    <Input
      placeholder={placeholder}
      className="max-w-full sm:max-w-sm"
      onChange={(e) => handleSearch(e.target.value)}
      defaultValue={searchParams.get('q')?.toString()}
    />
  )
}
