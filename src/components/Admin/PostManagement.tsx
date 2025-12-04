'use client';

import { useState, useEffect } from 'react';
import {
  Search,
  RefreshCw,
  MoreVertical,
  Trash2,
  Eye,
  EyeOff,
  FileText,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { postService, Post } from '@/services/post.service';
import Image from 'next/image';

export const PostManagement = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);
  const [limit] = useState(10);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  const fetchPosts = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const params: Record<string, string> = {
        page: currentPage.toString(),
        limit: limit.toString(),
        sort: sortOrder === 'desc' ? `-${sortBy}` : sortBy,
      };

      if (searchTerm) {
        params.searchTerm = searchTerm;
      }

      if (statusFilter !== 'ALL') {
        params.status = statusFilter;
      }

      const response = await postService.adminGetAllPosts(params);
      setPosts(response.data);
      setTotalPages(response.meta?.totalPage || 1);
      setTotalPosts(response.meta?.total || 0);

      if (isRefresh) {
        toast.success('Posts list refreshed');
      }
    } catch (error: unknown) {
      console.error('Failed to fetch posts:', error);
      
      let errorMessage = 'Failed to fetch posts';
      if (error && typeof error === 'object' && 'message' in error) {
        errorMessage = String(error.message);
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, statusFilter, sortBy, sortOrder]);

  const handleSearch = () => {
    setCurrentPage(1);
    fetchPosts();
  };

  const handleUpdateStatus = async (postId: string, status: string) => {
    try {
      await postService.updatePostStatus(postId, status);
      toast.success(`Post ${status.toLowerCase()} successfully`);
      fetchPosts(true);
    } catch (error) {
      console.error('Failed to update post status:', error);
      toast.error('Failed to update post status');
    }
  };

  const handleDeletePost = async () => {
    if (!selectedPost) return;

    try {
      await postService.deletePost(selectedPost._id);
      toast.success('Post deleted successfully');
      setDeleteDialogOpen(false);
      setSelectedPost(null);
      fetchPosts(true);
    } catch (error) {
      console.error('Failed to delete post:', error);
      toast.error('Failed to delete post');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return <Badge className="bg-green-500">Published</Badge>;
      case 'DRAFT':
        return <Badge className="bg-yellow-500">Draft</Badge>;
      case 'PRIVATE':
        return <Badge className="bg-gray-500">Private</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Post Management</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Manage all posts ({totalPosts} total)
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchPosts(true)}
          disabled={refreshing}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <div className="flex gap-2">
                <Input
                  placeholder="Search by title or content..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="flex-1"
                />
                <Button onClick={handleSearch} size="icon">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value="PUBLISHED">Published</SelectItem>
                <SelectItem value="DRAFT">Draft</SelectItem>
                <SelectItem value="PRIVATE">Private</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort By */}
            <Select
              value={`${sortBy}-${sortOrder}`}
              onValueChange={(value) => {
                const [field, order] = value.split('-');
                setSortBy(field);
                setSortOrder(order as 'asc' | 'desc');
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt-desc">Newest First</SelectItem>
                <SelectItem value="createdAt-asc">Oldest First</SelectItem>
                <SelectItem value="loveReactions-desc">Most Loved</SelectItem>
                <SelectItem value="comments-desc">Most Comments</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Posts Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Post</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Reactions</TableHead>
                  <TableHead>Comments</TableHead>
                  <TableHead>Reports</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                      <TableCell><Skeleton className="h-12 w-full" /></TableCell>
                      <TableCell><Skeleton className="h-10 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : posts.length > 0 ? (
                  posts.map((post, index) => (
                    <TableRow key={post._id}>
                      <TableCell className="font-medium">
                        {(currentPage - 1) * limit + index + 1}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-start gap-3 max-w-md">
                          {post.postImage && (
                            <div className="h-12 w-12 rounded bg-muted flex items-center justify-center overflow-hidden shrink-0">
                              <Image
                                src={post.postImage}
                                alt={post.postTitle || 'Post image'}
                                width={48}
                                height={48}
                                className="h-full w-full object-cover"
                              />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            {post.postTitle && (
                              <p className="font-medium line-clamp-1">{post.postTitle}</p>
                            )}
                            {post.postBody && (
                              <p className="text-xs text-muted-foreground line-clamp-2">
                                {post.postBody}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {post.userId ? (
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center overflow-hidden shrink-0">
                              {post.userId.avatar ? (
                                <Image
                                  src={post.userId.avatar}
                                  alt={post.userId.name}
                                  width={32}
                                  height={32}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <span className="text-xs font-semibold">
                                  {post.userId.name.charAt(0).toUpperCase()}
                                </span>
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-medium flex items-center gap-1">
                                {post.userId.name}
                                {post.userId.verifyBadge && <span className="text-blue-500 text-xs">✓</span>}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">Deleted user</span>
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(post.status)}</TableCell>
                      <TableCell className="font-semibold">{post.loveReactions.length}</TableCell>
                      <TableCell className="font-semibold">{post.comments.length}</TableCell>
                      <TableCell>
                        {post.reports && post.reports.length > 0 ? (
                          <Badge variant="destructive" className="gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            {post.reports.length}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm">
                        {new Date(post.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {post.status !== 'PUBLISHED' && (
                              <DropdownMenuItem
                                onClick={() => handleUpdateStatus(post._id, 'PUBLISHED')}
                                className="text-green-600"
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                Publish
                              </DropdownMenuItem>
                            )}
                            {post.status !== 'PRIVATE' && (
                              <DropdownMenuItem
                                onClick={() => handleUpdateStatus(post._id, 'PRIVATE')}
                                className="text-gray-600"
                              >
                                <EyeOff className="mr-2 h-4 w-4" />
                                Make Private
                              </DropdownMenuItem>
                            )}
                            {post.status !== 'DRAFT' && (
                              <DropdownMenuItem
                                onClick={() => handleUpdateStatus(post._id, 'DRAFT')}
                                className="text-yellow-600"
                              >
                                <FileText className="mr-2 h-4 w-4" />
                                Draft
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedPost(post);
                                setDeleteDialogOpen(true);
                              }}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      No posts found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the post
              {selectedPost?.postTitle && <strong> &quot;{selectedPost.postTitle}&quot;</strong>}
              . This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedPost(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeletePost}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
