'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Trophy, Lock, Check, ShoppingCart, Gift, Award, Crown, User, Sparkles } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
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
import { toast } from 'sonner';
import { Reward, RewardType, rewardService } from '@/services/reward.service';
import { useAuth } from '@/context/AuthContext';

const RewardsPage = () => {
  const router = useRouter();
  const { isAuthenticated, user, refreshUser } = useAuth();
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'claimed'>('all');
  const [activeType, setActiveType] = useState<RewardType | 'ALL'>('ALL');
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    reward: Reward | null;
  }>({ open: false, reward: null });

  const loadRewards = useCallback(async () => {
    try {
      setIsLoading(true);
      if (isAuthenticated) {
        const data = await rewardService.getAllRewards();
        setRewards(data);
      } else {
        setRewards([]);
      }
    } catch (error) {
      console.error('Failed to load rewards:', error);
      const errorMessage =
        error && typeof error === 'object' && 'message' in error
          ? (error as { message: string }).message
          : 'Failed to load rewards';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    loadRewards();
  }, [isAuthenticated, loadRewards]);

  const handleClaimClick = (reward: Reward) => {
    if (!isAuthenticated || !user) {
      toast.error('Please login to claim rewards');
      router.push('/auth/login');
      return;
    }

    if ((user.points || 0) < reward.pointPrice) {
      toast.error("You don't have enough points to claim this reward");
      return;
    }

    setConfirmDialog({ open: true, reward });
  };

  const handleConfirmClaim = async () => {
    const reward = confirmDialog.reward;
    if (!reward) return;

    try {
      setClaimingId(reward._id);
      setConfirmDialog({ open: false, reward: null });
      await rewardService.claimReward(reward._id);
      toast.success('Reward claimed successfully!');
      // Refresh both rewards and user data
      await Promise.all([loadRewards(), refreshUser()]);
    } catch (error) {
      console.error('Failed to claim reward:', error);
      const errorMessage =
        error && typeof error === 'object' && 'message' in error
          ? (error as { message: string }).message
          : 'Failed to claim reward';
      toast.error(errorMessage);
    } finally {
      setClaimingId(null);
    }
  };

  const getRewardIcon = (type: RewardType) => {
    switch (type) {
      case RewardType.BADGE:
        return <Award className="h-5 w-5" />;
      case RewardType.AVATAR:
        return <User className="h-5 w-5" />;
      case RewardType.BANNER:
        return <Gift className="h-5 w-5" />;
      case RewardType.UNLOCKED_TITLES:
        return <Crown className="h-5 w-5" />;
      default:
        return <Trophy className="h-5 w-5" />;
    }
  };

  const getRewardTypeName = (type: RewardType) => {
    return type.replace('_', ' ').toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase());
  };

  let filteredRewards = activeTab === 'all' ? rewards : rewards.filter((r) => r.isClaimed);
  if (activeType !== 'ALL') {
    filteredRewards = filteredRewards.filter((r) => r.type === activeType);
  }

  const rewardCounts = {
    all: rewards.length,
    badges: rewards.filter((r) => r.type === RewardType.BADGE).length,
    avatars: rewards.filter((r) => r.type === RewardType.AVATAR).length,
    banners: rewards.filter((r) => r.type === RewardType.BANNER).length,
    titles: rewards.filter((r) => r.type === RewardType.UNLOCKED_TITLES).length,
  };

  const renderRewardCard = (reward: Reward) => {
    const isTitle = reward.type === RewardType.UNLOCKED_TITLES;
    const isBadge = reward.type === RewardType.BADGE;
    const isAvatar = reward.type === RewardType.AVATAR;
    const isBanner = reward.type === RewardType.BANNER;

    return (
      <Card
        key={reward._id}
        className={`overflow-hidden hover:shadow-lg transition-all ${
          reward.isClaimed ? 'border-primary' : ''
        } ${isTitle ? 'bg-gradient-to-br from-yellow-500/5 to-orange-500/5' : ''}`}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className={`p-2 rounded-lg ${
                isTitle ? 'bg-yellow-500/20' :
                isBadge ? 'bg-blue-500/20' :
                isAvatar ? 'bg-purple-500/20' :
                'bg-green-500/20'
              }`}>
                {getRewardIcon(reward.type)}
              </div>
              <Badge variant="outline" className={
                isTitle ? 'border-yellow-500 text-yellow-700' :
                isBadge ? 'border-blue-500 text-blue-700' :
                isAvatar ? 'border-purple-500 text-purple-700' :
                'border-green-500 text-green-700'
              }>
                {getRewardTypeName(reward.type)}
              </Badge>
            </div>
            {reward.isPremiumOnly && (
              <Badge variant="secondary" className="shrink-0 bg-yellow-500 text-white">
                <Lock className="h-3 w-3 mr-1" />
                Premium
              </Badge>
            )}
          </div>
          <CardTitle className={`line-clamp-2 ${isTitle ? 'text-xl' : 'text-lg'}`}>
            {isTitle && <Crown className="inline h-5 w-5 mr-1 text-yellow-600" />}
            {reward.name}
          </CardTitle>
          {reward.isClaimed && (
            <Badge variant="default" className="w-fit bg-green-600">
              <Check className="h-3 w-3 mr-1" />
              Claimed
            </Badge>
          )}
        </CardHeader>
        
        <CardContent className="space-y-3">
          {/* Different layouts based on reward type */}
          {isBanner && reward.image && (
            <div className="relative w-full h-32 overflow-hidden rounded-md bg-muted border-2 border-border">
              <Image 
                src={reward.image} 
                alt={reward.name} 
                fill 
                className="object-cover"
                unoptimized={reward.image.endsWith('.gif')}
              />
            </div>
          )}
          
          {isAvatar && reward.image && (
            <div className="flex justify-center">
              <div className="relative h-32 w-32 overflow-hidden rounded-full bg-muted border-4 border-primary/20 shadow-lg">
                <Image 
                  src={reward.image} 
                  alt={reward.name} 
                  fill 
                  className="object-cover"
                />
              </div>
            </div>
          )}
          
          {isBadge && reward.image && (
            <div className="flex justify-center">
              <div className="relative h-24 w-24 overflow-hidden rounded-full bg-gradient-to-br from-blue-500/10 to-purple-500/10 p-4 shadow-lg">
                <Image 
                  src={reward.image} 
                  alt={reward.name} 
                  fill 
                  className="object-contain p-2"
                  unoptimized={reward.image.endsWith('.svg')}
                />
              </div>
            </div>
          )}
          
          {isTitle && (
            <div className="flex justify-center py-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-full border-2 border-yellow-500/30">
                <Sparkles className="h-4 w-4 text-yellow-600" />
                <span className="font-bold text-yellow-700">{reward.name}</span>
                <Sparkles className="h-4 w-4 text-yellow-600" />
              </div>
            </div>
          )}
          
          {reward.description && (
            <CardDescription className="line-clamp-2 text-center">{reward.description}</CardDescription>
          )}

          <div className="flex items-center justify-center gap-2 p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
            <Trophy className="h-5 w-5 text-yellow-600" />
            <span className="text-xl font-bold text-yellow-600">{reward.pointPrice.toLocaleString()}</span>
            <span className="text-sm text-muted-foreground">points</span>
          </div>
        </CardContent>
        
        <CardFooter>
          {reward.isClaimed ? (
            <Button className="w-full" variant="outline" disabled>
              <Check className="mr-2 h-4 w-4" />
              Already Claimed
            </Button>
          ) : (
            <Button
              className="w-full"
              onClick={() => handleClaimClick(reward)}
              disabled={claimingId === reward._id || (user?.points || 0) < reward.pointPrice}
            >
              {claimingId === reward._id ? (
                <>
                  <Trophy className="mr-2 h-4 w-4 animate-spin" />
                  Claiming...
                </>
              ) : (
                <>
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Claim Reward
                </>
              )}
            </Button>
          )}
        </CardFooter>
      </Card>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Rewards Store</h1>
        <p className="text-muted-foreground">Claim amazing rewards with your points</p>
        {user && (
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <Trophy className="h-5 w-5 text-yellow-600" />
            <span className="font-semibold">Your Points:</span>
            <span className="text-xl font-bold text-yellow-600">{user.points?.toLocaleString() || 0}</span>
          </div>
        )}
      </div>

      {/* Type Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Button
          variant={activeType === 'ALL' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveType('ALL')}
        >
          All ({rewardCounts.all})
        </Button>
        <Button
          variant={activeType === RewardType.BADGE ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveType(RewardType.BADGE)}
        >
          <Award className="h-4 w-4 mr-1" />
          Badges ({rewardCounts.badges})
        </Button>
        <Button
          variant={activeType === RewardType.AVATAR ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveType(RewardType.AVATAR)}
        >
          <User className="h-4 w-4 mr-1" />
          Avatars ({rewardCounts.avatars})
        </Button>
        <Button
          variant={activeType === RewardType.BANNER ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveType(RewardType.BANNER)}
        >
          <Gift className="h-4 w-4 mr-1" />
          Banners ({rewardCounts.banners})
        </Button>
        <Button
          variant={activeType === RewardType.UNLOCKED_TITLES ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveType(RewardType.UNLOCKED_TITLES)}
        >
          <Crown className="h-4 w-4 mr-1" />
          Titles ({rewardCounts.titles})
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-6 py-3 font-semibold border-b-2 transition-colors ${
            activeTab === 'all'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          All Rewards
        </button>
        <button
          onClick={() => setActiveTab('claimed')}
          className={`px-6 py-3 font-semibold border-b-2 transition-colors ${
            activeTab === 'claimed'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          My Rewards ({rewards.filter((r) => r.isClaimed).length})
        </button>
      </div>

      {/* Rewards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-32 w-full mb-4" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredRewards.length === 0 ? (
        <div className="text-center py-12">
          <Trophy className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">
            {!isAuthenticated ? 'Login to View Rewards' : activeTab === 'all' ? 'No Rewards Available' : 'No Claimed Rewards'}
          </h3>
          <p className="text-muted-foreground mb-4">
            {!isAuthenticated ? 'Please login to view and claim rewards' : activeTab === 'all' ? 'Check back later for new rewards!' : 'Start claiming rewards to see them here!'}
          </p>
          {!isAuthenticated && (
            <Button onClick={() => router.push('/auth/login')}>Login</Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredRewards.map((reward) => renderRewardCard(reward))}
        </div>
      )}

      {/* Confirmation Dialog */}
      <AlertDialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog({ open, reward: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Reward Claim</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to claim this reward?
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          {confirmDialog.reward && (
            <div className="py-4">
              <div className="flex flex-col gap-3 p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    {getRewardIcon(confirmDialog.reward.type)}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">{confirmDialog.reward.name}</p>
                    <p className="text-sm text-muted-foreground">{getRewardTypeName(confirmDialog.reward.type)}</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm text-muted-foreground">Cost:</span>
                    <span className="font-bold text-yellow-600">{confirmDialog.reward.pointPrice.toLocaleString()} points</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Your Points:</p>
                    <p className="font-semibold">{user?.points?.toLocaleString() || 0}</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-2 border-t">
                  <span className="text-sm text-muted-foreground">After Claim:</span>
                  <span className="font-bold text-green-600">
                    {((user?.points || 0) - confirmDialog.reward.pointPrice).toLocaleString()} points
                  </span>
                </div>
              </div>
            </div>
          )}
          
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmClaim}>
              <ShoppingCart className="mr-2 h-4 w-4" />
              Claim Reward
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default RewardsPage;
