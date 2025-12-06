"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { authService, AuthUser, ClaimedReward } from "@/services/auth.service";
import { rewardService } from "@/services/reward.service";
import { toast } from "sonner";
import {
  User,
  Mail,
  MapPin,
  Calendar,
  Award,
  Trophy,
  Crown,
  Edit,
  BadgeCheck,
  Sparkles,
  ImageIcon,
  LayoutTemplate,
  CheckCircle2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export function UserProfile() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [claimedRewards, setClaimedRewards] = useState<ClaimedReward[]>([]);
  
  // Modal states
  const [showBadgeModal, setShowBadgeModal] = useState(false);
  const [showBannerModal, setShowBannerModal] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [showTitleModal, setShowTitleModal] = useState(false);
  
  // Selection states
  const [selectedBadgeIds, setSelectedBadgeIds] = useState<string[]>([]);
  const [savingSelection, setSavingSelection] = useState(false);

  useEffect(() => {
    fetchUserProfile();
    fetchClaimedRewards();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const response = await authService.getMe();
      setUser(response.data);
      setSelectedBadgeIds(response.data.badges || []);
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const fetchClaimedRewards = async () => {
    try {
      const rewards = await rewardService.getMyRewards();
      setClaimedRewards(rewards);
    } catch (error) {
      console.error("Failed to fetch claimed rewards:", error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Get rewards by type
  const getRewardsByType = (type: string) => {
    return claimedRewards.filter(reward => reward.type === type);
  };

  // Check if string is a valid URL
  const isValidUrl = (str: string) => {
    try {
      new URL(str);
      return true;
    } catch {
      return false;
    }
  };

  // Get selected reward details
  const getSelectedReward = (rewardId?: string) => {
    if (!rewardId) return null;
    // If it's a valid URL, it's not a reward ID
    if (isValidUrl(rewardId)) return null;
    return claimedRewards.find(r => r._id === rewardId);
  };

  // Get display image - returns reward image or direct URL
  const getDisplayImage = (value?: string) => {
    if (!value) return null;
    const reward = getSelectedReward(value);
    if (reward?.image) return reward.image;
    if (isValidUrl(value)) return value;
    return null;
  };

  // Handle banner selection
  const handleSelectBanner = async (reward: ClaimedReward) => {
    if (!user || !reward.image) return;
    try {
      setSavingSelection(true);
      await authService.selectBanner(user._id, reward.image);
      toast.success("Banner selected successfully!");
      await fetchUserProfile();
      setShowBannerModal(false);
    } catch (err) {
      console.error("Failed to select banner:", err);
      toast.error("Failed to select banner");
    } finally {
      setSavingSelection(false);
    }
  };

  // Handle avatar selection
  const handleSelectAvatar = async (reward: ClaimedReward) => {
    if (!user || !reward.image) return;
    try {
      setSavingSelection(true);
      await authService.selectAvatar(user._id, reward.image);
      toast.success("Avatar selected successfully!");
      await fetchUserProfile();
      setShowAvatarModal(false);
    } catch (err) {
      console.error("Failed to select avatar:", err);
      toast.error("Failed to select avatar");
    } finally {
      setSavingSelection(false);
    }
  };

  // Handle title selection
  const handleSelectTitle = async (rewardId: string) => {
    if (!user) return;
    try {
      setSavingSelection(true);
      await authService.selectTitle(user._id, rewardId);
      toast.success("Title selected successfully!");
      await fetchUserProfile();
      setShowTitleModal(false);
    } catch (err) {
      console.error("Failed to select title:", err);
      toast.error("Failed to select title");
    } finally {
      setSavingSelection(false);
    }
  };

  // Handle badge selection (toggle)
  const handleToggleBadge = (rewardId: string) => {
    setSelectedBadgeIds(prev => {
      if (prev.includes(rewardId)) {
        return prev.filter(id => id !== rewardId);
      } else {
        if (prev.length >= 10) {
          toast.error("You can only select up to 10 badges");
          return prev;
        }
        return [...prev, rewardId];
      }
    });
  };

  // Save badge selection
  const handleSaveBadges = async () => {
    if (!user) return;
    try {
      setSavingSelection(true);
      await authService.selectBadges(user._id, selectedBadgeIds);
      toast.success("Badges saved successfully!");
      await fetchUserProfile();
      setShowBadgeModal(false);
    } catch (err) {
      console.error("Failed to save badges:", err);
      toast.error("Failed to save badges");
    } finally {
      setSavingSelection(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              <Skeleton className="h-32 w-32 rounded-full" />
              <div className="flex-1 space-y-4">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-64" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Failed to load profile</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">My Profile</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            View and manage your profile information
          </p>
        </div>
        <Link href="/dashboard/settings">
          <Button size="sm">
            <Edit className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
        </Link>
      </div>

      {/* Profile Card with Banner */}
      <Card className="overflow-hidden">
        {/* Banner Image */}
        <div className="relative h-48 sm:h-64 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20">
          {/* Check if banner is a reward ID or direct URL */}
          {getDisplayImage(user.banner) ? (
            <Image
              src={getDisplayImage(user.banner)!}
              alt="Profile Banner"
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
              loading="eager"
              priority
              className="object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-6xl opacity-10">🎓</div>
            </div>
          )}
          {/* Premium Badge on Banner */}
          {user.isPremium && (
            <div className="absolute top-4 right-4">
              <Badge className="bg-yellow-500 text-white">
                <Crown className="h-4 w-4 mr-1" />
                Premium
              </Badge>
            </div>
          )}
        </div>

        {/* Profile Info Section */}
        <CardContent className="relative pt-0 px-4 sm:px-6 pb-6">
          {/* Avatar - Centered and Overlapping Banner */}
          <div className="flex justify-center sm:justify-start -mt-16 sm:-mt-20 mb-4">
            <div className="relative shrink-0">
              <div className="relative h-32 w-32 sm:h-40 sm:w-40 rounded-full overflow-hidden bg-background border-4 border-background shadow-xl">
                {/* Check if avatar is a reward ID or direct URL */}
                {getDisplayImage(user.avatar) ? (
                  <Image
                    src={getDisplayImage(user.avatar)!}
                    alt={user.name}
                    fill
                    sizes="(max-width: 640px) 128px, 160px"
                    className="object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-primary text-primary-foreground">
                    <User className="h-16 w-16 sm:h-20 sm:w-20" />
                  </div>
                )}
              </div>
              {/* Verification Badge */}
              {user.verifyBadge && (
                <div className="absolute bottom-2 right-2 bg-blue-500 rounded-full p-1.5 border-2 border-background shadow-lg">
                  <BadgeCheck className="h-5 w-5 text-white" />
                </div>
              )}
            </div>
          </div>

          {/* User Details - Below Avatar */}
          <div className="space-y-4">
            {/* Name and Status */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="space-y-2 min-w-0 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                  <h2 className="text-2xl sm:text-3xl font-bold text-foreground wrap-break-word">{user.name}</h2>
                  {user.isPremium && <Crown className="h-6 w-6 text-yellow-500 shrink-0" />}
                </div>
                {user.userName && (
                  <p className="text-base text-muted-foreground wrap-break-word">@{user.userName}</p>
                )}
              </div>

              {/* Status Badges */}
              <div className="flex flex-wrap justify-center sm:justify-end gap-2 shrink-0">
                <Badge variant={user.isActive === "ACTIVE" ? "default" : "secondary"} className={user.isActive === "ACTIVE" ? "bg-green-500" : ""}>
                  {user.isActive}
                </Badge>
                <Badge variant="outline">{user.role}</Badge>
              </div>
            </div>

            {/* Stats Row */}
            <div className="flex justify-center sm:justify-start gap-8 py-3">
              <div className="text-center">
                <p className="text-xl sm:text-2xl font-bold text-yellow-600">{user.points}</p>
                <p className="text-xs text-muted-foreground">Points</p>
              </div>
              <div className="text-center">
                <p className="text-xl sm:text-2xl font-bold text-green-600">{user.scores}</p>
                <p className="text-xs text-muted-foreground">Scores</p>
              </div>
            </div>

            {/* Bio */}
            {user.bio && (
              <div className="text-center sm:text-left">
                <p className="text-sm text-foreground/90 max-w-2xl wrap-break-word mx-auto sm:mx-0">{user.bio}</p>
              </div>
            )}

            {/* Additional Info */}
            <div className="flex flex-wrap justify-center sm:justify-start gap-x-6 gap-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2 min-w-0">
                <Mail className="h-4 w-4 shrink-0" />
                <span className="break-all">{user.email}</span>
              </div>
              {(user.city || user.country) && (
                <div className="flex items-center gap-2 min-w-0">
                  <MapPin className="h-4 w-4 shrink-0" />
                  <span className="wrap-break-word">
                    {[user.city, user.country].filter(Boolean).join(", ")}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-2 shrink-0">
                <Calendar className="h-4 w-4" />
                <span className="whitespace-nowrap">Joined {formatDate(user.createdAt)}</span>
              </div>
            </div>

            {/* Premium Expiry */}
            {user.isPremium && user.premiumExpiryDate && (
              <div className="flex justify-center sm:justify-start">
                <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                  Premium until {formatDate(user.premiumExpiryDate)}
                </Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Activity Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Trophy className="h-5 w-5 text-yellow-600" />
              Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Points</span>
              <span className="text-xl font-bold text-yellow-600">{user.points}</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Scores</span>
              <span className="text-xl font-bold text-green-600">{user.scores}</span>
            </div>
          </CardContent>
        </Card>

        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <User className="h-5 w-5" />
              Personal Info
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {user.gender && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Gender</span>
                <span className="font-medium capitalize">{user.gender.toLowerCase()}</span>
              </div>
            )}
            {user.dateOfBirth && (
              <>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Birthday</span>
                  <span className="font-medium text-sm">{formatDate(user.dateOfBirth)}</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Account Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Award className="h-5 w-5" />
              Account
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Status</span>
              <Badge 
                variant={user.isActive === "ACTIVE" ? "default" : "secondary"}
                className={user.isActive === "ACTIVE" ? "bg-green-500" : ""}
              >
                {user.isActive}
              </Badge>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Role</span>
              <Badge variant="outline">{user.role}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Claimed Rewards Section */}
      {claimedRewards.length > 0 && (
        <>
          {/* Badges Section */}
          {getRewardsByType('BADGE').length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    My Badges
                  </CardTitle>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setSelectedBadgeIds(user?.badges || []);
                      setShowBadgeModal(true);
                    }}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Manage Badges
                  </Button>
                </div>
                <CardDescription>Show off your earned badges ({user?.badges?.length || 0}/10 displayed)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4">
                  {(user?.badges || []).slice(0, 10).map((badgeId) => {
                    const badge = getSelectedReward(badgeId);
                    if (!badge) return null;
                    return (
                      <div key={badge._id} className="flex flex-col items-center gap-2">
                        <div className="relative h-24 w-24 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 p-1 shadow-lg">
                          <div className="h-full w-full rounded-full bg-background flex items-center justify-center overflow-hidden">
                            {badge.image ? (
                              <Image src={badge.image} alt={badge.name} width={80} height={80} className="object-cover" />
                            ) : (
                              <Award className="h-12 w-12 text-yellow-600" />
                            )}
                          </div>
                        </div>
                        <p className="text-xs font-medium text-center max-w-[100px] truncate">{badge.name}</p>
                      </div>
                    );
                  })}
                  {(user?.badges?.length || 0) === 0 && (
                    <p className="text-sm text-muted-foreground">No badges selected yet. Click &ldquo;Manage Badges&rdquo; to choose up to 10 badges.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Avatar Selection */}
          {getRewardsByType('AVATAR').length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    My Avatars
                  </CardTitle>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowAvatarModal(true)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Change Avatar
                  </Button>
                </div>
                <CardDescription>Select an avatar from your claimed rewards</CardDescription>
              </CardHeader>
              <CardContent>
                {user?.avatar ? (
                  <div className="flex items-center gap-4">
                    <div className="relative h-20 w-20 rounded-full overflow-hidden border-4 border-primary shadow-lg">
                      {getDisplayImage(user.avatar) ? (
                        <Image 
                          src={getDisplayImage(user.avatar)!} 
                          alt="Selected Avatar" 
                          fill
                          sizes="80px"
                          className="object-cover" 
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center bg-primary/10">
                          <User className="h-10 w-10 text-primary" />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-semibold">{getSelectedReward(user.avatar)?.name || "Custom Avatar"}</p>
                      <p className="text-sm text-muted-foreground">Currently selected</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No avatar selected. Click &ldquo;Change Avatar&rdquo; to select one.</p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Banner Selection */}
          {getRewardsByType('BANNER').length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <LayoutTemplate className="h-5 w-5" />
                    My Banners
                  </CardTitle>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowBannerModal(true)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Change Banner
                  </Button>
                </div>
                <CardDescription>Select a banner from your claimed rewards</CardDescription>
              </CardHeader>
              <CardContent>
                {user?.banner ? (
                  <div className="space-y-3">
                    <div className="relative h-32 w-full rounded-lg overflow-hidden border shadow-md">
                      {getDisplayImage(user.banner) ? (
                        <Image 
                          src={getDisplayImage(user.banner)!} 
                          alt="Selected Banner" 
                          fill
                          sizes="(max-width: 768px) 100vw, 600px"
                          className="object-cover" 
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center bg-gradient-to-r from-primary/20 to-primary/10">
                          <ImageIcon className="h-12 w-12 text-primary/50" />
                        </div>
                      )}
                    </div>
                    <p className="text-sm font-medium">{getSelectedReward(user.banner)?.name || "Custom Banner"}</p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No banner selected. Click &ldquo;Change Banner&rdquo; to select one.</p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Title Selection */}
          {getRewardsByType('UNLOCKED_TITLES').length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Crown className="h-5 w-5" />
                    My Titles
                  </CardTitle>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowTitleModal(true)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Change Title
                  </Button>
                </div>
                <CardDescription>Select a title to display on your profile</CardDescription>
              </CardHeader>
              <CardContent>
                {user?.unlockedTitles && user.unlockedTitles.length > 0 ? (
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30">
                    <Sparkles className="h-4 w-4 text-purple-600" />
                    <span className="font-semibold text-purple-700">{getSelectedReward(user.unlockedTitles[0])?.name || user.unlockedTitles[0]}</span>
                    <Crown className="h-4 w-4 text-yellow-600" />
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No title selected. Click &ldquo;Change Title&rdquo; to select one.</p>
                )}
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Badge Selection Modal */}
      <Dialog open={showBadgeModal} onOpenChange={setShowBadgeModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manage Your Badges</DialogTitle>
            <DialogDescription>
              Select up to 10 badges to display on your profile ({selectedBadgeIds.length}/10 selected)
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 py-4">
            {getRewardsByType('BADGE').map((badge) => {
              const isSelected = selectedBadgeIds.includes(badge._id);
              return (
                <div
                  key={badge._id}
                  className={`relative cursor-pointer rounded-lg border-2 p-4 transition-all ${
                    isSelected ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => handleToggleBadge(badge._id)}
                >
                  {isSelected && (
                    <div className="absolute -top-2 -right-2 bg-primary rounded-full p-1">
                      <CheckCircle2 className="h-4 w-4 text-primary-foreground" />
                    </div>
                  )}
                  <div className="flex flex-col items-center gap-2">
                    <div className="relative h-20 w-20 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 p-0.5">
                      <div className="h-full w-full rounded-full bg-background flex items-center justify-center overflow-hidden">
                        {badge.image ? (
                          <Image src={badge.image} alt={badge.name} width={70} height={70} className="object-cover" />
                        ) : (
                          <Award className="h-10 w-10 text-yellow-600" />
                        )}
                      </div>
                    </div>
                    <p className="text-xs font-medium text-center line-clamp-2">{badge.name}</p>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setShowBadgeModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveBadges} disabled={savingSelection}>
              {savingSelection ? "Saving..." : "Save Selection"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Avatar Selection Modal */}
      <Dialog open={showAvatarModal} onOpenChange={setShowAvatarModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Select Your Avatar</DialogTitle>
            <DialogDescription>
              Choose an avatar to display on your profile
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 py-4">
            {getRewardsByType('AVATAR').map((avatar) => {
              const isSelected = user?.avatar === avatar.image;
              return (
                <div
                  key={avatar._id}
                  className={`relative cursor-pointer rounded-lg border-2 p-4 transition-all ${
                    isSelected ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => handleSelectAvatar(avatar)}
                >
                  {isSelected && (
                    <div className="absolute -top-2 -right-2 bg-primary rounded-full p-1">
                      <CheckCircle2 className="h-4 w-4 text-primary-foreground" />
                    </div>
                  )}
                  <div className="flex flex-col items-center gap-2">
                    <div className="relative h-24 w-24 rounded-full overflow-hidden border-2 border-primary/20">
                      {avatar.image ? (
                        <Image src={avatar.image} alt={avatar.name} fill sizes="96px" className="object-cover" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center bg-primary/10">
                          <User className="h-12 w-12 text-primary" />
                        </div>
                      )}
                    </div>
                    <p className="text-xs font-medium text-center line-clamp-2">{avatar.name}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>

      {/* Banner Selection Modal */}
      <Dialog open={showBannerModal} onOpenChange={setShowBannerModal}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Select Your Banner</DialogTitle>
            <DialogDescription>
              Choose a banner to display on your profile
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
            {getRewardsByType('BANNER').map((banner) => {
              const isSelected = user?.banner === banner.image;
              return (
                <div
                  key={banner._id}
                  className={`relative cursor-pointer rounded-lg border-2 overflow-hidden transition-all ${
                    isSelected ? 'border-primary' : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => handleSelectBanner(banner)}
                >
                  {isSelected && (
                    <div className="absolute top-2 right-2 bg-primary rounded-full p-1 z-10">
                      <CheckCircle2 className="h-5 w-5 text-primary-foreground" />
                    </div>
                  )}
                  <div className="relative h-32 w-full">
                    {banner.image ? (
                      <Image src={banner.image} alt={banner.name} fill sizes="(max-width: 768px) 100vw, 400px" className="object-cover" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-gradient-to-r from-primary/20 to-primary/10">
                        <ImageIcon className="h-12 w-12 text-primary/50" />
                      </div>
                    )}
                  </div>
                  <div className="p-3 bg-background">
                    <p className="text-sm font-medium">{banner.name}</p>
                    {banner.description && (
                      <p className="text-xs text-muted-foreground line-clamp-1">{banner.description}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>

      {/* Title Selection Modal */}
      <Dialog open={showTitleModal} onOpenChange={setShowTitleModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Select Your Title</DialogTitle>
            <DialogDescription>
              Choose a title to display on your profile
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-3 py-4">
            {getRewardsByType('UNLOCKED_TITLES').map((title) => {
              const isSelected = user?.unlockedTitles?.includes(title._id);
              return (
                <div
                  key={title._id}
                  className={`relative cursor-pointer rounded-lg border-2 p-4 transition-all ${
                    isSelected ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => handleSelectTitle(title._id)}
                >
                  {isSelected && (
                    <div className="absolute top-3 right-3 bg-primary rounded-full p-1">
                      <CheckCircle2 className="h-4 w-4 text-primary-foreground" />
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30">
                      <Sparkles className="h-4 w-4 text-purple-600" />
                      <span className="font-semibold text-purple-700">{title.name}</span>
                      <Crown className="h-4 w-4 text-yellow-600" />
                    </div>
                  </div>
                  {title.description && (
                    <p className="text-xs text-muted-foreground mt-2 ml-1">{title.description}</p>
                  )}
                </div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
