'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import authService, { AuthUser } from '@/services/auth'

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  signInWithGitHub: () => Promise<void>
  signOut: () => Promise<void>
  isAuthenticated: boolean
  hasGitHubAccess: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Initialize auth service
    const initAuth = async () => {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || localStorage.getItem('supabase_url')
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || localStorage.getItem('supabase_anon_key')

      if (supabaseUrl && supabaseKey) {
        const initialized = await authService.initialize(supabaseUrl, supabaseKey)
        if (initialized) {
          setUser(authService.getUser())
        }
      }
      
      setLoading(false)
    }

    initAuth()

    // Listen for auth state changes
    const unsubscribe = authService.onAuthStateChange((user) => {
      setUser(user)
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const signInWithGitHub = async () => {
    setLoading(true)
    try {
      const result = await authService.signInWithGitHub()
      if (!result.success) {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error('Sign in error:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    setLoading(true)
    try {
      const result = await authService.signOut()
      if (!result.success) {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error('Sign out error:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const value: AuthContextType = {
    user,
    loading,
    signInWithGitHub,
    signOut,
    isAuthenticated: authService.isAuthenticated(),
    hasGitHubAccess: authService.hasGitHubAccess(),
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
