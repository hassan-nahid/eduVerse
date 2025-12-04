'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Trophy, Lock, Check, ShoppingCart, Gift, Award, Crown, User } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Reward, RewardType, rewardService } from '@/services/reward.service';
import { useAuth } from '@/context/AuthContext';

const RewardsPage = () => {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'claimed'>('all');

  const loadRewards = useCallback(async () => {
    try {
      setIsLoading(true);
      if (isAuthenticated) {
        const data = await rewardService.getAllRewards();
        setRewards(data);
      } else {
        // For unauthenticated users, show empty state
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

  const handleClaim = async (rewardId: string, pointPrice: number) => {
    if (!isAuthenticated || !user) {
      toast.error('Please login to claim rewards');
      router.push('/auth/login');
      return;
    }

    if ((user.points || 0) < pointPrice) {
      toast.error("You don't have enough points to claim this reward");
      return;
    }

    try {
      setClaimingId(rewardId);
      await rewardService.claimReward(rewardId);
      toast.success('Reward claimed successfully!');
      // Reload rewards to update claimed status
      await loadRewards();
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

  const filteredRewards = activeTab === 'all' ? rewards : rewards.filter((r) => r.isClaimed);

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
          All Rewards ({rewards.length})
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
          {filteredRewards.map((reward) => (
            <Card
              key={reward._id}
              className={`overflow-hidden hover:shadow-lg transition-all ${
                reward.isClaimed ? 'border-primary' : ''
              }`}
            >
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-primary/10">{getRewardIcon(reward.type)}</div>
                    <Badge variant="outline">{getRewardTypeName(reward.type)}</Badge>
                  </div>
                  {reward.isPremiumOnly && (
                    <Badge variant="secondary" className="shrink-0">
                      <Lock className="h-3 w-3 mr-1" />
                      Premium
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-lg line-clamp-1">{reward.name}</CardTitle>
                {reward.isClaimed && (
                  <Badge variant="default" className="w-fit">
                    <Check className="h-3 w-3 mr-1" />
                    Claimed
                  </Badge>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                {reward.image && (
                  <div className="relative h-32 w-full overflow-hidden rounded-md bg-muted">
                    <Image src={reward.image} alt={reward.name} fill className="object-cover" />
                  </div>
                )}
                {reward.description && (
                  <CardDescription className="line-clamp-2">{reward.description}</CardDescription>
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
                    onClick={() => handleClaim(reward._id, reward.pointPrice)}
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
          ))}
        </div>
      )}
    </div>
  );
};

export default RewardsPage;
