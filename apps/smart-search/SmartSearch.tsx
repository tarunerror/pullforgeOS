'use client'

import React, { useState, useEffect } from 'react'
import { 
  Search, 
  Database, 
  Upload, 
  Trash2, 
  RefreshCw, 
  Settings, 
  FileText, 
  Star,
  Clock,
  Tag,
  AlertCircle,
  CheckCircle,
  Brain,
  Zap,
  Filter,
  Eye,
  Download
} from 'lucide-react'
import { useAuth } from '@/components/AuthProvider'
import AuthModal from '@/components/AuthModal'
import authService from '@/services/auth'
import { supabaseService, SearchResult, FileEmbedding } from '@/services/supabase'

interface SmartSearchProps {
  windowId: string
  data?: any
}

type ViewMode = 'search' | 'manage' | 'settings'

export default function SmartSearch({ windowId, data }: SmartSearchProps) {
  const { user, isAuthenticated } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [embeddings, setEmbeddings] = useState<FileEmbedding[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [viewMode, setViewMode] = useState<'search' | 'manage' | 'settings'>('search')
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [supabaseUrl, setSupabaseUrl] = useState('')
  const [supabaseKey, setSupabaseKey] = useState('')
  const [threshold, setThreshold] = useState(0.7)
  const [maxResults, setMaxResults] = useState(10)
  const [selectedProject, setSelectedProject] = useState('')
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    const storedUrl = localStorage.getItem('supabase_url')
    const storedKey = localStorage.getItem('supabase_key')
    
    if (storedUrl && storedKey) {
      setSupabaseUrl(storedUrl)
      setSupabaseKey(storedKey)
      initializeSupabase(storedUrl, storedKey)
    }
  }, [])

  const loadUserEmbeddings = async () => {
    setLoading(true)
    setError('')
    
    try {
      const result = await authService.getUserEmbeddings()
      if (result.success && result.embeddings) {
        setEmbeddings(result.embeddings)
      } else {
        setError(result.error || 'Failed to load embeddings')
      }
    } catch (error: any) {
      setError(`Failed to load embeddings: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleAuthRequired = () => {
    if (!isAuthenticated) {
      setShowAuthModal(true)
      return false
    }
    return true
  }

  const initializeSupabase = async (url: string, key: string) => {
    setLoading(true)
    try {
      const result = await supabaseService.initialize(url, key)
      if (result.success) {
        setIsConnected(true)
        localStorage.setItem('supabase_url', url)
        localStorage.setItem('supabase_key', key)
        await loadAllFiles()
      } else {
        console.error('Failed to connect to Supabase:', result.message)
      }
    } catch (error) {
      console.error('Error initializing Supabase:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleConnect = () => {
    if (supabaseUrl.trim() && supabaseKey.trim()) {
      initializeSupabase(supabaseUrl, supabaseKey)
    }
  }

  const loadAllFiles = async () => {
    if (!isConnected) return
    
    setLoading(true)
    try {
      if (selectedProject) {
        const files = await supabaseService.getProjectFiles(selectedProject)
        setEmbeddings(files)
      } else {
        // For demo purposes, we'll simulate loading all files
        setEmbeddings([])
      }
    } catch (error) {
      console.error('Error loading files:', error)
    } finally {
      setLoading(false)
    }
  }

  const performSearch = async () => {
    if (!handleAuthRequired() || !searchQuery.trim()) return
    
    setLoading(true)
    setError('')
    
    try {
      // Generate embedding for search query (simplified - in real implementation use OpenAI)
      const queryEmbedding = Array.from({ length: 1536 }, () => Math.random())
      
      const result = await authService.searchUserEmbeddings(queryEmbedding, 10)
      if (result.success && result.results) {
        setSearchResults(result.results)
      } else {
        setError(result.error || 'Search failed')
      }
    } catch (error: any) {
      setError(`Search failed: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const uploadFile = async (file: File) => {
    if (!isConnected) return
    
    setLoading(true)
    try {
      const content = await file.text()
      const result = await supabaseService.storeFileEmbedding(
        file.name,
        file.name,
        content,
        {
          language: getFileLanguage(file.name),
          project_id: selectedProject || 'default'
        }
      )
      
      if (result.success) {
        await loadAllFiles()
        alert('File uploaded and indexed successfully!')
      } else {
        alert(`Failed to upload file: ${result.message}`)
      }
    } catch (error) {
      console.error('Error uploading file:', error)
      alert('Error uploading file')
    } finally {
      setLoading(false)
    }
  }

  const deleteFile = async (id: string) => {
    if (!isConnected) return
    
    setLoading(true)
    try {
      const result = await supabaseService.deleteFileEmbedding(id)
      if (result.success) {
        await loadAllFiles()
        alert('File deleted successfully!')
      } else {
        alert(`Failed to delete file: ${result.message}`)
      }
    } catch (error) {
      console.error('Error deleting file:', error)
      alert('Error deleting file')
    } finally {
      setLoading(false)
    }
  }

  const getFileLanguage = (filename: string): string => {
    const ext = filename.split('.').pop()?.toLowerCase()
    const languageMap: { [key: string]: string } = {
      'js': 'javascript',
      'ts': 'typescript',
      'jsx': 'javascript',
      'tsx': 'typescript',
      'py': 'python',
      'java': 'java',
      'cpp': 'cpp',
      'c': 'c',
      'cs': 'csharp',
      'php': 'php',
      'rb': 'ruby',
      'go': 'go',
      'rs': 'rust',
      'swift': 'swift',
      'kt': 'kotlin',
      'scala': 'scala',
      'html': 'html',
      'css': 'css',
      'scss': 'scss',
      'sass': 'sass',
      'less': 'less',
      'json': 'json',
      'xml': 'xml',
      'yaml': 'yaml',
      'yml': 'yaml',
      'md': 'markdown',
      'txt': 'text'
    }
    return languageMap[ext || ''] || 'text'
  }

  if (!isConnected) {
    return (
      <div className="h-full bg-gray-900 text-white p-6 flex items-center justify-center">
        <div className="max-w-md w-full space-y-6">
          <div className="text-center">
            <Database size={48} className="mx-auto text-purple-400 mb-4" />
            <h2 className="text-2xl font-bold mb-2">Smart Search</h2>
            <p className="text-gray-400">Connect to Supabase for vector-powered file search</p>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Supabase URL</label>
              <input
                type="text"
                value={supabaseUrl}
                onChange={(e) => setSupabaseUrl(e.target.value)}
                placeholder="https://your-project.supabase.co"
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Supabase Anon Key</label>
              <input
                type="password"
                value={supabaseKey}
                onChange={(e) => setSupabaseKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            
            <button
              onClick={handleConnect}
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              {loading ? <RefreshCw className="animate-spin" size={16} /> : <Database size={16} />}
              <span>{loading ? 'Connecting...' : 'Connect'}</span>
            </button>
            
            <div className="text-xs text-gray-500 text-center space-y-1">
              <p>Requires pgvector extension enabled</p>
              <p>See setup instructions in settings</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full bg-gray-900 text-white flex flex-col">
      {/* Header */}
      <div className="border-b border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Brain className="text-purple-400" size={24} />
            <h1 className="text-xl font-bold">Smart Search</h1>
            <span className="text-xs bg-purple-600 px-2 py-1 rounded">Vector AI</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('search')}
              className={`px-3 py-1 rounded text-sm ${viewMode === 'search' ? 'bg-purple-600' : 'bg-gray-700 hover:bg-gray-600'}`}
            >
              Search
            </button>
            <button
              onClick={() => setViewMode('manage')}
              className={`px-3 py-1 rounded text-sm ${viewMode === 'manage' ? 'bg-purple-600' : 'bg-gray-700 hover:bg-gray-600'}`}
            >
              Manage
            </button>
            <button
              onClick={() => setViewMode('settings')}
              className={`p-2 rounded ${viewMode === 'settings' ? 'bg-purple-600' : 'bg-gray-700 hover:bg-gray-600'}`}
            >
              <Settings size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {viewMode === 'search' && (
          <div className="h-full flex flex-col">
            {/* Search Interface */}
            <div className="p-4 border-b border-gray-700 space-y-4">
              <div className="flex space-x-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search files using natural language..."
                    className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500"
                    onKeyPress={(e) => e.key === 'Enter' && performSearch()}
                  />
                </div>
                <button
                  onClick={performSearch}
                  disabled={loading || !searchQuery.trim()}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 rounded-lg transition-colors flex items-center space-x-2"
                >
                  {loading ? <RefreshCw className="animate-spin" size={16} /> : <Zap size={16} />}
                  <span>Search</span>
                </button>
              </div>
              
              {/* Filters */}
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-2">
                  <Filter size={14} />
                  <span>Similarity:</span>
                  <input
                    type="range"
                    min="0.5"
                    max="1"
                    step="0.05"
                    value={threshold}
                    onChange={(e) => setThreshold(parseFloat(e.target.value))}
                    className="w-20"
                  />
                  <span>{threshold.toFixed(2)}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span>Results:</span>
                  <select
                    value={maxResults}
                    onChange={(e) => setMaxResults(parseInt(e.target.value))}
                    className="bg-gray-800 border border-gray-700 rounded px-2 py-1"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Search Results */}
            <div className="flex-1 overflow-y-auto p-4">
              {searchResults.length > 0 ? (
                <div className="space-y-4">
                  {searchResults.map((result, index) => (
                    <div key={index} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <FileText size={16} className="text-purple-400" />
                          <h3 className="font-semibold">{result.file_name}</h3>
                          <span className="text-xs bg-purple-900 text-purple-300 px-2 py-1 rounded">
                            {(result.similarity * 100).toFixed(1)}% match
                          </span>
                        </div>
                        <div className="flex space-x-1">
                          <button className="p-1 hover:bg-gray-700 rounded">
                            <Eye size={14} />
                          </button>
                          <button className="p-1 hover:bg-gray-700 rounded">
                            <Download size={14} />
                          </button>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-400 mb-2">{result.file_path}</p>
                      
                      <div className="bg-gray-900 rounded p-3 text-sm">
                        <pre className="whitespace-pre-wrap text-gray-300 line-clamp-4">
                          {result.content.substring(0, 300)}
                          {result.content.length > 300 && '...'}
                        </pre>
                      </div>
                      
                      <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                        <span>Language: {result.metadata.language || 'Unknown'}</span>
                        <span>Size: {(result.metadata.size / 1024).toFixed(1)} KB</span>
                        <span>Modified: {new Date(result.metadata.last_modified).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : searchQuery && !loading ? (
                <div className="text-center py-12">
                  <Search size={48} className="mx-auto text-gray-600 mb-4" />
                  <p className="text-gray-400">No results found for "{searchQuery}"</p>
                  <p className="text-sm text-gray-500 mt-2">Try adjusting your search terms or lowering the similarity threshold</p>
                </div>
              ) : !searchQuery ? (
                <div className="text-center py-12">
                  <Brain size={48} className="mx-auto text-purple-400 mb-4" />
                  <p className="text-gray-400">Enter a search query to find files using AI-powered semantic search</p>
                  <p className="text-sm text-gray-500 mt-2">Search by functionality, purpose, or content description</p>
                </div>
              ) : null}
            </div>
          </div>
        )}

        {viewMode === 'manage' && (
          <div className="h-full flex flex-col">
            <div className="p-4 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">File Management</h2>
                <div className="flex space-x-2">
                  <input
                    type="file"
                    multiple
                    onChange={(e) => {
                      const files = Array.from(e.target.files || [])
                      files.forEach(uploadFile)
                    }}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-sm cursor-pointer flex items-center space-x-1"
                  >
                    <Upload size={14} />
                    <span>Upload</span>
                  </label>
                  <button
                    onClick={loadAllFiles}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm flex items-center space-x-1"
                  >
                    <RefreshCw size={14} />
                    <span>Refresh</span>
                  </button>
                </div>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <RefreshCw className="animate-spin text-purple-400" size={24} />
                </div>
              ) : (
                <div className="divide-y divide-gray-700">
                  {embeddings.filter((file: any) => (
                    <div key={file.id} className="p-4 hover:bg-gray-800">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <FileText className="text-purple-400" size={16} />
                          <div>
                            <h3 className="font-medium">{file.file_name}</h3>
                            <p className="text-sm text-gray-400">{file.file_path}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-500">
                            {(file.metadata.size / 1024).toFixed(1)} KB
                          </span>
                          <button
                            onClick={() => deleteFile(file.id)}
                            className="p-1 hover:bg-red-600 rounded transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {viewMode === 'settings' && (
          <div className="p-6 space-y-6">
            <div>
              <h2 className="text-xl font-bold mb-4">Smart Search Settings</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Supabase URL</label>
                  <input
                    type="text"
                    value={supabaseUrl}
                    onChange={(e) => setSupabaseUrl(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Supabase Key</label>
                  <input
                    type="password"
                    value={supabaseKey}
                    onChange={(e) => setSupabaseKey(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg"
                  />
                </div>
                
                <button
                  onClick={handleConnect}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg"
                >
                  Update Connection
                </button>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2">Database Setup</h3>
              <p className="text-gray-400 text-sm mb-4">
                Run this SQL in your Supabase SQL editor to set up the vector search:
              </p>
              <pre className="bg-gray-800 p-4 rounded-lg text-xs overflow-x-auto">
                {supabaseService.getSetupSQL()}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
