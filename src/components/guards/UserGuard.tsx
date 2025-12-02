/**
 * User Guard Component
 * Protects user routes - redirects admin users to their dashboard
 */

'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { toast } from 'sonner'

interface UserGuardProps {
  children: React.ReactNode
}

export function UserGuard({ children }: UserGuardProps) {
  const { user, isLoading, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      // Not authenticated - redirect to login
      if (!isAuthenticated) {
        toast.error('Access Denied', {
          description: 'Please login to access this page.'
        })
        router.push('/auth/login?redirect=/dashboard')
        return
      }

      // Admin trying to access user routes - redirect to admin dashboard
      if (user?.role === 'ADMIN') {
        toast.info('Redirecting to Admin Dashboard', {
          description: 'You are an admin user.'
        })
        router.push('/admin/dashboard')
        return
      }
    }
  }, [user, isLoading, isAuthenticated, router])

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // Not authenticated or is admin - don't render children
  if (!isAuthenticated || user?.role === 'ADMIN') {
    return null
  }

  // User is regular user - render children
  return <>{children}</>
}
