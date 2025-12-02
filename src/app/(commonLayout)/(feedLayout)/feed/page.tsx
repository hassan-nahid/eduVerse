import FeedClient from '@/components/feed/FeedClient'

export default function FeedPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-2">Community Feed</h1>
        <p className="text-muted-foreground">
          Discover posts, challenges, and updates from the community
        </p>
      </div>
      <FeedClient />
    </div>
  )
}