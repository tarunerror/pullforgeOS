'use client'

import React, { useState, useRef, useEffect } from 'react'
import Editor from '@monaco-editor/react'
import { FolderOpen, File, Save, Play, Bot, Settings } from 'lucide-react'
import openRouterService from '@/services/openrouter'

interface CodeEditorProps {
  windowId: string
  data?: any
}

interface FileItem {
  name: string
  path: string
  type: 'file' | 'folder'
  content?: string
  children?: FileItem[]
}

export default function CodeEditor({ windowId }: CodeEditorProps) {
  const [files, setFiles] = useState<FileItem[]>([
    {
      name: 'example.js',
      path: '/example.js',
      type: 'file',
      content: `// Welcome to AI OS Code Editor
// This is a Monaco-based editor with AI assistance

function greetUser(name) {
  console.log(\`Hello, \${name}! Welcome to AI OS.\`);
  return \`Welcome to the future of coding, \${name}!\`;
}

// Try the AI assistant by clicking the Bot icon
const message = greetUser('Developer');
console.log(message);

// Features:
// - Syntax highlighting
// - IntelliSense
// - AI code assistance
// - Live preview (coming soon)
// - Git integration (coming soon)
`,
    },
    {
      name: 'README.md',
      path: '/README.md',
      type: 'file',
      content: `# AI OS Code Editor

A powerful Monaco-based code editor with AI assistance.

## Features

- 🎨 Syntax highlighting for multiple languages
- 🧠 AI-powered code completion and suggestions
- 📁 File explorer with project management
- 🔍 Advanced search and replace
- 🚀 Live preview for web projects
- 📝 Markdown support
- 🔧 Integrated terminal access

## Getting Started

1. Open files from the file explorer
2. Start coding with full IntelliSense support
3. Use the AI assistant for code explanations and refactoring
4. Save your work and see live previews

Happy coding! 🚀
`,
    },
  ])
  
  const [activeFile, setActiveFile] = useState<FileItem | null>(files[0])
  const [showAIAssistant, setShowAIAssistant] = useState(false)
  const [aiPrompt, setAiPrompt] = useState('')
  const editorRef = useRef<any>(null)

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor
    
    // Configure Monaco theme
    monaco.editor.defineTheme('ai-os-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '6A9955' },
        { token: 'keyword', foreground: '569CD6' },
        { token: 'string', foreground: 'CE9178' },
        { token: 'number', foreground: 'B5CEA8' },
      ],
      colors: {
        'editor.background': '#1a1a1a',
        'editor.foreground': '#e5e5e5',
        'editorCursor.foreground': '#3b82f6',
        'editor.lineHighlightBackground': '#2d2d2d',
        'editorLineNumber.foreground': '#858585',
        'editor.selectionBackground': '#3b82f650',
      },
    })
    
    monaco.editor.setTheme('ai-os-dark')
  }

  const handleFileSelect = (file: FileItem) => {
    setActiveFile(file)
  }

  const handleEditorChange = (value: string | undefined) => {
    if (activeFile && value !== undefined) {
      setFiles(prev => prev.map(file => 
        file.path === activeFile.path 
          ? { ...file, content: value }
          : file
      ))
      setActiveFile(prev => prev ? { ...prev, content: value } : null)
    }
  }

  const handleSave = () => {
    if (activeFile) {
      // In a real implementation, this would save to the file system
      console.log('Saving file:', activeFile.path)
      // Show save confirmation
      const event = new CustomEvent('show-notification', {
        detail: { message: `Saved ${activeFile.name}`, type: 'success' }
      })
      window.dispatchEvent(event)
    }
  }

  const handleRunCode = () => {
    if (activeFile && activeFile.name.endsWith('.js')) {
      try {
        // Basic JavaScript execution (be careful with this in production)
        const result = eval(activeFile.content || '')
        console.log('Code execution result:', result)
      } catch (error) {
        console.error('Code execution error:', error)
      }
    }
  }

  const getLanguageFromFileName = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase()
    switch (ext) {
      case 'js': return 'javascript'
      case 'ts': return 'typescript'
      case 'jsx': return 'javascript'
      case 'tsx': return 'typescript'
      case 'py': return 'python'
      case 'html': return 'html'
      case 'css': return 'css'
      case 'json': return 'json'
      case 'md': return 'markdown'
      case 'yml':
      case 'yaml': return 'yaml'
      default: return 'plaintext'
    }
  }

  return (
    <div className="h-full flex bg-os-bg">
      {/* File Explorer Sidebar */}
      <div className="w-64 bg-os-surface border-r border-os-border flex flex-col">
        <div className="p-3 border-b border-os-border">
          <h3 className="text-sm font-semibold text-os-text flex items-center">
            <FolderOpen size={16} className="mr-2" />
            Explorer
          </h3>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {files.map((file) => (
            <button
              key={file.path}
              onClick={() => handleFileSelect(file)}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-os-border/50 transition-colors flex items-center ${
                activeFile?.path === file.path ? 'bg-os-accent/20 text-os-accent' : 'text-os-text'
              }`}
            >
              <File size={14} className="mr-2 flex-shrink-0" />
              <span className="truncate">{file.name}</span>
            </button>
          ))}
        </div>

        <div className="p-3 border-t border-os-border">
          <button className="w-full px-3 py-2 text-sm bg-os-accent/20 hover:bg-os-accent/30 rounded transition-colors text-os-accent">
            + New File
          </button>
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1 flex flex-col">
        {/* Editor Toolbar */}
        <div className="h-10 bg-os-surface border-b border-os-border flex items-center justify-between px-4">
          <div className="flex items-center space-x-2">
            {activeFile && (
              <span className="text-sm text-os-text flex items-center">
                <File size={14} className="mr-1" />
                {activeFile.name}
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={handleSave}
              className="p-1.5 hover:bg-os-border rounded transition-colors text-os-text-muted hover:text-os-text"
              title="Save (Ctrl+S)"
            >
              <Save size={16} />
            </button>
            <button
              onClick={handleRunCode}
              className="p-1.5 hover:bg-os-border rounded transition-colors text-os-text-muted hover:text-os-text"
              title="Run Code"
            >
              <Play size={16} />
            </button>
            <button
              onClick={() => setShowAIAssistant(!showAIAssistant)}
              className={`p-1.5 hover:bg-os-border rounded transition-colors ${
                showAIAssistant ? 'text-os-accent bg-os-accent/20' : 'text-os-text-muted hover:text-os-text'
              }`}
              title="AI Assistant"
            >
              <Bot size={16} />
            </button>
            <button
              className="p-1.5 hover:bg-os-border rounded transition-colors text-os-text-muted hover:text-os-text"
              title="Settings"
            >
              <Settings size={16} />
            </button>
          </div>
        </div>

        <div className="flex-1 flex">
          {/* Monaco Editor */}
          <div className="flex-1">
            {activeFile ? (
              <Editor
                height="100%"
                language={getLanguageFromFileName(activeFile.name)}
                value={activeFile.content}
                onChange={handleEditorChange}
                onMount={handleEditorDidMount}
                options={{
                  minimap: { enabled: true },
                  fontSize: 14,
                  lineNumbers: 'on',
                  roundedSelection: false,
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  tabSize: 2,
                  insertSpaces: true,
                  wordWrap: 'on',
                  bracketPairColorization: { enabled: true },
                  guides: {
                    indentation: true,
                    bracketPairs: true,
                  },
                }}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-os-text-muted">
                <div className="text-center">
                  <File size={48} className="mx-auto mb-4 opacity-50" />
                  <div>Select a file to start editing</div>
                </div>
              </div>
            )}
          </div>

          {/* AI Assistant Sidebar */}
          {showAIAssistant && (
            <div className="w-80 bg-os-surface border-l border-os-border flex flex-col">
              <div className="p-3 border-b border-os-border">
                <h3 className="text-sm font-semibold text-os-text flex items-center">
                  <Bot size={16} className="mr-2 text-os-accent" />
                  AI Assistant
                </h3>
              </div>
              
              <div className="flex-1 p-3 overflow-y-auto">
                <div className="space-y-3">
                  <div className="bg-os-bg rounded-lg p-3">
                    <div className="text-xs text-os-text-muted mb-1">AI Assistant</div>
                    <div className="text-sm text-os-text">
                      👋 Hi! I'm your AI coding assistant. I can help you:
                      <ul className="mt-2 space-y-1 text-xs">
                        <li>• Explain code snippets</li>
                        <li>• Suggest improvements</li>
                        <li>• Debug issues</li>
                        <li>• Generate code</li>
                        <li>• Refactor functions</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="bg-os-accent/10 rounded-lg p-3">
                    <div className="text-xs text-os-accent mb-1">Quick Actions</div>
                    <div className="space-y-2">
                      <button className="w-full text-left text-xs bg-os-bg hover:bg-os-border/50 rounded p-2 transition-colors">
                        Explain selected code
                      </button>
                      <button className="w-full text-left text-xs bg-os-bg hover:bg-os-border/50 rounded p-2 transition-colors">
                        Optimize this function
                      </button>
                      <button className="w-full text-left text-xs bg-os-bg hover:bg-os-border/50 rounded p-2 transition-colors">
                        Add error handling
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-3 border-t border-os-border">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="Ask AI anything..."
                    className="flex-1 px-3 py-2 text-sm bg-os-bg border border-os-border rounded focus:outline-none focus:border-os-accent"
                  />
                  <button className="px-3 py-2 bg-os-accent text-white text-sm rounded hover:bg-os-accent/80 transition-colors">
                    Send
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
