'use client'

import { ThemeProvider } from '@/lib/contexts/theme-context'
import { GraphQLProvider } from '@/lib/graphql/apollo-provider'
import { AuthProvider } from '@/lib/contexts/auth-context'
import { SemesterProvider } from '@/lib/contexts/semester-context'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <GraphQLProvider>
          <SemesterProvider>{children}</SemesterProvider>
        </GraphQLProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
