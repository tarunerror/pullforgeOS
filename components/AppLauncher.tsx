'use client'

import React, { useState } from 'react'
import { useWindows } from '@/contexts/WindowContext'
import { Terminal, Code, MessageSquare, FolderOpen, Grid3X3, X } from 'lucide-react'

const apps = [
  {
    id: 'terminal',
    name: 'Terminal',
    icon: Terminal,
    component: 'terminal',
    description: 'Browser-based terminal with WebContainer',
    defaultSize: { width: 800, height: 500 },
    defaultPosition: { x: 100, y: 100 },
  },
  {
    id: 'code-editor',
    name: 'Code Editor',
    icon: Code,
    component: 'code-editor',
    description: 'Monaco-based code editor with AI assistance',
    defaultSize: { width: 1000, height: 600 },
    defaultPosition: { x: 150, y: 50 },
  },
  {
    id: 'chat',
    name: 'AI Chat',
    icon: MessageSquare,
    component: 'chat',
    description: 'Chat with AI agents for coding, design, and more',
    defaultSize: { width: 600, height: 500 },
    defaultPosition: { x: 200, y: 150 },
  },
  {
    id: 'file-explorer',
    name: 'File Explorer',
    icon: FolderOpen,
    component: 'file-explorer',
    description: 'Browse, upload, and manage files',
    defaultSize: { width: 700, height: 500 },
    defaultPosition: { x: 250, y: 100 },
  },
]

export default function AppLauncher() {
  const [isOpen, setIsOpen] = useState(false)
  const { openWindow } = useWindows()

  const launchApp = (app: typeof apps[0]) => {
    openWindow({
      title: app.name,
      component: app.component,
      isMinimized: false,
      isMaximized: false,
      position: app.defaultPosition,
      size: app.defaultSize,
    })
    setIsOpen(false)
  }

  return (
    <div className="relative">
      {/* App Launcher Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 bg-os-surface/80 backdrop-blur-sm border border-os-border rounded-lg flex items-center justify-center hover:bg-os-surface transition-colors shadow-lg"
      >
        <Grid3X3 size={20} className="text-os-text" />
      </button>

      {/* App Grid */}
      {isOpen && (
        <div className="absolute top-14 left-0 w-80 bg-os-surface/95 backdrop-blur-sm border border-os-border rounded-lg shadow-2xl p-4 z-50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-os-text font-semibold">Applications</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-os-border rounded transition-colors"
            >
              <X size={16} className="text-os-text-muted" />
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            {apps.map((app) => {
              const IconComponent = app.icon
              return (
                <button
                  key={app.id}
                  onClick={() => launchApp(app)}
                  className="flex flex-col items-center p-3 rounded-lg hover:bg-os-border/50 transition-colors group"
                >
                  <div className="w-12 h-12 bg-os-accent/20 rounded-lg flex items-center justify-center mb-2 group-hover:bg-os-accent/30 transition-colors">
                    <IconComponent size={24} className="text-os-accent" />
                  </div>
                  <span className="text-sm font-medium text-os-text">{app.name}</span>
                  <span className="text-xs text-os-text-muted text-center mt-1 leading-tight">
                    {app.description}
                  </span>
                </button>
              )
            })}
          </div>

          <div className="mt-4 pt-3 border-t border-os-border">
            <div className="text-xs text-os-text-muted text-center">
              AI OS v0.1.0 - Browser-Based Operating System
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
