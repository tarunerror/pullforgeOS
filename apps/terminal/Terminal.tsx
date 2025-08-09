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
        // Enhanced fallback terminal function
        const initFallbackTerminal = (terminal: XTerm) => {
          let currentPath = '~/pullforge-os'
          let commandHistory: string[] = []
          let historyIndex = -1
          let currentCommand = ''
          
          const showPrompt = () => {
            terminal.write(`\r\n\x1b[32muser@pullforge-os\x1b[0m:\x1b[34m${currentPath}\x1b[0m$ `)
          }
          
          const executeCommand = (cmd: string) => {
            const trimmedCmd = cmd.trim()
            if (!trimmedCmd) return
            
            commandHistory.unshift(trimmedCmd)
            if (commandHistory.length > 50) commandHistory.pop()
            
            const [command, ...args] = trimmedCmd.split(' ')
            
            switch (command.toLowerCase()) {
              case 'help':
                terminal.writeln('\r\n📚 Available commands:')
                terminal.writeln('  help          - Show this help message')
                terminal.writeln('  ls            - List directory contents')
                terminal.writeln('  pwd           - Show current directory')
                terminal.writeln('  cd <dir>      - Change directory')
                terminal.writeln('  clear         - Clear terminal')
                terminal.writeln('  echo <text>   - Echo text')
                terminal.writeln('  date          - Show current date/time')
                terminal.writeln('  whoami        - Show current user')
                terminal.writeln('  uname         - Show system info')
                terminal.writeln('  node --version - Show Node.js version (simulated)')
                terminal.writeln('  npm --version  - Show npm version (simulated)')
                break
                
              case 'ls':
                terminal.writeln('\r\n📁 Directory contents:')
                terminal.writeln('  \x1b[34mapps/\x1b[0m          - Application components')
                terminal.writeln('  \x1b[34mcomponents/\x1b[0m   - React components')
                terminal.writeln('  \x1b[34mservices/\x1b[0m     - API services')
                terminal.writeln('  \x1b[32mpackage.json\x1b[0m  - Project configuration')
                terminal.writeln('  \x1b[32mREADME.md\x1b[0m     - Project documentation')
                break
                
              case 'pwd':
                terminal.writeln(`\r\n${currentPath}`)
                break
                
              case 'cd':
                if (args.length === 0) {
                  currentPath = '~'
                } else if (args[0] === '..') {
                  const pathParts = currentPath.split('/')
                  if (pathParts.length > 1) {
                    pathParts.pop()
                    currentPath = pathParts.join('/') || '~'
                  }
                } else {
                  currentPath = currentPath === '~' ? `~/${args[0]}` : `${currentPath}/${args[0]}`
                }
                break
                
              case 'clear':
                terminal.clear()
                terminal.writeln('🚀 Pullforge OS Terminal (Enhanced Simulation Mode)')
                terminal.writeln('💡 Type "help" for available commands')
                break
                
              case 'echo':
                terminal.writeln(`\r\n${args.join(' ')}`)
                break
                
              case 'date':
                terminal.writeln(`\r\n${new Date().toString()}`)
                break
                
              case 'whoami':
                terminal.writeln('\r\nuser')
                break
                
              case 'uname':
                terminal.writeln('\r\nPullforge OS (Browser-based Development Environment)')
                break
                
              case 'node':
                if (args[0] === '--version') {
                  terminal.writeln('\r\nv18.17.0 (simulated)')
                } else {
                  terminal.writeln('\r\n⚠️  Node.js execution requires WebContainer')
                  terminal.writeln('💡 Try setting up HTTPS or check browser compatibility')
                }
                break
                
              case 'npm':
                if (args[0] === '--version') {
                  terminal.writeln('\r\n9.6.7 (simulated)')
                } else {
                  terminal.writeln('\r\n⚠️  npm commands require WebContainer')
                  terminal.writeln('💡 Try setting up HTTPS or check browser compatibility')
                }
                break
                
              default:
                terminal.writeln(`\r\n❌ Command not found: ${command}`)
                terminal.writeln('💡 Type "help" for available commands')
                break
            }
          }
          
          showPrompt()
          
          terminal.onData((data) => {
            const code = data.charCodeAt(0)
            
            if (code === 13) { // Enter
              executeCommand(currentCommand)
              currentCommand = ''
              historyIndex = -1
              showPrompt()
            } else if (code === 127) { // Backspace
              if (currentCommand.length > 0) {
                currentCommand = currentCommand.slice(0, -1)
                terminal.write('\b \b')
              }
            } else if (code === 27) { // Escape sequences (arrow keys)
              // Handle arrow keys for command history
              return
            } else if (code >= 32) { // Printable characters
              currentCommand += data
              terminal.write(data)
            }
          })
        }

        // Initialize XTerm
        const terminal = new XTerm({
          theme: {
            background: '#1a1a1a',
            foreground: '#e5e5e5',
            cursor: '#3b82f6',
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

        if (terminalRef.current) {
          terminal.open(terminalRef.current)
          fitAddon.fit()
        }

        xtermRef.current = terminal
        fitAddonRef.current = fitAddon

        // Initialize WebContainer with better error handling
        terminal.writeln('🚀 Initializing AI OS Terminal...')
        terminal.writeln('📦 Starting WebContainer environment...')
        
        // Check WebContainer compatibility first
        const isWebContainerSupported = () => {
          // Check if running in browser environment
          if (typeof window === 'undefined') return false
          
          // Check for required APIs
          const requiredAPIs = [
            'SharedArrayBuffer',
            'WebAssembly',
            'Worker',
            'MessageChannel'
          ]
          
          for (const api of requiredAPIs) {
            if (!(api in window)) {
              terminal.writeln(`❌ Missing required API: ${api}`)
              return false
            }
          }
          
          // Check for HTTPS or localhost
          const isSecureContext = window.location.protocol === 'https:' || 
                                 window.location.hostname === 'localhost' ||
                                 window.location.hostname === '127.0.0.1'
          
          if (!isSecureContext) {
            terminal.writeln('❌ WebContainer requires HTTPS or localhost')
            return false
          }
          
          return true
        }

        if (!isWebContainerSupported()) {
          terminal.writeln('⚠️  WebContainer not supported in this environment')
          terminal.writeln('📝 Falling back to enhanced terminal simulation')
          terminal.writeln('')
          
          // Enhanced fallback terminal
          initFallbackTerminal(terminal)
          setIsLoading(false)
          return
        }
        
        try {
          // Add timeout for WebContainer initialization
          const webcontainerPromise = WebContainer.boot()
          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('WebContainer initialization timeout')), 15000)
          })
          
          const webcontainerInstance = await Promise.race([webcontainerPromise, timeoutPromise]) as WebContainer
          webcontainerRef.current = webcontainerInstance

          terminal.writeln('✅ WebContainer ready!')
          terminal.writeln('💡 You can now run Node.js, npm, git, and other commands')
          terminal.writeln('📁 Type "ls" to see files, "node --version" to check Node.js')
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
        } catch (containerError: any) {
          console.error('WebContainer initialization failed:', containerError)
          terminal.writeln('❌ WebContainer failed to initialize')
          terminal.writeln(`💥 Error: ${containerError.message}`)
          terminal.writeln('📝 Falling back to enhanced terminal simulation')
          terminal.writeln('')
          
          // Enhanced fallback terminal
          initFallbackTerminal(terminal)
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
