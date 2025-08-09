'use client'

import React, { useState, useEffect } from 'react'
import { 
  GitBranch, 
  Star, 
  GitFork, 
  Download, 
  Search, 
  Plus, 
  FileText, 
  Folder,
  ExternalLink,
  GitPullRequest,
  Settings,
  Key,
  RefreshCw
} from 'lucide-react'
import { githubService, GitHubRepo, GitHubFile, PullRequest } from '@/services/github'
import { gitHubAppService, GitHubInstallation } from '@/services/github-app'

interface GitHubProps {
  windowId: string
  data?: any
}

type ViewMode = 'repos' | 'repo-detail' | 'pull-requests' | 'settings' | 'app-installation'

export default function GitHub({ windowId, data }: GitHubProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('repos')
  const [repositories, setRepositories] = useState<GitHubRepo[]>([])
  const [selectedRepo, setSelectedRepo] = useState<GitHubRepo | null>(null)
  const [repoContents, setRepoContents] = useState<GitHubFile[]>([])
  const [pullRequests, setPullRequests] = useState<PullRequest[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [token, setToken] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentPath, setCurrentPath] = useState('')
  const [installations, setInstallations] = useState<GitHubInstallation[]>([])
  const [isAppInstalled, setIsAppInstalled] = useState(false)

  useEffect(() => {
    // Check for stored GitHub token
    const storedToken = localStorage.getItem('github_token')
    if (storedToken) {
      setToken(storedToken)
      setIsAuthenticated(true)
      githubService.setToken(storedToken)
      loadRepositories()
    }
    
    // Check GitHub App installation status
    checkAppInstallation()
  }, [])

  const checkAppInstallation = async () => {
    try {
      const status = await gitHubAppService.checkInstallationStatus()
      setIsAppInstalled(status.installed)
      setInstallations(status.installations)
      if (status.installed) {
        setIsAuthenticated(true)
        loadRepositories()
      }
    } catch (error) {
      console.error('Error checking app installation:', error)
    }
  }

  const handleInstallGitHubApp = () => {
    try {
      gitHubAppService.initiateGitHubAppInstallation()
      // Listen for installation completion (in a real app, you'd use webhooks)
      setTimeout(() => {
        checkAppInstallation()
      }, 5000)
    } catch (error) {
      console.error('Error initiating GitHub App installation:', error)
      alert('Error initiating GitHub App installation. Please check your configuration.')
    }
  }

  const handleAuthenticate = () => {
    if (token.trim()) {
      localStorage.setItem('github_token', token)
      githubService.setToken(token)
      setIsAuthenticated(true)
      loadRepositories()
    }
  }

  const loadRepositories = async () => {
    setLoading(true)
    try {
      const repos = await githubService.getUserRepos()
      setRepositories(repos)
    } catch (error) {
      console.error('Error loading repositories:', error)
    } finally {
      setLoading(false)
    }
  }

  const searchRepositories = async () => {
    if (!searchQuery.trim()) return
    
    setLoading(true)
    try {
      const repos = await githubService.searchRepos(searchQuery)
      setRepositories(repos)
    } catch (error) {
      console.error('Error searching repositories:', error)
    } finally {
      setLoading(false)
    }
  }

  const selectRepository = async (repo: GitHubRepo) => {
    setSelectedRepo(repo)
    setViewMode('repo-detail')
    setLoading(true)
    
    try {
      const contents = await githubService.getRepoContents(repo.owner.login, repo.name)
      setRepoContents(contents)
      setCurrentPath('')
    } catch (error) {
      console.error('Error loading repository contents:', error)
    } finally {
      setLoading(false)
    }
  }

  const navigateToFolder = async (path: string) => {
    if (!selectedRepo) return
    
    setLoading(true)
    try {
      const contents = await githubService.getRepoContents(selectedRepo.owner.login, selectedRepo.name, path)
      setRepoContents(contents)
      setCurrentPath(path)
    } catch (error) {
      console.error('Error navigating to folder:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadPullRequests = async () => {
    if (!selectedRepo) return
    
    setLoading(true)
    try {
      const prs = await githubService.getPullRequests(selectedRepo.owner.login, selectedRepo.name)
      setPullRequests(prs)
      setViewMode('pull-requests')
    } catch (error) {
      console.error('Error loading pull requests:', error)
    } finally {
      setLoading(false)
    }
  }

  const createAIPullRequest = async () => {
    if (!selectedRepo) return
    
    // This is a simplified example - in a real implementation,
    // you'd collect actual changes and generate a proper PR
    const changes = ['Updated README.md', 'Fixed TypeScript errors', 'Added new feature']
    const context = 'Automated improvements generated by Pullforge OS AI'
    
    try {
      const description = await githubService.generatePRDescription(changes, context)
      
      // In a real implementation, you'd create an actual branch and PR
      console.log('AI-Generated PR Description:', description)
      alert('AI PR description generated! Check console for details.')
    } catch (error) {
      console.error('Error creating AI pull request:', error)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="h-full bg-gray-900 text-white p-6 flex items-center justify-center">
        <div className="max-w-md w-full space-y-6">
          <div className="text-center">
            <GitBranch size={48} className="mx-auto text-blue-400 mb-4" />
            <h2 className="text-2xl font-bold mb-2">GitHub Integration</h2>
            <p className="text-gray-400">Connect your GitHub account to access repositories</p>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">GitHub Personal Access Token</label>
              <input
                type="password"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <button
              onClick={handleAuthenticate}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              <Key size={16} />
              <span>Authenticate</span>
            </button>
            
            <div className="text-xs text-gray-500 text-center">
              <p>Generate a token at: github.com/settings/tokens</p>
              <p>Required scopes: repo, user</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full bg-gray-900 text-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <div className="flex items-center space-x-3">
          <GitBranch className="text-blue-400" size={24} />
          <h1 className="text-xl font-bold">GitHub Integration</h1>
          {isAppInstalled && (
            <span className="bg-green-600 text-white px-2 py-1 rounded-full text-xs">
              App Installed
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {isAuthenticated && (
            <>
              <button
                onClick={() => setViewMode('repos')}
                className={`px-3 py-2 rounded-lg text-sm ${
                  viewMode === 'repos' ? 'bg-blue-600' : 'hover:bg-gray-800'
                }`}
              >
                Repositories
              </button>
              
              {selectedRepo && (
                <button
                  onClick={loadPullRequests}
                  className={`px-3 py-2 rounded-lg text-sm ${
                    viewMode === 'pull-requests' ? 'bg-blue-600' : 'hover:bg-gray-800'
                  }`}
                >
                  Pull Requests
                </button>
              )}
            </>
          )}
          
          <button
            onClick={() => setViewMode('app-installation')}
            className={`px-3 py-2 rounded-lg text-sm ${
              viewMode === 'app-installation' ? 'bg-blue-600' : 'hover:bg-gray-800'
            }`}
          >
            App Setup
          </button>
          
          <button
            onClick={() => setViewMode('settings')}
            className={`p-2 rounded-lg ${
              viewMode === 'settings' ? 'bg-blue-600' : 'hover:bg-gray-800'
            }`}
          >
            <Settings size={20} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {viewMode === 'repos' && (
          <div className="h-full flex flex-col">
            {/* Search */}
            <div className="p-4 border-b border-gray-700">
              <div className="flex space-x-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search repositories..."
                    className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500"
                    onKeyPress={(e) => e.key === 'Enter' && searchRepositories()}
                  />
                </div>
                <button
                  onClick={searchRepositories}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                >
                  Search
                </button>
                <button
                  onClick={loadRepositories}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                >
                  <RefreshCw size={16} />
                </button>
              </div>
            </div>

            {/* Repository List */}
            <div className="flex-1 overflow-y-auto p-4">
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <RefreshCw className="animate-spin text-blue-400" size={24} />
                </div>
              ) : (
                <div className="grid gap-4">
                  {repositories.map((repo) => (
                    <div
                      key={repo.id}
                      onClick={() => selectRepository(repo)}
                      className="bg-gray-800 rounded-lg p-4 hover:bg-gray-750 cursor-pointer transition-colors border border-gray-700"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-blue-400 mb-1">{repo.name}</h3>
                          <p className="text-gray-300 text-sm mb-2">{repo.description || 'No description'}</p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            {repo.language && (
                              <span className="flex items-center space-x-1">
                                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                                <span>{repo.language}</span>
                              </span>
                            )}
                            <span className="flex items-center space-x-1">
                              <Star size={12} />
                              <span>{repo.stargazers_count}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <GitFork size={12} />
                              <span>{repo.forks_count}</span>
                            </span>
                          </div>
                        </div>
                        <ExternalLink size={16} className="text-gray-500" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {viewMode === 'repo-detail' && selectedRepo && (
          <div className="h-full flex flex-col">
            {/* Repository Header */}
            <div className="p-4 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold">{selectedRepo.full_name}</h2>
                  <p className="text-gray-400 text-sm">{selectedRepo.description}</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={createAIPullRequest}
                    className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-sm flex items-center space-x-1"
                  >
                    <Plus size={14} />
                    <span>AI PR</span>
                  </button>
                  <button className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm flex items-center space-x-1">
                    <Download size={14} />
                    <span>Clone</span>
                  </button>
                </div>
              </div>
              
              {/* Breadcrumb */}
              {currentPath && (
                <div className="mt-2 text-sm text-gray-400">
                  <span 
                    onClick={() => navigateToFolder('')}
                    className="cursor-pointer hover:text-white"
                  >
                    {selectedRepo.name}
                  </span>
                  {currentPath.split('/').map((segment, index, array) => (
                    <span key={index}>
                      <span className="mx-1">/</span>
                      <span 
                        onClick={() => navigateToFolder(array.slice(0, index + 1).join('/'))}
                        className="cursor-pointer hover:text-white"
                      >
                        {segment}
                      </span>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* File Browser */}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <RefreshCw className="animate-spin text-blue-400" size={24} />
                </div>
              ) : (
                <div className="divide-y divide-gray-700">
                  {repoContents.map((item) => (
                    <div
                      key={item.path}
                      onClick={() => item.type === 'dir' && navigateToFolder(item.path)}
                      className={`flex items-center space-x-3 p-3 hover:bg-gray-800 ${
                        item.type === 'dir' ? 'cursor-pointer' : ''
                      }`}
                    >
                      {item.type === 'dir' ? (
                        <Folder className="text-blue-400" size={16} />
                      ) : (
                        <FileText className="text-gray-400" size={16} />
                      )}
                      <span className="flex-1">{item.name}</span>
                      {item.type === 'file' && (
                        <span className="text-xs text-gray-500">
                          {(item.size / 1024).toFixed(1)} KB
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {viewMode === 'pull-requests' && selectedRepo && (
          <div className="h-full flex flex-col">
            <div className="p-4 border-b border-gray-700">
              <h2 className="text-lg font-semibold">Pull Requests</h2>
              <p className="text-gray-400 text-sm">{selectedRepo.full_name}</p>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <RefreshCw className="animate-spin text-blue-400" size={24} />
                </div>
              ) : (
                <div className="divide-y divide-gray-700">
                  {pullRequests.map((pr) => (
                    <div key={pr.number} className="p-4 hover:bg-gray-800">
                      <div className="flex items-start space-x-3">
                        <GitPullRequest 
                          className={pr.state === 'open' ? 'text-green-400' : 'text-gray-400'} 
                          size={16} 
                        />
                        <div className="flex-1">
                          <h3 className="font-medium">{pr.title}</h3>
                          <p className="text-sm text-gray-400 mt-1">
                            #{pr.number} by {pr.user.login} • {new Date(pr.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs ${
                          pr.state === 'open' ? 'bg-green-900 text-green-300' : 'bg-gray-700 text-gray-300'
                        }`}>
                          {pr.state}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {viewMode === 'app-installation' && (
          <div className="p-6">
            <h2 className="text-xl font-bold mb-4">GitHub App Installation</h2>
            
            {!isAppInstalled ? (
              <div className="space-y-6">
                <div className="bg-blue-900/50 border border-blue-700 rounded-lg p-4">
                  <h3 className="font-semibold mb-2">🚀 Recommended: Install Pullforge OS GitHub App</h3>
                  <p className="text-gray-300 text-sm mb-4">
                    The GitHub App provides secure, fine-grained access to your repositories without requiring personal access tokens.
                  </p>
                  <ul className="text-sm text-gray-300 space-y-1 mb-4">
                    <li>✅ Secure repository access</li>
                    <li>✅ No personal tokens required</li>
                    <li>✅ Fine-grained permissions</li>
                    <li>✅ Easy repository management</li>
                  </ul>
                  <button
                    onClick={handleInstallGitHubApp}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg"
                  >
                    Install GitHub App
                  </button>
                </div>
                
                <div className="text-center text-gray-400">
                  <p>or</p>
                </div>
                
                <div className="bg-yellow-900/50 border border-yellow-700 rounded-lg p-4">
                  <h3 className="font-semibold mb-2">⚠️ Alternative: Personal Access Token</h3>
                  <p className="text-gray-300 text-sm mb-4">
                    Use a personal access token for basic GitHub integration. Less secure than the GitHub App.
                  </p>
                  <button
                    onClick={() => setViewMode('settings')}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
                  >
                    Configure Token
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-green-900/50 border border-green-700 rounded-lg p-4">
                  <h3 className="font-semibold mb-2">✅ GitHub App Installed</h3>
                  <p className="text-gray-300 text-sm mb-4">
                    Pullforge OS is successfully connected to your GitHub account.
                  </p>
                  <div className="space-y-2">
                    <h4 className="font-medium">Installed for:</h4>
                    {installations.map((installation) => (
                      <div key={installation.id} className="flex items-center space-x-3 p-2 bg-gray-800 rounded">
                        <img 
                          src={installation.account.avatar_url} 
                          alt={installation.account.login}
                          className="w-8 h-8 rounded-full"
                        />
                        <div>
                          <p className="font-medium">{installation.account.login}</p>
                          <p className="text-xs text-gray-400">{installation.account.type}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <button
                  onClick={() => setViewMode('repos')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
                >
                  View Repositories
                </button>
              </div>
            )}
          </div>
        )}

        {viewMode === 'settings' && (
          <div className="p-6">
            <h2 className="text-xl font-bold mb-4">GitHub Settings</h2>
            <div className="space-y-4">
              <div className="bg-yellow-900/50 border border-yellow-700 rounded-lg p-4 mb-4">
                <p className="text-sm text-yellow-200">
                  ⚠️ Personal Access Tokens are less secure than GitHub Apps. Consider installing the GitHub App instead.
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Personal Access Token</label>
                <input
                  type="password"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg"
                  placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Create a token at: <a href="https://github.com/settings/tokens" target="_blank" className="text-blue-400 hover:underline">github.com/settings/tokens</a>
                </p>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={handleAuthenticate}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                >
                  Update Token
                </button>
                <button
                  onClick={() => {
                    localStorage.removeItem('github_token')
                    setIsAuthenticated(false)
                    setToken('')
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
                >
                  Disconnect
                </button>
                <button
                  onClick={() => setViewMode('app-installation')}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
                >
                  Install GitHub App Instead
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
