import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { WindowProvider } from '@/contexts/WindowContext'
import { AuthProvider } from '@/components/AuthProvider'
import PullforgeFavicon from '@/components/PullforgeFavicon'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Pullforge OS',
  description: 'Browser-based development environment with AI assistance',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <PullforgeFavicon />
      </head>
      <body className={`${inter.className} bg-os-bg text-os-text font-mono overflow-hidden`}>
        <AuthProvider>
          <WindowProvider>
            {children}
          </WindowProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
