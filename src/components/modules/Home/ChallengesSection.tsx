import Link from 'next/link'
import { Play, Gamepad2, Rocket, Brain, Star, Users, Target } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

export const ChallengesSection = () => {
  const upcomingChallenges = [
    {
      title: 'Speed Coding Sprint',
      participants: 1250,
      prize: '5000 pts',
      difficulty: 'Medium',
      time: 'Starting in 2h',
      icon: Rocket,
      color: 'text-blue-500'
    },
    {
      title: 'Algorithm Battle Royale',
      participants: 890,
      prize: '10000 pts',
      difficulty: 'Hard',
      time: 'Starting in 5h',
      icon: Brain,
      color: 'text-purple-500'
    },
    {
      title: 'Design Challenge',
      participants: 650,
      prize: '3000 pts',
      difficulty: 'Easy',
      time: 'Starting tomorrow',
      icon: Star,
      color: 'text-yellow-500'
    },
  ]

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <Badge className="mb-4">
              <Gamepad2 className="h-3 w-3 mr-1 inline" />
              Live Challenges
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Join the Action
            </h2>
            <p className="text-lg text-muted-foreground">
              Participate in daily challenges and tournaments. Win points, badges, and bragging rights!
            </p>
          </div>

          <div className="space-y-4">
            {upcomingChallenges.map((challenge, index) => {
              const Icon = challenge.icon
              return (
                <Card key={index} className="border-2 hover:border-primary/50 transition-all hover:shadow-lg overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start space-x-4">
                        <div className={`w-12 h-12 rounded-xl bg-muted flex items-center justify-center ${challenge.color}`}>
                          <Icon className="h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg mb-1">{challenge.title}</h3>
                          <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                            <span className="flex items-center">
                              <Users className="h-3.5 w-3.5 mr-1" />
                              {challenge.participants}
                            </span>
                            <span>•</span>
                            <Badge variant="outline" className="text-xs">
                              {challenge.difficulty}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                    <Separator className="my-4" />
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Prize Pool</p>
                        <p className="font-bold text-lg text-primary">{challenge.prize}</p>
                      </div>
                      <Button asChild>
                        <Link href="/challenges">
                          <Play className="mr-2 h-4 w-4" />
                          Join Now
                        </Link>
                      </Button>
                    </div>
                    <div className="mt-3 text-xs text-muted-foreground flex items-center">
                      <Target className="h-3.5 w-3.5 mr-1" />
                      {challenge.time}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
