/**
 * Admin Guard Component
 * Protects admin routes - redirects non-admin users
 */

'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { toast } from 'sonner'

interface AdminGuardProps {
  children: React.ReactNode
}

export function AdminGuard({ children }: AdminGuardProps) {
  const { user, isLoading, isAuthenticated } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!isLoading) {
      // Not authenticated - redirect to login
      if (!isAuthenticated) {
        toast.error('Access Denied', {
          description: 'Please login to access this page.'
        })
        router.push(`/auth/login?redirect=${encodeURIComponent(pathname)}`)
        return
      }

      // Authenticated but not admin - redirect to dashboard
      if (user?.role !== 'ADMIN') {
        toast.error('Access Denied', {
          description: 'You do not have permission to access this page.'
        })
        router.push('/dashboard')
        return
      }
    }
  }, [user, isLoading, isAuthenticated, router, pathname])

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Verifying access...</p>
        </div>
      </div>
    )
  }

  // Not authenticated or not admin - don't render children
  if (!isAuthenticated || user?.role !== 'ADMIN') {
    return null
  }

  // User is admin - render children
  return <>{children}</>
}
