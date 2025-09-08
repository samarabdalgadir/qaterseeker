// app/layout.tsx
import '@/styles/globals.css'
import { ClerkProvider } from '@clerk/nextjs'
import { ReactNode } from 'react'

export const metadata = {
  title: 'Qatar Seeker',
  description: 'Job portal with Clerk and Prisma',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ClerkProvider>
          {children} {/* هذا يمثل جميع صفحاتك */}
        </ClerkProvider>
      </body>
    </html>
  )
}
