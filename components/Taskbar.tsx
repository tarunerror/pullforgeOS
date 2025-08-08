'use client'

import React from 'react'
import { useWindows } from '@/contexts/WindowContext'
import { Terminal, Code, MessageSquare, FolderOpen, Clock } from 'lucide-react'
import PullforgeLogoAnimated from './PullforgeLogoAnimated'

export default function Taskbar() {
  const { windows, restoreWindow, focusWindow } = useWindows()

  const getIcon = (component: string) => {
    switch (component) {
      case 'terminal':
        return <Terminal size={16} />
      case 'code-editor':
        return <Code size={16} />
      case 'chat':
        return <MessageSquare size={16} />
      case 'file-explorer':
        return <FolderOpen size={16} />
      default:
        return <div className="w-4 h-4 bg-os-accent rounded" />
    }
  }

  const currentTime = new Date().toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  })

  return (
    <div className="fixed bottom-0 left-0 right-0 h-14 bg-os-surface/70 backdrop-blur-xl border-t border-os-border/30 flex items-center justify-between px-6 z-50" style={{
      background: 'rgba(45, 45, 45, 0.8)',
      backdropFilter: 'blur(20px)',
      borderTop: '1px solid rgba(64, 64, 64, 0.3)',
      boxShadow: '0 -10px 25px -5px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
    }}>
      {/* Start Menu / Logo */}
      <div className="flex items-center space-x-3 group cursor-pointer">
        <PullforgeLogoAnimated size={40} />
        <div className="flex flex-col">
          <span className="text-os-text font-bold text-lg tracking-wide group-hover:text-blue-400 transition-colors leading-tight">Pullforge</span>
          <span className="text-os-text-muted text-xs tracking-wider group-hover:text-blue-300 transition-colors leading-tight">OS</span>
        </div>
      </div>

      {/* Window Tasks */}
      <div className="flex items-center space-x-2 flex-1 justify-center">
        {windows.map((window) => (
          <button
            key={window.id}
            onClick={() => {
              if (window.isMinimized) {
                restoreWindow(window.id)
              } else {
                focusWindow(window.id)
              }
            }}
            className={`group flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-300 hover:scale-105 ${
              window.isMinimized 
                ? 'bg-os-border/30 text-os-text-muted hover:bg-os-border/50' 
                : 'bg-gradient-to-r from-os-accent/20 to-blue-500/20 text-os-text border border-os-accent/40 shadow-lg hover:shadow-blue-500/25'
            }`}
          >
            <div className="transition-transform duration-200 group-hover:scale-110">
              {getIcon(window.component)}
            </div>
            <span className="text-sm max-w-28 truncate font-medium">{window.title}</span>
            {!window.isMinimized && (
              <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
            )}
          </button>
        ))}
      </div>

      {/* System Tray */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2 text-os-text-muted bg-os-border/20 px-3 py-2 rounded-lg backdrop-blur-sm">
          <Clock size={16} className="text-blue-400" />
          <span className="text-sm font-mono font-medium">{currentTime}</span>
        </div>
      </div>
    </div>
  )
}
