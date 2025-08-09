'use client'

import React, { useState, useEffect } from 'react'
import { 
  Search, 
  Download, 
  Trash2, 
  Play, 
  Star, 
  Filter,
  Grid3X3,
  List,
  ExternalLink,
  Shield,
  HardDrive,
  User,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader
} from 'lucide-react'
import { appStoreService, Application, InstallationProgress } from '@/services/app-store'
import { useWindows } from '@/contexts/WindowContext'

interface AppStoreProps {
  windowId: string
  data?: any
}

type ViewMode = 'grid' | 'list'
type FilterCategory = 'all' | 'browser' | 'development' | 'productivity' | 'entertainment' | 'system'

export default function AppStore({ windowId, data }: AppStoreProps) {
  const { openWindow } = useWindows()
  const [applications, setApplications] = useState<Application[]>([])
  const [filteredApps, setFilteredApps] = useState<Application[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<FilterCategory>('all')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [selectedApp, setSelectedApp] = useState<Application | null>(null)
  const [showInstalled, setShowInstalled] = useState(false)
  const [installationProgress, setInstallationProgress] = useState<Map<string, InstallationProgress>>(new Map())

  useEffect(() => {
    loadApplications()
  }, [])

  useEffect(() => {
    filterApplications()
  }, [applications, searchQuery, selectedCategory, showInstalled])

  const loadApplications = () => {
    const apps = appStoreService.getAvailableApps()
    setApplications(apps)
  }

  const filterApplications = () => {
    let filtered = applications

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = appStoreService.searchApps(searchQuery)
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(app => app.category === selectedCategory)
    }

    // Filter by installation status
    if (showInstalled) {
      filtered = filtered.filter(app => app.installed)
    }

    setFilteredApps(filtered)
  }

  const handleInstallApp = async (appId: string) => {
    try {
      // Add progress listener
      appStoreService.addInstallationListener(appId, (progress) => {
        setInstallationProgress(prev => new Map(prev.set(appId, progress)))
        
        if (progress.status === 'completed') {
          // Refresh applications list
          loadApplications()
          // Remove progress after a delay
          setTimeout(() => {
            setInstallationProgress(prev => {
              const newMap = new Map(prev)
              newMap.delete(appId)
              return newMap
            })
          }, 2000)
        }
      })

      await appStoreService.installApp(appId)
    } catch (error) {
      console.error('Installation failed:', error)
      alert(`Installation failed: ${error}`)
    }
  }

  const handleUninstallApp = async (appId: string) => {
    try {
      await appStoreService.uninstallApp(appId)
      loadApplications()
    } catch (error) {
      console.error('Uninstallation failed:', error)
      alert(`Uninstallation failed: ${error}`)
    }
  }

  const handleLaunchApp = (appId: string) => {
    try {
      appStoreService.launchApp(appId, { openWindow })
    } catch (error) {
      console.error('Launch failed:', error)
      alert(`Launch failed: ${error}`)
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'browser': return '🌐'
      case 'development': return '⚡'
      case 'productivity': return '📊'
      case 'entertainment': return '🎮'
      case 'system': return '⚙️'
      default: return '📱'
    }
  }

  const getProgressColor = (status: string) => {
    switch (status) {
      case 'downloading': return 'bg-blue-600'
      case 'installing': return 'bg-yellow-600'
      case 'completed': return 'bg-green-600'
      case 'error': return 'bg-red-600'
      default: return 'bg-gray-600'
    }
  }

  return (
    <div className="h-full bg-gray-900 text-white flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">App Store</h1>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="p-2 hover:bg-gray-800 rounded-lg"
            >
              {viewMode === 'grid' ? <List size={20} /> : <Grid3X3 size={20} />}
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search applications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
          
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as FilterCategory)}
            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Categories</option>
            <option value="browser">Browsers</option>
            <option value="development">Development</option>
            <option value="productivity">Productivity</option>
            <option value="entertainment">Entertainment</option>
            <option value="system">System</option>
          </select>

          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showInstalled}
              onChange={(e) => setShowInstalled(e.target.checked)}
              className="rounded"
            />
            <span className="text-sm">Installed Only</span>
          </label>
        </div>
      </div>

      {/* Applications Grid/List */}
      <div className="flex-1 overflow-y-auto p-4">
        {filteredApps.length === 0 ? (
          <div className="text-center text-gray-400 mt-8">
            <div className="text-6xl mb-4">📱</div>
            <p>No applications found</p>
          </div>
        ) : (
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
            : 'space-y-4'
          }>
            {filteredApps.map((app) => {
              const progress = installationProgress.get(app.id)
              
              return (
                <div
                  key={app.id}
                  className={`bg-gray-800 rounded-lg p-4 hover:bg-gray-750 transition-colors ${
                    viewMode === 'list' ? 'flex items-center space-x-4' : ''
                  }`}
                >
                  {/* App Icon */}
                  <div className={`${viewMode === 'list' ? 'flex-shrink-0' : 'mb-3'}`}>
                    <div className="w-16 h-16 bg-gray-700 rounded-lg flex items-center justify-center text-2xl">
                      {app.icon}
                    </div>
                  </div>

                  {/* App Info */}
                  <div className={`${viewMode === 'list' ? 'flex-1' : ''}`}>
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-lg">{app.name}</h3>
                      {app.featured && (
                        <Star className="text-yellow-400 fill-current" size={16} />
                      )}
                    </div>
                    
                    <p className="text-gray-400 text-sm mb-2 line-clamp-2">
                      {app.description}
                    </p>

                    <div className="flex items-center space-x-4 text-xs text-gray-500 mb-3">
                      <span className="flex items-center space-x-1">
                        <span>{getCategoryIcon(app.category)}</span>
                        <span className="capitalize">{app.category}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <User size={12} />
                        <span>{app.developer}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <HardDrive size={12} />
                        <span>{app.size}</span>
                      </span>
                    </div>

                    {/* Installation Progress */}
                    {progress && (
                      <div className="mb-3">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span>{progress.message}</span>
                          <span>{Math.round(progress.progress)}%</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(progress.status)}`}
                            style={{ width: `${progress.progress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center space-x-2">
                      {!app.installed ? (
                        <button
                          onClick={() => handleInstallApp(app.id)}
                          disabled={!!progress}
                          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 px-3 py-2 rounded-lg text-sm transition-colors"
                        >
                          {progress ? (
                            <Loader className="animate-spin" size={16} />
                          ) : (
                            <Download size={16} />
                          )}
                          <span>{progress ? 'Installing...' : 'Install'}</span>
                        </button>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleLaunchApp(app.id)}
                            className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 px-3 py-2 rounded-lg text-sm transition-colors"
                          >
                            <Play size={16} />
                            <span>Launch</span>
                          </button>
                          <button
                            onClick={() => handleUninstallApp(app.id)}
                            className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 px-3 py-2 rounded-lg text-sm transition-colors"
                          >
                            <Trash2 size={16} />
                            <span>Uninstall</span>
                          </button>
                        </div>
                      )}
                      
                      {app.url && (
                        <button
                          onClick={() => window.open(app.url, '_blank')}
                          className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                          title="Open website"
                        >
                          <ExternalLink size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
