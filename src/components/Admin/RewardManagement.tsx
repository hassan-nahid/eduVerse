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
  Trash2,
  RefreshCw,
  Award,
  Eye,
  EyeOff,
  Search,
  X,
} from "lucide-react";
import { rewardService, Reward, RewardType } from "@/services/reward.service";
import { toast } from "sonner";
import Image from "next/image";
import { Checkbox } from "@/components/ui/checkbox";

const RewardManagement = () => {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [filteredRewards, setFilteredRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<RewardType | "ALL">("ALL");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");
  const [premiumFilter, setPremiumFilter] = useState<"ALL" | "PREMIUM" | "FREE">("ALL");

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
      const data = await rewardService.getAllRewards();
      setRewards(data);
      setFilteredRewards(data);
    } catch (error) {
      console.error("Error fetching rewards:", error);
      toast.error("Failed to fetch rewards");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRewards();
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = [...rewards];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((r) =>
        r.name.toLowerCase().includes(query) ||
        r.description?.toLowerCase().includes(query)
      );
    }

    if (typeFilter !== "ALL") {
      filtered = filtered.filter((r) => r.type === typeFilter);
    }

    if (statusFilter === "ACTIVE") {
      filtered = filtered.filter((r) => r.isActive);
    } else if (statusFilter === "INACTIVE") {
      filtered = filtered.filter((r) => !r.isActive);
    }

    if (premiumFilter === "PREMIUM") {
      filtered = filtered.filter((r) => r.isPremiumOnly);
    } else if (premiumFilter === "FREE") {
      filtered = filtered.filter((r) => !r.isPremiumOnly);
    }

    setFilteredRewards(filtered);
  }, [searchQuery, typeFilter, statusFilter, premiumFilter, rewards]);

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

  const handleDeleteClick = (reward: Reward) => {
    setSelectedReward(reward);
    setIsDeleteDialogOpen(true);
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

  const handleDelete = async () => {
    if (!selectedReward) return;

    setProcessingId(selectedReward._id);
    try {
      await rewardService.adminDeleteReward(selectedReward._id);
      toast.success("Reward deleted successfully");
      setIsDeleteDialogOpen(false);
      fetchRewards();
    } catch (error) {
      console.error("Error deleting reward:", error);
      toast.error("Failed to delete reward");
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

  const clearFilters = () => {
    setSearchQuery("");
    setTypeFilter("ALL");
    setStatusFilter("ALL");
    setPremiumFilter("ALL");
    toast.success("Filters cleared");
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Reward Management</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Create and manage rewards for users to claim ({filteredRewards.length} rewards)
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
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {/* Search */}
            <div className="lg:col-span-1">
              <Input
                type="text"
                placeholder="Search rewards..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>

            {/* Type Filter */}
            <Select
              value={typeFilter}
              onValueChange={(value) => setTypeFilter(value as RewardType | "ALL")}
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
              onValueChange={(value) => setStatusFilter(value as "ALL" | "ACTIVE" | "INACTIVE")}
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
              onValueChange={(value) => setPremiumFilter(value as "ALL" | "PREMIUM" | "FREE")}
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
            ) : filteredRewards.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  No rewards found
                </TableCell>
              </TableRow>
            ) : (
              filteredRewards.map((reward) => (
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
                        <Eye className="h-3 w-3 mr-1" />
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="secondary">
                        <EyeOff className="h-3 w-3 mr-1" />
                        Inactive
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(reward.createdAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditClick(reward)}
                        disabled={processingId === reward._id}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteClick(reward)}
                        disabled={processingId === reward._id}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Reward</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this reward? This will make it inactive
              but won&apos;t remove it from users who already claimed it.
            </DialogDescription>
          </DialogHeader>
          {selectedReward && (
            <div className="py-4">
              <div className="flex items-center gap-3">
                {selectedReward.image ? (
                  <div className="relative h-16 w-16 rounded-md overflow-hidden">
                    <Image
                      src={selectedReward.image}
                      alt={selectedReward.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="h-16 w-16 rounded-md bg-muted flex items-center justify-center">
                    <Award className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
                <div>
                  <div className="font-medium">{selectedReward.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {selectedReward.pointPrice} points • {selectedReward.type}
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={processingId !== null}
            >
              {processingId ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RewardManagement;
