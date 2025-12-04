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
    Trophy,
    Users,
    Crown,
    X,
} from 'lucide-react';
import Image from 'next/image';
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
    quizService,
    Quiz,
    CreateQuizData,
    QuizStatus,
    Question,
} from '@/services/quiz.service';

export const QuizManagement = () => {
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [premiumFilter, setPremiumFilter] = useState('ALL');
    const [sortBy, setSortBy] = useState('-createdAt');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalQuizzes, setTotalQuizzes] = useState(0);
    const [limit] = useState(10);

    // Dialogs
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [participantsDialogOpen, setParticipantsDialogOpen] = useState(false);
    const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);

    // Form state
    const [formData, setFormData] = useState<CreateQuizData>({
        title: '',
        description: '',
        questions: [],
        rewardPoints: 0,
        status: QuizStatus.DRAFT,
        isPremiumOnly: false,
    });

    // Question form state
    const [currentQuestion, setCurrentQuestion] = useState<Question>({
        questionText: '',
        options: ['', '', '', ''],
        correctOptionIndex: 0,
        points: 10,
    });

    // Fetch quizzes
    const fetchQuizzes = async () => {
        try {
            setRefreshing(true);
            const params: {
                searchTerm?: string;
                status?: string;
                isPremiumOnly?: string;
                sort?: string;
                page: number;
                limit: number;
            } = {
                page: currentPage,
                limit,
                sort: sortBy,
            };

            if (searchTerm) params.searchTerm = searchTerm;
            if (statusFilter !== 'ALL') params.status = statusFilter;
            if (premiumFilter !== 'ALL') params.isPremiumOnly = premiumFilter === 'PREMIUM' ? 'true' : 'false';

            const response = await quizService.adminGetAllQuizzes(params);
            setQuizzes(response.data);
            setTotalPages(response.meta.totalPage);
            setTotalQuizzes(response.meta.total);
        } catch (error) {
            console.error('Error fetching quizzes:', error);
            toast.error('Failed to fetch quizzes');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchQuizzes();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage, searchTerm, statusFilter, premiumFilter, sortBy]);

    // Handle create/update quiz
    const handleCreateQuiz = async () => {
        try {
            if (!formData.title.trim()) {
                toast.error('Please enter a quiz title');
                return;
            }

            if (formData.questions.length === 0) {
                toast.error('Please add at least one question');
                return;
            }

            await quizService.createQuiz(formData);
            toast.success('Quiz created successfully');
            setCreateDialogOpen(false);
            resetForm();
            fetchQuizzes();
        } catch (error) {
            console.error('Error creating quiz:', error);
            toast.error('Failed to create quiz');
        }
    };

    const handleUpdateQuiz = async () => {
        if (!selectedQuiz) return;

        try {
            await quizService.updateQuiz(selectedQuiz._id, formData);
            toast.success('Quiz updated successfully');
            setEditDialogOpen(false);
            resetForm();
            fetchQuizzes();
        } catch (error) {
            console.error('Error updating quiz:', error);
            toast.error('Failed to update quiz');
        }
    };

    // Handle delete
    const handleDeleteQuiz = async () => {
        if (!selectedQuiz) return;

        try {
            await quizService.deleteQuiz(selectedQuiz._id);
            toast.success('Quiz deleted successfully');
            setDeleteDialogOpen(false);
            setSelectedQuiz(null);
            fetchQuizzes();
        } catch (error) {
            console.error('Error deleting quiz:', error);
            toast.error('Failed to delete quiz');
        }
    };

    // Question management
    const handleAddQuestion = () => {
        if (!currentQuestion.questionText.trim()) {
            toast.error('Please enter a question');
            return;
        }

        if (currentQuestion.options.some((opt) => !opt.trim())) {
            toast.error('All options must be filled');
            return;
        }

        setFormData({
            ...formData,
            questions: [...formData.questions, currentQuestion],
        });

        setCurrentQuestion({
            questionText: '',
            options: ['', '', '', ''],
            correctOptionIndex: 0,
            points: 10,
        });

        toast.success('Question added');
    };

    const handleRemoveQuestion = (index: number) => {
        setFormData({
            ...formData,
            questions: formData.questions.filter((_, i) => i !== index),
        });
        toast.success('Question removed');
    };

    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            questions: [],
            rewardPoints: 0,
            status: QuizStatus.DRAFT,
            isPremiumOnly: false,
        });
        setCurrentQuestion({
            questionText: '',
            options: ['', '', '', ''],
            correctOptionIndex: 0,
            points: 10,
        });
        setSelectedQuiz(null);
    };

    const openEditDialog = (quiz: Quiz) => {
        setSelectedQuiz(quiz);
        setFormData({
            title: quiz.title,
            description: quiz.description || '',
            questions: quiz.questions,
            rewardPoints: quiz.rewardPoints,
            status: quiz.status as QuizStatus,
            isPremiumOnly: quiz.isPremiumOnly,
        });
        setEditDialogOpen(true);
    };

    const openDeleteDialog = (quiz: Quiz) => {
        setSelectedQuiz(quiz);
        setDeleteDialogOpen(true);
    };

    // Status change
    const handleStatusChange = async (quiz: Quiz, newStatus: string) => {
        try {
            await quizService.updateQuiz(quiz._id, { status: newStatus as QuizStatus });
            toast.success(`Quiz status changed to ${newStatus}`);
            fetchQuizzes();
        } catch (error) {
            console.error('Error changing status:', error);
            toast.error('Failed to change status');
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case QuizStatus.PUBLISHED:
                return <Badge className="bg-green-500">Published</Badge>;
            case QuizStatus.DRAFT:
                return <Badge className="bg-yellow-500">Draft</Badge>;
            case QuizStatus.PRIVATE:
                return <Badge className="bg-gray-500">Private</Badge>;
            default:
                return <Badge>{status}</Badge>;
        }
    };

    const clearFilters = () => {
        setSearchTerm('');
        setStatusFilter('ALL');
        setPremiumFilter('ALL');
        setSortBy('-createdAt');
        setCurrentPage(1);
        toast.success('Filters cleared');
    };

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Quiz Management</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {[...Array(5)].map((_, i) => (
                            <Skeleton key={i} className="h-16 w-full" />
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle>Quiz Management</CardTitle>
                    <Button onClick={() => setCreateDialogOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Quiz
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                {/* Filters */}
                <div className="mb-4">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-semibold">Filters</h3>
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
                </div>
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search quizzes..."
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="pl-8"
                            />
                        </div>
                    </div>
                    <Select
                        value={statusFilter}
                        onValueChange={(value) => {
                            setStatusFilter(value);
                            setCurrentPage(1);
                        }}
                    >
                        <SelectTrigger className="w-full sm:w-[180px]">
                            <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">All Status</SelectItem>
                            <SelectItem value="PUBLISHED">Published</SelectItem>
                            <SelectItem value="DRAFT">Draft</SelectItem>
                            <SelectItem value="PRIVATE">Private</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select
                        value={premiumFilter}
                        onValueChange={(value) => {
                            setPremiumFilter(value);
                            setCurrentPage(1);
                        }}
                    >
                        <SelectTrigger className="w-full sm:w-[180px]">
                            <SelectValue placeholder="Filter by type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">All Types</SelectItem>
                            <SelectItem value="PREMIUM">Premium Only</SelectItem>
                            <SelectItem value="FREE">Free</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select
                        value={sortBy}
                        onValueChange={(value) => {
                            setSortBy(value);
                            setCurrentPage(1);
                        }}
                    >
                        <SelectTrigger className="w-full sm:w-[200px]">
                            <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="-createdAt">Newest First</SelectItem>
                            <SelectItem value="createdAt">Oldest First</SelectItem>
                            <SelectItem value="title">Title (A-Z)</SelectItem>
                            <SelectItem value="-title">Title (Z-A)</SelectItem>
                            <SelectItem value="-totalScore">Highest Score</SelectItem>
                            <SelectItem value="totalScore">Lowest Score</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={fetchQuizzes}
                        disabled={refreshing}
                    >
                        <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                    </Button>
                </div>
                {/* Table */}
                <div className="rounded-md border overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Quiz</TableHead>
                                <TableHead>Questions</TableHead>
                                <TableHead>Scores</TableHead>
                                <TableHead>Participants</TableHead>
                                <TableHead>Avg Score</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {quizzes.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                                        No quizzes found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                quizzes.map((quiz) => (
                                    <TableRow key={quiz._id}>
                                        <TableCell>
                                            <div>
                                                <p className="font-medium">{quiz.title}</p>
                                                {quiz.description && (
                                                    <p className="text-sm text-muted-foreground line-clamp-1">
                                                        {quiz.description}
                                                    </p>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1">
                                                <span className="font-medium">{quiz.questions.length}</span>
                                                <span className="text-sm text-muted-foreground">questions</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-1 text-sm">
                                                    <Trophy className="h-3 w-3 text-yellow-500" />
                                                    <span>{quiz.totalScore} Scores</span>
                                                </div>
                                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                                    <Trophy className="h-3 w-3 text-blue-500" />
                                                    {quiz.rewardPoints} Points
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1">
                                                <Users className="h-4 w-4 text-muted-foreground" />
                                                <span>{quiz.participantCount || 0}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className="font-medium">
                                                {quiz.averageScore ? `${quiz.averageScore}%` : '-'}
                                            </span>
                                        </TableCell>
                                        <TableCell>{getStatusBadge(quiz.status)}</TableCell>
                                        <TableCell>
                                            {quiz.isPremiumOnly ? (
                                                <Badge variant="secondary" className="gap-1">
                                                    <Crown className="h-3 w-3 text-yellow-500" />
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
                                                    <DropdownMenuItem onClick={() => openEditDialog(quiz)}>
                                                        <Edit className="h-4 w-4 mr-2" />
                                                        Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => {
                                                        setSelectedQuiz(quiz);
                                                        setParticipantsDialogOpen(true);
                                                    }}>
                                                        <Users className="h-4 w-4 mr-2" />
                                                        View Participants
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                                                    <DropdownMenuItem
                                                        onClick={() => handleStatusChange(quiz, QuizStatus.PUBLISHED)}
                                                    >
                                                        Publish
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => handleStatusChange(quiz, QuizStatus.DRAFT)}
                                                    >
                                                        Set as Draft
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => handleStatusChange(quiz, QuizStatus.PRIVATE)}
                                                    >
                                                        Set as Private
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        onClick={() => openDeleteDialog(quiz)}
                                                        className="text-red-600"
                                                    >
                                                        <Trash2 className="h-4 w-4 mr-2" />
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between mt-4">
                    <p className="text-sm text-muted-foreground">
                        Showing {quizzes.length} of {totalQuizzes} quizzes
                    </p>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="text-sm">
                            Page {currentPage} of {totalPages}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </CardContent>

            {/* Create/Edit Dialog */}
            <Dialog open={createDialogOpen || editDialogOpen} onOpenChange={(open) => {
                if (!open) {
                    setCreateDialogOpen(false);
                    setEditDialogOpen(false);
                    resetForm();
                }
            }}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editDialogOpen ? 'Edit Quiz' : 'Create New Quiz'}</DialogTitle>
                        <DialogDescription>
                            {editDialogOpen ? 'Update quiz details' : 'Create a new quiz for users'}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        {/* Basic Info */}
                        <div className="space-y-2">
                            <Label htmlFor="title">Title *</Label>
                            <Input
                                id="title"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="Enter quiz title"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Enter quiz description"
                                rows={3}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="rewardPoints">Reward Points</Label>
                                <Input
                                    id="rewardPoints"
                                    type="number"
                                    min="0"
                                    value={formData.rewardPoints}
                                    onChange={(e) =>
                                        setFormData({ ...formData, rewardPoints: parseInt(e.target.value) || 0 })
                                    }
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="status">Status</Label>
                                <Select
                                    value={formData.status}
                                    onValueChange={(value) =>
                                        setFormData({ ...formData, status: value as QuizStatus })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value={QuizStatus.DRAFT}>Draft</SelectItem>
                                        <SelectItem value={QuizStatus.PUBLISHED}>Published</SelectItem>
                                        <SelectItem value={QuizStatus.PRIVATE}>Private</SelectItem>
                                    </SelectContent>
                                </Select>
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
                                Premium Only
                            </Label>
                        </div>

                        {/* Questions */}
                        <div className="border-t pt-4">
                            <h3 className="font-semibold mb-4">Questions ({formData.questions.length})</h3>

                            {/* Existing Questions */}
                            {formData.questions.length > 0 && (
                                <div className="space-y-3 mb-4">
                                    {formData.questions.map((q, index) => (
                                        <Card key={index}>
                                            <CardContent className="pt-4">
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="flex-1">
                                                        <p className="font-medium text-sm mb-2">
                                                            {index + 1}. {q.questionText}
                                                        </p>
                                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                                            {q.options.map((opt, i) => (
                                                                <div
                                                                    key={i}
                                                                    className={`p-2 rounded ${i === q.correctOptionIndex
                                                                            ? 'bg-green-100 dark:bg-green-900/20'
                                                                            : 'bg-muted'
                                                                        }`}
                                                                >
                                                                    {opt} {i === q.correctOptionIndex && '✓'}
                                                                </div>
                                                            ))}
                                                        </div>
                                                        <p className="text-xs text-muted-foreground mt-2">
                                                            Points: {q.points}
                                                        </p>
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleRemoveQuestion(index)}
                                                    >
                                                        <X className="h-4 w-4 text-red-500" />
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            )}

                            {/* Add New Question */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-sm">Add New Question</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="space-y-2">
                                        <Label>Question Text</Label>
                                        <Input
                                            value={currentQuestion.questionText}
                                            onChange={(e) =>
                                                setCurrentQuestion({ ...currentQuestion, questionText: e.target.value })
                                            }
                                            placeholder="Enter question"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Options</Label>
                                        {currentQuestion.options.map((opt, index) => (
                                            <div key={index} className="flex items-center gap-2">
                                                <Input
                                                    value={opt}
                                                    onChange={(e) => {
                                                        const newOptions = [...currentQuestion.options];
                                                        newOptions[index] = e.target.value;
                                                        setCurrentQuestion({ ...currentQuestion, options: newOptions });
                                                    }}
                                                    placeholder={`Option ${index + 1}`}
                                                />
                                                <Checkbox
                                                    checked={currentQuestion.correctOptionIndex === index}
                                                    onCheckedChange={() =>
                                                        setCurrentQuestion({ ...currentQuestion, correctOptionIndex: index })
                                                    }
                                                    title="Correct answer"
                                                />
                                            </div>
                                        ))}
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Points</Label>
                                        <Input
                                            type="number"
                                            min="1"
                                            value={currentQuestion.points}
                                            onChange={(e) =>
                                                setCurrentQuestion({
                                                    ...currentQuestion,
                                                    points: parseInt(e.target.value) || 1,
                                                })
                                            }
                                        />
                                    </div>

                                    <Button onClick={handleAddQuestion} className="w-full" variant="outline">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Question
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setCreateDialogOpen(false);
                                setEditDialogOpen(false);
                                resetForm();
                            }}
                        >
                            Cancel
                        </Button>
                        <Button onClick={editDialogOpen ? handleUpdateQuiz : handleCreateQuiz}>
                            {editDialogOpen ? 'Update Quiz' : 'Create Quiz'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Participants Dialog */}
            <Dialog open={participantsDialogOpen} onOpenChange={setParticipantsDialogOpen}>
                <DialogContent className="max-w-4xl max-h-100vh w-[95vw]">
                    <DialogHeader>
                        <DialogTitle className="text-lg sm:text-xl font-bold">Quiz Participants</DialogTitle>
                        <DialogDescription className="text-xs sm:text-sm">
                            {selectedQuiz?.title && (
                                <span className="font-medium">
                                    Quiz: &quot;{selectedQuiz.title}&quot;
                                </span>
                            )}
                        </DialogDescription>
                    </DialogHeader>

                    {/* Stats Summary
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4 py-2 sm:py-4">
            <Card>
              <CardContent className="p-3 sm:p-4">
                <div className="text-center">
                  <p className="text-xl sm:text-2xl font-bold">
                    {selectedQuiz?.participantCount || 0}
                  </p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 whitespace-nowrap">
                    Total Participants
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 sm:p-4">
                <div className="text-center">
                  <p className="text-xl sm:text-2xl font-bold text-blue-600">
                    {selectedQuiz?.averageScore ? `${selectedQuiz.averageScore}%` : '0%'}
                  </p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 whitespace-nowrap">
                    Average Score
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 sm:p-4">
                <div className="text-center">
                  <p className="text-xl sm:text-2xl font-bold text-yellow-600">
                    {selectedQuiz?.totalScore || 0}
                  </p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 whitespace-nowrap">
                    Total Points
                  </p>
                </div>
              </CardContent>
            </Card>
          </div> */}

                    <div className="max-h-[400px] sm:max-h-[500px] overflow-y-auto">
                        {selectedQuiz?.participants && selectedQuiz.participants.length > 0 ? (
                            <div className="space-y-2 sm:space-y-3">
                                {selectedQuiz.participants.map((participant, index) => (
                                    <Card key={participant.userId._id} className="overflow-hidden">
                                        <CardContent className="p-3 sm:p-4">
                                            <div className="flex items-start gap-2 sm:gap-4">
                                                {/* Rank Badge */}
                                                <div className="shrink-0 hidden sm:block">
                                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                                        <span className="font-bold text-primary">#{index + 1}</span>
                                                    </div>
                                                </div>

                                                {/* User Info */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-muted flex items-center justify-center overflow-hidden shrink-0">
                                                            {participant.userId.avatar ? (
                                                                <Image
                                                                    src={participant.userId.avatar}
                                                                    alt={participant.userId.name}
                                                                    width={40}
                                                                    height={40}
                                                                    className="h-full w-full object-cover"
                                                                />
                                                            ) : (
                                                                <span className="text-xs sm:text-sm font-semibold">
                                                                    {participant.userId.name.charAt(0).toUpperCase()}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                                                                <p className="font-semibold text-sm sm:text-base">
                                                                    {participant.userId.name}
                                                                </p>
                                                                {participant.userId.verifyBadge && (
                                                                    <Badge variant="secondary" className="h-4 sm:h-5 px-1 sm:px-1.5 text-xs">
                                                                        <span className="text-blue-500">✓</span>
                                                                    </Badge>
                                                                )}
                                                                {participant.userId.isPremium && (
                                                                    <Badge variant="secondary" className="h-4 sm:h-5 px-1 sm:px-1.5">
                                                                        <Crown className="h-2.5 sm:h-3 w-2.5 sm:w-3 text-yellow-500" />
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                            <p className="text-xs sm:text-sm text-muted-foreground truncate">
                                                                @{participant.userId.userName}
                                                                {participant.userId.email && (
                                                                    <span className="ml-2 hidden md:inline">• {participant.userId.email}</span>
                                                                )}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* Score Section */}
                                                    <div className="bg-muted/50 rounded-lg p-2 sm:p-3 mt-2 sm:mt-3">
                                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
                                                            <div className="text-center">
                                                                <p className="text-lg sm:text-xl font-bold text-green-600">
                                                                    {participant.percentage || 0}%
                                                                </p>
                                                                <p className="text-[10px] sm:text-xs text-muted-foreground">
                                                                    Percentage
                                                                </p>
                                                            </div>
                                                            <div className="text-center">
                                                                <p className="text-lg sm:text-xl font-bold">
                                                                    {participant.score}
                                                                </p>
                                                                <p className="text-[10px] sm:text-xs text-muted-foreground">
                                                                    Score
                                                                </p>
                                                            </div>
                                                            <div className="text-center">
                                                                <div className="flex items-center justify-center gap-1">
                                                                    <Trophy className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-500" />
                                                                    <p className="text-lg sm:text-xl font-bold">
                                                                        {participant.earnedPoints}
                                                                    </p>
                                                                </div>
                                                                <p className="text-[10px] sm:text-xs text-muted-foreground">
                                                                    Points Earned
                                                                </p>
                                                            </div>
                                                            <div className="text-center col-span-2 sm:col-span-1">
                                                                <p className="text-xs sm:text-sm font-medium">
                                                                    {new Date(participant.completedAt).toLocaleDateString()}
                                                                </p>
                                                                <p className="text-[10px] sm:text-xs text-muted-foreground">
                                                                    Completed
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <Card>
                                <CardContent className="py-8 sm:py-12">
                                    <div className="text-center">
                                        <Users className="h-8 w-8 sm:h-12 sm:w-12 mx-auto text-muted-foreground mb-2 sm:mb-3" />
                                        <p className="text-base sm:text-lg font-medium">No participants yet</p>
                                        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                                            This quiz hasn&apos;t been completed by anyone
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    <DialogFooter className="mt-2 sm:mt-4">
                        <Button
                            onClick={() => setParticipantsDialogOpen(false)}
                            className="w-full sm:w-auto"
                        >
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Quiz</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete &quot;{selectedQuiz?.title}&quot;? This action cannot be
                            undone and all participant data will be lost.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteQuiz} className="bg-red-600 hover:bg-red-700">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </Card>
    );
};
