import { Sidebar } from '@/components/layout/sidebar'
import { MobileNav } from '@/components/layout/mobile-nav'
import { getUserWithChurch } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const userData = await getUserWithChurch()

  if (!userData) {
    redirect('/login')
  }

  return (
    <div className="flex h-screen bg-gray-50 flex-col md:flex-row">
      <div className="hidden md:block w-64 flex-shrink-0">
        <Sidebar 
          userRole={userData.role}
          churchName={userData.churches?.name}
        />
      </div>
      <main className="flex-1 overflow-auto pb-24 md:pb-0">
        {children}
      </main>
      <MobileNav userRole={userData.role} />
    </div>
  )
}