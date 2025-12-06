'use client'

import { Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { AuthLayout } from '@/components/modules/Auth/AuthLayout'
import { LoginForm } from '@/components/modules/Auth/LoginForm'
import { useAuth } from '@/context/AuthContext'
import { Skeleton } from '@/components/ui/skeleton'

function LoginPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isAuthenticated, user, isLoading } = useAuth()

  useEffect(() => {
    // If already authenticated, redirect to appropriate dashboard or redirect URL
    if (!isLoading && isAuthenticated && user) {
      const redirectUrl = searchParams.get('redirect')
      
      if (redirectUrl) {
        router.push(redirectUrl)
      } else if (user.role === 'ADMIN') {
        router.push('/admin/dashboard')
      } else {
        router.push('/dashboard')
      }
    }
  }, [isAuthenticated, user, isLoading, router, searchParams])

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <AuthLayout
        title="Welcome Back!"
        subtitle="Sign in to continue your learning journey and compete with friends."
      >
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </AuthLayout>
    )
  }

  // Don't render login form if already authenticated (will redirect)
  if (isAuthenticated) {
    return null
  }

  return (
    <AuthLayout
      title="Welcome Back!"
      subtitle="Sign in to continue your learning journey and compete with friends."
    >
      <LoginForm />
    </AuthLayout>
  )
}

const LoginPage = () => {
  return (
    <Suspense fallback={
      <AuthLayout
        title="Welcome Back!"
        subtitle="Sign in to continue your learning journey and compete with friends."
      >
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </AuthLayout>
    }>
      <LoginPageContent />
    </Suspense>
  )
}

export default LoginPage