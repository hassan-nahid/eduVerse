'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Mail, Lock, User, Chrome, CheckCircle2, Calendar as CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { authService } from '@/services/auth.service'
import { otpService } from '@/services/otp.service'
import type { ApiError } from '@/lib/api-client'

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  confirmPassword: z.string(),
  dateOfBirth: z.date().refine((date) => {
    const age = new Date().getFullYear() - date.getFullYear()
    return age >= 13
  }, 'You must be at least 13 years old'),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER'], {
    message: 'Please select your gender',
  }),
  agreeToTerms: z.boolean().refine((val) => val === true, {
    message: 'You must agree to the terms and conditions',
  })
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

type RegisterFormData = z.infer<typeof registerSchema>

export const RegisterForm = () => {
  'use no memo'
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const router = useRouter()

  const { register, handleSubmit, formState: { errors, isSubmitting }, setValue, watch } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  // eslint-disable-next-line react-hooks/incompatible-library
  const password = watch('password', '')
  const agreeToTerms = watch('agreeToTerms')
  const dateOfBirth = watch('dateOfBirth')
  const gender = watch('gender')

  const passwordRequirements = [
    { met: password.length >= 8, text: 'At least 8 characters' },
    { met: /[A-Z]/.test(password), text: 'One uppercase letter' },
    { met: /[0-9]/.test(password), text: 'One number' },
    { met: /[^A-Za-z0-9]/.test(password), text: 'One special character' }
  ]

  const onSubmit = async (data: RegisterFormData) => {
    try {
      // Format data for backend API
      const registerData = {
        name: data.name,
        email: data.email,
        password: data.password,
        gender: data.gender,
        dateOfBirth: data.dateOfBirth.toISOString()
      }

      await authService.register(registerData)

      // Send OTP to the registered email
      try {
        await otpService.sendOTP({ 
          email: data.email, 
          name: data.name 
        })
        
        toast.success('Account created successfully!', {
          description: 'We\'ve sent a verification code to your email.'
        })

        // Redirect to verify email page with email and name as query params
        router.push(`/auth/verify-email?email=${encodeURIComponent(data.email)}&name=${encodeURIComponent(data.name)}`)
      } catch {
        // If OTP sending fails, still redirect to verify page but show warning
        toast.warning('Account created but OTP sending failed', {
          description: 'You can request a new code on the verification page.'
        })
        router.push(`/auth/verify-email?email=${encodeURIComponent(data.email)}&name=${encodeURIComponent(data.name)}`)
      }
    } catch (error) {
      const apiError = error as ApiError
      console.error('Registration error:', apiError)
      
      // Default error message
      let errorTitle = 'Registration Failed'
      let errorDescription = 'Something went wrong. Please try again.'

      // Check if we have a network error (statusCode 0 means fetch failed)
      if (apiError.statusCode === 0 || !apiError.statusCode) {
        errorTitle = 'Connection Error'
        errorDescription = 'Unable to connect to the server. Please check your internet connection and try again.'
      }
      // Handle duplicate email error (from handleDuplicateError in backend)
      else if (apiError.statusCode === 400 && apiError.message?.includes('already exists')) {
        errorTitle = 'Account Already Exists'
        errorDescription = apiError.message
      }
      // Handle Zod validation errors
      else if (apiError.statusCode === 400 && apiError.message === 'Zod Error' && apiError.errorSources) {
        errorTitle = 'Validation Error'
        // Show all validation errors
        apiError.errorSources.forEach((err, index) => {
          if (index === 0) {
            errorDescription = `${err.path}: ${err.message}`
          } else {
            setTimeout(() => {
              toast.error(`${err.path}: ${err.message}`, { duration: 5000 })
            }, index * 100)
          }
        })
      }
      // Handle other validation errors with errorSources
      else if (apiError.errorSources && apiError.errorSources.length > 0) {
        errorTitle = 'Validation Error'
        apiError.errorSources.forEach((err, index) => {
          if (index === 0) {
            errorDescription = err.message
          } else {
            setTimeout(() => {
              toast.error(err.message, { duration: 5000 })
            }, index * 100)
          }
        })
      }
      // Handle server errors
      else if (apiError.statusCode >= 500) {
        errorTitle = 'Server Error'
        errorDescription = 'Our servers are experiencing issues. Please try again in a few moments.'
      }
      // Use backend message for any other error
      else if (apiError.message) {
        errorDescription = apiError.message
      }

      toast.error(errorTitle, {
        description: errorDescription,
        duration: 5000
      })
    }
  }

  const handleGoogleSignup = () => {
    // Redirect to backend Google OAuth endpoint
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'
    window.location.href = `${apiUrl}/auth/google?redirect=/dashboard`
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="space-y-4">
        {/* Name Field */}
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              id="name"
              type="text"
              placeholder="John Doe"
              className="pl-10 h-12"
              {...register('name')}
            />
          </div>
          {errors.name && (
            <p className="text-sm text-red-500">{errors.name.message}</p>
          )}
        </div>

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

        {/* Date of Birth */}
        <div className="space-y-2">
          <Label>Date of Birth</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={`w-full h-12 justify-start text-left font-normal ${!dateOfBirth && 'text-muted-foreground'}`}
              >
                <CalendarIcon className="mr-2 h-5 w-5" />
                {dateOfBirth ? format(dateOfBirth, 'PPP') : 'Pick a date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={dateOfBirth}
                onSelect={(date) => date && setValue('dateOfBirth', date, { shouldValidate: true })}
                captionLayout="dropdown-years"
                fromYear={1940}
                toYear={new Date().getFullYear() - 13}
                disabled={(date) =>
                  date > new Date() || date < new Date('1900-01-01')
                }
              />
            </PopoverContent>
          </Popover>
          {errors.dateOfBirth && (
            <p className="text-sm text-red-500">{errors.dateOfBirth.message}</p>
          )}
        </div>

        {/* Gender */}
        <div className="space-y-2">
          <Label>Gender</Label>
          <Select onValueChange={(value) => setValue('gender', value as 'MALE' | 'FEMALE' | 'OTHER', { shouldValidate: true })} value={gender}>
            <SelectTrigger className="h-12">
              <SelectValue placeholder="Select your gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="MALE">Male</SelectItem>
              <SelectItem value="FEMALE">Female</SelectItem>
              <SelectItem value="OTHER">Other</SelectItem>
            </SelectContent>
          </Select>
          {errors.gender && (
            <p className="text-sm text-red-500">{errors.gender.message}</p>
          )}
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
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
          {password && (
            <div className="space-y-1.5 mt-2">
              {passwordRequirements.map((req, index) => (
                <div key={index} className="flex items-center space-x-2 text-xs">
                  <CheckCircle2 
                    className={`h-3.5 w-3.5 ${req.met ? 'text-green-500' : 'text-muted-foreground'}`}
                  />
                  <span className={req.met ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}>
                    {req.text}
                  </span>
                </div>
              ))}
            </div>
          )}
          {errors.password && (
            <p className="text-sm text-red-500">{errors.password.message}</p>
          )}
        </div>

        {/* Confirm Password Field */}
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="••••••••"
              className="pl-10 pr-10 h-12"
              {...register('confirmPassword')}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
          )}
        </div>

        {/* Terms Agreement */}
        <div className="flex items-start space-x-2 pt-2">
          <Checkbox 
            id="terms"
            checked={agreeToTerms}
            onCheckedChange={(checked) => setValue('agreeToTerms', checked as boolean, { shouldValidate: true })}
            className="mt-1"
          />
          <label
            htmlFor="terms"
            className="text-sm leading-relaxed peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
          >
            I agree to the{' '}
            <Link href="/terms" className="text-primary hover:underline">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="text-primary hover:underline">
              Privacy Policy
            </Link>
          </label>
        </div>
        {errors.agreeToTerms && (
          <p className="text-sm text-red-500">{errors.agreeToTerms.message}</p>
        )}
      </div>

      {/* Submit Button */}
      <Button 
        type="submit" 
        className="w-full h-12 text-base" 
        size="lg"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Creating Account...' : 'Create Account'}
      </Button>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <Separator />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or sign up with
          </span>
        </div>
      </div>

      {/* Social Signup */}
      <div className="grid grid-cols-1 gap-3">
        <Button type="button" variant="outline" className="h-12" size="lg" onClick={handleGoogleSignup}>
          <Chrome className="mr-2 h-5 w-5" />
          Continue with Google
        </Button>
      </div>

      {/* Login Link */}
      <div className="text-center text-sm">
        <span className="text-muted-foreground">Already have an account? </span>
        <Link href="/auth/login" className="text-primary font-semibold hover:underline">
          Sign in
        </Link>
      </div>
    </form>
  )
}
