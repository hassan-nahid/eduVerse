import { ReactNode } from 'react'
import Link from 'next/link'
import { GraduationCap, Trophy, Users, Zap, Star, Sparkles } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

interface AuthLayoutProps {
  children: ReactNode
  title: string
  subtitle: string
}

export const AuthLayout = ({ children, title, subtitle }: AuthLayoutProps) => {
  const features = [
    { icon: Trophy, label: 'Compete', color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
    { icon: Users, label: 'Community', color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { icon: Zap, label: 'Earn Points', color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { icon: Star, label: 'Badges', color: 'text-pink-500', bg: 'bg-pink-500/10' },
  ]

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Side - Form */}
      <div className="flex-1 flex flex-col justify-center py-8 px-4 sm:px-6 lg:px-10 xl:px-16">
        <div className="mx-auto w-full max-w-md">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 mb-6 group">
            <div className="w-9 h-9 bg-linear-to-br from-primary to-purple-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <GraduationCap className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">eduVerse</span>
          </Link>

          {/* Title */}
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">{title}</h1>
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          </div>

          {/* Form */}
          {children}

          {/* Mobile Stats */}
          <div className="mt-6 flex justify-center space-x-6 text-center lg:hidden">
            <div>
              <div className="text-lg font-bold">50K+</div>
              <div className="text-xs text-muted-foreground">Users</div>
            </div>
            <div>
              <div className="text-lg font-bold">500+</div>
              <div className="text-xs text-muted-foreground">Challenges</div>
            </div>
            <div>
              <div className="text-lg font-bold">10M+</div>
              <div className="text-xs text-muted-foreground">Points</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Promotional */}
      <div className="hidden lg:flex lg:flex-1 bg-muted relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-primary/10 via-purple-500/10 to-pink-500/10" />
        <div className="absolute top-20 right-20 w-64 h-64 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 left-20 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
        
        <div className="relative flex flex-col justify-center px-10 xl:px-14 w-full max-w-xl mx-auto">
          <div className="space-y-6">
            <div className="inline-flex items-center space-x-2 bg-background/80 backdrop-blur px-3 py-2 rounded-full border w-fit">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span className="font-semibold text-xs">50K+ Learners</span>
            </div>
            
            <h2 className="text-3xl xl:text-4xl font-bold leading-tight">
              Transform Learning Into An{' '}
              <span className="bg-linear-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
                Epic Adventure
              </span>
            </h2>
            
            <p className="text-base text-muted-foreground">
              Join the gamified learning platform. Compete with friends, earn rewards, and level up your skills.
            </p>

            {/* Features */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              {features.map((feature, index) => {
                const Icon = feature.icon
                return (
                  <Card key={index} className="border bg-background/60 backdrop-blur hover:bg-background/80 transition-all">
                    <CardContent className="p-4">
                      <div className={`w-10 h-10 rounded-lg ${feature.bg} flex items-center justify-center mb-2`}>
                        <Icon className={`h-5 w-5 ${feature.color}`} />
                      </div>
                      <p className="font-semibold text-sm">{feature.label}</p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
