'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { RefreshCcw } from 'lucide-react'
import { postService, Post } from '@/services/post.service'
import PostCard from '@/components/feed/PostCard'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuth } from '@/context/AuthContext'
import { toast } from 'sonner'
import { useRouter, usePathname } from 'next/navigation'

export default function FeedClient() {
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [lastId, setLastId] = useState<string | null>(null)
  const observerTarget = useRef<HTMLDivElement>(null)
  const { isAuthenticated } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  const loadPosts = useCallback(async (isLoadMore = false) => {
    try {
      if (isLoadMore) {
        setIsLoadingMore(true)
      } else {
        setIsLoading(true)
      }

      const response = await postService.getAllPosts(
        isLoadMore ? lastId || undefined : undefined,
        10
      )

      // Filter out posts with null/undefined userId
      const validPosts = response.data.filter(post => post.userId)
      
      if (isLoadMore) {
        setPosts(prev => [...prev, ...validPosts])
      } else {
        setPosts(validPosts)
      }

      setHasMore(response.meta.hasMore)
      setLastId(response.meta.lastId)
    } catch (error) {
      console.error('Failed to load posts:', error)
      toast.error('Failed to load posts')
    } finally {
      setIsLoading(false)
      setIsLoadingMore(false)
    }
  }, [lastId])

  // Initial load
  useEffect(() => {
    loadPosts()
  }, [loadPosts])

  // Infinite scroll
  const handleObserver = useCallback((entries: IntersectionObserverEntry[]) => {
    const [target] = entries
    if (target.isIntersecting && hasMore && !isLoadingMore) {
      loadPosts(true)
    }
  }, [hasMore, isLoadingMore, loadPosts])

  useEffect(() => {
    const element = observerTarget.current
    if (!element) return

    const observer = new IntersectionObserver(handleObserver, {
      threshold: 0.5,
    })

    observer.observe(element)
    return () => observer.disconnect()
  }, [handleObserver])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      const response = await postService.getAllPosts(undefined, 10)
      const validPosts = response.data.filter(post => post.userId)
      setPosts(validPosts)
      setHasMore(response.meta.hasMore)
      setLastId(response.meta.lastId)
      toast.success('Feed refreshed!')
    } catch (error) {
      console.error('Failed to refresh feed:', error)
      toast.error('Failed to refresh feed')
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleLoveReaction = async (postId: string) => {
    if (!isAuthenticated) {
      toast.error('Please login to react to posts')
      router.push(`/auth/login?redirect=${encodeURIComponent(pathname)}`)
      return
    }

    try {
      const updatedPost = await postService.toggleLoveReaction(postId)
      setPosts(prev =>
        prev.map(post =>
          post._id === postId ? updatedPost : post
        )
      )
    } catch (error) {
      console.error('Failed to toggle love reaction:', error)
      toast.error('Failed to react to post')
    }
  }

  const handleAddComment = async (postId: string, commentText: string) => {
    if (!isAuthenticated) {
      toast.error('Please login to comment on posts')
      router.push(`/auth/login?redirect=${encodeURIComponent(pathname)}`)
      return
    }

    if (!commentText.trim()) {
      toast.error('Comment cannot be empty')
      return
    }

    try {
      const updatedPost = await postService.addComment(postId, commentText)
      setPosts(prev =>
        prev.map(post =>
          post._id === postId ? updatedPost : post
        )
      )
      toast.success('Comment added successfully')
    } catch (error) {
      console.error('Failed to add comment:', error)
      toast.error('Failed to add comment')
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-card rounded-lg p-6 border">
            <div className="flex items-start gap-4 mb-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4 mb-4" />
            <Skeleton className="h-48 w-full rounded-lg mb-4" />
            <div className="flex gap-4">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-20" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (posts.length === 0) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <div className="text-6xl mb-4">📝</div>
        <h2 className="text-2xl font-bold mb-2">No Posts Yet</h2>
        <p className="text-muted-foreground">Be the first to create a post!</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Refresh Button */}
      <div className="flex justify-end">
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCcw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Refreshing...' : 'Refresh Feed'}
        </button>
      </div>

      {posts.map((post) => (
        <PostCard
          key={post._id}
          post={post}
          onLoveReaction={handleLoveReaction}
          onAddComment={handleAddComment}
        />
      ))}

      {/* Infinite scroll trigger */}
      {hasMore && (
        <div ref={observerTarget} className="py-4">
          {isLoadingMore && (
            <div className="bg-card rounded-lg p-6 border">
              <div className="flex items-start gap-4 mb-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          )}
        </div>
      )}

      {!hasMore && posts.length > 0 && (
        <div className="text-center py-4 text-muted-foreground">
          <p>You&apos;ve reached the end! 🎉</p>
        </div>
      )}
    </div>
  )
}
