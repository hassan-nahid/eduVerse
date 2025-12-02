'use client'

import { useState, useEffect } from 'react'
import { Trophy, Medal, Award, Crown, Zap, Star, TrendingUp, BadgeCheck } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { apiClient } from '@/lib/api-client'

interface LeaderboardUser {
  _id: string
  rank: number
  name: string
  userName?: string
  email: string
  avatar?: string
  scores: number
  points: number
  isPremium?: boolean
  verifyBadge?: boolean
  badges?: string[]
}

// Note: Backend response is { statusCode, success, message, data: User[], meta: {...} }
// ApiClient returns the full response, so we access response.data (the user array) directly
type LeaderboardResponse = LeaderboardUser[]

export default function LeaderboardClient() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([])
  const [meta, setMeta] = useState<{
    page: number
    limit: number
    total: number
    totalPage: number
  } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    fetchLeaderboard(currentPage)
  }, [currentPage])

  const fetchLeaderboard = async (page: number) => {
    setIsLoading(true)
    try {
      const response = await apiClient.get<LeaderboardResponse>(
        `/user/leaderboard?page=${page}&limit=50`
      )
      // Backend: sendResponse({ data: result.data, meta: result.meta })
      // So response.data = user array, response.meta = pagination info
      setLeaderboard(response.data || [])
      if (response.meta && response.meta.page && response.meta.total !== undefined) {
        setMeta({
          page: response.meta.page,
          limit: response.meta.limit || 50,
          total: response.meta.total,
          totalPage: response.meta.totalPage || 1
        })
      }
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error)
      setLeaderboard([])
      setMeta(null)
    } finally {
      setIsLoading(false)
    }
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-6 w-6 text-yellow-500" />
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />
      case 3:
        return <Award className="h-6 w-6 text-amber-600" />
      default:
        return <span className="text-lg font-bold text-muted-foreground">#{rank}</span>
    }
  }

  const getRankBgColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-linear-to-r from-yellow-50 to-yellow-100 dark:from-yellow-950/30 dark:to-yellow-900/30 border-yellow-300'
      case 2:
        return 'bg-linear-to-r from-gray-50 to-gray-100 dark:from-gray-950/30 dark:to-gray-900/30 border-gray-300'
      case 3:
        return 'bg-linear-to-r from-amber-50 to-amber-100 dark:from-amber-950/30 dark:to-amber-900/30 border-amber-300'
      default:
        return 'bg-card border-border'
    }
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <Skeleton className="h-12 w-64 mb-8 mx-auto" />
        {[...Array(10)].map((_, i) => (
          <Skeleton key={i} className="h-20 mb-4" />
        ))}
      </div>
    )
  }

  if (!meta || leaderboard.length === 0) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <Trophy className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">No Leaderboard Data</h2>
        <p className="text-muted-foreground">Check back later to see the rankings!</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <Trophy className="h-12 w-12 text-primary mr-3" />
          <h1 className="text-4xl font-bold">Leaderboard</h1>
        </div>
        <p className="text-muted-foreground text-lg">
          Top performers ranked by scores and points
        </p>
        <div className="flex items-center justify-center gap-4 mt-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <TrendingUp className="h-4 w-4" />
            {meta.total} Total Players
          </span>
          <span>•</span>
          <span>Page {meta.page} of {meta.totalPage}</span>
        </div>
      </div>

      {/* Leaderboard List */}
      <div className="space-y-3">
        {leaderboard.map((user) => (
          <Card 
            key={user._id} 
            className={`${getRankBgColor(user.rank)} transition-all hover:shadow-lg`}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                {/* Rank */}
                <div className="shrink-0 w-12 flex items-center justify-center">
                  {getRankIcon(user.rank)}
                </div>

                {/* Avatar */}
                <Avatar className="h-14 w-14 border-2 border-primary">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="bg-primary text-primary-foreground font-bold">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>

                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-lg truncate">
                      {user.name}
                    </h3>
                    {user.verifyBadge && (
                      <Badge variant="secondary" className="text-xs">
                        <BadgeCheck/> Verified
                      </Badge>
                    )}
                    {user.isPremium && (
                      <Badge variant="default" className="text-xs bg-linear-to-r from-yellow-500 to-orange-500">
                        Premium
                      </Badge>
                    )}
                  </div>
                  {user.userName && (
                    <p className="text-sm text-muted-foreground">@{user.userName}</p>
                  )}
                </div>

                {/* Stats */}
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <div className="flex items-center gap-1 mb-1">
                      <Star className="h-4 w-4 text-primary" />
                      <span className="font-bold text-lg">{user.scores}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">Scores</span>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 mb-1">
                      <Zap className="h-4 w-4 text-yellow-500" />
                      <span className="font-bold text-lg">{user.points.toLocaleString()}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">Points</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {meta.totalPage > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground px-4">
            Page {meta.page} of {meta.totalPage}
          </span>
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.min(meta.totalPage, prev + 1))}
            disabled={currentPage === meta.totalPage}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}
