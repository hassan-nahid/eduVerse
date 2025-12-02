import Link from 'next/link'
import { UserPlus, Medal, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export const CTASection = () => {
  return (
    <section className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-linear-to-br from-primary/20 via-purple-500/20 to-pink-500/20" />
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="border-2 border-primary/30 bg-background/95 backdrop-blur-sm shadow-2xl max-w-4xl mx-auto overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />
          <CardContent className="p-12 text-center space-y-6 relative">
            <div className="inline-flex items-center space-x-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-4">
              <Medal className="h-4 w-4" />
              <span className="text-sm font-semibold">Start Your Free Journey Today</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold">
              Ready to Level Up?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Join the fastest-growing gamified learning community. Make friends, compete in challenges, and transform the way you learn.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <Button size="lg" className="text-lg px-8 shadow-lg shadow-primary/30" asChild>
                <Link href="/auth/register">
                  <UserPlus className="mr-2 h-5 w-5" />
                  Create Free Account
                </Link>
              </Button>
              <div className="flex flex-col sm:flex-row items-center gap-2 text-sm text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span>No credit card needed</span>
                </div>
                <span className="hidden sm:inline">•</span>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span>Join in 30 seconds</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
