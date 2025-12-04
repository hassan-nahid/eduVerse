'use client';

import { useState, useEffect } from 'react';
import {
  Search,
  RefreshCw,
  MoreVertical,
  Trash2,
  Edit,
  Plus,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Trophy,
  Users,
  Crown,
  CheckCircle,
  XCircle,
  Eye,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import {
  challengeService,
  Challenge,
  CreateChallengeData,
  ChallengeStatus,
  ParticipantStatus,
} from '@/services/challenge.service';
import Image from 'next/image';

export const ChallengeManagement = () => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [premiumFilter, setPremiumFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalChallenges, setTotalChallenges] = useState(0);
  const [limit] = useState(10);

  // Dialogs
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [participantsDialogOpen, setParticipantsDialogOpen] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);

  // Form state
  const [formData, setFormData] = useState<CreateChallengeData>({
    title: '',
    description: '',
    challengeImage: '',
    pointsReward: 0,
    scoresReward: 0,
    startDate: '',
    endDate: '',
    isPremiumOnly: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [uploading, setUploading] = useState(false);

  const fetchChallenges = async (isRefresh = false) => {
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

      if (premiumFilter !== 'ALL') {
        params.isPremiumOnly = premiumFilter === 'PREMIUM' ? 'true' : 'false';
      }

      const response = await challengeService.adminGetAllChallenges(params);
      setChallenges(response.data);
      setTotalPages(response.meta?.totalPage || 1);
      setTotalChallenges(response.meta?.total || 0);

      if (isRefresh) {
        toast.success('Challenges list refreshed');
      }
    } catch (error: unknown) {
      console.error('Failed to fetch challenges:', error);

      let errorMessage = 'Failed to fetch challenges';
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
    fetchChallenges();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, statusFilter, premiumFilter, sortBy, sortOrder]);

  const handleSearch = () => {
    setCurrentPage(1);
    fetchChallenges();
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      challengeImage: '',
      pointsReward: 0,
      scoresReward: 0,
      startDate: '',
      endDate: '',
      isPremiumOnly: false,
    });
    setImageFile(null);
    setImagePreview('');
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }

      setImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview('');
    setFormData({ ...formData, challengeImage: '' });
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) return formData.challengeImage || null;

    const uploadFormData = new FormData();
    uploadFormData.append('challengeImage', imageFile);

    try {
      setUploading(true);
      
      // Upload to backend which handles Cloudinary upload
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/challenge/upload-image`, {
        method: 'POST',
        body: uploadFormData,
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      return data.data.imageUrl || data.data;
    } catch (error) {
      console.error('Failed to upload image:', error);
      toast.error('Failed to upload image');
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleCreateChallenge = async () => {
    if (!formData.title || !formData.description || !formData.startDate || !formData.endDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);

      // Upload image if selected
      let imageUrl = formData.challengeImage;
      if (imageFile) {
        const uploadedUrl = await uploadImage();
        if (!uploadedUrl) {
          toast.error('Image upload failed. Please try again.');
          setSubmitting(false);
          return;
        }
        imageUrl = uploadedUrl;
      }

      await challengeService.createChallenge({ ...formData, challengeImage: imageUrl });
      toast.success('Challenge created successfully');
      setCreateDialogOpen(false);
      resetForm();
      fetchChallenges(true);
    } catch (error) {
      console.error('Failed to create challenge:', error);
      toast.error('Failed to create challenge');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateChallenge = async () => {
    if (!selectedChallenge) return;

    if (!formData.title || !formData.description || !formData.startDate || !formData.endDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);

      // Upload image if new file selected
      let imageUrl = formData.challengeImage;
      if (imageFile) {
        const uploadedUrl = await uploadImage();
        if (!uploadedUrl) {
          toast.error('Image upload failed. Please try again.');
          setSubmitting(false);
          return;
        }
        imageUrl = uploadedUrl;
      }

      await challengeService.updateChallenge(selectedChallenge._id, { ...formData, challengeImage: imageUrl });
      toast.success('Challenge updated successfully');
      setEditDialogOpen(false);
      setSelectedChallenge(null);
      resetForm();
      fetchChallenges(true);
    } catch (error) {
      console.error('Failed to update challenge:', error);
      toast.error('Failed to update challenge');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteChallenge = async () => {
    if (!selectedChallenge) return;

    try {
      await challengeService.deleteChallenge(selectedChallenge._id);
      toast.success('Challenge deleted successfully');
      setDeleteDialogOpen(false);
      setSelectedChallenge(null);
      fetchChallenges(true);
    } catch (error) {
      console.error('Failed to delete challenge:', error);
      toast.error('Failed to delete challenge');
    }
  };

  const handleUpdateStatus = async (challengeId: string, status: ChallengeStatus) => {
    try {
      await challengeService.updateChallenge(challengeId, { status });
      toast.success(`Challenge status updated to ${status}`);
      fetchChallenges(true);
    } catch (error) {
      console.error('Failed to update challenge status:', error);
      toast.error('Failed to update challenge status');
    }
  };

  const handleUpdateParticipantStatus = async (
    challengeId: string,
    userId: string,
    status: 'APPROVED' | 'REJECTED'
  ) => {
    try {
      await challengeService.updateParticipantStatus(challengeId, userId, status as ParticipantStatus);
      toast.success(`Participant ${status.toLowerCase()} successfully`);
      fetchChallenges(true);
      
      // Refresh the selected challenge if participants dialog is open
      if (selectedChallenge) {
        const updatedChallenge = await challengeService.getChallengeById(challengeId);
        setSelectedChallenge(updatedChallenge);
      }
    } catch (error) {
      console.error('Failed to update participant status:', error);
      toast.error('Failed to update participant status');
    }
  };

  const openEditDialog = (challenge: Challenge) => {
    setSelectedChallenge(challenge);
    setFormData({
      title: challenge.title,
      description: challenge.description,
      challengeImage: challenge.challengeImage || '',
      pointsReward: challenge.pointsReward,
      scoresReward: challenge.scoresReward,
      startDate: challenge.startDate.split('T')[0],
      endDate: challenge.endDate.split('T')[0],
      isPremiumOnly: challenge.isPremiumOnly,
    });
    setImagePreview(challenge.challengeImage || '');
    setImageFile(null);
    setEditDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge className="bg-green-500">Active</Badge>;
      case 'COMPLETED':
        return <Badge className="bg-blue-500">Completed</Badge>;
      case 'EXPIRED':
        return <Badge className="bg-gray-500">Expired</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Challenge Management
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Manage all challenges ({totalChallenges} total)
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchChallenges(true)}
            disabled={refreshing}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            size="sm"
            onClick={() => {
              resetForm();
              setCreateDialogOpen(true);
            }}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Create Challenge
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
            {/* Search */}
            <div className="lg:col-span-2">
              <div className="flex gap-2">
                <Input
                  placeholder="Search by title..."
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
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="EXPIRED">Expired</SelectItem>
              </SelectContent>
            </Select>

            {/* Premium Filter */}
            <Select value={premiumFilter} onValueChange={setPremiumFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Types</SelectItem>
                <SelectItem value="PREMIUM">Premium Only</SelectItem>
                <SelectItem value="FREE">Free</SelectItem>
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
                <SelectItem value="startDate-desc">Start Date (Latest)</SelectItem>
                <SelectItem value="startDate-asc">Start Date (Earliest)</SelectItem>
                <SelectItem value="endDate-desc">End Date (Latest)</SelectItem>
                <SelectItem value="endDate-asc">End Date (Earliest)</SelectItem>
                <SelectItem value="pointsReward-desc">Highest Points</SelectItem>
                <SelectItem value="scoresReward-desc">Highest Scores</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Challenges Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Challenge</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Rewards</TableHead>
                  <TableHead>Participants</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <Skeleton className="h-4 w-8" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-12 w-full" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-10 w-32" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-10 w-24" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-12" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-20" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-16" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-8 w-8 ml-auto" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : challenges.length > 0 ? (
                  challenges.map((challenge, index) => (
                    <TableRow key={challenge._id}>
                      <TableCell className="font-medium">
                        {(currentPage - 1) * limit + index + 1}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-start gap-3 max-w-md">
                          {challenge.challengeImage && (
                            <div className="h-12 w-12 rounded bg-muted flex items-center justify-center overflow-hidden shrink-0">
                              <Image
                                src={challenge.challengeImage}
                                alt={challenge.title}
                                width={48}
                                height={48}
                                className="h-full w-full object-cover"
                              />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium line-clamp-1">{challenge.title}</p>
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {challenge.description}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            <span className="text-xs">Start:</span>
                          </div>
                          <div className="font-medium">{formatDate(challenge.startDate)}</div>
                          <div className="flex items-center gap-1 text-muted-foreground mt-1">
                            <Calendar className="h-3 w-3" />
                            <span className="text-xs">End:</span>
                          </div>
                          <div className="font-medium">{formatDate(challenge.endDate)}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-sm">
                            <Trophy className="h-3 w-3 text-yellow-500" />
                            <span className="font-semibold">{challenge.pointsReward}</span>
                            <span className="text-xs text-muted-foreground">points</span>
                          </div>
                          <div className="flex items-center gap-1 text-sm">
                            <Trophy className="h-3 w-3 text-blue-500" />
                            <span className="font-semibold">{challenge.scoresReward}</span>
                            <span className="text-xs text-muted-foreground">scores</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span className="font-semibold">
                              {challenge.participantStats?.totalParticipants || challenge.participants.length}
                            </span>
                          </div>
                          {challenge.participantStats && (
                            <div className="text-xs space-y-0.5">
                              <div className="text-yellow-600">
                                ⏳ {challenge.participantStats.pendingCount} pending
                              </div>
                              <div className="text-green-600">
                                ✓ {challenge.participantStats.approvedCount} approved
                              </div>
                              {challenge.participantStats.rejectedCount > 0 && (
                                <div className="text-red-600">
                                  ✗ {challenge.participantStats.rejectedCount} rejected
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(challenge.status)}</TableCell>
                      <TableCell>
                        {challenge.isPremiumOnly ? (
                          <Badge variant="secondary" className="gap-1">
                            <Crown className="h-3 w-3" />
                            Premium
                          </Badge>
                        ) : (
                          <Badge variant="outline">Free</Badge>
                        )}
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
                            <DropdownMenuItem onClick={() => openEditDialog(challenge)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedChallenge(challenge);
                                setParticipantsDialogOpen(true);
                              }}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View Participants
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {challenge.status !== 'ACTIVE' && (
                              <DropdownMenuItem
                                onClick={() =>
                                  handleUpdateStatus(challenge._id, ChallengeStatus.ACTIVE)
                                }
                                className="text-green-600"
                              >
                                Mark as Active
                              </DropdownMenuItem>
                            )}
                            {challenge.status !== 'COMPLETED' && (
                              <DropdownMenuItem
                                onClick={() =>
                                  handleUpdateStatus(challenge._id, ChallengeStatus.COMPLETED)
                                }
                                className="text-blue-600"
                              >
                                Mark as Completed
                              </DropdownMenuItem>
                            )}
                            {challenge.status !== 'EXPIRED' && (
                              <DropdownMenuItem
                                onClick={() =>
                                  handleUpdateStatus(challenge._id, ChallengeStatus.EXPIRED)
                                }
                                className="text-gray-600"
                              >
                                Mark as Expired
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedChallenge(challenge);
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
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No challenges found
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

      {/* Create/Edit Challenge Dialog */}
      <Dialog
        open={createDialogOpen || editDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setCreateDialogOpen(false);
            setEditDialogOpen(false);
            setSelectedChallenge(null);
            resetForm();
          }
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editDialogOpen ? 'Edit Challenge' : 'Create New Challenge'}
            </DialogTitle>
            <DialogDescription>
              {editDialogOpen
                ? 'Update the challenge details below'
                : 'Fill in the details to create a new challenge'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div>
              <Label htmlFor="title">
                Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter challenge title"
              />
            </div>
            <div>
              <Label htmlFor="description">
                Description <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter challenge description"
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="challengeImage">Challenge Image</Label>
              
              {/* Image Preview */}
              {imagePreview && (
                <div className="relative w-full h-48 rounded-lg overflow-hidden bg-muted">
                  <Image
                    src={imagePreview}
                    alt="Preview"
                    fill
                    className="object-cover"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={removeImage}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {/* File Upload Input */}
              <div className="flex gap-2">
                <Input
                  id="challengeImageFile"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="flex-1"
                />
                {imageFile && (
                  <span className="text-sm text-muted-foreground self-center">
                    {imageFile.name}
                  </span>
                )}
              </div>
              
              {/* Or URL Input */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or use URL</span>
                </div>
              </div>
              
              <Input
                placeholder="https://example.com/image.jpg"
                value={formData.challengeImage}
                onChange={(e) => {
                  setFormData({ ...formData, challengeImage: e.target.value });
                  if (e.target.value) {
                    setImagePreview(e.target.value);
                    setImageFile(null);
                  }
                }}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="pointsReward">
                  Points Reward <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="pointsReward"
                  type="number"
                  min="0"
                  value={formData.pointsReward}
                  onChange={(e) =>
                    setFormData({ ...formData, pointsReward: parseInt(e.target.value) || 0 })
                  }
                />
              </div>
              <div>
                <Label htmlFor="scoresReward">
                  Scores Reward <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="scoresReward"
                  type="number"
                  min="0"
                  value={formData.scoresReward}
                  onChange={(e) =>
                    setFormData({ ...formData, scoresReward: parseInt(e.target.value) || 0 })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">
                  Start Date <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="startDate"
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={formData.startDate}
                  onChange={(e) => {
                    setFormData({ ...formData, startDate: e.target.value });
                    // Reset end date if it's before the new start date
                    if (formData.endDate && e.target.value > formData.endDate) {
                      setFormData({ ...formData, startDate: e.target.value, endDate: '' });
                    }
                  }}
                />
              </div>
              <div>
                <Label htmlFor="endDate">
                  End Date <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="endDate"
                  type="date"
                  min={formData.startDate || new Date().toISOString().split('T')[0]}
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  disabled={!formData.startDate}
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isPremiumOnly"
                checked={formData.isPremiumOnly}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isPremiumOnly: checked as boolean })
                }
              />
              <Label htmlFor="isPremiumOnly" className="cursor-pointer">
                Premium Only Challenge
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setCreateDialogOpen(false);
                setEditDialogOpen(false);
                setSelectedChallenge(null);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={editDialogOpen ? handleUpdateChallenge : handleCreateChallenge}
              disabled={submitting || uploading}
            >
              {submitting || uploading
                ? uploading
                  ? 'Uploading...'
                  : 'Saving...'
                : editDialogOpen
                ? 'Update Challenge'
                : 'Create Challenge'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the challenge
              {selectedChallenge?.title && (
                <strong> &quot;{selectedChallenge.title}&quot;</strong>
              )}
              . This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedChallenge(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteChallenge}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Participants Dialog */}
      <Dialog open={participantsDialogOpen} onOpenChange={setParticipantsDialogOpen}>
        <DialogContent className="max-w-6xl max-h-100vh">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Challenge Participants</DialogTitle>
            <DialogDescription>
              {selectedChallenge?.title && (
                <span className="font-medium">
                  Challenge: &quot;{selectedChallenge.title}&quot;
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          
          {/* Stats Summary */}
          {/* {selectedChallenge?.participantStats && (
            <div className="grid grid-cols-4 gap-4 py-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold">{selectedChallenge.participantStats.totalParticipants}</p>
                    <p className="text-xs text-muted-foreground">Total Participants</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-yellow-600">{selectedChallenge.participantStats.pendingCount}</p>
                    <p className="text-xs text-muted-foreground">Pending Review</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{selectedChallenge.participantStats.approvedCount}</p>
                    <p className="text-xs text-muted-foreground">Approved</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-red-600">{selectedChallenge.participantStats.rejectedCount}</p>
                    <p className="text-xs text-muted-foreground">Rejected</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )} */}

          <div className="max-h-[500px] overflow-y-auto">
            {selectedChallenge?.participants && selectedChallenge.participants.length > 0 ? (
              <div className="space-y-3">
                {selectedChallenge.participants.map((participant, index) => (
                  <Card key={participant.userId._id} className="overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        {/* Participant Number */}
                        <div className="shrink-0">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="font-bold text-primary">#{index + 1}</span>
                          </div>
                        </div>

                        {/* User Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center overflow-hidden shrink-0">
                              {participant.userId.avatar ? (
                                <Image
                                  src={participant.userId.avatar}
                                  alt={participant.userId.name}
                                  width={40}
                                  height={40}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <span className="text-sm font-semibold">
                                  {participant.userId.name.charAt(0).toUpperCase()}
                                </span>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="font-semibold text-base">
                                  {participant.userId.name}
                                </p>
                                {participant.userId.verifyBadge && (
                                  <Badge variant="secondary" className="h-5 px-1.5">
                                    <span className="text-blue-500">✓</span>
                                  </Badge>
                                )}
                                {participant.userId.isPremium && (
                                  <Badge variant="secondary" className="h-5 px-1.5">
                                    <Crown className="h-3 w-3 text-yellow-500" />
                                  </Badge>
                                )}
                                {/* Status Badge */}
                                {participant.status === 'PENDING' && (
                                  <Badge className="bg-yellow-500 ml-auto">⏳ Pending</Badge>
                                )}
                                {participant.status === 'APPROVED' && (
                                  <Badge className="bg-green-500 ml-auto">✓ Approved</Badge>
                                )}
                                {participant.status === 'REJECTED' && (
                                  <Badge className="bg-red-500 ml-auto">✗ Rejected</Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">
                                @{participant.userId.userName}
                                {participant.userId.email && (
                                  <span className="ml-2">• {participant.userId.email}</span>
                                )}
                              </p>
                            </div>
                          </div>

                          {/* Post Submission */}
                          {participant.postId ? (
                            <div className="bg-muted/50 rounded-lg p-3 mt-3">
                              <div className="flex items-start gap-3">
                                {participant.postId.postImage && (
                                  <div className="w-16 h-16 rounded bg-muted flex items-center justify-center overflow-hidden shrink-0">
                                    <Image
                                      src={participant.postId.postImage}
                                      alt="Post"
                                      width={64}
                                      height={64}
                                      className="h-full w-full object-cover"
                                    />
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-sm mb-1">
                                    {participant.postId.postTitle || 'Untitled Post'}
                                  </p>
                                  {participant.postId.postBody && (
                                    <p className="text-xs text-muted-foreground line-clamp-2">
                                      {participant.postId.postBody}
                                    </p>
                                  )}
                                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                                    {participant.postId.createdAt && (
                                      <span>
                                        📅 {new Date(participant.postId.createdAt).toLocaleDateString()}
                                      </span>
                                    )}
                                    {participant.postId.loveReactions && (
                                      <span>❤️ {participant.postId.loveReactions.length}</span>
                                    )}
                                    {participant.postId.comments && (
                                      <span>💬 {participant.postId.comments.length}</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="bg-muted/30 rounded-lg p-3 mt-3 text-center">
                              <p className="text-sm text-muted-foreground">
                                No post submitted yet
                              </p>
                            </div>
                          )}

                          {/* Rewards Section */}
                          {participant.status === 'APPROVED' && (
                            <div className="flex items-center gap-4 mt-3 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                              <div className="flex items-center gap-2">
                                <Trophy className="h-4 w-4 text-yellow-600" />
                                <span className="font-semibold text-sm">
                                  {participant.pointsEarned} points
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Trophy className="h-4 w-4 text-blue-600" />
                                <span className="font-semibold text-sm">
                                  {participant.scoresEarned} scores
                                </span>
                              </div>
                              {participant.completedAt && (
                                <span className="text-xs text-muted-foreground ml-auto">
                                  Completed: {new Date(participant.completedAt).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          )}

                          {/* Action Buttons */}
                          {participant.status === 'PENDING' && participant.postId && (
                            <div className="flex gap-2 mt-3">
                              <Button
                                size="sm"
                                className="flex-1 bg-green-600 hover:bg-green-700"
                                onClick={() =>
                                  handleUpdateParticipantStatus(
                                    selectedChallenge._id,
                                    participant.userId._id,
                                    'APPROVED'
                                  )
                                }
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Approve Submission
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="flex-1 text-red-600 hover:text-red-700 border-red-200"
                                onClick={() =>
                                  handleUpdateParticipantStatus(
                                    selectedChallenge._id,
                                    participant.userId._id,
                                    'REJECTED'
                                  )
                                }
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Reject Submission
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12">
                  <div className="text-center">
                    <Users className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                    <p className="text-lg font-medium">No participants yet</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      This challenge hasn&apos;t received any submissions
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
          
          <DialogFooter className="mt-4">
            <Button onClick={() => setParticipantsDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
