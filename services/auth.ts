import { createClient, SupabaseClient, User, Session } from '@supabase/supabase-js'
import openRouterService from './openrouter'

export interface AuthUser extends User {
  github_username?: string
  github_access_token?: string
  github_installation_id?: string
}

export interface AuthSession extends Session {
  user: AuthUser
}

class AuthService {
  private supabase: SupabaseClient | null = null
  private user: AuthUser | null = null
  private session: AuthSession | null = null
  private listeners: ((user: AuthUser | null) => void)[] = []

  async initialize(supabaseUrl: string, supabaseKey: string): Promise<boolean> {
    try {
      this.supabase = createClient(supabaseUrl, supabaseKey, {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true
        }
      })

      // Get initial session
      const { data: { session }, error } = await this.supabase.auth.getSession()
      if (error) {
        console.error('Error getting session:', error)
        return false
      }

      if (session) {
        this.session = session as AuthSession
        this.user = session.user as AuthUser
        this.notifyListeners()
      }

      // Listen for auth changes
      this.supabase.auth.onAuthStateChange((event, session) => {
        console.log('Auth state changed:', event)
        
        if (session) {
          this.session = session as AuthSession
          this.user = session.user as AuthUser
        } else {
          this.session = null
          this.user = null
        }
        
        this.notifyListeners()
      })

      return true
    } catch (error) {
      console.error('Failed to initialize auth:', error)
      return false
    }
  }

  async signInWithGitHub(): Promise<{ success: boolean; error?: string }> {
    if (!this.supabase) {
      return { success: false, error: 'Supabase not initialized' }
    }

    try {
      const { data, error } = await this.supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          scopes: 'repo read:user user:email',
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  async signOut(): Promise<{ success: boolean; error?: string }> {
    if (!this.supabase) {
      return { success: false, error: 'Supabase not initialized' }
    }

    try {
      const { error } = await this.supabase.auth.signOut()
      if (error) {
        return { success: false, error: error.message }
      }

      this.session = null
      this.user = null
      this.notifyListeners()
      
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  async updateProfile(updates: {
    github_username?: string
    github_access_token?: string
    github_installation_id?: string
  }): Promise<{ success: boolean; error?: string }> {
    if (!this.supabase || !this.user) {
      return { success: false, error: 'Not authenticated' }
    }

    try {
      const { error } = await this.supabase.auth.updateUser({
        data: updates
      })

      if (error) {
        return { success: false, error: error.message }
      }

      // Update local user data
      if (this.user) {
        Object.assign(this.user, updates)
        this.notifyListeners()
      }

      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  async getGitHubInstallations(): Promise<{
    success: boolean
    installations?: any[]
    error?: string
  }> {
    if (!this.user?.github_access_token) {
      return { success: false, error: 'GitHub access token not available' }
    }

    try {
      const response = await fetch('https://api.github.com/user/installations', {
        headers: {
          'Authorization': `token ${this.user.github_access_token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      })

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`)
      }

      const data = await response.json()
      return { success: true, installations: data.installations }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  async getInstallationRepositories(installationId: string): Promise<{
    success: boolean
    repositories?: any[]
    error?: string
  }> {
    if (!this.user?.github_access_token) {
      return { success: false, error: 'GitHub access token not available' }
    }

    try {
      const response = await fetch(`https://api.github.com/user/installations/${installationId}/repositories`, {
        headers: {
          'Authorization': `token ${this.user.github_access_token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      })

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`)
      }

      const data = await response.json()
      return { success: true, repositories: data.repositories }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  // User management
  getUser(): AuthUser | null {
    return this.user
  }

  getSession(): AuthSession | null {
    return this.session
  }

  isAuthenticated(): boolean {
    return !!this.user
  }

  hasGitHubAccess(): boolean {
    return !!(this.user?.github_access_token)
  }

  // Event listeners
  onAuthStateChange(callback: (user: AuthUser | null) => void): () => void {
    this.listeners.push(callback)
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(callback)
      if (index > -1) {
        this.listeners.splice(index, 1)
      }
    }
  }

  private notifyListeners() {
    this.listeners.forEach(callback => callback(this.user))
  }

  // Database operations for user data
  async saveUserEmbedding(fileId: string, embedding: number[], metadata: any): Promise<{
    success: boolean
    error?: string
  }> {
    if (!this.supabase || !this.user) {
      return { success: false, error: 'Not authenticated' }
    }

    try {
      const { error } = await this.supabase
        .from('user_embeddings')
        .upsert({
          user_id: this.user.id,
          file_id: fileId,
          embedding,
          metadata,
          updated_at: new Date().toISOString()
        })

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  async searchUserEmbeddings(queryEmbedding: number[], limit: number = 10): Promise<{
    success: boolean
    results?: any[]
    error?: string
  }> {
    if (!this.supabase || !this.user) {
      return { success: false, error: 'Not authenticated' }
    }

    try {
      const { data, error } = await this.supabase.rpc('search_user_embeddings', {
        query_embedding: queryEmbedding,
        user_id: this.user.id,
        match_threshold: 0.7,
        match_count: limit
      })

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true, results: data }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  async getUserEmbeddings(): Promise<{
    success: boolean
    embeddings?: any[]
    error?: string
  }> {
    if (!this.supabase || !this.user) {
      return { success: false, error: 'Not authenticated' }
    }

    try {
      const { data, error } = await this.supabase
        .from('user_embeddings')
        .select('*')
        .eq('user_id', this.user.id)
        .order('updated_at', { ascending: false })

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true, embeddings: data }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  async deleteUserEmbedding(fileId: string): Promise<{
    success: boolean
    error?: string
  }> {
    if (!this.supabase || !this.user) {
      return { success: false, error: 'Not authenticated' }
    }

    try {
      const { error } = await this.supabase
        .from('user_embeddings')
        .delete()
        .eq('user_id', this.user.id)
        .eq('file_id', fileId)

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }
}

export const authService = new AuthService()
export default authService
