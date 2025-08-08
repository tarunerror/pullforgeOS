'use client'

import React, { useRef, useEffect } from 'react'
import Draggable from 'react-draggable'
import { ResizableBox } from 'react-resizable'
import { useWindows, WindowData } from '@/contexts/WindowContext'
import { X, Minus, Square, Maximize2 } from 'lucide-react'
import Terminal from '@/apps/terminal/Terminal'
import CodeEditor from '@/apps/code-editor/CodeEditor'
import Chat from '@/apps/chat/Chat'
import FileExplorer from '@/apps/file-explorer/FileExplorer'

interface WindowProps {
  windowData: WindowData
}

const componentMap = {
  terminal: Terminal,
  'code-editor': CodeEditor,
  chat: Chat,
  'file-explorer': FileExplorer,
}

export default function Window({ windowData }: WindowProps) {
  const { closeWindow, minimizeWindow, maximizeWindow, focusWindow, updateWindow } = useWindows()
  const windowRef = useRef<HTMLDivElement>(null)
  const Component = componentMap[windowData.component as keyof typeof componentMap]

  useEffect(() => {
    if (windowRef.current) {
      windowRef.current.focus()
    }
  }, [])

  if (windowData.isMinimized) {
    return null
  }

  const handleDrag = (e: any, data: any) => {
    updateWindow(windowData.id, {
      position: { x: data.x, y: data.y }
    })
  }

  const handleResize = (e: any, { size }: any) => {
    updateWindow(windowData.id, {
      size: { width: size.width, height: size.height }
    })
  }

  const windowStyle = {
    zIndex: windowData.zIndex,
    ...(windowData.isMaximized && {
      position: 'fixed' as const,
      top: 0,
      left: 0,
      width: '100vw',
      height: 'calc(100vh - 60px)',
    })
  }

  const WindowContent = (
    <div
      ref={windowRef}
      className="window-enter bg-os-surface/80 backdrop-blur-xl border border-os-border/50 rounded-xl shadow-2xl overflow-hidden transition-all duration-300 hover:shadow-blue-500/20 hover:shadow-2xl"
      style={{
        ...windowStyle,
        background: 'rgba(45, 45, 45, 0.85)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(64, 64, 64, 0.3)',
        boxShadow: `
          0 25px 50px -12px rgba(0, 0, 0, 0.5),
          0 0 0 1px rgba(255, 255, 255, 0.05),
          inset 0 1px 0 rgba(255, 255, 255, 0.1)
        `
      }}
      onClick={() => focusWindow(windowData.id)}
    >
      {/* Window Header */}
      <div className="flex items-center justify-between bg-gradient-to-r from-os-surface/90 to-os-surface/70 backdrop-blur-sm border-b border-os-border/30 px-4 py-3 cursor-move">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-400 transition-colors cursor-pointer shadow-sm hover:shadow-red-500/50" />
            <div className="w-3 h-3 rounded-full bg-yellow-500 hover:bg-yellow-400 transition-colors cursor-pointer shadow-sm hover:shadow-yellow-500/50" />
            <div className="w-3 h-3 rounded-full bg-green-500 hover:bg-green-400 transition-colors cursor-pointer shadow-sm hover:shadow-green-500/50" />
          </div>
          <span className="text-sm font-medium text-os-text/90 tracking-wide">{windowData.title}</span>
        </div>
        
        <div className="flex items-center space-x-1">
          <button
            onClick={(e) => {
              e.stopPropagation()
              minimizeWindow(windowData.id)
            }}
            className="p-2 hover:bg-os-border/50 rounded-md transition-all duration-200 hover:scale-110 group"
          >
            <Minus size={14} className="text-os-text-muted group-hover:text-os-text transition-colors" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              maximizeWindow(windowData.id)
            }}
            className="p-2 hover:bg-os-border/50 rounded-md transition-all duration-200 hover:scale-110 group"
          >
            {windowData.isMaximized ? 
              <Square size={14} className="text-os-text-muted group-hover:text-os-text transition-colors" /> : 
              <Maximize2 size={14} className="text-os-text-muted group-hover:text-os-text transition-colors" />
            }
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              closeWindow(windowData.id)
            }}
            className="p-2 hover:bg-red-500/20 rounded-md transition-all duration-200 hover:scale-110 group"
          >
            <X size={14} className="text-os-text-muted group-hover:text-red-400 transition-colors" />
          </button>
        </div>
      </div>

      {/* Window Content */}
      <div className="flex-1 overflow-hidden" style={{ height: 'calc(100% - 40px)' }}>
        {Component ? <Component windowId={windowData.id} data={windowData.data} /> : (
          <div className="flex items-center justify-center h-full text-os-text-muted">
            Component "{windowData.component}" not found
          </div>
        )}
      </div>
    </div>
  )

  if (windowData.isMaximized) {
    return WindowContent
  }

  return (
    <Draggable
      handle=".cursor-move"
      position={windowData.position}
      onDrag={handleDrag}
      bounds="parent"
    >
      <div style={{ position: 'absolute' }}>
        <ResizableBox
          width={windowData.size.width}
          height={windowData.size.height}
          onResize={handleResize}
          minConstraints={[300, 200]}
          maxConstraints={[window?.innerWidth || 1200, window?.innerHeight - 100 || 800]}
          resizeHandles={['se', 'e', 's', 'w', 'n', 'sw', 'ne', 'nw']}
        >
          {WindowContent}
        </ResizableBox>
      </div>
    </Draggable>
  )
}
