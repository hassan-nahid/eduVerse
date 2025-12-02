'use client'

import { useState } from 'react'
import { Heart, MessageCircle, Send, BadgeCheck, Crown } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Post } from '@/services/post.service'
import { formatDistanceToNow } from 'date-fns'
import { useAuth } from '@/context/AuthContext'
import Image from 'next/image'

interface PostCardProps {
  post: Post
  onLoveReaction: (postId: string) => void
  onAddComment: (postId: string, commentText: string) => void
}

export default function PostCard({ post, onLoveReaction, onAddComment }: PostCardProps) {
  const [showComments, setShowComments] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { user } = useAuth()

  // Guard clause: Don't render if post.userId is null/undefined
  if (!post.userId) {
    return null
  }

  const isLikedByCurrentUser = user
    ? post.loveReactions.some((reaction) => reaction?._id === user._id)
    : false

  const getInitials = (name?: string) => {
    if (!name) return '??'
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
  }

  const handleSubmitComment = async () => {
    if (!commentText.trim()) return

    setIsSubmitting(true)
    try {
      await onAddComment(post._id, commentText)
      setCommentText('')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg">
      <CardHeader className="space-y-0 pb-4">
        <div className="flex items-start gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={post.userId.avatar || undefined} alt={post.userId.name} />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {getInitials(post.userId.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold truncate">{post.userId.name}</h3>
              {post.userId.verifyBadge && (
                <BadgeCheck className="h-4 w-4 text-blue-500 shrink-0" />
              )}
              {post.userId.isPremium && (
                <Crown className="h-4 w-4 text-yellow-500 shrink-0" />
              )}
              {post.userId.userName && (
                <span className="text-sm text-muted-foreground">
                  @{post.userId.userName}
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground" title={new Date(post.createdAt).toLocaleString()}>
              {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
            </p>
          </div>
          {post.status !== 'PUBLISHED' && (
            <Badge variant="secondary">{post.status}</Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {post.postTitle && (
          <h2 className="text-xl font-bold">{post.postTitle}</h2>
        )}
        {post.postBody && (
          <p className="text-muted-foreground whitespace-pre-wrap">{post.postBody}</p>
        )}
        {post.postImage && (
          <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-muted">
            <Image
              src={post.postImage}
              alt={post.postTitle || 'Post image'}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 672px"
            />
          </div>
        )}
      </CardContent>

      <CardFooter className="flex-col items-start gap-4 pt-4 border-t">
        {/* Action Buttons */}
        <div className="flex items-center gap-4 w-full">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onLoveReaction(post._id)}
            className={`gap-2 transition-all duration-200 ${isLikedByCurrentUser ? 'text-red-500 hover:text-red-600' : 'hover:text-red-500'}`}
          >
            <Heart
              className={`h-5 w-5 transition-all duration-200 ${isLikedByCurrentUser ? 'fill-red-500 scale-110' : 'hover:scale-110'}`}
            />
            <span className="font-medium">{post.loveReactions.length}</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowComments(!showComments)}
            className="gap-2 transition-all duration-200 hover:text-primary"
          >
            <MessageCircle className="h-5 w-5 transition-transform duration-200 hover:scale-110" />
            <span className="font-medium">{post.comments.length}</span>
          </Button>
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="w-full space-y-4 animate-in slide-in-from-top-2 duration-300">
            {/* Comment Input */}
            <div className="flex gap-2">
              <Textarea
                placeholder="Write a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="min-h-20 resize-none transition-all duration-200 focus:ring-2"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSubmitComment()
                  }
                }}
              />
              <Button
                size="icon"
                onClick={handleSubmitComment}
                disabled={!commentText.trim() || isSubmitting}
                className="transition-all duration-200 hover:scale-105"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>

            {/* Comments List */}
            {post.comments.length > 0 && (
              <div className="space-y-3 max-h-96 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
                {post.comments.filter(comment => comment.userId).map((comment, index) => (
                  <div key={index} className="flex gap-3 animate-in fade-in duration-300" style={{ animationDelay: `${index * 50}ms` }}>
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={comment.userId?.avatar || undefined}
                        alt={comment.userId?.name || 'User'}
                      />
                      <AvatarFallback className="text-xs">
                        {getInitials(comment.userId?.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="bg-muted rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="font-semibold text-sm">
                            {comment.userId?.name || 'Unknown User'}
                          </span>
                          {comment.userId?.verifyBadge && (
                            <BadgeCheck className="h-3 w-3 text-blue-500 shrink-0" />
                          )}
                          {comment.userId?.isPremium && (
                            <Crown className="h-3 w-3 text-yellow-500 shrink-0" />
                          )}
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(comment.createdAt), {
                              addSuffix: true,
                            })}
                          </span>
                        </div>
                        <p className="text-sm whitespace-pre-wrap">
                          {comment.commentText}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardFooter>
    </Card>
  )
}
