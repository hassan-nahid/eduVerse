'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Mail, Lock, Chrome } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import { authService } from '@/services/auth.service'
import { useAuth } from '@/context/AuthContext'
import type { ApiError } from '@/lib/api-client'

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional()
})

type LoginFormData = z.infer<typeof loginSchema>

export const LoginForm = () => {
  'use no memo'
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()
  const { login: setAuthUser } = useAuth()
  
  const { register, handleSubmit, formState: { errors, isSubmitting }, setValue, watch } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      rememberMe: false
    }
  })

  // eslint-disable-next-line react-hooks/incompatible-library
  const rememberMe = watch('rememberMe')

  const onSubmit = async (data: LoginFormData) => {
    try {
      const response = await authService.login({
        email: data.email,
        password: data.password
      })

      // Update auth context with user data
      setAuthUser(response.data.user)

      toast.success('Login successful!', {
        description: `Welcome back, ${response.data.user.name}!`
      })

      // Store user data in localStorage if needed
      if (data.rememberMe) {
        localStorage.setItem('rememberedEmail', data.email)
      } else {
        localStorage.removeItem('rememberedEmail')
      }

      // Redirect based on user role
      if (response.data.user.role === 'ADMIN') {
        router.push('/admin/dashboard')
      } else {
        router.push('/dashboard')
      }
    } catch (error) {
      const apiError = error as ApiError
      console.error('Login error:', apiError)
      
      // Default error message
      let errorTitle = 'Login Failed'
      let errorDescription = 'Something went wrong. Please try again.'

      // Check if we have a network error (statusCode 0 means fetch failed)
      if (apiError.statusCode === 0 || !apiError.statusCode) {
        errorTitle = 'Connection Error'
        errorDescription = 'Unable to connect to the server. Please check your internet connection and try again.'
      }
      // Check for unverified user (401 with specific message from passport)
      else if (apiError.statusCode === 401 && apiError.message === 'User is not verified') {
        toast.warning('Email Verification Required', {
          description: 'Please verify your email address to continue.',
          duration: 5000
        })
        
        // Redirect to verify email page
        router.push(`/auth/verify-email?email=${encodeURIComponent(data.email)}`)
        return
      }
      // Handle other 401 errors (invalid credentials)
      else if (apiError.statusCode === 401) {
        errorTitle = 'Invalid Credentials'
        errorDescription = apiError.message || 'The email or password you entered is incorrect. Please try again.'
      } 
      else if (apiError.statusCode === 404) {
        errorTitle = 'Account Not Found'
        errorDescription = apiError.message || 'No account exists with this email address. Please sign up first.'
      } 
      else if (apiError.statusCode === 403) {
        errorTitle = 'Access Denied'
        errorDescription = apiError.message || 'Your account may be inactive or blocked. Please contact support.'
      }
      else if (apiError.statusCode >= 500) {
        errorTitle = 'Server Error'
        errorDescription = 'Our servers are experiencing issues. Please try again in a few moments.'
      }
      else if (apiError.message) {
        // Use the backend's message for any other error
        errorDescription = apiError.message
      }

      // Show error sources if available (validation errors)
      if (apiError.errorSources && apiError.errorSources.length > 0) {
        const errorMessages = apiError.errorSources.map(err => err.message).join(', ')
        errorDescription = errorMessages
      }

      toast.error(errorTitle, {
        description: errorDescription,
        duration: 5000
      })
    }
  }

  const handleGoogleLogin = () => {
    // Redirect to backend Google OAuth endpoint
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'
    window.location.href = `${apiUrl}/auth/google?redirect=/dashboard`
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        {/* Email Field */}
        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              className="pl-10 h-12"
              {...register('email')}
            />
          </div>
          {errors.email && (
            <p className="text-sm text-red-500">{errors.email.message}</p>
          )}
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link 
              href="/auth/forgot-password" 
              className="text-sm text-primary hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              className="pl-10 pr-10 h-12"
              {...register('password')}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-sm text-red-500">{errors.password.message}</p>
          )}
        </div>

        {/* Remember Me */}
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="remember"
            checked={rememberMe}
            onCheckedChange={(checked) => setValue('rememberMe', checked as boolean)}
          />
          <label
            htmlFor="remember"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
          >
            Remember me for 30 days
          </label>
        </div>
      </div>

      {/* Submit Button */}
      <Button type="submit" className="w-full h-12 text-base" size="lg" disabled={isSubmitting}>
        {isSubmitting ? 'Signing in...' : 'Sign In to Your Account'}
      </Button>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <Separator />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>

      {/* Social Login */}
      <div className="grid grid-cols-1 gap-3">
        <Button type="button" variant="outline" className="h-12" size="lg" onClick={handleGoogleLogin}>
          <Chrome className="mr-2 h-5 w-5" />
          Continue with Google
        </Button>
      </div>

      {/* Sign Up Link */}
      <div className="text-center text-sm">
        <span className="text-muted-foreground">Don&apos;t have an account? </span>
        <Link href="/auth/register" className="text-primary font-semibold hover:underline">
          Sign up for free
        </Link>
      </div>
    </form>
  )
}
