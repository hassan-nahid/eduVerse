import { MessageSquare, Gamepad2, Trophy, Users, Award, Brain } from 'lucide-react'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const FeaturesGrid = () => {
  const features = [
    {
      icon: MessageSquare,
      title: 'Social Feed',
      description: 'Share your learning wins, ask questions, and engage with a supportive community of learners.',
      color: 'bg-blue-500/10 text-blue-500',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Gamepad2,
      title: 'Daily Challenges',
      description: 'Complete fun challenges every day, earn points, maintain streaks, and compete for top spots.',
      color: 'bg-green-500/10 text-green-500',
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      icon: Trophy,
      title: 'Live Competitions',
      description: 'Join real-time tournaments, battle friends, and climb global leaderboards for epic rewards.',
      color: 'bg-yellow-500/10 text-yellow-500',
      gradient: 'from-yellow-500 to-orange-500'
    },
    {
      icon: Users,
      title: 'Study Squads',
      description: 'Form study groups, collaborate on challenges, and grow together with your learning crew.',
      color: 'bg-purple-500/10 text-purple-500',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      icon: Award,
      title: 'Badges & Rewards',
      description: 'Unlock exclusive badges, collect achievements, and redeem points for amazing prizes.',
      color: 'bg-pink-500/10 text-pink-500',
      gradient: 'from-pink-500 to-rose-500'
    },
    {
      icon: Brain,
      title: 'Skill Trees',
      description: 'Level up across multiple skill paths, unlock new abilities, and track your complete journey.',
      color: 'bg-indigo-500/10 text-indigo-500',
      gradient: 'from-indigo-500 to-violet-500'
    },
  ]

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge className="mb-4">Platform Features</Badge>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Everything You Need to Thrive
          </h2>
          <p className="text-lg text-muted-foreground">
            A complete ecosystem for social learning and competitive growth
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <Card key={index} className="border-2 hover:border-primary/50 transition-all hover:shadow-lg group overflow-hidden relative">
                <div className={`absolute inset-0 bg-linear-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity`} />
                <CardHeader className="relative">
                  <div className={`w-14 h-14 rounded-xl ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className="h-7 w-7" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                  <CardDescription className="text-base leading-relaxed">{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
