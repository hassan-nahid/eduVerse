'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import { Calendar, Trophy, Users, Lock, Clock, Star, Zap } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Challenge, challengeService } from '@/services/challenge.service';
import { Quiz, quizService } from '@/services/quiz.service';
import { useAuth } from '@/context/AuthContext';

const ChallengesQuizzes = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, user } = useAuth();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [isLoadingChallenges, setIsLoadingChallenges] = useState(true);
  const [isLoadingQuizzes, setIsLoadingQuizzes] = useState(true);
  const [activeTab, setActiveTab] = useState<'challenges' | 'quizzes'>('challenges');

  const loadChallenges = useCallback(async () => {
    try {
      setIsLoadingChallenges(true);
      if (isAuthenticated) {
        const data = await challengeService.getAllChallenges();
        setChallenges(data);
      } else {
        // For unauthenticated users, show empty state
        setChallenges([]);
      }
    } catch (error) {
      console.error('Failed to load challenges:', error);
      const errorMessage = error && typeof error === 'object' && 'message' in error 
        ? (error as { message: string }).message 
        : 'Failed to load challenges';
      toast.error(errorMessage);
    } finally {
      setIsLoadingChallenges(false);
    }
  }, [isAuthenticated]);

  const loadQuizzes = useCallback(async () => {
    try {
      setIsLoadingQuizzes(true);
      if (isAuthenticated) {
        const data = await quizService.getAllQuizzes();
        setQuizzes(data);
      } else {
        // For unauthenticated users, show empty state
        setQuizzes([]);
      }
    } catch (error) {
      console.error('Failed to load quizzes:', error);
      const errorMessage = error && typeof error === 'object' && 'message' in error 
        ? (error as { message: string }).message 
        : 'Failed to load quizzes';
      toast.error(errorMessage);
    } finally {
      setIsLoadingQuizzes(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    loadChallenges();
    loadQuizzes();
  }, [isAuthenticated, loadChallenges, loadQuizzes]);

  const handleChallengeClick = (challengeId: string) => {
    if (!isAuthenticated) {
      toast.error('Please login to participate in challenges');
      router.push(`/auth/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }
    router.push(`/challenges/${challengeId}`);
  };

  const handleQuizClick = (quizId: string) => {
    if (!isAuthenticated) {
      toast.error('Please login to take quizzes');
      router.push(`/auth/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }
    router.push(`/quiz/${quizId}`);
  };

  const isExpiringSoon = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const daysUntilEnd = (end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return daysUntilEnd <= 3 && daysUntilEnd > 0;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Challenges & Quizzes</h1>
        <p className="text-muted-foreground">Test your knowledge and earn rewards</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b">
        <button
          onClick={() => setActiveTab('challenges')}
          className={`px-6 py-3 font-semibold border-b-2 transition-colors ${
            activeTab === 'challenges'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Challenges ({challenges.length})
        </button>
        <button
          onClick={() => setActiveTab('quizzes')}
          className={`px-6 py-3 font-semibold border-b-2 transition-colors ${
            activeTab === 'quizzes'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Quizzes ({quizzes.length})
        </button>
      </div>

      {/* Challenges Tab */}
      {activeTab === 'challenges' && (
        <div>
          {isLoadingChallenges ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-40 w-full mb-4" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-2/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : challenges.length === 0 ? (
            <div className="text-center py-12">
              <Trophy className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">{isAuthenticated ? 'No Active Challenges' : 'Login to View Challenges'}</h3>
              <p className="text-muted-foreground mb-4">{isAuthenticated ? 'Check back later for new challenges!' : 'Please login to view and participate in challenges'}</p>
              {!isAuthenticated && (
                <Button onClick={() => router.push(`/auth/login?redirect=${encodeURIComponent(pathname)}`)}>Login</Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {challenges.map((challenge) => (
                <Card
                  key={challenge._id}
                  className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => handleChallengeClick(challenge._id)}
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between mb-2">
                      <CardTitle className="text-xl line-clamp-2">{challenge.title}</CardTitle>
                      {challenge.isPremiumOnly && (
                        <Badge variant="secondary" className="ml-2 shrink-0">
                          <Lock className="h-3 w-3 mr-1" />
                          Premium
                        </Badge>
                      )}
                    </div>
                    {isExpiringSoon(challenge.endDate) && (
                      <Badge variant="destructive" className="w-fit">
                        <Clock className="h-3 w-3 mr-1" />
                        Ending Soon
                      </Badge>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {challenge.challengeImage && (
                      <div className="relative h-40 w-full overflow-hidden rounded-md bg-muted">
                        <Image
                          src={challenge.challengeImage}
                          alt={challenge.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <CardDescription className="line-clamp-3">{challenge.description}</CardDescription>

                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1 text-yellow-600">
                        <Zap className="h-4 w-4" />
                        <span className="font-semibold">{challenge.pointsReward} points</span>
                      </div>
                      <div className="flex items-center gap-1 text-primary">
                        <Star className="h-4 w-4" />
                        <span className="font-semibold">{challenge.scoresReward} scores</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>{challenge.participants.length} participants</span>
                    </div>

                    <div className="space-y-1 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>Ends {formatDistanceToNow(new Date(challenge.endDate), { addSuffix: true })}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full" onClick={() => handleChallengeClick(challenge._id)}>
                      View Details
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Quizzes Tab */}
      {activeTab === 'quizzes' && (
        <div>
          {isLoadingQuizzes ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-20 w-full mb-4" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-2/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : quizzes.length === 0 ? (
            <div className="text-center py-12">
              <Trophy className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">{isAuthenticated ? 'No Quizzes Available' : 'Login to View Quizzes'}</h3>
              <p className="text-muted-foreground mb-4">{isAuthenticated ? 'Check back later for new quizzes!' : 'Please login to view and take quizzes'}</p>
              {!isAuthenticated && (
                <Button onClick={() => router.push(`/auth/login?redirect=${encodeURIComponent(pathname)}`)}>Login</Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {quizzes.map((quiz) => {
                const hasCompleted = quiz.participants.some((p) => p.userId._id === user?._id);
                const userResult = quiz.participants.find((p) => p.userId._id === user?._id);

                return (
                  <Card
                    key={quiz._id}
                    className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => handleQuizClick(quiz._id)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between mb-2">
                        <CardTitle className="text-xl line-clamp-2">{quiz.title}</CardTitle>
                        {quiz.isPremiumOnly && (
                          <Badge variant="secondary" className="ml-2 shrink-0">
                            <Lock className="h-3 w-3 mr-1" />
                            Premium
                          </Badge>
                        )}
                      </div>
                      {hasCompleted && (
                        <Badge variant="default" className="w-fit">
                          Completed
                        </Badge>
                      )}
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {quiz.description && (
                        <CardDescription className="line-clamp-3">{quiz.description}</CardDescription>
                      )}

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Questions:</span>
                          <span className="font-semibold">{quiz.questions.length}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Total Score:</span>
                          <span className="font-semibold flex items-center gap-1"><Star className='h-4 w-4' />{quiz.totalScore} scores</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Reward:</span>
                          <span className="font-semibold text-yellow-600 flex items-center gap-1"><Zap className='h-4 w-4' />{quiz.rewardPoints} points</span>
                        </div>
                      </div>

                      {hasCompleted && userResult && (
                        <div className="p-3 bg-muted rounded-lg">
                          <div className="text-sm font-semibold mb-1">Your Score</div>
                          <div className="text-2xl font-bold text-primary">
                            {userResult.score}/{quiz.totalScore}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Earned: {userResult.earnedPoints} points
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>{quiz.participants.length} completed</span>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button className="w-full" onClick={() => handleQuizClick(quiz._id)}>
                        {hasCompleted ? 'View Results' : 'Take Quiz'}
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ChallengesQuizzes;
