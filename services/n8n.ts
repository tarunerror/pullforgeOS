import axios from 'axios'

export interface N8nWorkflow {
  id: string
  name: string
  active: boolean
  tags: string[]
  createdAt: string
  updatedAt: string
  versionId: string
  nodes: N8nNode[]
  connections: any
}

export interface N8nNode {
  id: string
  name: string
  type: string
  typeVersion: number
  position: [number, number]
  parameters: any
}

export interface N8nExecution {
  id: string
  finished: boolean
  mode: string
  retryOf?: string
  retrySuccessId?: string
  startedAt: string
  stoppedAt?: string
  workflowId: string
  status: 'new' | 'running' | 'success' | 'error' | 'canceled' | 'crashed' | 'waiting'
}

export interface WorkflowTemplate {
  id: string
  name: string
  description: string
  category: string
  nodes: N8nNode[]
  connections: any
  tags: string[]
}

class N8nService {
  private baseUrl: string = ''
  private apiKey: string = ''
  private isConnected: boolean = false

  async connect(baseUrl: string, apiKey: string): Promise<{ success: boolean; message: string }> {
    try {
      this.baseUrl = baseUrl.replace(/\/$/, '') // Remove trailing slash
      this.apiKey = apiKey
      
      // Test connection
      const response = await axios.get(`${this.baseUrl}/rest/workflows`, {
        headers: this.getHeaders()
      })
      
      this.isConnected = true
      return {
        success: true,
        message: `Connected to n8n successfully. Found ${response.data.data?.length || 0} workflows.`
      }
    } catch (error: any) {
      this.isConnected = false
      return {
        success: false,
        message: `Failed to connect to n8n: ${error.response?.data?.message || error.message}`
      }
    }
  }

  private getHeaders() {
    return {
      'X-N8N-API-KEY': this.apiKey,
      'Content-Type': 'application/json'
    }
  }

  private checkConnection() {
    if (!this.isConnected) {
      throw new Error('Not connected to n8n. Please connect first.')
    }
  }

  // Get all workflows
  async getWorkflows(): Promise<N8nWorkflow[]> {
    this.checkConnection()
    
    try {
      const response = await axios.get(`${this.baseUrl}/rest/workflows`, {
        headers: this.getHeaders()
      })
      
      return response.data.data || []
    } catch (error) {
      console.error('Error fetching workflows:', error)
      throw error
    }
  }

  // Get specific workflow
  async getWorkflow(id: string): Promise<N8nWorkflow> {
    this.checkConnection()
    
    try {
      const response = await axios.get(`${this.baseUrl}/rest/workflows/${id}`, {
        headers: this.getHeaders()
      })
      
      return response.data
    } catch (error) {
      console.error('Error fetching workflow:', error)
      throw error
    }
  }

  // Create new workflow
  async createWorkflow(workflow: Partial<N8nWorkflow>): Promise<N8nWorkflow> {
    this.checkConnection()
    
    try {
      const response = await axios.post(`${this.baseUrl}/rest/workflows`, workflow, {
        headers: this.getHeaders()
      })
      
      return response.data
    } catch (error) {
      console.error('Error creating workflow:', error)
      throw error
    }
  }

  // Update workflow
  async updateWorkflow(id: string, workflow: Partial<N8nWorkflow>): Promise<N8nWorkflow> {
    this.checkConnection()
    
    try {
      const response = await axios.patch(`${this.baseUrl}/rest/workflows/${id}`, workflow, {
        headers: this.getHeaders()
      })
      
      return response.data
    } catch (error) {
      console.error('Error updating workflow:', error)
      throw error
    }
  }

  // Delete workflow
  async deleteWorkflow(id: string): Promise<{ success: boolean }> {
    this.checkConnection()
    
    try {
      await axios.delete(`${this.baseUrl}/rest/workflows/${id}`, {
        headers: this.getHeaders()
      })
      
      return { success: true }
    } catch (error) {
      console.error('Error deleting workflow:', error)
      throw error
    }
  }

  // Activate/Deactivate workflow
  async toggleWorkflow(id: string, active: boolean): Promise<N8nWorkflow> {
    this.checkConnection()
    
    try {
      const response = await axios.patch(`${this.baseUrl}/rest/workflows/${id}`, 
        { active }, 
        { headers: this.getHeaders() }
      )
      
      return response.data
    } catch (error) {
      console.error('Error toggling workflow:', error)
      throw error
    }
  }

  // Execute workflow manually
  async executeWorkflow(id: string, data?: any): Promise<N8nExecution> {
    this.checkConnection()
    
    try {
      const response = await axios.post(`${this.baseUrl}/rest/workflows/${id}/execute`, 
        data || {}, 
        { headers: this.getHeaders() }
      )
      
      return response.data
    } catch (error) {
      console.error('Error executing workflow:', error)
      throw error
    }
  }

  // Get workflow executions
  async getExecutions(workflowId?: string, limit: number = 20): Promise<N8nExecution[]> {
    this.checkConnection()
    
    try {
      const params = new URLSearchParams()
      if (workflowId) params.append('workflowId', workflowId)
      params.append('limit', limit.toString())
      
      const response = await axios.get(`${this.baseUrl}/rest/executions?${params}`, {
        headers: this.getHeaders()
      })
      
      return response.data.data || []
    } catch (error) {
      console.error('Error fetching executions:', error)
      throw error
    }
  }

  // Get execution details
  async getExecution(id: string): Promise<N8nExecution> {
    this.checkConnection()
    
    try {
      const response = await axios.get(`${this.baseUrl}/rest/executions/${id}`, {
        headers: this.getHeaders()
      })
      
      return response.data
    } catch (error) {
      console.error('Error fetching execution:', error)
      throw error
    }
  }

  // Get predefined workflow templates
  getWorkflowTemplates(): WorkflowTemplate[] {
    return [
      {
        id: 'github-pr-automation',
        name: 'GitHub PR Automation',
        description: 'Automatically create PRs when code changes are detected',
        category: 'Development',
        tags: ['github', 'automation', 'pr'],
        nodes: [
          {
            id: 'webhook',
            name: 'Webhook',
            type: 'n8n-nodes-base.webhook',
            typeVersion: 1,
            position: [250, 300],
            parameters: {
              httpMethod: 'POST',
              path: 'github-webhook'
            }
          },
          {
            id: 'github',
            name: 'GitHub',
            type: 'n8n-nodes-base.github',
            typeVersion: 1,
            position: [450, 300],
            parameters: {
              operation: 'createPullRequest',
              owner: '{{ $json.repository.owner.login }}',
              repository: '{{ $json.repository.name }}',
              title: 'Automated PR: {{ $json.head_commit.message }}',
              body: 'This PR was created automatically by Pullforge OS workflow automation.',
              head: '{{ $json.ref }}',
              base: 'main'
            }
          }
        ],
        connections: {
          'Webhook': {
            'main': [
              [
                {
                  'node': 'GitHub',
                  'type': 'main',
                  'index': 0
                }
              ]
            ]
          }
        }
      },
      {
        id: 'code-quality-check',
        name: 'Code Quality Check',
        description: 'Run automated code quality checks and send notifications',
        category: 'Development',
        tags: ['code-quality', 'automation', 'notifications'],
        nodes: [
          {
            id: 'schedule',
            name: 'Schedule Trigger',
            type: 'n8n-nodes-base.scheduleTrigger',
            typeVersion: 1,
            position: [250, 300],
            parameters: {
              rule: {
                interval: [
                  {
                    field: 'hours',
                    hoursInterval: 6
                  }
                ]
              }
            }
          },
          {
            id: 'http',
            name: 'HTTP Request',
            type: 'n8n-nodes-base.httpRequest',
            typeVersion: 1,
            position: [450, 300],
            parameters: {
              url: 'https://api.github.com/repos/owner/repo/pulls',
              authentication: 'genericCredentialType',
              genericAuthType: 'httpHeaderAuth'
            }
          },
          {
            id: 'slack',
            name: 'Slack',
            type: 'n8n-nodes-base.slack',
            typeVersion: 1,
            position: [650, 300],
            parameters: {
              operation: 'postMessage',
              channel: '#development',
              text: 'Code quality check completed. {{ $json.length }} PRs reviewed.'
            }
          }
        ],
        connections: {
          'Schedule Trigger': {
            'main': [
              [
                {
                  'node': 'HTTP Request',
                  'type': 'main',
                  'index': 0
                }
              ]
            ]
          },
          'HTTP Request': {
            'main': [
              [
                {
                  'node': 'Slack',
                  'type': 'main',
                  'index': 0
                }
              ]
            ]
          }
        }
      },
      {
        id: 'file-sync-automation',
        name: 'File Sync Automation',
        description: 'Sync files between different services and repositories',
        category: 'File Management',
        tags: ['sync', 'files', 'automation'],
        nodes: [
          {
            id: 'webhook',
            name: 'File Change Webhook',
            type: 'n8n-nodes-base.webhook',
            typeVersion: 1,
            position: [250, 300],
            parameters: {
              httpMethod: 'POST',
              path: 'file-change'
            }
          },
          {
            id: 'supabase',
            name: 'Supabase',
            type: 'n8n-nodes-base.supabase',
            typeVersion: 1,
            position: [450, 300],
            parameters: {
              operation: 'insert',
              table: 'file_embeddings',
              data: {
                file_path: '{{ $json.file_path }}',
                content: '{{ $json.content }}',
                metadata: '{{ $json.metadata }}'
              }
            }
          }
        ],
        connections: {
          'File Change Webhook': {
            'main': [
              [
                {
                  'node': 'Supabase',
                  'type': 'main',
                  'index': 0
                }
              ]
            ]
          }
        }
      }
    ]
  }

  // Create workflow from template
  async createFromTemplate(templateId: string, customizations?: any): Promise<N8nWorkflow> {
    const template = this.getWorkflowTemplates().find(t => t.id === templateId)
    if (!template) {
      throw new Error(`Template ${templateId} not found`)
    }

    const workflow: Partial<N8nWorkflow> = {
      name: customizations?.name || template.name,
      nodes: template.nodes,
      connections: template.connections,
      tags: template.tags,
      active: false
    }

    return this.createWorkflow(workflow)
  }
}

export const n8nService = new N8nService()
