import authService from './auth'

export interface GitHubInstallation {
  id: number
  account: {
    login: string
    id: number
    avatar_url: string
    type: string
  }
  repository_selection: string
  permissions: Record<string, string>
  created_at: string
  updated_at: string
}

export interface GitHubRepository {
  id: number
  name: string
  full_name: string
  description: string
  private: boolean
  html_url: string
  clone_url: string
  ssh_url: string
  default_branch: string
  language: string
  stargazers_count: number
  forks_count: number
  updated_at: string
  owner: {
    login: string
    avatar_url: string
  }
}

export interface GitHubFile {
  name: string
  path: string
  sha: string
  size: number
  url: string
  html_url: string
  git_url: string
  download_url: string
  type: 'file' | 'dir'
  content?: string
  encoding?: string
}

class GitHubAppService {
  private baseUrl = 'https://api.github.com'

  private async makeRequest(endpoint: string, options: RequestInit = {}): Promise<Response> {
    const user = authService.getUser()
    if (!user?.github_access_token) {
      throw new Error('GitHub access token not available. Please authenticate with GitHub.')
    }

    const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint}`
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `token ${user.github_access_token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(`GitHub API error: ${response.status} - ${errorData.message || response.statusText}`)
    }

    return response
  }

  // Installation management
  async getInstallations(): Promise<GitHubInstallation[]> {
    try {
      const response = await this.makeRequest('/user/installations')
      const data = await response.json()
      return data.installations || []
    } catch (error) {
      console.error('Error fetching installations:', error)
      throw error
    }
  }

  async getInstallationRepositories(installationId: number): Promise<GitHubRepository[]> {
    try {
      const response = await this.makeRequest(`/user/installations/${installationId}/repositories`)
      const data = await response.json()
      return data.repositories || []
    } catch (error) {
      console.error('Error fetching installation repositories:', error)
      throw error
    }
  }

  // Repository operations
  async getRepository(owner: string, repo: string): Promise<GitHubRepository> {
    try {
      const response = await this.makeRequest(`/repos/${owner}/${repo}`)
      return await response.json()
    } catch (error) {
      console.error('Error fetching repository:', error)
      throw error
    }
  }

  async getRepositoryContents(owner: string, repo: string, path: string = ''): Promise<GitHubFile[]> {
    try {
      const response = await this.makeRequest(`/repos/${owner}/${repo}/contents/${path}`)
      const data = await response.json()
      return Array.isArray(data) ? data : [data]
    } catch (error) {
      console.error('Error fetching repository contents:', error)
      throw error
    }
  }

  async getFileContent(owner: string, repo: string, path: string): Promise<string> {
    try {
      const response = await this.makeRequest(`/repos/${owner}/${repo}/contents/${path}`)
      const data = await response.json()
      
      if (data.content && data.encoding === 'base64') {
        return atob(data.content.replace(/\n/g, ''))
      }
      
      throw new Error('File content not available or not base64 encoded')
    } catch (error) {
      console.error('Error fetching file content:', error)
      throw error
    }
  }

  // Branch operations
  async getBranches(owner: string, repo: string): Promise<any[]> {
    try {
      const response = await this.makeRequest(`/repos/${owner}/${repo}/branches`)
      return await response.json()
    } catch (error) {
      console.error('Error fetching branches:', error)
      throw error
    }
  }

  async createBranch(owner: string, repo: string, branchName: string, fromBranch: string = 'main'): Promise<any> {
    try {
      // Get the SHA of the source branch
      const branchResponse = await this.makeRequest(`/repos/${owner}/${repo}/git/refs/heads/${fromBranch}`)
      const branchData = await branchResponse.json()
      const sha = branchData.object.sha

      // Create new branch
      const response = await this.makeRequest(`/repos/${owner}/${repo}/git/refs`, {
        method: 'POST',
        body: JSON.stringify({
          ref: `refs/heads/${branchName}`,
          sha: sha
        })
      })
      
      return await response.json()
    } catch (error) {
      console.error('Error creating branch:', error)
      throw error
    }
  }

  // File operations
  async createOrUpdateFile(
    owner: string,
    repo: string,
    path: string,
    content: string,
    message: string,
    branch: string = 'main',
    sha?: string
  ): Promise<any> {
    try {
      const body: any = {
        message,
        content: btoa(content),
        branch
      }

      if (sha) {
        body.sha = sha
      }

      const response = await this.makeRequest(`/repos/${owner}/${repo}/contents/${path}`, {
        method: 'PUT',
        body: JSON.stringify(body)
      })
      
      return await response.json()
    } catch (error) {
      console.error('Error creating/updating file:', error)
      throw error
    }
  }

  async deleteFile(
    owner: string,
    repo: string,
    path: string,
    message: string,
    sha: string,
    branch: string = 'main'
  ): Promise<any> {
    try {
      const response = await this.makeRequest(`/repos/${owner}/${repo}/contents/${path}`, {
        method: 'DELETE',
        body: JSON.stringify({
          message,
          sha,
          branch
        })
      })
      
      return await response.json()
    } catch (error) {
      console.error('Error deleting file:', error)
      throw error
    }
  }

  // Pull Request operations
  async createPullRequest(
    owner: string,
    repo: string,
    title: string,
    body: string,
    head: string,
    base: string = 'main'
  ): Promise<any> {
    try {
      const response = await this.makeRequest(`/repos/${owner}/${repo}/pulls`, {
        method: 'POST',
        body: JSON.stringify({
          title,
          body,
          head,
          base
        })
      })
      
      return await response.json()
    } catch (error) {
      console.error('Error creating pull request:', error)
      throw error
    }
  }

  async getPullRequests(owner: string, repo: string, state: string = 'open'): Promise<any[]> {
    try {
      const response = await this.makeRequest(`/repos/${owner}/${repo}/pulls?state=${state}`)
      return await response.json()
    } catch (error) {
      console.error('Error fetching pull requests:', error)
      throw error
    }
  }

  async getPullRequest(owner: string, repo: string, pullNumber: number): Promise<any> {
    try {
      const response = await this.makeRequest(`/repos/${owner}/${repo}/pulls/${pullNumber}`)
      return await response.json()
    } catch (error) {
      console.error('Error fetching pull request:', error)
      throw error
    }
  }

  // Commit operations
  async getCommits(owner: string, repo: string, branch?: string, limit: number = 30): Promise<any[]> {
    try {
      let url = `/repos/${owner}/${repo}/commits?per_page=${limit}`
      if (branch) {
        url += `&sha=${branch}`
      }
      
      const response = await this.makeRequest(url)
      return await response.json()
    } catch (error) {
      console.error('Error fetching commits:', error)
      throw error
    }
  }

  // Search operations
  async searchRepositories(query: string, sort: string = 'updated', order: string = 'desc'): Promise<any> {
    try {
      const user = authService.getUser()
      if (!user) {
        throw new Error('User not authenticated')
      }

      // Search in user's accessible repositories
      const response = await this.makeRequest(`/search/repositories?q=${encodeURIComponent(query)}+user:${user.user_metadata?.user_name || user.email}&sort=${sort}&order=${order}`)
      return await response.json()
    } catch (error) {
      console.error('Error searching repositories:', error)
      throw error
    }
  }

  async searchCode(query: string, repo?: string): Promise<any> {
    try {
      let searchQuery = query
      if (repo) {
        searchQuery += ` repo:${repo}`
      }
      
      const response = await this.makeRequest(`/search/code?q=${encodeURIComponent(searchQuery)}`)
      return await response.json()
    } catch (error) {
      console.error('Error searching code:', error)
      throw error
    }
  }

  // User operations
  async getAuthenticatedUser(): Promise<any> {
    try {
      const response = await this.makeRequest('/user')
      return await response.json()
    } catch (error) {
      console.error('Error fetching authenticated user:', error)
      throw error
    }
  }

  // Utility methods
  async generateAIPRDescription(changes: string[], context: string = ''): Promise<string> {
    // This is a simplified AI description generator
    // In a real implementation, you'd use OpenAI or another AI service
    
    const changeTypes = {
      added: changes.filter(c => c.includes('add') || c.includes('create')),
      modified: changes.filter(c => c.includes('update') || c.includes('modify') || c.includes('change')),
      removed: changes.filter(c => c.includes('delete') || c.includes('remove')),
      fixed: changes.filter(c => c.includes('fix') || c.includes('bug'))
    }

    let description = '## Summary\n\n'
    
    if (changeTypes.added.length > 0) {
      description += `### ✨ Added\n${changeTypes.added.map(c => `- ${c}`).join('\n')}\n\n`
    }
    
    if (changeTypes.modified.length > 0) {
      description += `### 🔄 Modified\n${changeTypes.modified.map(c => `- ${c}`).join('\n')}\n\n`
    }
    
    if (changeTypes.fixed.length > 0) {
      description += `### 🐛 Fixed\n${changeTypes.fixed.map(c => `- ${c}`).join('\n')}\n\n`
    }
    
    if (changeTypes.removed.length > 0) {
      description += `### 🗑️ Removed\n${changeTypes.removed.map(c => `- ${c}`).join('\n')}\n\n`
    }

    if (context) {
      description += `## Context\n\n${context}\n\n`
    }

    description += `## Testing\n\n- [ ] Manual testing completed\n- [ ] All tests pass\n- [ ] No breaking changes\n\n`
    description += `---\n*Generated by Pullforge OS*`

    return description
  }

  // Installation URL generator
  getInstallationUrl(clientId: string): string {
    const redirectUri = encodeURIComponent(`${window.location.origin}/auth/github/callback`)
    return `https://github.com/apps/pullforge-os/installations/new?client_id=${clientId}&redirect_uri=${redirectUri}`
  }

  // GitHub OAuth App installation flow
  initiateGitHubAppInstallation(): void {
    const clientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID
    if (!clientId) {
      throw new Error('GitHub Client ID not configured')
    }

    const installUrl = `https://github.com/apps/pullforge-os/installations/new`
    window.open(installUrl, '_blank', 'width=600,height=700')
  }

  // Check installation status
  async checkInstallationStatus(): Promise<{ installed: boolean; installations: GitHubInstallation[] }> {
    try {
      const installations = await this.getInstallations()
      return {
        installed: installations.length > 0,
        installations
      }
    } catch (error) {
      return {
        installed: false,
        installations: []
      }
    }
  }
}

export const gitHubAppService = new GitHubAppService()
export default gitHubAppService
