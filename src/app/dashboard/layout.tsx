import { Sidebar } from '@/components/layout/sidebar'
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
    <div className="flex h-screen bg-gray-50">
      <div className="w-64 flex-shrink-0">
        <Sidebar 
          userRole={userData.role}
          churchName={userData.churches?.name}
        />
      </div>
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}