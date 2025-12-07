export interface Family {
  id: string
  name: string
  church_id: string
  created_at?: string
}

export interface Member {
  id: string
  church_id: string
  name: string
  email?: string | null
  phone?: string | null
  birth_date: string
  position: string // church_role
  entry_date: string
  status: 'active' | 'inactive'
  
  // New fields
  address?: string | null
  neighborhood?: string | null
  city?: string | null
  state?: string | null
  zip_code?: string | null
  cpf?: string | null
  profession?: string | null
  baptism_date?: string | null
  spouse_name?: string | null
  children_names?: string[] | null
  family_id?: string | null
  photo_url?: string | null
  
  created_at?: string
}
