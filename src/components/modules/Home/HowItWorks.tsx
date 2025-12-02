import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const HowItWorks = () => {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge className="mb-4">Getting Started</Badge>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Level Up in 3 Simple Steps
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <Card className="text-center border-2 relative overflow-hidden group hover:border-primary/50 transition-all">
            <div className="absolute inset-0 bg-linear-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardContent className="p-8 relative">
              <div className="w-16 h-16 bg-linear-to-br from-blue-500 to-cyan-500 text-white rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-6 shadow-lg">
                1
              </div>
              <h3 className="text-xl font-bold mb-3">Join the Community</h3>
              <p className="text-muted-foreground">
                Sign up free, create your profile, and connect with thousands of learners worldwide
              </p>
            </CardContent>
          </Card>
          
          <Card className="text-center border-2 relative overflow-hidden group hover:border-primary/50 transition-all">
            <div className="absolute inset-0 bg-linear-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardContent className="p-8 relative">
              <div className="w-16 h-16 bg-linear-to-br from-purple-500 to-pink-500 text-white rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-6 shadow-lg">
                2
              </div>
              <h3 className="text-xl font-bold mb-3">Complete Challenges</h3>
              <p className="text-muted-foreground">
                Take on daily quests, join tournaments, and compete with friends to earn points
              </p>
            </CardContent>
          </Card>
          
          <Card className="text-center border-2 relative overflow-hidden group hover:border-primary/50 transition-all">
            <div className="absolute inset-0 bg-linear-to-br from-yellow-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardContent className="p-8 relative">
              <div className="w-16 h-16 bg-linear-to-br from-yellow-500 to-orange-500 text-white rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-6 shadow-lg">
                3
              </div>
              <h3 className="text-xl font-bold mb-3">Climb & Celebrate</h3>
              <p className="text-muted-foreground">
                Rise through the ranks, unlock badges, share wins, and inspire others
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
