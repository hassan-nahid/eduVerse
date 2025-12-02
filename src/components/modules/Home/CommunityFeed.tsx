import Link from 'next/link'
import { ArrowRight, Heart, MessageSquare, Zap, Flame } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

export const CommunityFeed = () => {
  const communityPosts = [
    {
      id: 1,
      user: 'Sarah Chen',
      achievement: 'Just completed the JavaScript Pro Challenge!',
      points: 500,
      likes: 342,
      comments: 28,
      timeAgo: '2h ago',
      badge: '🔥',
      level: 18
    },
    {
      id: 2,
      user: 'Marcus Williams',
      achievement: 'Hit a 30-day learning streak! 🎯',
      points: 1000,
      likes: 589,
      comments: 45,
      timeAgo: '5h ago',
      badge: '⚡',
      level: 22
    },
    {
      id: 3,
      user: 'Aisha Patel',
      achievement: 'First place in React Tournament! 🏆',
      points: 2000,
      likes: 823,
      comments: 67,
      timeAgo: '1d ago',
      badge: '👑',
      level: 25
    },
  ]

  return (
    <section className="py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <Badge className="mb-4">
            <Flame className="h-3 w-3 mr-1 inline" />
            Live Activity
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            See What the Community is Achieving
          </h2>
          <p className="text-lg text-muted-foreground">
            Real learners, real progress, real celebrations 🎉
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {communityPosts.map((post) => (
            <Card key={post.id} className="border-2 hover:border-primary/50 hover:shadow-xl transition-all overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <Avatar className="h-12 w-12 border-2 border-primary">
                        <AvatarFallback className="bg-linear-to-br from-primary to-purple-500 text-primary-foreground">
                          {post.user.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-1 -right-1 bg-background border-2 border-background rounded-full text-xs px-1.5 py-0.5 font-bold">
                        {post.level}
                      </div>
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{post.user}</p>
                      <p className="text-xs text-muted-foreground">{post.timeAgo}</p>
                    </div>
                  </div>
                  <span className="text-2xl">{post.badge}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="font-medium">{post.achievement}</p>
                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <button className="flex items-center space-x-1 hover:text-red-500 transition-colors">
                      <Heart className="h-4 w-4" />
                      <span>{post.likes}</span>
                    </button>
                    <button className="flex items-center space-x-1 hover:text-primary transition-colors">
                      <MessageSquare className="h-4 w-4" />
                      <span>{post.comments}</span>
                    </button>
                  </div>
                  <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
                    <Zap className="h-3 w-3 mr-1" />
                    +{post.points}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-8">
          <Button variant="outline" size="lg" asChild>
            <Link href="/feed">
              View Full Feed
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
