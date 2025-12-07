'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Users, 
  DollarSign, 
  Settings, 
  UserPlus,
  TrendingUp,
  LogOut
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient as createSupabaseClient } from '@/lib/supabase/client'

interface MobileNavProps {
  userRole?: 'admin' | 'treasurer' | 'member'
}

const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    roles: ['admin', 'treasurer', 'member']
  },
  {
    name: 'Membros',
    href: '/dashboard/members',
    icon: Users,
    roles: ['admin', 'treasurer']
  },
  {
    name: 'Transações',
    href: '/dashboard/transactions',
    icon: DollarSign,
    roles: ['admin', 'treasurer']
  },
  {
    name: 'Lançamento',
    href: '/dashboard/quick-entry',
    icon: TrendingUp,
    roles: ['admin', 'treasurer']
  },
  {
    name: 'Usuários',
    href: '/dashboard/users',
    icon: UserPlus,
    roles: ['admin']
  },
  {
    name: 'Config',
    href: '/dashboard/settings',
    icon: Settings,
    roles: ['admin']
  }
]

export function MobileNav({ userRole = 'member' }: MobileNavProps) {
  const pathname = usePathname()
  const supabase = createSupabaseClient()

  const filteredNavigation = navigation.filter(item => 
    item.roles.includes(userRole)
  )

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 pb-4">
      <nav className="flex items-center justify-between px-2 overflow-x-auto no-scrollbar">
        {filteredNavigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              prefetch={false}
              className={cn(
                'flex flex-col items-center justify-center min-w-[4rem] py-3 px-1 text-xs font-medium transition-colors',
                isActive
                  ? 'text-primary'
                  : 'text-gray-500 hover:text-gray-900'
              )}
            >
              <item.icon className={cn("h-6 w-6 mb-1", isActive && "text-primary")} />
              <span className="truncate max-w-[4rem]">{item.name}</span>
            </Link>
          )
        })}
        
        <button
          onClick={handleLogout}
          className="flex flex-col items-center justify-center min-w-[4rem] py-3 px-1 text-xs font-medium text-red-500 hover:text-red-700 transition-colors"
        >
          <LogOut className="h-6 w-6 mb-1" />
          <span>Sair</span>
        </button>
      </nav>
    </div>
  )
}
