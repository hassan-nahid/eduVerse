"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Plus,
  Edit,
  RefreshCw,
  Award,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { rewardService, Reward, RewardType } from "@/services/reward.service";
import { toast } from "sonner";
import Image from "next/image";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";

const RewardManagement = () => {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Pagination and meta
  const [currentPage, setCurrentPage] = useState(1);
  const [pageLimit, setPageLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRewards, setTotalRewards] = useState(0);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [searchTerm, setSearchTerm] = useState(""); // Debounced search term
  const [typeFilter, setTypeFilter] = useState<RewardType | "ALL">("ALL");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");
  const [premiumFilter, setPremiumFilter] = useState<"ALL" | "PREMIUM" | "FREE">("ALL");
  const [sortField, setSortField] = useState("-createdAt");

  // Form state
  const [formData, setFormData] = useState({
    type: RewardType.BADGE,
    name: "",
    description: "",
    pointPrice: 0,
    isPremiumOnly: false,
    isActive: true,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  const fetchRewards = async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number | boolean | undefined> = {
        page: currentPage,
        limit: pageLimit,
        sort: sortField,
      };

      if (searchTerm.trim()) {
        params.searchTerm = searchTerm.trim();
      }

      if (typeFilter !== "ALL") {
        params.type = typeFilter;
      }

      if (statusFilter === "ACTIVE") {
        params.isActive = true;
      } else if (statusFilter === "INACTIVE") {
        params.isActive = false;
      }

      if (premiumFilter === "PREMIUM") {
        params.isPremiumOnly = true;
      } else if (premiumFilter === "FREE") {
        params.isPremiumOnly = false;
      }

      const response = await rewardService.adminGetAllRewards(params);
      setRewards(response.data);
      setTotalPages(response.meta.totalPage);
      setTotalRewards(response.meta.total);
    } catch (error) {
      console.error("Error fetching rewards:", error);
      toast.error("Failed to fetch rewards");
    } finally {
      setLoading(false);
    }
  };

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    fetchRewards();
  }, [currentPage, pageLimit, sortField, searchTerm, typeFilter, statusFilter, premiumFilter]);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1); // Reset to first page on search
  };

  const handleFilterChange = () => {
    setCurrentPage(1); // Reset to first page on filter change
  };

  const clearFilters = () => {
    setSearchQuery("");
    setTypeFilter("ALL");
    setStatusFilter("ALL");
    setPremiumFilter("ALL");
    setSortField("-createdAt");
    setCurrentPage(1);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // Apply filters - removed local filtering, now using server-side
  useEffect(() => {
    handleFilterChange();
  }, [typeFilter, statusFilter, premiumFilter]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setFormData({
      type: RewardType.BADGE,
      name: "",
      description: "",
      pointPrice: 0,
      isPremiumOnly: false,
      isActive: true,
    });
    setImageFile(null);
    setImagePreview("");
  };

  const handleCreateClick = () => {
    resetForm();
    setIsCreateDialogOpen(true);
  };

  const handleEditClick = (reward: Reward) => {
    setSelectedReward(reward);
    setFormData({
      type: reward.type,
      name: reward.name,
      description: reward.description || "",
      pointPrice: reward.pointPrice,
      isPremiumOnly: reward.isPremiumOnly,
      isActive: reward.isActive,
    });
    setImagePreview(reward.image || "");
    setIsEditDialogOpen(true);
  };

  const handleCreate = async () => {
    if (!formData.name.trim()) {
      toast.error("Reward name is required");
      return;
    }

    if (formData.pointPrice < 0) {
      toast.error("Point price must be non-negative");
      return;
    }

    setProcessingId("creating");
    try {
      const data = new FormData();
      data.append("type", formData.type);
      data.append("name", formData.name.trim());
      data.append("description", formData.description.trim());
      data.append("pointPrice", formData.pointPrice.toString());
      data.append("isPremiumOnly", formData.isPremiumOnly.toString());
      data.append("isActive", formData.isActive.toString());
      
      if (imageFile) {
        data.append("image", imageFile);
      }

      await rewardService.adminCreateReward(data);
      toast.success("Reward created successfully");
      setIsCreateDialogOpen(false);
      resetForm();
      fetchRewards();
    } catch (error) {
      console.error("Error creating reward:", error);
      toast.error("Failed to create reward");
    } finally {
      setProcessingId(null);
    }
  };

  const handleUpdate = async () => {
    if (!selectedReward) return;

    if (!formData.name.trim()) {
      toast.error("Reward name is required");
      return;
    }

    if (formData.pointPrice < 0) {
      toast.error("Point price must be non-negative");
      return;
    }

    setProcessingId(selectedReward._id);
    try {
      const data = new FormData();
      data.append("type", formData.type);
      data.append("name", formData.name.trim());
      data.append("description", formData.description.trim());
      data.append("pointPrice", formData.pointPrice.toString());
      data.append("isPremiumOnly", formData.isPremiumOnly.toString());
      data.append("isActive", formData.isActive.toString());
      
      if (imageFile) {
        data.append("image", imageFile);
      }

      await rewardService.adminUpdateReward(selectedReward._id, data);
      toast.success("Reward updated successfully");
      setIsEditDialogOpen(false);
      resetForm();
      fetchRewards();
    } catch (error) {
      console.error("Error updating reward:", error);
      toast.error("Failed to update reward");
    } finally {
      setProcessingId(null);
    }
  };

  const handleToggleStatus = async (reward: Reward) => {
    setProcessingId(reward._id);
    try {
      const data = new FormData();
      data.append("isActive", (!reward.isActive).toString());
      
      await rewardService.adminUpdateReward(reward._id, data);
      toast.success(`Reward ${!reward.isActive ? 'activated' : 'deactivated'} successfully`);
      fetchRewards();
    } catch (error) {
      console.error("Error toggling reward status:", error);
      toast.error("Failed to update reward status");
    } finally {
      setProcessingId(null);
    }
  };

  const getTypeBadge = (type: RewardType) => {
    const typeConfig = {
      [RewardType.BADGE]: { label: "Badge", className: "bg-blue-500" },
      [RewardType.AVATAR]: { label: "Avatar", className: "bg-purple-500" },
      [RewardType.BANNER]: { label: "Banner", className: "bg-green-500" },
      [RewardType.UNLOCKED_TITLES]: { label: "Title", className: "bg-orange-500" },
    };

    const config = typeConfig[type];
    return (
      <Badge className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Reward Management</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Create and manage rewards for users to claim ({totalRewards} total)
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchRewards}
            disabled={loading}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button size="sm" onClick={handleCreateClick}>
            <Plus className="h-4 w-4 mr-2" />
            Create Reward
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base sm:text-lg">Filters</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-xs h-8"
            >
              <X className="h-3 w-3 mr-1" />
              Clear Filters
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
            {/* Search */}
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search by name, description, or type..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Type Filter */}
            <Select
              value={typeFilter}
              onValueChange={(value) => {
                setTypeFilter(value as RewardType | "ALL");
                handleFilterChange();
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Types</SelectItem>
                <SelectItem value={RewardType.BADGE}>Badge</SelectItem>
                <SelectItem value={RewardType.AVATAR}>Avatar</SelectItem>
                <SelectItem value={RewardType.BANNER}>Banner</SelectItem>
                <SelectItem value={RewardType.UNLOCKED_TITLES}>Title</SelectItem>
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select
              value={statusFilter}
              onValueChange={(value) => {
                setStatusFilter(value as "ALL" | "ACTIVE" | "INACTIVE");
                handleFilterChange();
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="INACTIVE">Inactive</SelectItem>
              </SelectContent>
            </Select>

            {/* Access Filter */}
            <Select
              value={premiumFilter}
              onValueChange={(value) => {
                setPremiumFilter(value as "ALL" | "PREMIUM" | "FREE");
                handleFilterChange();
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Access" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Access</SelectItem>
                <SelectItem value="PREMIUM">Premium Only</SelectItem>
                <SelectItem value="FREE">Free</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Sort Options */}
          <div className="mt-4 flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Sort by:</span>
            <Select
              value={sortField}
              onValueChange={(value) => setSortField(value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="-createdAt">Newest First</SelectItem>
                <SelectItem value="createdAt">Oldest First</SelectItem>
                <SelectItem value="name">Name (A-Z)</SelectItem>
                <SelectItem value="-name">Name (Z-A)</SelectItem>
                <SelectItem value="pointPrice">Price (Low to High)</SelectItem>
                <SelectItem value="-pointPrice">Price (High to Low)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Points</TableHead>
              <TableHead>Access</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  Loading...
                </TableCell>
              </TableRow>
            ) : rewards.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  No rewards found
                </TableCell>
              </TableRow>
            ) : (
              rewards.map((reward: Reward) => (
                <TableRow key={reward._id}>
                  <TableCell>
                    {reward.image ? (
                      <div className="relative h-12 w-12 rounded-md overflow-hidden">
                        <Image
                          src={reward.image}
                          alt={reward.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="h-12 w-12 rounded-md bg-muted flex items-center justify-center">
                        <Award className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{reward.name}</div>
                    {reward.description && (
                      <div className="text-sm text-muted-foreground line-clamp-1">
                        {reward.description}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>{getTypeBadge(reward.type)}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{reward.pointPrice} pts</Badge>
                  </TableCell>
                  <TableCell>
                    {reward.isPremiumOnly ? (
                      <Badge className="bg-yellow-500">Premium</Badge>
                    ) : (
                      <Badge variant="secondary">Free</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {reward.isActive ? (
                      <Badge variant="default" className="bg-green-500">
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="secondary">
                        Inactive
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(reward.createdAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2 items-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditClick(reward)}
                        disabled={processingId === reward._id}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {reward.isActive ? 'Active' : 'Inactive'}
                        </span>
                        <Switch
                          checked={reward.isActive}
                          onCheckedChange={() => handleToggleStatus(reward)}
                          disabled={processingId === reward._id}
                        />
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        {!loading && rewards.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-4 border-t">
            <div className="text-sm text-muted-foreground">
              Showing {((currentPage - 1) * pageLimit) + 1} to {Math.min(currentPage * pageLimit, totalRewards)} of {totalRewards} rewards
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(pageNum)}
                      className="w-8 h-8 p-0"
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Reward</DialogTitle>
            <DialogDescription>
              Add a new reward for users to claim with their points
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="create-type" className="mb-2 block">Type *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) =>
                    setFormData({ ...formData, type: value as RewardType })
                  }
                >
                  <SelectTrigger id="create-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={RewardType.BADGE}>Badge</SelectItem>
                    <SelectItem value={RewardType.AVATAR}>Avatar</SelectItem>
                    <SelectItem value={RewardType.BANNER}>Banner</SelectItem>
                    <SelectItem value={RewardType.UNLOCKED_TITLES}>Title</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="create-points" className="mb-2 block">Point Price *</Label>
                <Input
                  id="create-points"
                  type="number"
                  min="0"
                  value={formData.pointPrice}
                  onChange={(e) =>
                    setFormData({ ...formData, pointPrice: Number(e.target.value) })
                  }
                />
              </div>
            </div>

            <div>
              <Label htmlFor="create-name" className="mb-2 block">Name *</Label>
              <Input
                id="create-name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Enter reward name"
              />
            </div>

            <div>
              <Label htmlFor="create-description" className="mb-2 block">Description</Label>
              <Textarea
                id="create-description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Enter reward description"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="create-image" className="mb-2 block">Image</Label>
              <Input
                id="create-image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
              {imagePreview && (
                <div className="mt-2 relative h-32 w-32 rounded-md overflow-hidden">
                  <Image
                    src={imagePreview}
                    alt="Preview"
                    fill
                    className="object-cover"
                  />
                </div>
              )}
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="create-premium"
                  checked={formData.isPremiumOnly}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isPremiumOnly: checked as boolean })
                  }
                />
                <Label htmlFor="create-premium" className="cursor-pointer">
                  Premium Only
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="create-active"
                  checked={formData.isActive}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isActive: checked as boolean })
                  }
                />
                <Label htmlFor="create-active" className="cursor-pointer">
                  Active
                </Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={processingId !== null}>
              {processingId ? "Creating..." : "Create Reward"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Reward</DialogTitle>
            <DialogDescription>
              Update reward information
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-type" className="mb-2 block">Type *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) =>
                    setFormData({ ...formData, type: value as RewardType })
                  }
                >
                  <SelectTrigger id="edit-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={RewardType.BADGE}>Badge</SelectItem>
                    <SelectItem value={RewardType.AVATAR}>Avatar</SelectItem>
                    <SelectItem value={RewardType.BANNER}>Banner</SelectItem>
                    <SelectItem value={RewardType.UNLOCKED_TITLES}>Title</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="edit-points" className="mb-2 block">Point Price *</Label>
                <Input
                  id="edit-points"
                  type="number"
                  min="0"
                  value={formData.pointPrice}
                  onChange={(e) =>
                    setFormData({ ...formData, pointPrice: Number(e.target.value) })
                  }
                />
              </div>
            </div>

            <div>
              <Label htmlFor="edit-name" className="mb-2 block">Name *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Enter reward name"
              />
            </div>

            <div>
              <Label htmlFor="edit-description" className="mb-2 block">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Enter reward description"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="edit-image" className="mb-2 block">Image (leave empty to keep current)</Label>
              <Input
                id="edit-image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
              {imagePreview && (
                <div className="mt-2 relative h-32 w-32 rounded-md overflow-hidden">
                  <Image
                    src={imagePreview}
                    alt="Preview"
                    fill
                    className="object-cover"
                  />
                </div>
              )}
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="edit-premium"
                  checked={formData.isPremiumOnly}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isPremiumOnly: checked as boolean })
                  }
                />
                <Label htmlFor="edit-premium" className="cursor-pointer">
                  Premium Only
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="edit-active"
                  checked={formData.isActive}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isActive: checked as boolean })
                  }
                />
                <Label htmlFor="edit-active" className="cursor-pointer">
                  Active
                </Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate} disabled={processingId !== null}>
              {processingId ? "Updating..." : "Update Reward"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RewardManagement;
