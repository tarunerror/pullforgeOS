'use client'

import React, { useEffect, useRef, useState } from 'react'
import { Terminal as XTerm } from 'xterm'
import { FitAddon } from 'xterm-addon-fit'
import { WebLinksAddon } from 'xterm-addon-web-links'
import { WebContainer } from '@webcontainer/api'

interface TerminalProps {
  windowId: string
  data?: any
}

export default function Terminal({ windowId }: TerminalProps) {
  const terminalRef = useRef<HTMLDivElement>(null)
  const xtermRef = useRef<XTerm | null>(null)
  const fitAddonRef = useRef<FitAddon | null>(null)
  const webcontainerRef = useRef<WebContainer | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!terminalRef.current) return

    const initTerminal = async () => {
      try {
        // Initialize XTerm
        const terminal = new XTerm({
          theme: {
            background: '#1a1a1a',
            foreground: '#e5e5e5',
            cursor: '#3b82f6',
            selection: '#3b82f6',
            black: '#1a1a1a',
            red: '#ef4444',
            green: '#22c55e',
            yellow: '#eab308',
            blue: '#3b82f6',
            magenta: '#a855f7',
            cyan: '#06b6d4',
            white: '#f5f5f5',
            brightBlack: '#404040',
            brightRed: '#f87171',
            brightGreen: '#4ade80',
            brightYellow: '#facc15',
            brightBlue: '#60a5fa',
            brightMagenta: '#c084fc',
            brightCyan: '#22d3ee',
            brightWhite: '#ffffff',
          },
          fontFamily: 'JetBrains Mono, Monaco, Consolas, monospace',
          fontSize: 14,
          lineHeight: 1.2,
          cursorBlink: true,
          allowTransparency: true,
        })

        const fitAddon = new FitAddon()
        const webLinksAddon = new WebLinksAddon()

        terminal.loadAddon(fitAddon)
        terminal.loadAddon(webLinksAddon)

        terminal.open(terminalRef.current)
        fitAddon.fit()

        xtermRef.current = terminal
        fitAddonRef.current = fitAddon

        // Initialize WebContainer
        terminal.writeln('🚀 Initializing AI OS Terminal...')
        terminal.writeln('📦 Starting WebContainer environment...')
        
        try {
          const webcontainerInstance = await WebContainer.boot()
          webcontainerRef.current = webcontainerInstance

          terminal.writeln('✅ WebContainer ready!')
          terminal.writeln('💡 You can now run Node.js, npm, git, and other commands')
          terminal.writeln('')

          // Set up shell process
          const shellProcess = await webcontainerInstance.spawn('jsh', {
            terminal: {
              cols: terminal.cols,
              rows: terminal.rows,
            },
          })

          shellProcess.output.pipeTo(
            new WritableStream({
              write(data) {
                terminal.write(data)
              },
            })
          )

          const input = shellProcess.input.getWriter()

          terminal.onData((data) => {
            input.write(data)
          })

          // Handle terminal resize
          terminal.onResize(({ cols, rows }) => {
            shellProcess.resize({ cols, rows })
          })

          setIsLoading(false)
        } catch (containerError) {
          console.error('WebContainer initialization failed:', containerError)
          terminal.writeln('❌ WebContainer failed to initialize')
          terminal.writeln('⚠️  Falling back to basic terminal mode')
          terminal.writeln('')
          
          // Fallback: Basic terminal simulation
          let currentPath = '~'
          terminal.write(`user@ai-os:${currentPath}$ `)

          terminal.onData((data) => {
            if (data === '\r') {
              terminal.writeln('')
              terminal.write(`user@ai-os:${currentPath}$ `)
            } else if (data === '\u007f') { // Backspace
              terminal.write('\b \b')
            } else {
              terminal.write(data)
            }
          })

          setIsLoading(false)
        }

      } catch (err) {
        console.error('Terminal initialization failed:', err)
        setError('Failed to initialize terminal')
        setIsLoading(false)
      }
    }

    initTerminal()

    // Handle window resize
    const handleResize = () => {
      if (fitAddonRef.current) {
        setTimeout(() => {
          fitAddonRef.current?.fit()
        }, 100)
      }
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      if (xtermRef.current) {
        xtermRef.current.dispose()
      }
      if (webcontainerRef.current) {
        webcontainerRef.current.teardown()
      }
    }
  }, [])

  // Handle window resize when parent window is resized
  useEffect(() => {
    const resizeObserver = new ResizeObserver(() => {
      if (fitAddonRef.current) {
        setTimeout(() => {
          fitAddonRef.current?.fit()
        }, 100)
      }
    })

    if (terminalRef.current) {
      resizeObserver.observe(terminalRef.current)
    }

    return () => {
      resizeObserver.disconnect()
    }
  }, [])

  if (error) {
    return (
      <div className="flex items-center justify-center h-full bg-os-bg text-red-400">
        <div className="text-center">
          <div className="text-2xl mb-2">⚠️</div>
          <div>Terminal Error</div>
          <div className="text-sm text-os-text-muted mt-1">{error}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full bg-os-bg relative">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-os-bg/80 backdrop-blur-sm z-10">
          <div className="text-center">
            <div className="animate-spin w-6 h-6 border-2 border-os-accent border-t-transparent rounded-full mx-auto mb-2"></div>
            <div className="text-os-text-muted">Initializing Terminal...</div>
          </div>
        </div>
      )}
      <div
        ref={terminalRef}
        className="h-full w-full p-2"
        style={{ fontFamily: 'JetBrains Mono, Monaco, Consolas, monospace' }}
      />
    </div>
  )
}
