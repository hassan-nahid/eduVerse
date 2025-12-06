'use client'

import { Suspense, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { Mail, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp'
import { otpService } from '@/services/otp.service'
import type { ApiError } from '@/lib/api-client'

function VerifyEmailContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get('email') || ''
  const name = searchParams.get('name') || 'User'
  
  const [otp, setOtp] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [countdown, setCountdown] = useState(0)

  // Redirect if no email provided
  useEffect(() => {
    if (!email) {
      toast.error('Email address is required')
      router.push('/auth/login')
    }
  }, [email, router])

  // Countdown timer for resend button
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP')
      return
    }

    setIsVerifying(true)
    try {
      await otpService.verifyOTP({ email, otp })
      
      toast.success('Email verified successfully!', {
        description: 'You can now login to your account.'
      })
      
      // Redirect to login page
      router.push('/auth/login')
    } catch (error) {
      const apiError = error as ApiError
      
      let errorTitle = 'Verification Failed'
      let errorDescription = 'Please try again.'

      if (apiError.statusCode === 401) {
        errorTitle = 'Invalid OTP'
        errorDescription = 'The OTP you entered is incorrect or has expired. Please try again.'
      } else if (apiError.statusCode === 404) {
        if (apiError.message?.includes('already verified')) {
          errorTitle = 'Already Verified'
          errorDescription = 'Your email is already verified. You can login now.'
          setTimeout(() => router.push('/auth/login'), 2000)
        } else {
          errorDescription = 'User not found. Please register first.'
        }
      } else if (apiError.statusCode === 0) {
        errorTitle = 'Connection Error'
        errorDescription = 'Unable to connect to the server. Please check your internet connection.'
      } else if (apiError.message) {
        errorDescription = apiError.message
      }

      toast.error(errorTitle, {
        description: errorDescription,
        duration: 5000
      })
    } finally {
      setIsVerifying(false)
    }
  }

  const handleResendOTP = async () => {
    setIsResending(true)
    try {
      await otpService.sendOTP({ email, name })
      
      toast.success('OTP sent successfully!', {
        description: 'Please check your email for the verification code.'
      })
      
      setCountdown(120) // 2 minutes countdown
      setOtp('') // Clear current OTP
    } catch (error) {
      const apiError = error as ApiError
      
      let errorTitle = 'Failed to Send OTP'
      let errorDescription = 'Please try again.'

      if (apiError.statusCode === 404) {
        if (apiError.message?.includes('already verified')) {
          errorTitle = 'Already Verified'
          errorDescription = 'Your email is already verified. You can login now.'
          setTimeout(() => router.push('/auth/login'), 2000)
        } else {
          errorDescription = 'User not found. Please register first.'
          setTimeout(() => router.push('/auth/register'), 2000)
        }
      } else if (apiError.statusCode === 0) {
        errorTitle = 'Connection Error'
        errorDescription = 'Unable to connect to the server. Please check your internet connection.'
      } else if (apiError.message) {
        errorDescription = apiError.message
      }

      toast.error(errorTitle, {
        description: errorDescription,
        duration: 5000
      })
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Mail className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl font-bold">Verify Your Email</h1>
          <p className="text-muted-foreground">
            We&apos;ve sent a 6-digit verification code to
          </p>
          <p className="font-semibold text-foreground">{email}</p>
        </div>

        {/* OTP Input */}
        <div className="space-y-6">
          <div className="flex flex-col items-center space-y-4">
            <InputOTP
              maxLength={6}
              value={otp}
              onChange={(value) => setOtp(value)}
              disabled={isVerifying}
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
            <p className="text-sm text-muted-foreground">
              Enter the 6-digit code from your email
            </p>
          </div>

          {/* Verify Button */}
          <Button
            onClick={handleVerifyOTP}
            disabled={otp.length !== 6 || isVerifying}
            className="w-full h-12 text-base"
            size="lg"
          >
            {isVerifying ? 'Verifying...' : 'Verify Email'}
          </Button>

          {/* Resend OTP */}
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Didn&apos;t receive the code?
            </p>
            <Button
              variant="ghost"
              onClick={handleResendOTP}
              disabled={countdown > 0 || isResending}
              className="text-primary hover:text-primary/80"
            >
              {isResending
                ? 'Sending...'
                : countdown > 0
                ? `Resend in ${countdown}s`
                : 'Resend Code'}
            </Button>
          </div>

          {/* Back to Login */}
          <div className="pt-4">
            <Link href="/auth/login">
              <Button variant="outline" className="w-full" size="lg">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Login
              </Button>
            </Link>
          </div>
        </div>

        {/* Help Text */}
        <div className="text-center text-sm text-muted-foreground">
          <p>Check your spam folder if you don&apos;t see the email</p>
        </div>
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="w-full max-w-md">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
              <Mail className="w-8 h-8 text-primary animate-pulse" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Loading...</h1>
          </div>
        </div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  )
}
