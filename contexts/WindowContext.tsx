'use client'

import React, { createContext, useContext, useState, useCallback } from 'react'

export interface WindowData {
  id: string
  title: string
  component: string
  isMinimized: boolean
  isMaximized: boolean
  position: { x: number; y: number }
  size: { width: number; height: number }
  zIndex: number
  data?: any
}

interface WindowContextType {
  windows: WindowData[]
  activeWindowId: string | null
  openWindow: (window: Omit<WindowData, 'id' | 'zIndex'>) => string
  closeWindow: (id: string) => void
  minimizeWindow: (id: string) => void
  maximizeWindow: (id: string) => void
  restoreWindow: (id: string) => void
  focusWindow: (id: string) => void
  updateWindow: (id: string, updates: Partial<WindowData>) => void
}

const WindowContext = createContext<WindowContextType | undefined>(undefined)

export function WindowProvider({ children }: { children: React.ReactNode }) {
  const [windows, setWindows] = useState<WindowData[]>([])
  const [activeWindowId, setActiveWindowId] = useState<string | null>(null)
  const [nextZIndex, setNextZIndex] = useState(1000)

  const openWindow = useCallback((windowData: Omit<WindowData, 'id' | 'zIndex'>) => {
    const id = `window-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const newWindow: WindowData = {
      ...windowData,
      id,
      zIndex: nextZIndex,
    }
    
    setWindows(prev => [...prev, newWindow])
    setActiveWindowId(id)
    setNextZIndex(prev => prev + 1)
    
    return id
  }, [nextZIndex])

  const closeWindow = useCallback((id: string) => {
    setWindows(prev => prev.filter(w => w.id !== id))
    setActiveWindowId(prev => prev === id ? null : prev)
  }, [])

  const minimizeWindow = useCallback((id: string) => {
    setWindows(prev => prev.map(w => 
      w.id === id ? { ...w, isMinimized: true } : w
    ))
  }, [])

  const maximizeWindow = useCallback((id: string) => {
    setWindows(prev => prev.map(w => 
      w.id === id ? { 
        ...w, 
        isMaximized: !w.isMaximized,
        position: w.isMaximized ? w.position : { x: 0, y: 0 },
        size: w.isMaximized ? w.size : { width: window.innerWidth, height: window.innerHeight - 60 }
      } : w
    ))
  }, [])

  const restoreWindow = useCallback((id: string) => {
    setWindows(prev => prev.map(w => 
      w.id === id ? { ...w, isMinimized: false } : w
    ))
    setActiveWindowId(id)
  }, [])

  const focusWindow = useCallback((id: string) => {
    setWindows(prev => prev.map(w => 
      w.id === id ? { ...w, zIndex: nextZIndex } : w
    ))
    setActiveWindowId(id)
    setNextZIndex(prev => prev + 1)
  }, [nextZIndex])

  const updateWindow = useCallback((id: string, updates: Partial<WindowData>) => {
    setWindows(prev => prev.map(w => 
      w.id === id ? { ...w, ...updates } : w
    ))
  }, [])

  return (
    <WindowContext.Provider value={{
      windows,
      activeWindowId,
      openWindow,
      closeWindow,
      minimizeWindow,
      maximizeWindow,
      restoreWindow,
      focusWindow,
      updateWindow,
    }}>
      {children}
    </WindowContext.Provider>
  )
}

export function useWindows() {
  const context = useContext(WindowContext)
  if (context === undefined) {
    throw new Error('useWindows must be used within a WindowProvider')
  }
  return context
}
