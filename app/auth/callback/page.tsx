'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, AlertCircle, RefreshCw } from 'lucide-react'

export default function AuthCallback() {
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // The Supabase client will automatically handle the callback
        // and update the auth state through the AuthProvider
        
        // Wait a moment for the auth state to update
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        setStatus('success')
        setMessage('Authentication successful! Redirecting...')
        
        // Redirect back to the main app after a short delay
        setTimeout(() => {
          router.push('/')
        }, 1500)
        
      } catch (error: any) {
        console.error('Auth callback error:', error)
        setStatus('error')
        setMessage(error.message || 'Authentication failed')
      }
    }

    handleAuthCallback()
  }, [router])

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="bg-gray-800 rounded-lg p-8 max-w-md w-full mx-4 text-center">
        {status === 'loading' && (
          <>
            <RefreshCw className="mx-auto text-blue-400 animate-spin mb-4" size={48} />
            <h1 className="text-xl font-bold text-white mb-2">Completing Authentication</h1>
            <p className="text-gray-400">Please wait while we set up your account...</p>
          </>
        )}
        
        {status === 'success' && (
          <>
            <CheckCircle className="mx-auto text-green-400 mb-4" size={48} />
            <h1 className="text-xl font-bold text-white mb-2">Authentication Successful</h1>
            <p className="text-gray-400 mb-4">{message}</p>
            <div className="text-sm text-gray-500">
              You will be redirected to Pullforge OS shortly...
            </div>
          </>
        )}
        
        {status === 'error' && (
          <>
            <AlertCircle className="mx-auto text-red-400 mb-4" size={48} />
            <h1 className="text-xl font-bold text-white mb-2">Authentication Failed</h1>
            <p className="text-gray-400 mb-4">{message}</p>
            <button
              onClick={() => router.push('/')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Return to Pullforge OS
            </button>
          </>
        )}
      </div>
    </div>
  )
}
