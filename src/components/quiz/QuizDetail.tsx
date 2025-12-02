'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Trophy, Clock, CheckCircle, XCircle, Lock, Users } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Quiz, quizService } from '@/services/quiz.service';
import { useAuth } from '@/context/AuthContext';

interface QuizDetailProps {
  quizId: string;
}

const QuizDetail = ({ quizId }: QuizDetailProps) => {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: number }>({});
  const [showResults, setShowResults] = useState(false);
  const [result, setResult] = useState<{ score: number; earnedPoints: number } | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('Please login to view quizzes');
      router.push('/login');
      return;
    }
    loadQuiz();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quizId, isAuthenticated]);

  const loadQuiz = async () => {
    try {
      setIsLoading(true);
      console.log('Loading quiz with ID:', quizId);
      const data = await quizService.getQuizById(quizId);
      console.log('Quiz data received:', data);
      setQuiz(data);

      // Check if user has already completed this quiz
      const hasCompleted = data.participants.some((p) => p.userId === user?._id);
      setShowResults(hasCompleted);

      if (hasCompleted) {
        const userResult = data.participants.find((p) => p.userId === user?._id);
        if (userResult) {
          setResult({
            score: userResult.score,
            earnedPoints: userResult.earnedPoints,
          });
        }
      }
    } catch (error) {
      console.error('Failed to load quiz:', error);
      const errorMessage = error && typeof error === 'object' && 'message' in error 
        ? (error as { message: string }).message 
        : 'Failed to load quiz';
      toast.error(errorMessage);
      router.push('/challenges');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerChange = (questionIndex: number, optionIndex: number) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [questionIndex]: optionIndex,
    });
  };

  const handleSubmit = async () => {
    if (!quiz) return;

    // Validate all questions are answered
    const unansweredQuestions = quiz.questions
      .map((_, index) => index)
      .filter((index) => selectedAnswers[index] === undefined);

    if (unansweredQuestions.length > 0) {
      toast.error(`Please answer all questions. ${unansweredQuestions.length} question(s) remaining.`);
      return;
    }

    try {
      setIsSubmitting(true);
      const answers = quiz.questions.map((_, index) => selectedAnswers[index]);
      const resultData = await quizService.submitQuiz(quizId, answers);

      setResult(resultData);
      setShowResults(true);
      toast.success('Quiz submitted successfully!');

      // Reload quiz to get updated data
      await loadQuiz();
    } catch (error) {
      console.error('Failed to submit quiz:', error);
      const errorMessage = error && typeof error === 'object' && 'message' in error 
        ? (error as { message: string }).message 
        : 'Failed to submit quiz';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Skeleton className="h-8 w-64 mb-4" />
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-3/4 mb-2" />
            <Skeleton className="h-4 w-full" />
          </CardHeader>
          <CardContent className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i}>
                <Skeleton className="h-6 w-full mb-4" />
                <div className="space-y-2">
                  {[...Array(4)].map((_, j) => (
                    <Skeleton key={j} className="h-10 w-full" />
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Quiz Not Found</h2>
          <Button onClick={() => router.push('/challenges')}>Back to Challenges</Button>
        </div>
      </div>
    );
  }

  const hasCompleted = quiz.participants.some((p) => p.userId === user?._id);
  const userResult = quiz.participants.find((p) => p.userId === user?._id);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Back Button */}
      <Button variant="ghost" className="mb-6" onClick={() => router.push('/challenges')}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Challenges
      </Button>

      {/* Quiz Header */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-3xl mb-2">{quiz.title}</CardTitle>
              {quiz.description && <CardDescription className="text-base">{quiz.description}</CardDescription>}
            </div>
            <div className="flex flex-col gap-2 ml-4">
              {quiz.isPremiumOnly && (
                <Badge variant="secondary">
                  <Lock className="h-3 w-3 mr-1" />
                  Premium
                </Badge>
              )}
              {hasCompleted && (
                <Badge variant="default">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Completed
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold">{quiz.questions.length}</div>
              <div className="text-sm text-muted-foreground">Questions</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold">{quiz.totalScore}</div>
              <div className="text-sm text-muted-foreground">Total Score</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{quiz.rewardPoints}</div>
              <div className="text-sm text-muted-foreground">Reward Points</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="flex items-center justify-center gap-1 text-2xl font-bold">
                <Users className="h-5 w-5" />
                {quiz.participants.length}
              </div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Card (if completed) */}
      {hasCompleted && userResult && (
        <Card className="mb-6 border-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-6 w-6 text-yellow-600" />
              Your Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-6 bg-primary/10 rounded-lg">
                <div className="text-4xl font-bold text-primary">
                  {userResult.score}/{quiz.totalScore}
                </div>
                <div className="text-sm text-muted-foreground mt-2">Your Score</div>
              </div>
              <div className="text-center p-6 bg-yellow-500/10 rounded-lg">
                <div className="text-4xl font-bold text-yellow-600">{userResult.earnedPoints}</div>
                <div className="text-sm text-muted-foreground mt-2">Points Earned</div>
              </div>
              <div className="text-center p-6 bg-green-500/10 rounded-lg">
                <div className="text-4xl font-bold text-green-600">
                  {Math.round((userResult.score / quiz.totalScore) * 100)}%
                </div>
                <div className="text-sm text-muted-foreground mt-2">Accuracy</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Questions */}
      <div className="space-y-6">
        {quiz.questions.map((question, questionIndex) => {
          const isCorrect =
            showResults &&
            question.correctOptionIndex !== undefined &&
            selectedAnswers[questionIndex] === question.correctOptionIndex;
          const isWrong =
            showResults &&
            question.correctOptionIndex !== undefined &&
            selectedAnswers[questionIndex] !== undefined &&
            selectedAnswers[questionIndex] !== question.correctOptionIndex;

          return (
            <Card key={questionIndex}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">
                    Question {questionIndex + 1}
                    <span className="ml-2 text-sm font-normal text-muted-foreground">
                      ({question.points} {question.points === 1 ? 'point' : 'points'})
                    </span>
                  </CardTitle>
                  {showResults && (
                    <div>
                      {isCorrect && (
                        <Badge variant="default" className="bg-green-600">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Correct
                        </Badge>
                      )}
                      {isWrong && (
                        <Badge variant="destructive">
                          <XCircle className="h-3 w-3 mr-1" />
                          Wrong
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
                <CardDescription className="text-base mt-2">{question.questionText}</CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={selectedAnswers[questionIndex]?.toString()}
                  onValueChange={(value) => handleAnswerChange(questionIndex, parseInt(value))}
                  disabled={showResults}
                >
                  <div className="space-y-3">
                    {question.options.map((option, optionIndex) => {
                      const isSelectedAnswer = selectedAnswers[questionIndex] === optionIndex;
                      const isCorrectOption = showResults && question.correctOptionIndex === optionIndex;
                      const isWrongSelection =
                        showResults && isSelectedAnswer && question.correctOptionIndex !== optionIndex;

                      return (
                        <div
                          key={optionIndex}
                          className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-colors ${
                            isCorrectOption
                              ? 'border-green-600 bg-green-50 dark:bg-green-950/20'
                              : isWrongSelection
                              ? 'border-red-600 bg-red-50 dark:bg-red-950/20'
                              : isSelectedAnswer
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          <RadioGroupItem value={optionIndex.toString()} id={`q${questionIndex}-opt${optionIndex}`} />
                          <Label
                            htmlFor={`q${questionIndex}-opt${optionIndex}`}
                            className="flex-1 cursor-pointer font-medium"
                          >
                            {option}
                            {isCorrectOption && (
                              <CheckCircle className="inline-block ml-2 h-4 w-4 text-green-600" />
                            )}
                            {isWrongSelection && <XCircle className="inline-block ml-2 h-4 w-4 text-red-600" />}
                          </Label>
                        </div>
                      );
                    })}
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Submit Button */}
      {!showResults && (
        <div className="mt-8 flex justify-center">
          <Button size="lg" onClick={handleSubmit} disabled={isSubmitting} className="min-w-[200px]">
            {isSubmitting ? (
              <>
                <Clock className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Trophy className="mr-2 h-4 w-4" />
                Submit Quiz
              </>
            )}
          </Button>
        </div>
      )}

      {/* Retake Message */}
      {showResults && (
        <div className="mt-8 text-center p-6 bg-muted rounded-lg">
          <p className="text-muted-foreground">
            You have already completed this quiz. Your score has been recorded.
          </p>
        </div>
      )}
    </div>
  );
};

export default QuizDetail;
