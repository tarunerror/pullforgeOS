'use client'

import React, { useState } from 'react'
import { useAuth } from './AuthProvider'
import { 
  Github, 
  Key, 
  Database, 
  Shield, 
  CheckCircle, 
  AlertCircle, 
  X,
  ExternalLink,
  Settings
} from 'lucide-react'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  requiredFor?: string
}

export default function AuthModal({ isOpen, onClose, requiredFor }: AuthModalProps) {
  const { user, signInWithGitHub, signOut, loading, isAuthenticated, hasGitHubAccess } = useAuth()
  const [supabaseUrl, setSupabaseUrl] = useState(
    process.env.NEXT_PUBLIC_SUPABASE_URL || localStorage.getItem('supabase_url') || ''
  )
  const [supabaseKey, setSupabaseKey] = useState(
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || localStorage.getItem('supabase_anon_key') || ''
  )
  const [error, setError] = useState('')
  const [step, setStep] = useState<'config' | 'auth' | 'success'>('config')

  if (!isOpen) return null

  const handleSupabaseConfig = () => {
    if (!supabaseUrl.trim() || !supabaseKey.trim()) {
      setError('Please provide both Supabase URL and Anon Key')
      return
    }

    localStorage.setItem('supabase_url', supabaseUrl)
    localStorage.setItem('supabase_anon_key', supabaseKey)
    setStep('auth')
    setError('')
  }

  const handleGitHubSignIn = async () => {
    try {
      setError('')
      await signInWithGitHub()
      setStep('success')
    } catch (error: any) {
      setError(error.message || 'Failed to sign in with GitHub')
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      setStep('config')
    } catch (error: any) {
      setError(error.message || 'Failed to sign out')
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4 border border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Shield className="text-blue-400" size={24} />
            <h2 className="text-xl font-bold text-white">Authentication Required</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {requiredFor && (
          <div className="mb-4 p-3 bg-blue-900 border border-blue-700 rounded-lg">
            <p className="text-blue-300 text-sm">
              Authentication is required to use <strong>{requiredFor}</strong>
            </p>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-900 border border-red-700 rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertCircle className="text-red-400" size={16} />
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Step 1: Supabase Configuration */}
        {step === 'config' && (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <Database className="mx-auto text-green-400 mb-2" size={32} />
              <h3 className="text-lg font-semibold text-white mb-2">Configure Supabase</h3>
              <p className="text-gray-400 text-sm">
                First, configure your Supabase connection for authentication and vector embeddings
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Supabase URL
              </label>
              <input
                type="text"
                value={supabaseUrl}
                onChange={(e) => setSupabaseUrl(e.target.value)}
                placeholder="https://your-project.supabase.co"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Supabase Anon Key
              </label>
              <input
                type="password"
                value={supabaseKey}
                onChange={(e) => setSupabaseKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <button
              onClick={handleSupabaseConfig}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              <Settings size={16} />
              <span>Configure Supabase</span>
            </button>

            <div className="text-xs text-gray-500 space-y-1">
              <p>• Get your Supabase URL and Anon Key from your project dashboard</p>
              <p>• Enable GitHub OAuth in Supabase Auth settings</p>
              <p>• Required for authentication and vector embeddings</p>
            </div>
          </div>
        )}

        {/* Step 2: GitHub Authentication */}
        {step === 'auth' && !isAuthenticated && (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <Github className="mx-auto text-white mb-2" size={32} />
              <h3 className="text-lg font-semibold text-white mb-2">Sign in with GitHub</h3>
              <p className="text-gray-400 text-sm">
                Authenticate with GitHub to access your repositories and enable AI-powered features
              </p>
            </div>

            <button
              onClick={handleGitHubSignIn}
              disabled={loading}
              className="w-full bg-gray-900 hover:bg-gray-800 border border-gray-600 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              <Github size={20} />
              <span>{loading ? 'Signing in...' : 'Continue with GitHub'}</span>
              <ExternalLink size={16} />
            </button>

            <div className="text-xs text-gray-500 space-y-1">
              <p>• Secure OAuth authentication via Supabase</p>
              <p>• Access to your GitHub repositories</p>
              <p>• Required for GitHub integration features</p>
            </div>
          </div>
        )}

        {/* Step 3: Success / User Info */}
        {(step === 'success' || isAuthenticated) && user && (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <CheckCircle className="mx-auto text-green-400 mb-2" size={32} />
              <h3 className="text-lg font-semibold text-white mb-2">Authentication Successful</h3>
              <p className="text-gray-400 text-sm">
                You're now authenticated and ready to use all features
              </p>
            </div>

            <div className="bg-gray-700 rounded-lg p-4 space-y-3">
              <div className="flex items-center space-x-3">
                <img
                  src={user.user_metadata?.avatar_url || `https://github.com/${user.user_metadata?.user_name}.png`}
                  alt="Avatar"
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <p className="font-medium text-white">
                    {user.user_metadata?.full_name || user.user_metadata?.user_name || user.email}
                  </p>
                  <p className="text-sm text-gray-400">{user.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center space-x-1">
                  <CheckCircle className="text-green-400" size={12} />
                  <span className="text-gray-300">Supabase Connected</span>
                </div>
                <div className="flex items-center space-x-1">
                  <CheckCircle className="text-green-400" size={12} />
                  <span className="text-gray-300">GitHub Authenticated</span>
                </div>
                <div className="flex items-center space-x-1">
                  <CheckCircle className="text-green-400" size={12} />
                  <span className="text-gray-300">Vector Embeddings</span>
                </div>
                <div className="flex items-center space-x-1">
                  <CheckCircle className="text-green-400" size={12} />
                  <span className="text-gray-300">Repository Access</span>
                </div>
              </div>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={onClose}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Continue
              </button>
              <button
                onClick={handleSignOut}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
