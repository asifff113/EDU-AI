'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useAppContext } from '@/contexts/AppContext';
import {
  Brain,
  Clock,
  Users,
  Trophy,
  Target,
  BookOpen,
  PlayCircle,
  BarChart3,
  Zap,
  CheckCircle,
  XCircle,
  Timer,
  Award,
  TrendingUp,
  Plus,
  Search,
  Filter,
  Star,
  Calendar,
  FileText,
  Sparkles,
} from 'lucide-react';

interface Exam {
  id: string;
  title: string;
  description: string;
  category: string;
  subject: string;
  difficulty: 'easy' | 'medium' | 'hard';
  duration: number;
  totalQuestions: number;
  passingScore: number;
  createdByName: string;
  createdAt: string;
  _count: {
    questions: number;
    attempts: number;
  };
}

interface ExamAttempt {
  id: string;
  startTime: string;
  endTime?: string;
  score: number;
  totalScore: number;
  percentage: number;
  passed: boolean;
  status: string;
  exam: {
    title: string;
    category: string;
    subject: string;
    difficulty: string;
    duration: number;
    passingScore: number;
  };
}

interface UserStats {
  totalAttempts: number;
  passedAttempts: number;
  failedAttempts: number;
  successRate: number;
  averageScore: number;
  totalExamsTaken: number;
}

const examCategories = [
  { id: 'all', name: 'All Categories' },
  { id: 'mathematics', name: 'Mathematics' },
  { id: 'science', name: 'Science' },
  { id: 'programming', name: 'Programming' },
  { id: 'language', name: 'Language Arts' },
  { id: 'history', name: 'History' },
  { id: 'business', name: 'Business' },
  { id: 'medical', name: 'Medical' },
  { id: 'engineering', name: 'Engineering' },
];

const difficultyColors = {
  easy: 'bg-green-500',
  medium: 'bg-yellow-500',
  hard: 'bg-red-500',
};

const difficultyTextColors = {
  easy: 'text-green-600',
  medium: 'text-yellow-600',
  hard: 'text-red-600',
};

// Demo data for development
const demoExams: Exam[] = [
  {
    id: '1',
    title: 'Advanced Calculus Assessment',
    description:
      'Comprehensive test covering differential and integral calculus, limits, and series',
    category: 'mathematics',
    subject: 'Calculus',
    difficulty: 'hard',
    duration: 120,
    totalQuestions: 25,
    passingScore: 70,
    createdByName: 'Prof. Sarah Johnson',
    createdAt: '2024-01-15T10:00:00Z',
    _count: { questions: 25, attempts: 156 },
  },
  {
    id: '2',
    title: 'JavaScript Fundamentals Quiz',
    description: 'Test your knowledge of JavaScript basics, ES6 features, and DOM manipulation',
    category: 'programming',
    subject: 'JavaScript',
    difficulty: 'medium',
    duration: 60,
    totalQuestions: 20,
    passingScore: 75,
    createdByName: 'John Developer',
    createdAt: '2024-01-10T14:30:00Z',
    _count: { questions: 20, attempts: 234 },
  },
  {
    id: '3',
    title: 'Basic Physics Concepts',
    description: 'Fundamental physics concepts including mechanics, thermodynamics, and waves',
    category: 'science',
    subject: 'Physics',
    difficulty: 'easy',
    duration: 45,
    totalQuestions: 15,
    passingScore: 60,
    createdByName: 'Dr. Mike Wilson',
    createdAt: '2024-01-08T09:15:00Z',
    _count: { questions: 15, attempts: 89 },
  },
  {
    id: '4',
    title: 'English Grammar Mastery',
    description: 'Comprehensive grammar test covering tenses, clauses, and sentence structure',
    category: 'language',
    subject: 'English',
    difficulty: 'medium',
    duration: 90,
    totalQuestions: 30,
    passingScore: 80,
    createdByName: 'Prof. Emma Davis',
    createdAt: '2024-01-05T11:45:00Z',
    _count: { questions: 30, attempts: 178 },
  },
];

const demoUserStats: UserStats = {
  totalAttempts: 12,
  passedAttempts: 8,
  failedAttempts: 4,
  successRate: 66.7,
  averageScore: 78.5,
  totalExamsTaken: 8,
};

// AI Question Form Component
function AIQuestionForm({
  onGenerate,
  isLoading,
  onClose,
  generatedQuestions,
}: {
  onGenerate: (data: { topic: string; difficulty: string; count: string; type: string }) => void;
  isLoading: boolean;
  onClose: () => void;
  generatedQuestions: any[];
}) {
  const [formData, setFormData] = useState({
    topic: '',
    difficulty: '',
    count: '',
    type: '',
  });

  const handleSubmit = () => {
    if (!formData.topic || !formData.difficulty || !formData.count || !formData.type) {
      alert('Please fill in all fields');
      return;
    }
    onGenerate(formData);
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="topic">Topic</Label>
        <Input
          id="topic"
          placeholder="e.g., JavaScript, Linear Algebra, Physics"
          value={formData.topic}
          onChange={(e) => setFormData((prev) => ({ ...prev, topic: e.target.value }))}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="difficulty">Difficulty</Label>
          <Select
            value={formData.difficulty}
            onValueChange={(value) => setFormData((prev) => ({ ...prev, difficulty: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="easy">Easy</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="hard">Hard</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="count">Question Count</Label>
          <Select
            value={formData.count}
            onValueChange={(value) => setFormData((prev) => ({ ...prev, count: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Count" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5 Questions</SelectItem>
              <SelectItem value="10">10 Questions</SelectItem>
              <SelectItem value="15">15 Questions</SelectItem>
              <SelectItem value="20">20 Questions</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <Label htmlFor="type">Question Type</Label>
        <Select
          value={formData.type}
          onValueChange={(value) => setFormData((prev) => ({ ...prev, type: value }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="mcq">Multiple Choice</SelectItem>
            <SelectItem value="true_false">True/False</SelectItem>
            <SelectItem value="short_answer">Short Answer</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {generatedQuestions.length > 0 && (
        <div className="mt-6">
          <h4 className="font-semibold mb-3">Generated Questions Preview:</h4>
          <div className="max-h-40 overflow-y-auto space-y-2">
            {generatedQuestions.slice(0, 3).map((q, index) => (
              <div key={index} className="p-3 border rounded text-sm">
                <p className="font-medium">{q.question}</p>
                {q.options && (
                  <div className="mt-1 text-xs text-gray-600">Options: {q.options.join(', ')}</div>
                )}
              </div>
            ))}
            {generatedQuestions.length > 3 && (
              <p className="text-sm text-gray-500">
                ...and {generatedQuestions.length - 3} more questions
              </p>
            )}
          </div>
        </div>
      )}

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={isLoading}>
          {isLoading ? 'Generating...' : 'Generate Questions'}
        </Button>
      </div>
    </div>
  );
}

const demoRecentAttempts: ExamAttempt[] = [
  {
    id: '1',
    startTime: '2024-01-20T10:00:00Z',
    endTime: '2024-01-20T11:30:00Z',
    score: 85,
    totalScore: 100,
    percentage: 85,
    passed: true,
    status: 'completed',
    exam: {
      title: 'JavaScript Fundamentals Quiz',
      category: 'programming',
      subject: 'JavaScript',
      difficulty: 'medium',
      duration: 60,
      passingScore: 75,
    },
  },
  {
    id: '2',
    startTime: '2024-01-18T14:00:00Z',
    endTime: '2024-01-18T15:15:00Z',
    score: 42,
    totalScore: 75,
    percentage: 56,
    passed: false,
    status: 'completed',
    exam: {
      title: 'Advanced Calculus Assessment',
      category: 'mathematics',
      subject: 'Calculus',
      difficulty: 'hard',
      duration: 120,
      passingScore: 70,
    },
  },
];

export default function ExamPage() {
  const { t } = useTranslation('common');
  const { user } = useAppContext();
  const [exams, setExams] = useState<Exam[]>(demoExams);
  const [filteredExams, setFilteredExams] = useState<Exam[]>(demoExams);
  const [userStats, setUserStats] = useState<UserStats>(demoUserStats);
  const [recentAttempts, setRecentAttempts] = useState<ExamAttempt[]>(demoRecentAttempts);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showAIDialog, setShowAIDialog] = useState(false);
  const [aiGenerationLoading, setAiGenerationLoading] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<any[]>([]);

  // Filter exams based on search and filters
  useEffect(() => {
    let filtered = exams;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter((exam) => exam.category === selectedCategory);
    }

    if (selectedDifficulty !== 'all') {
      filtered = filtered.filter((exam) => exam.difficulty === selectedDifficulty);
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (exam) =>
          exam.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          exam.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          exam.subject.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    setFilteredExams(filtered);
  }, [exams, selectedCategory, selectedDifficulty, searchQuery]);

  const handleStartExam = useCallback(async (examId: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/exam/${examId}/start`, {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        const attempt = await response.json();
        // For now, just show success message since we haven't built the exam taking page yet
        alert(`Exam started successfully! Attempt ID: ${attempt.id}`);
        console.log('Exam attempt started:', attempt);
      } else {
        const errorData = await response.json();
        alert(`Failed to start exam: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error starting exam:', error);
      alert('Failed to start exam. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleGenerateQuestions = useCallback(
    async (formData: { topic: string; difficulty: string; count: string; type: string }) => {
      try {
        setAiGenerationLoading(true);
        const response = await fetch('/api/exam/generate-questions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            topic: formData.topic,
            difficulty: formData.difficulty,
            count: parseInt(formData.count),
            type: formData.type,
          }),
        });

        if (response.ok) {
          const questions = await response.json();
          setGeneratedQuestions(questions);
          alert(`Generated ${questions.length} questions successfully!`);
          console.log('Generated questions:', questions);
        } else {
          const errorData = await response.json();
          alert(`Failed to generate questions: ${errorData.error || 'Unknown error'}`);
        }
      } catch (error) {
        console.error('Error generating questions:', error);
        alert('Failed to generate questions. Please try again.');
      } finally {
        setAiGenerationLoading(false);
      }
    },
    [],
  );

  // Load real exams from API on component mount
  useEffect(() => {
    const fetchExams = async () => {
      try {
        const response = await fetch('/api/exam', {
          credentials: 'include',
        });

        if (response.ok) {
          const apiExams = await response.json();
          if (apiExams && apiExams.length > 0) {
            setExams(apiExams);
          }
        } else {
          console.log('Using demo data - API not available');
        }
      } catch (error) {
        console.log('Using demo data - API error:', error);
      }
    };

    const fetchUserStats = async () => {
      try {
        const response = await fetch('/api/exam/user/stats', {
          credentials: 'include',
        });

        if (response.ok) {
          const stats = await response.json();
          setUserStats(stats);
        }
      } catch (error) {
        console.log('Using demo stats - API error:', error);
      }
    };

    const fetchUserHistory = async () => {
      try {
        const response = await fetch('/api/exam/user/history', {
          credentials: 'include',
        });

        if (response.ok) {
          const history = await response.json();
          setRecentAttempts(history);
        }
      } catch (error) {
        console.log('Using demo history - API error:', error);
      }
    };

    fetchExams();
    fetchUserStats();
    fetchUserHistory();
  }, []);

  const getDifficultyBadgeColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'hard':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          {t('pages.examTitle')}
        </h1>
        <p className="text-gray-600 mt-2">{t('pages.examDesc')}</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Attempts</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats.totalAttempts}</div>
            <p className="text-xs text-muted-foreground">
              {userStats.totalExamsTaken} unique exams
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {userStats.successRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {userStats.passedAttempts} passed, {userStats.failedAttempts} failed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {userStats.averageScore.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">Across all attempts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground text-green-600">+3 from last month</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="browse" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="browse">Browse Exams</TabsTrigger>
          <TabsTrigger value="history">My History</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="create">Create Exam</TabsTrigger>
        </TabsList>

        {/* Browse Exams Tab */}
        <TabsContent value="browse" className="space-y-6">
          {/* Search and Filters */}
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search exams by title, subject, or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {examCategories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>

              <Dialog open={showAIDialog} onOpenChange={setShowAIDialog}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-purple-600 to-blue-600">
                    <Sparkles className="h-4 w-4 mr-2" />
                    AI Generate
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Generate AI Questions</DialogTitle>
                    <DialogDescription>
                      Create custom questions using AI for any topic
                    </DialogDescription>
                  </DialogHeader>
                  <AIQuestionForm
                    onGenerate={handleGenerateQuestions}
                    isLoading={aiGenerationLoading}
                    onClose={() => setShowAIDialog(false)}
                    generatedQuestions={generatedQuestions}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Results count */}
          <div className="text-sm text-gray-600">
            Showing {filteredExams.length} of {exams.length} exams
          </div>

          {/* Exams Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredExams.map((exam) => (
              <Card key={exam.id} className="hover:shadow-lg transition-shadow duration-200">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between mb-2">
                    <Badge className={getDifficultyBadgeColor(exam.difficulty)}>
                      {exam.difficulty.toUpperCase()}
                    </Badge>
                    <div className="text-xs text-gray-500">{exam._count.attempts} attempts</div>
                  </div>
                  <CardTitle className="text-lg line-clamp-2">{exam.title}</CardTitle>
                  <CardDescription className="line-clamp-2">{exam.description}</CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Exam Details */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="h-3 w-3" />
                      <span>{formatDuration(exam.duration)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className="h-3 w-3" />
                      <span>{exam.totalQuestions} questions</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Target className="h-3 w-3" />
                      <span>{exam.passingScore}% to pass</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-3 w-3" />
                      <span>{exam.subject}</span>
                    </div>
                  </div>

                  {/* Creator and Date */}
                  <div className="text-xs text-gray-500">
                    Created by {exam.createdByName} •{' '}
                    {new Date(exam.createdAt).toLocaleDateString()}
                  </div>

                  {/* Action Button */}
                  <Button
                    onClick={() => handleStartExam(exam.id)}
                    className="w-full"
                    disabled={isLoading}
                  >
                    <PlayCircle className="h-4 w-4 mr-2" />
                    Start Exam
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* No results */}
          {filteredExams.length === 0 && (
            <div className="text-center py-12">
              <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No exams found</h3>
              <p className="text-gray-600 mb-4">Try adjusting your search criteria or filters</p>
              <Button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setSelectedDifficulty('all');
                }}
              >
                Clear Filters
              </Button>
            </div>
          )}
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Recent Exam Attempts</h3>
            <Badge variant="secondary">{recentAttempts.length} attempts</Badge>
          </div>

          <div className="space-y-4">
            {recentAttempts.map((attempt) => (
              <Card key={attempt.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold">{attempt.exam.title}</h4>
                        {attempt.passed ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600" />
                        )}
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Score:</span> {attempt.score}/
                          {attempt.totalScore}
                        </div>
                        <div>
                          <span className="font-medium">Percentage:</span>{' '}
                          <span className={attempt.passed ? 'text-green-600' : 'text-red-600'}>
                            {attempt.percentage.toFixed(1)}%
                          </span>
                        </div>
                        <div>
                          <span className="font-medium">Required:</span> {attempt.exam.passingScore}
                          %
                        </div>
                        <div>
                          <span className="font-medium">Date:</span>{' '}
                          {new Date(attempt.startTime).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <Badge className={getDifficultyBadgeColor(attempt.exam.difficulty)}>
                      {attempt.exam.difficulty.toUpperCase()}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Performance Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Success Rate</span>
                    <span>{userStats.successRate.toFixed(1)}%</span>
                  </div>
                  <Progress value={userStats.successRate} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Average Score</span>
                    <span>{userStats.averageScore.toFixed(1)}%</span>
                  </div>
                  <Progress value={userStats.averageScore} className="h-2" />
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {userStats.passedAttempts}
                    </div>
                    <div className="text-sm text-gray-600">Passed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {userStats.failedAttempts}
                    </div>
                    <div className="text-sm text-gray-600">Failed</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  Achievements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                      <Star className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div>
                      <p className="font-medium">First Perfect Score</p>
                      <p className="text-sm text-gray-600">Achieved 100% on JavaScript Quiz</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <Zap className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">Speed Demon</p>
                      <p className="text-sm text-gray-600">Completed exam in under 30 minutes</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                      <Target className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">Consistent Performer</p>
                      <p className="text-sm text-gray-600">Passed 5 exams in a row</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Create Exam Tab */}
        <TabsContent value="create" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Create New Exam
              </CardTitle>
              <CardDescription>
                Create custom exams for yourself or share with others
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="examTitle">Exam Title</Label>
                    <Input id="examTitle" placeholder="Enter exam title" />
                  </div>
                  <div>
                    <Label htmlFor="examDescription">Description</Label>
                    <Input id="examDescription" placeholder="Brief description of the exam" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="examCategory">Category</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {examCategories.slice(1).map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="examSubject">Subject</Label>
                      <Input id="examSubject" placeholder="e.g., Algebra, React" />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="examDifficulty">Difficulty</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select difficulty" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="easy">Easy</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="hard">Hard</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="examDuration">Duration (minutes)</Label>
                      <Input id="examDuration" type="number" placeholder="60" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="totalQuestions">Total Questions</Label>
                      <Input id="totalQuestions" type="number" placeholder="20" />
                    </div>
                    <div>
                      <Label htmlFor="passingScore">Passing Score (%)</Label>
                      <Input id="passingScore" type="number" placeholder="70" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline">Save Draft</Button>
                <Button>Create Exam</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
