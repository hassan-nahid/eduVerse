import { apiClient } from '@/lib/api-client'

export interface PostUser {
  _id: string
  name: string
  userName?: string
  avatar?: string
  verifyBadge?: boolean
  isPremium?: boolean
}

export interface Comment {
  userId: PostUser
  commentText: string
  createdAt: string
}

export interface Post {
  _id: string
  postTitle?: string
  postBody?: string
  postImage?: string
  userId: PostUser
  loveReactions: PostUser[]
  comments: Comment[]
  challengeId?: string
  status: 'PUBLISHED' | 'PRIVATE' | 'DRAFT'
  createdAt: string
  updatedAt: string
}

export interface GetPostsResponse {
  data: Post[]
  meta: {
    hasMore: boolean
    lastId: string | null
    count: number
  }
}

export const postService = {
  // Get all posts with infinite scroll
  async getAllPosts(lastId?: string, limit = 10): Promise<GetPostsResponse> {
    const params = new URLSearchParams()
    if (lastId) params.append('lastId', lastId)
    params.append('limit', limit.toString())
    
    const response = await apiClient.get<Post[]>(`/post?${params.toString()}`)
    
    const meta = response.meta as { hasMore?: boolean; lastId?: string | null; count?: number } | undefined
    
    return {
      data: response.data,
      meta: {
        hasMore: meta?.hasMore ?? false,
        lastId: meta?.lastId ?? null,
        count: meta?.count ?? 0
      }
    }
  },

  // Toggle love reaction on a post
  async toggleLoveReaction(postId: string) {
    const response = await apiClient.post<Post>(`/post/${postId}/love`)
    return response.data
  },

  // Add comment to a post
  async addComment(postId: string, commentText: string) {
    const response = await apiClient.post<Post>(`/post/${postId}/comment`, {
      commentText
    })
    return response.data
  },

  // Create a new post
  async createPost(data: { postTitle?: string; postBody?: string; postImage?: string }) {
    const response = await apiClient.post<Post>('/post', data)
    return response.data
  },

  // Get single post
  async getSinglePost(postId: string) {
    const response = await apiClient.get<Post>(`/post/${postId}`)
    return response.data
  }
}
