import Link from 'next/link'
import { ArrowRight, Trophy, Zap, Flame } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

export const LeaderboardSection = () => {
  const leaderboardUsers = [
    { rank: 1, name: 'Alex Rivera', points: 45680, badge: '👑', level: 28, streak: 45, trend: '+12%' },
    { rank: 2, name: 'Priya Sharma', points: 43200, badge: '🥈', level: 27, streak: 38, trend: '+8%' },
    { rank: 3, name: 'James Park', points: 41850, badge: '🥉', level: 26, streak: 42, trend: '+15%' },
    { rank: 4, name: 'Sofia Martinez', points: 39500, badge: '🏅', level: 25, streak: 30, trend: '+5%' },
    { rank: 5, name: 'Yuki Tanaka', points: 38200, badge: '🏅', level: 24, streak: 35, trend: '+10%' },
  ]

  return (
    <section className="py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <Badge className="mb-4">
              <Trophy className="h-3 w-3 mr-1 inline" />
              Global Rankings
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Compete for Glory
            </h2>
            <p className="text-lg text-muted-foreground">
              Battle your way to the top, earn exclusive titles, and become a legend in the community.
            </p>
          </div>

          <Card className="border-2">
            <CardContent className="p-6">
              <div className="space-y-3">
                {leaderboardUsers.map((user) => (
                  <div 
                    key={user.rank} 
                    className={`flex items-center justify-between p-4 rounded-xl transition-all ${
                      user.rank === 1 
                        ? 'bg-yellow-500/10 border-2 border-yellow-500/30' 
                        : user.rank <= 3 
                        ? 'bg-primary/5 border-2 border-primary/20' 
                        : 'bg-muted hover:bg-muted/80'
                    }`}
                  >
                    <div className="flex items-center space-x-4 flex-1">
                      <span className="text-2xl font-bold w-8 text-center">{user.badge}</span>
                      <Avatar className={`h-12 w-12 ${user.rank <= 3 ? 'border-2 border-primary' : ''}`}>
                        <AvatarFallback className={user.rank === 1 ? 'bg-yellow-500 text-white' : 'bg-primary text-primary-foreground'}>
                          {user.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate">{user.name}</p>
                        <div className="flex items-center space-x-3 text-xs text-muted-foreground">
                          <span>Level {user.level}</span>
                          <span>•</span>
                          <span className="flex items-center">
                            <Flame className="h-3 w-3 mr-0.5 text-orange-500" />
                            {user.streak}
                          </span>
                          <span className="text-green-500 font-semibold">{user.trend}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-1 font-bold">
                        <Zap className="h-4 w-4 text-yellow-500" />
                        <span>{user.points.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <Button className="w-full mt-6" variant="outline" asChild>
                <Link href="/leaderboard">
                  View Full Rankings
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
