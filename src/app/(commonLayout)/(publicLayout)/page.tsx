import { HeroSection } from '@/components/modules/Home/HeroSection'
import { CommunityFeed } from '@/components/modules/Home/CommunityFeed'
import { FeaturesGrid } from '@/components/modules/Home/FeaturesGrid'
import { LeaderboardSection } from '@/components/modules/Home/LeaderboardSection'
import { ChallengesSection } from '@/components/modules/Home/ChallengesSection'
import { TestimonialsSection } from '@/components/modules/Home/TestimonialsSection'
import { HowItWorks } from '@/components/modules/Home/HowItWorks'
import { CTASection } from '@/components/modules/Home/CTASection'

const HomePage = () => {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <CommunityFeed />
      <FeaturesGrid />
      <LeaderboardSection />
      <ChallengesSection />
      <TestimonialsSection />
      <HowItWorks />
      <CTASection />
    </div>
  )
}

export default HomePage
