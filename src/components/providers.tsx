'use client'

import { ThemeProvider } from '@/lib/contexts/theme-context'
import { GraphQLProvider } from '@/lib/graphql/apollo-provider'
import { AuthProvider } from '@/lib/contexts/auth-context'
import { SemesterProvider } from '@/lib/contexts/semester-context'
import { ToastProvider } from '@/components/common/Toast'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <GraphQLProvider>
          <SemesterProvider>
            <ToastProvider>{children}</ToastProvider>
          </SemesterProvider>
        </GraphQLProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
