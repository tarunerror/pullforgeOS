'use client'

import React, { useState, useRef } from 'react'
import { 
  Folder, 
  File, 
  Upload, 
  Download, 
  Trash2, 
  Edit3, 
  Plus, 
  Search,
  Grid,
  List,
  MoreVertical,
  FileText,
  Image,
  Code,
  Archive
} from 'lucide-react'

interface FileExplorerProps {
  windowId: string
  data?: any
}

interface FileItem {
  id: string
  name: string
  type: 'file' | 'folder'
  size?: number
  modified: Date
  path: string
  children?: FileItem[]
  mimeType?: string
}

export default function FileExplorer({ windowId }: FileExplorerProps) {
  const [files, setFiles] = useState<FileItem[]>([
    {
      id: '1',
      name: 'Documents',
      type: 'folder',
      modified: new Date('2024-01-15'),
      path: '/Documents',
      children: [
        {
          id: '2',
          name: 'README.md',
          type: 'file',
          size: 1024,
          modified: new Date('2024-01-15'),
          path: '/Documents/README.md',
          mimeType: 'text/markdown',
        },
        {
          id: '3',
          name: 'project-notes.txt',
          type: 'file',
          size: 2048,
          modified: new Date('2024-01-14'),
          path: '/Documents/project-notes.txt',
          mimeType: 'text/plain',
        },
      ],
    },
    {
      id: '4',
      name: 'Projects',
      type: 'folder',
      modified: new Date('2024-01-16'),
      path: '/Projects',
      children: [
        {
          id: '5',
          name: 'ai-os-mvp',
          type: 'folder',
          modified: new Date('2024-01-16'),
          path: '/Projects/ai-os-mvp',
          children: [],
        },
        {
          id: '6',
          name: 'web-app',
          type: 'folder',
          modified: new Date('2024-01-10'),
          path: '/Projects/web-app',
          children: [],
        },
      ],
    },
    {
      id: '7',
      name: 'example.js',
      type: 'file',
      size: 1536,
      modified: new Date('2024-01-16'),
      path: '/example.js',
      mimeType: 'application/javascript',
    },
    {
      id: '8',
      name: 'screenshot.png',
      type: 'file',
      size: 245760,
      modified: new Date('2024-01-15'),
      path: '/screenshot.png',
      mimeType: 'image/png',
    },
  ])

  const [currentPath, setCurrentPath] = useState('/')
  const [selectedFiles, setSelectedFiles] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')
  const [searchQuery, setSearchQuery] = useState('')
  const [showContextMenu, setShowContextMenu] = useState<{ x: number; y: number; fileId?: string } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const getCurrentFiles = () => {
    if (currentPath === '/') {
      return files
    }
    
    const pathParts = currentPath.split('/').filter(Boolean)
    let current = files
    
    for (const part of pathParts) {
      const folder = current.find(f => f.name === part && f.type === 'folder')
      if (folder?.children) {
        current = folder.children
      } else {
        return []
      }
    }
    
    return current
  }

  const filteredFiles = getCurrentFiles().filter(file =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getFileIcon = (file: FileItem) => {
    if (file.type === 'folder') {
      return <Folder size={20} className="text-blue-400" />
    }
    
    const ext = file.name.split('.').pop()?.toLowerCase()
    switch (ext) {
      case 'js':
      case 'ts':
      case 'jsx':
      case 'tsx':
      case 'py':
      case 'html':
      case 'css':
        return <Code size={20} className="text-green-400" />
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'gif':
      case 'svg':
        return <Image size={20} className="text-purple-400" />
      case 'zip':
      case 'rar':
      case 'tar':
        return <Archive size={20} className="text-orange-400" />
      case 'md':
      case 'txt':
      case 'doc':
      case 'docx':
        return <FileText size={20} className="text-gray-400" />
      default:
        return <File size={20} className="text-gray-400" />
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  const handleFileClick = (file: FileItem) => {
    if (file.type === 'folder') {
      setCurrentPath(currentPath === '/' ? `/${file.name}` : `${currentPath}/${file.name}`)
    } else {
      // Open file in appropriate app
      console.log('Opening file:', file.path)
    }
  }

  const handleFileSelect = (fileId: string, isCtrlClick: boolean = false) => {
    if (isCtrlClick) {
      setSelectedFiles(prev => 
        prev.includes(fileId) 
          ? prev.filter(id => id !== fileId)
          : [...prev, fileId]
      )
    } else {
      setSelectedFiles([fileId])
    }
  }

  const handleUpload = () => {
    fileInputRef.current?.click()
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = Array.from(event.target.files || [])
    
    uploadedFiles.forEach(file => {
      const newFile: FileItem = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        name: file.name,
        type: 'file',
        size: file.size,
        modified: new Date(),
        path: currentPath === '/' ? `/${file.name}` : `${currentPath}/${file.name}`,
        mimeType: file.type,
      }
      
      // Add to current directory
      setFiles(prev => [...prev, newFile])
    })
    
    event.target.value = ''
  }

  const handleContextMenu = (e: React.MouseEvent, fileId?: string) => {
    e.preventDefault()
    setShowContextMenu({ x: e.clientX, y: e.clientY, fileId })
  }

  const navigateUp = () => {
    if (currentPath === '/') return
    const pathParts = currentPath.split('/').filter(Boolean)
    pathParts.pop()
    setCurrentPath(pathParts.length === 0 ? '/' : '/' + pathParts.join('/'))
  }

  const breadcrumbs = currentPath.split('/').filter(Boolean)

  return (
    <div className="h-full flex flex-col bg-os-bg">
      {/* Toolbar */}
      <div className="h-12 bg-os-surface border-b border-os-border flex items-center justify-between px-4">
        <div className="flex items-center space-x-2">
          <button
            onClick={navigateUp}
            disabled={currentPath === '/'}
            className="p-1.5 hover:bg-os-border rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ←
          </button>
          
          <div className="flex items-center space-x-1 text-sm text-os-text">
            <button
              onClick={() => setCurrentPath('/')}
              className="hover:bg-os-border px-2 py-1 rounded transition-colors"
            >
              Home
            </button>
            {breadcrumbs.map((crumb, index) => (
              <React.Fragment key={index}>
                <span className="text-os-text-muted">/</span>
                <button
                  onClick={() => setCurrentPath('/' + breadcrumbs.slice(0, index + 1).join('/'))}
                  className="hover:bg-os-border px-2 py-1 rounded transition-colors"
                >
                  {crumb}
                </button>
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-os-text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search files..."
              className="pl-10 pr-4 py-1.5 text-sm bg-os-bg border border-os-border rounded focus:outline-none focus:border-os-accent w-48"
            />
          </div>
          
          <div className="flex border border-os-border rounded overflow-hidden">
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 transition-colors ${viewMode === 'list' ? 'bg-os-accent text-white' : 'hover:bg-os-border'}`}
            >
              <List size={16} />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 transition-colors ${viewMode === 'grid' ? 'bg-os-accent text-white' : 'hover:bg-os-border'}`}
            >
              <Grid size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="h-10 bg-os-surface/50 border-b border-os-border flex items-center px-4 space-x-2">
        <button
          onClick={handleUpload}
          className="flex items-center space-x-1 px-3 py-1.5 text-sm bg-os-accent/20 hover:bg-os-accent/30 rounded transition-colors text-os-accent"
        >
          <Upload size={14} />
          <span>Upload</span>
        </button>
        
        <button className="flex items-center space-x-1 px-3 py-1.5 text-sm hover:bg-os-border rounded transition-colors text-os-text">
          <Plus size={14} />
          <span>New Folder</span>
        </button>
        
        {selectedFiles.length > 0 && (
          <>
            <div className="w-px h-6 bg-os-border" />
            <button className="flex items-center space-x-1 px-3 py-1.5 text-sm hover:bg-os-border rounded transition-colors text-os-text">
              <Download size={14} />
              <span>Download</span>
            </button>
            <button className="flex items-center space-x-1 px-3 py-1.5 text-sm hover:bg-red-600/20 rounded transition-colors text-red-400">
              <Trash2 size={14} />
              <span>Delete</span>
            </button>
          </>
        )}
      </div>

      {/* File List */}
      <div className="flex-1 overflow-auto p-4">
        {viewMode === 'list' ? (
          <div className="space-y-1">
            {filteredFiles.map((file) => (
              <div
                key={file.id}
                onClick={() => handleFileClick(file)}
                onContextMenu={(e) => handleContextMenu(e, file.id)}
                className={`flex items-center space-x-3 p-2 rounded hover:bg-os-surface transition-colors cursor-pointer ${
                  selectedFiles.includes(file.id) ? 'bg-os-accent/20 border border-os-accent/30' : ''
                }`}
              >
                <div className="flex-shrink-0">
                  {getFileIcon(file)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-os-text truncate">{file.name}</div>
                </div>
                <div className="text-xs text-os-text-muted w-20 text-right">
                  {file.type === 'file' && file.size ? formatFileSize(file.size) : '—'}
                </div>
                <div className="text-xs text-os-text-muted w-32 text-right">
                  {formatDate(file.modified)}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleContextMenu(e, file.id)
                  }}
                  className="p-1 hover:bg-os-border rounded transition-colors opacity-0 group-hover:opacity-100"
                >
                  <MoreVertical size={14} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-6 gap-4">
            {filteredFiles.map((file) => (
              <div
                key={file.id}
                onClick={() => handleFileClick(file)}
                onContextMenu={(e) => handleContextMenu(e, file.id)}
                className={`flex flex-col items-center p-3 rounded-lg hover:bg-os-surface transition-colors cursor-pointer ${
                  selectedFiles.includes(file.id) ? 'bg-os-accent/20 border border-os-accent/30' : ''
                }`}
              >
                <div className="mb-2">
                  {getFileIcon(file)}
                </div>
                <div className="text-xs text-center text-os-text truncate w-full">
                  {file.name}
                </div>
                {file.type === 'file' && file.size && (
                  <div className="text-xs text-os-text-muted mt-1">
                    {formatFileSize(file.size)}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {filteredFiles.length === 0 && (
          <div className="flex flex-col items-center justify-center h-64 text-os-text-muted">
            <Folder size={48} className="mb-4 opacity-50" />
            <div className="text-lg mb-2">No files found</div>
            <div className="text-sm">
              {searchQuery ? 'Try a different search term' : 'This folder is empty'}
            </div>
          </div>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Context Menu */}
      {showContextMenu && (
        <div
          className="fixed bg-os-surface border border-os-border rounded-lg shadow-lg py-1 z-50"
          style={{ left: showContextMenu.x, top: showContextMenu.y }}
          onMouseLeave={() => setShowContextMenu(null)}
        >
          <button className="w-full text-left px-3 py-1.5 text-sm hover:bg-os-border transition-colors flex items-center space-x-2">
            <Edit3 size={14} />
            <span>Rename</span>
          </button>
          <button className="w-full text-left px-3 py-1.5 text-sm hover:bg-os-border transition-colors flex items-center space-x-2">
            <Download size={14} />
            <span>Download</span>
          </button>
          <div className="border-t border-os-border my-1" />
          <button className="w-full text-left px-3 py-1.5 text-sm hover:bg-red-600/20 transition-colors flex items-center space-x-2 text-red-400">
            <Trash2 size={14} />
            <span>Delete</span>
          </button>
        </div>
      )}
    </div>
  )
}
