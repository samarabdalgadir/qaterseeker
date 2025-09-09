// app/layout.tsx
import '@/styles/globals.css'
import { ReactNode } from 'react'
import { ThemeProvider } from '@/components/theme-provider'

export const metadata = {
  title: 'Qatar Seeker',
  description: 'Job portal with Supabase and Prisma',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
