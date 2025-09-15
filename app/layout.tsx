// app/layout.tsx
import '@/styles/globals.css'
import { ReactNode } from 'react'
import { ThemeProvider } from '@/components/theme-provider'
import { ClerkProvider } from '@clerk/nextjs'

export const metadata = {
  title: 'Qatar Seeker',
  description: 'Job portal with Clerk authentication',
}

/**
 * Root layout component that wraps the entire application
 * Provides Clerk authentication context and theme support
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className="min-h-screen bg-background text-foreground antialiased">
          <ThemeProvider>

            {children}
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
