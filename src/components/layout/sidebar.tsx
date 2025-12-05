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
  LogOut,
  Church
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface SidebarProps {
  userRole?: 'admin' | 'treasurer' | 'member'
  churchName?: string
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
    name: 'Lançamento Rápido',
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
    name: 'Configurações',
    href: '/dashboard/settings',
    icon: Settings,
    roles: ['admin']
  }
]

export function Sidebar({ userRole = 'member', churchName = 'Igreja' }: SidebarProps) {
  const pathname = usePathname()

  const filteredNavigation = navigation.filter(item => 
    item.roles.includes(userRole)
  )

  const handleLogout = async () => {
    // Limpa sessão demo e vai para login
    try {
      document.cookie = 'demo_session=; Max-Age=0; path=/; samesite=lax'
      localStorage.removeItem('demo_user')
    } catch {}
    window.location.href = '/login'
  }

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
      {/* Header */}
      <div className="flex items-center gap-2 p-6 border-b border-gray-200">
        <Church className="h-8 w-8 text-primary" />
        <div>
          <h1 className="font-semibold text-lg text-gray-900">MultiChurch</h1>
          <p className="text-sm text-gray-500 truncate">{churchName}</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {filteredNavigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              prefetch={false}
              className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-gray-700 hover:bg-gray-100'
                  )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-gray-700 hover:bg-gray-100"
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5" />
          Sair
        </Button>
      </div>
    </div>
  )
}