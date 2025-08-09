'use client'

import React, { useState, useEffect } from 'react'
import { 
  Zap, 
  Play, 
  Square, 
  Settings, 
  Plus, 
  Trash2, 
  RefreshCw,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Copy,
  Download,
  Upload,
  GitBranch,
  Database,
  Webhook,
  Calendar
} from 'lucide-react'
import { n8nService, N8nWorkflow, N8nExecution, WorkflowTemplate } from '@/services/n8n'

interface WorkflowAutomationProps {
  windowId: string
  data?: any
}

type ViewMode = 'workflows' | 'executions' | 'templates' | 'settings'

export default function WorkflowAutomation({ windowId, data }: WorkflowAutomationProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('workflows')
  const [workflows, setWorkflows] = useState<N8nWorkflow[]>([])
  const [executions, setExecutions] = useState<N8nExecution[]>([])
  const [templates, setTemplates] = useState<WorkflowTemplate[]>([])
  const [selectedWorkflow, setSelectedWorkflow] = useState<N8nWorkflow | null>(null)
  const [loading, setLoading] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [n8nUrl, setN8nUrl] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    // Check for stored n8n credentials
    const storedUrl = localStorage.getItem('n8n_url')
    const storedKey = localStorage.getItem('n8n_api_key')
    
    if (storedUrl && storedKey) {
      setN8nUrl(storedUrl)
      setApiKey(storedKey)
      connectToN8n(storedUrl, storedKey)
    }
    
    // Load templates
    setTemplates(n8nService.getWorkflowTemplates())
  }, [])

  const connectToN8n = async (url: string, key: string) => {
    setLoading(true)
    setError('')
    
    try {
      const result = await n8nService.connect(url, key)
      if (result.success) {
        setIsConnected(true)
        localStorage.setItem('n8n_url', url)
        localStorage.setItem('n8n_api_key', key)
        await loadWorkflows()
        await loadExecutions()
      } else {
        setError(result.message)
      }
    } catch (error: any) {
      setError(`Connection failed: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleConnect = () => {
    if (n8nUrl.trim() && apiKey.trim()) {
      connectToN8n(n8nUrl, apiKey)
    }
  }

  const loadWorkflows = async () => {
    if (!isConnected) return
    
    setLoading(true)
    try {
      const workflowList = await n8nService.getWorkflows()
      setWorkflows(workflowList)
    } catch (error: any) {
      setError(`Failed to load workflows: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const loadExecutions = async () => {
    if (!isConnected) return
    
    try {
      const executionList = await n8nService.getExecutions(undefined, 50)
      setExecutions(executionList)
    } catch (error: any) {
      console.error('Failed to load executions:', error)
    }
  }

  const toggleWorkflow = async (id: string, active: boolean) => {
    setLoading(true)
    try {
      await n8nService.toggleWorkflow(id, active)
      await loadWorkflows()
    } catch (error: any) {
      setError(`Failed to ${active ? 'activate' : 'deactivate'} workflow: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const executeWorkflow = async (id: string) => {
    setLoading(true)
    try {
      await n8nService.executeWorkflow(id)
      await loadExecutions()
      alert('Workflow executed successfully!')
    } catch (error: any) {
      setError(`Failed to execute workflow: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const deleteWorkflow = async (id: string) => {
    if (!confirm('Are you sure you want to delete this workflow?')) return
    
    setLoading(true)
    try {
      await n8nService.deleteWorkflow(id)
      await loadWorkflows()
    } catch (error: any) {
      setError(`Failed to delete workflow: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const createFromTemplate = async (templateId: string) => {
    const name = prompt('Enter workflow name:')
    if (!name) return
    
    setLoading(true)
    try {
      await n8nService.createFromTemplate(templateId, { name })
      await loadWorkflows()
      alert('Workflow created from template!')
    } catch (error: any) {
      setError(`Failed to create workflow: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="text-green-400" size={16} />
      case 'error':
      case 'crashed':
        return <XCircle className="text-red-400" size={16} />
      case 'running':
        return <RefreshCw className="text-blue-400 animate-spin" size={16} />
      case 'waiting':
        return <Clock className="text-yellow-400" size={16} />
      default:
        return <AlertCircle className="text-gray-400" size={16} />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-900 text-green-300'
      case 'error':
      case 'crashed':
        return 'bg-red-900 text-red-300'
      case 'running':
        return 'bg-blue-900 text-blue-300'
      case 'waiting':
        return 'bg-yellow-900 text-yellow-300'
      default:
        return 'bg-gray-700 text-gray-300'
    }
  }

  if (!isConnected) {
    return (
      <div className="h-full bg-gray-900 text-white p-6 flex items-center justify-center">
        <div className="max-w-md w-full space-y-6">
          <div className="text-center">
            <Zap size={48} className="mx-auto text-yellow-400 mb-4" />
            <h2 className="text-2xl font-bold mb-2">Workflow Automation</h2>
            <p className="text-gray-400">Connect to your n8n instance for workflow automation</p>
          </div>
          
          {error && (
            <div className="p-3 bg-red-900 border border-red-700 rounded-lg">
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">n8n Instance URL</label>
              <input
                type="text"
                value={n8nUrl}
                onChange={(e) => setN8nUrl(e.target.value)}
                placeholder="https://your-n8n-instance.com"
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">API Key</label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="n8n_api_key_..."
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              />
            </div>
            
            <button
              onClick={handleConnect}
              disabled={loading}
              className="w-full bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              {loading ? <RefreshCw className="animate-spin" size={16} /> : <Zap size={16} />}
              <span>{loading ? 'Connecting...' : 'Connect'}</span>
            </button>
            
            <div className="text-xs text-gray-500 text-center space-y-1">
              <p>Requires n8n instance with API access enabled</p>
              <p>Generate API key in n8n Settings → API</p>
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
            <Zap className="text-yellow-400" size={24} />
            <h1 className="text-xl font-bold">Workflow Automation</h1>
            <span className="text-xs bg-yellow-600 px-2 py-1 rounded">n8n</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('workflows')}
              className={`px-3 py-1 rounded text-sm ${viewMode === 'workflows' ? 'bg-yellow-600' : 'bg-gray-700 hover:bg-gray-600'}`}
            >
              Workflows
            </button>
            <button
              onClick={() => setViewMode('executions')}
              className={`px-3 py-1 rounded text-sm ${viewMode === 'executions' ? 'bg-yellow-600' : 'bg-gray-700 hover:bg-gray-600'}`}
            >
              Executions
            </button>
            <button
              onClick={() => setViewMode('templates')}
              className={`px-3 py-1 rounded text-sm ${viewMode === 'templates' ? 'bg-yellow-600' : 'bg-gray-700 hover:bg-gray-600'}`}
            >
              Templates
            </button>
            <button
              onClick={() => setViewMode('settings')}
              className={`p-2 rounded ${viewMode === 'settings' ? 'bg-yellow-600' : 'bg-gray-700 hover:bg-gray-600'}`}
            >
              <Settings size={16} />
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-900 border-b border-red-700">
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {viewMode === 'workflows' && (
          <div className="h-full flex flex-col">
            <div className="p-4 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Workflows</h2>
                <div className="flex space-x-2">
                  <button
                    onClick={loadWorkflows}
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
                  <RefreshCw className="animate-spin text-yellow-400" size={24} />
                </div>
              ) : (
                <div className="divide-y divide-gray-700">
                  {workflows.map((workflow) => (
                    <div key={workflow.id} className="p-4 hover:bg-gray-800">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${workflow.active ? 'bg-green-400' : 'bg-gray-500'}`} />
                          <div>
                            <h3 className="font-medium">{workflow.name}</h3>
                            <p className="text-sm text-gray-400">
                              {workflow.nodes?.length || 0} nodes • Updated {new Date(workflow.updatedAt).toLocaleDateString()}
                            </p>
                            <div className="flex items-center space-x-2 mt-1">
                              {workflow.tags?.map((tag) => (
                                <span key={tag} className="text-xs bg-gray-700 px-2 py-1 rounded">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => executeWorkflow(workflow.id)}
                            className="p-2 hover:bg-green-600 rounded transition-colors"
                            title="Execute"
                          >
                            <Play size={14} />
                          </button>
                          <button
                            onClick={() => toggleWorkflow(workflow.id, !workflow.active)}
                            className={`p-2 rounded transition-colors ${
                              workflow.active ? 'hover:bg-red-600' : 'hover:bg-green-600'
                            }`}
                            title={workflow.active ? 'Deactivate' : 'Activate'}
                          >
                            {workflow.active ? <Square size={14} /> : <Play size={14} />}
                          </button>
                          <button
                            onClick={() => setSelectedWorkflow(workflow)}
                            className="p-2 hover:bg-blue-600 rounded transition-colors"
                            title="View Details"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            onClick={() => deleteWorkflow(workflow.id)}
                            className="p-2 hover:bg-red-600 rounded transition-colors"
                            title="Delete"
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

        {viewMode === 'executions' && (
          <div className="h-full flex flex-col">
            <div className="p-4 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Recent Executions</h2>
                <button
                  onClick={loadExecutions}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm flex items-center space-x-1"
                >
                  <RefreshCw size={14} />
                  <span>Refresh</span>
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              <div className="divide-y divide-gray-700">
                {executions.map((execution) => (
                  <div key={execution.id} className="p-4 hover:bg-gray-800">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(execution.status)}
                        <div>
                          <h3 className="font-medium">Execution #{execution.id.slice(-8)}</h3>
                          <p className="text-sm text-gray-400">
                            Started: {new Date(execution.startedAt).toLocaleString()}
                            {execution.stoppedAt && ` • Finished: ${new Date(execution.stoppedAt).toLocaleString()}`}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded text-xs ${getStatusColor(execution.status)}`}>
                          {execution.status}
                        </span>
                        <button
                          className="p-2 hover:bg-blue-600 rounded transition-colors"
                          title="View Details"
                        >
                          <Eye size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {viewMode === 'templates' && (
          <div className="h-full flex flex-col">
            <div className="p-4 border-b border-gray-700">
              <h2 className="text-lg font-semibold">Workflow Templates</h2>
              <p className="text-gray-400 text-sm">Pre-built workflows for common automation tasks</p>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
              <div className="grid gap-4">
                {templates.map((template) => (
                  <div key={template.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-semibold">{template.name}</h3>
                          <span className="text-xs bg-yellow-900 text-yellow-300 px-2 py-1 rounded">
                            {template.category}
                          </span>
                        </div>
                        <p className="text-gray-300 text-sm mb-3">{template.description}</p>
                        <div className="flex items-center space-x-2">
                          {template.tags.map((tag) => (
                            <span key={tag} className="text-xs bg-gray-700 px-2 py-1 rounded">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <button
                          onClick={() => createFromTemplate(template.id)}
                          className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-sm flex items-center space-x-1"
                        >
                          <Plus size={14} />
                          <span>Create</span>
                        </button>
                        <button className="p-2 hover:bg-gray-700 rounded transition-colors">
                          <Eye size={14} />
                        </button>
                      </div>
                    </div>
                    
                    <div className="mt-3 pt-3 border-t border-gray-700 text-sm text-gray-400">
                      <div className="flex items-center space-x-4">
                        <span>{template.nodes.length} nodes</span>
                        <span>Ready to use</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {viewMode === 'settings' && (
          <div className="p-6 space-y-6">
            <div>
              <h2 className="text-xl font-bold mb-4">n8n Settings</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">n8n Instance URL</label>
                  <input
                    type="text"
                    value={n8nUrl}
                    onChange={(e) => setN8nUrl(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">API Key</label>
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg"
                  />
                </div>
                
                <button
                  onClick={handleConnect}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg"
                >
                  Update Connection
                </button>
                
                <button
                  onClick={() => {
                    localStorage.removeItem('n8n_url')
                    localStorage.removeItem('n8n_api_key')
                    setIsConnected(false)
                    setN8nUrl('')
                    setApiKey('')
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg ml-2"
                >
                  Disconnect
                </button>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2">Integration Info</h3>
              <div className="bg-gray-800 p-4 rounded-lg space-y-2 text-sm">
                <p><strong>Status:</strong> {isConnected ? '✅ Connected' : '❌ Disconnected'}</p>
                <p><strong>Workflows:</strong> {workflows.length}</p>
                <p><strong>Recent Executions:</strong> {executions.length}</p>
                <p><strong>Templates Available:</strong> {templates.length}</p>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2">Quick Setup</h3>
              <div className="text-sm text-gray-400 space-y-2">
                <p>1. Install n8n: <code className="bg-gray-800 px-2 py-1 rounded">npm install -g n8n</code></p>
                <p>2. Start n8n: <code className="bg-gray-800 px-2 py-1 rounded">n8n start</code></p>
                <p>3. Enable API access in n8n settings</p>
                <p>4. Generate API key and connect here</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Workflow Details Modal */}
      {selectedWorkflow && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">{selectedWorkflow.name}</h3>
              <button
                onClick={() => setSelectedWorkflow(null)}
                className="text-gray-400 hover:text-white"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Details</h4>
                <div className="bg-gray-900 p-3 rounded text-sm">
                  <p><strong>ID:</strong> {selectedWorkflow.id}</p>
                  <p><strong>Status:</strong> {selectedWorkflow.active ? 'Active' : 'Inactive'}</p>
                  <p><strong>Nodes:</strong> {selectedWorkflow.nodes?.length || 0}</p>
                  <p><strong>Created:</strong> {new Date(selectedWorkflow.createdAt).toLocaleString()}</p>
                  <p><strong>Updated:</strong> {new Date(selectedWorkflow.updatedAt).toLocaleString()}</p>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedWorkflow.tags?.map((tag) => (
                    <span key={tag} className="text-xs bg-gray-700 px-2 py-1 rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Nodes</h4>
                <div className="bg-gray-900 p-3 rounded text-sm max-h-40 overflow-y-auto">
                  {selectedWorkflow.nodes?.map((node, index) => (
                    <div key={node.id} className="mb-2">
                      <span className="font-medium">{node.name}</span>
                      <span className="text-gray-400 ml-2">({node.type})</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
