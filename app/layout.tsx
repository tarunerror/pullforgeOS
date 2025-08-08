import type { Metadata } from 'next'
import './globals.css'
import PullforgeFavicon from '@/components/PullforgeFavicon'

export const metadata: Metadata = {
  title: 'Pullforge OS - Your Browser-Based Operating System',
  description: 'A powerful browser-based OS with AI agents, code editor, terminal, and development tools',
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
      <body className="bg-os-bg text-os-text font-mono overflow-hidden">
        {children}
      </body>
    </html>
  )
}
