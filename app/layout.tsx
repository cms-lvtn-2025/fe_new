import './globals.css'
import type { Metadata } from 'next'
import { Providers } from '@/components/providers'

export const metadata: Metadata = {
  title: 'Hệ thống quản lý luận văn HCMUT',
  description: 'Hệ thống quản lý luận văn HCMUT',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className="transition-colors duration-300">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
