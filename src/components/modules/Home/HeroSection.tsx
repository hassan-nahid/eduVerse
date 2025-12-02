import Link from 'next/link'
import { Rocket, Trophy, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export const HeroSection = () => {
  const stats = [
    { label: 'Active Members', value: '50K+' },
    { label: 'Daily Challenges', value: '500+' },
    { label: 'Posts Shared', value: '2M+' },
    { label: 'Points Earned', value: '10M+' },
  ]

  return (
    <section className="relative overflow-hidden bg-linear-to-br from-primary/10 via-purple-500/10 to-pink-500/10 py-16 sm:py-24">
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      <div className="absolute top-20 left-10 w-64 h-64 bg-primary/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
      
      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto space-y-8">
          <div className="inline-flex items-center space-x-2 bg-primary/10 text-primary px-4 py-2 rounded-full border border-primary/20">
            <Sparkles className="h-4 w-4 animate-pulse" />
            <span className="text-sm font-semibold">Join 50,000+ Learners Leveling Up Daily</span>
          </div>
          
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold leading-tight">
            Learn. Compete. Connect.{' '}
            <span className="bg-linear-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Win Together.
            </span>
          </h1>
          
          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto">
            The first social learning platform where education meets gaming. Challenge friends, earn rewards, share victories, and level up your skills in a vibrant community.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="lg" className="text-lg px-8 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all" asChild>
              <Link href="/auth/register">
                <Rocket className="mr-2 h-5 w-5" />
                Start Your Journey
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 border-2" asChild>
              <Link href="/leaderboard">
                <Trophy className="mr-2 h-5 w-5" />
                View Leaderboard
              </Link>
            </Button>
          </div>

          {/* Live Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-8">
            {stats.map((stat, index) => (
              <Card key={index} className="bg-background/50 backdrop-blur border-2 hover:border-primary/50 transition-all">
                <CardContent className="p-4 text-center">
                  <div className="font-bold text-2xl">{stat.value}</div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
