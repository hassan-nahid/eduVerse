import { Zap } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

export const TestimonialsSection = () => {
  const testimonials = [
    {
      name: 'David Thompson',
      role: 'Level 32 • Code Master',
      content: 'This platform changed how I learn! The gamification keeps me coming back every day, and I&apos;ve made amazing friends who push me to be better.',
      stats: '15K points • 60-day streak'
    },
    {
      name: 'Maria Garcia',
      role: 'Level 28 • Data Wizard',
      content: 'The competitive aspect is addictive! I love seeing my name climb the leaderboard and celebrating wins with my study squad.',
      stats: '12K points • 45-day streak'
    },
    {
      name: 'Ryan Lee',
      role: 'Level 25 • Design Ninja',
      content: 'Best learning community ever! The daily challenges are fun, and I&apos;ve learned more in 3 months here than in years of solo studying.',
      stats: '10K points • 30-day streak'
    },
  ]

  return (
    <section className="py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge className="mb-4">Community Voices</Badge>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Loved by Gamified Learners
          </h2>
          <p className="text-lg text-muted-foreground">
            See how our community members are crushing their goals
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="border-2 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-primary/10 to-transparent rounded-bl-full" />
              <CardHeader className="relative">
                <div className="flex items-center space-x-4 mb-4">
                  <Avatar className="h-14 w-14 border-2 border-primary">
                    <AvatarFallback className="bg-linear-to-br from-primary to-purple-500 text-primary-foreground text-lg">
                      {testimonial.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-bold">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-muted-foreground leading-relaxed">{testimonial.content}</p>
              </CardHeader>
              <CardContent>
                <Badge variant="outline" className="font-normal">
                  <Zap className="h-3 w-3 mr-1 text-yellow-500" />
                  {testimonial.stats}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
