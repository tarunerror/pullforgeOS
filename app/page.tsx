'use client'

import Desktop from '@/components/Desktop'
import { WindowProvider } from '@/contexts/WindowContext'

export default function Home() {
  return (
    <WindowProvider>
      <Desktop />
    </WindowProvider>
  )
}
