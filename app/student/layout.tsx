import Sidebar from '@/components/layout/sidebar'
import Header from '@/components/layout/header'
import { SemesterProvider } from '@/lib/contexts/semester-context'

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SemesterProvider>
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar userRole="student" />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header userRole="student" />
          <main className="flex-1 overflow-y-auto p-6">
            {children}
          </main>
        </div>
      </div>
    </SemesterProvider>
  )
}
