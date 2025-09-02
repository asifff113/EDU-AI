'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Search,
  Filter,
  Plus,
  HelpCircle,
  Star,
  Clock,
  Users,
  MessageCircle,
  Image as ImageIcon,
  Video,
  Mic,
  FileText,
  Award,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  DollarSign,
  Heart,
} from 'lucide-react';

type QuestionStatus = 'open' | 'answered' | 'closed';
type QuestionType = 'free' | 'paid';
type Subject =
  | 'mathematics'
  | 'physics'
  | 'chemistry'
  | 'biology'
  | 'english'
  | 'programming'
  | 'other';

type Question = {
  id: number;
  title: string;
  description: string;
  subject: Subject;
  type: QuestionType;
  bounty?: number;
  status: QuestionStatus;
  askedBy: {
    name: string;
    avatar: string;
    level: string;
  };
  createdAt: string;
  answerCount: number;
  viewCount: number;
  upvotes: number;
  tags: string[];
  hasImages?: boolean;
  hasVideo?: boolean;
  bestAnswer?: {
    id: number;
    content: string;
    answeredBy: {
      name: string;
      avatar: string;
      rating: number;
      isExpert: boolean;
    };
    createdAt: string;
    upvotes: number;
  };
};

const subjects = [
  { id: 'all', name: 'All Subjects' },
  { id: 'mathematics', name: 'Mathematics' },
  { id: 'physics', name: 'Physics' },
  { id: 'chemistry', name: 'Chemistry' },
  { id: 'biology', name: 'Biology' },
  { id: 'english', name: 'English' },
  { id: 'programming', name: 'Programming' },
  { id: 'other', name: 'Other' },
];

export default function QAPage() {
  const [selectedTab, setSelectedTab] = useState('browse');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [showAskDialog, setShowAskDialog] = useState(false);

  // Demo questions data
  const demoQuestions: Question[] = [
    {
      id: 1,
      title: 'How to solve quadratic equations using the quadratic formula?',
      description:
        'I am struggling with understanding when and how to apply the quadratic formula. Can someone explain with step-by-step examples?',
      subject: 'mathematics',
      type: 'free',
      status: 'answered',
      askedBy: {
        name: 'Tanvir Hasan',
        avatar:
          'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=50&h=50&fit=crop&auto=format',
        level: 'High School',
      },
      createdAt: '2024-01-15T10:30:00Z',
      answerCount: 3,
      viewCount: 127,
      upvotes: 12,
      tags: ['algebra', 'equations', 'formula'],
      hasImages: true,
      bestAnswer: {
        id: 1,
        content:
          'The quadratic formula is x = (-b ± √(b²-4ac)) / 2a. Let me break this down step by step...',
        answeredBy: {
          name: 'Dr. Sarah Johnson',
          avatar:
            'https://images.unsplash.com/photo-1494790108755-2616c6286ca8?w=50&h=50&fit=crop&auto=format',
          rating: 4.9,
          isExpert: true,
        },
        createdAt: '2024-01-15T11:45:00Z',
        upvotes: 15,
      },
    },
    {
      id: 2,
      title: 'Need help with React useEffect cleanup function',
      description:
        'I am getting memory leaks in my React app. Can someone explain how to properly use cleanup functions in useEffect?',
      subject: 'programming',
      type: 'paid',
      bounty: 500,
      status: 'open',
      askedBy: {
        name: 'Nadia Islam',
        avatar:
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=50&h=50&fit=crop&auto=format',
        level: 'University',
      },
      createdAt: '2024-01-14T14:20:00Z',
      answerCount: 1,
      viewCount: 89,
      upvotes: 8,
      tags: ['react', 'useEffect', 'memory-leak', 'javascript'],
      hasImages: false,
      hasVideo: true,
    },
    {
      id: 3,
      title: 'Organic Chemistry: Mechanism of SN2 reaction',
      description:
        'I need detailed explanation of SN2 reaction mechanism with stereochemistry considerations.',
      subject: 'chemistry',
      type: 'paid',
      bounty: 800,
      status: 'answered',
      askedBy: {
        name: 'Karim Rahman',
        avatar:
          'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=50&h=50&fit=crop&auto=format',
        level: 'Medical College',
      },
      createdAt: '2024-01-13T16:45:00Z',
      answerCount: 2,
      viewCount: 156,
      upvotes: 18,
      tags: ['organic-chemistry', 'reaction-mechanism', 'stereochemistry'],
      hasImages: true,
      bestAnswer: {
        id: 2,
        content:
          'SN2 reactions proceed through a backside attack mechanism. The nucleophile attacks from the opposite side...',
        answeredBy: {
          name: 'Rashid Ahmed',
          avatar:
            'https://images.unsplash.com/photo-1566492031773-4f4e44671d66?w=50&h=50&fit=crop&auto=format',
          rating: 4.6,
          isExpert: true,
        },
        createdAt: '2024-01-13T18:30:00Z',
        upvotes: 22,
      },
    },
  ];

  const filteredQuestions = useMemo(() => {
    let filtered = demoQuestions.filter((question) => {
      const matchesSubject = selectedSubject === 'all' || question.subject === selectedSubject;
      const matchesType = selectedType === 'all' || question.type === selectedType;
      const matchesStatus = selectedStatus === 'all' || question.status === selectedStatus;
      const matchesSearch =
        searchQuery === '' ||
        question.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        question.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        question.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesSubject && matchesType && matchesStatus && matchesSearch;
    });

    // Sort questions
    switch (sortBy) {
      case 'recent':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'popular':
        filtered.sort((a, b) => b.upvotes - a.upvotes);
        break;
      case 'bounty':
        filtered.sort((a, b) => (b.bounty || 0) - (a.bounty || 0));
        break;
      case 'unanswered':
        filtered = filtered.filter((q) => q.answerCount === 0);
        break;
    }

    return filtered;
  }, [selectedSubject, selectedType, selectedStatus, searchQuery, sortBy, demoQuestions]);

  const getStatusIcon = (status: QuestionStatus) => {
    switch (status) {
      case 'answered':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'open':
        return <AlertCircle className="w-4 h-4 text-blue-600" />;
      case 'closed':
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: QuestionStatus) => {
    switch (status) {
      case 'answered':
        return 'bg-green-100 text-green-800';
      case 'open':
        return 'bg-blue-100 text-blue-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSubjectIcon = (subject: Subject) => {
    switch (subject) {
      case 'mathematics':
        return '🔢';
      case 'physics':
        return '⚡';
      case 'chemistry':
        return '🧪';
      case 'biology':
        return '🧬';
      case 'english':
        return '📝';
      case 'programming':
        return '💻';
      default:
        return '❓';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  return (
    <div className="space-y-6 relative">
      {/* Header - Purple/Magenta Card */}
      <div className="group perspective-1000">
        <div className="relative overflow-hidden bg-gradient-to-br from-purple-600/20 via-magenta-500/15 to-pink-400/20 rounded-xl p-6 border border-purple-400/30 shadow-xl backdrop-blur-sm transition-all duration-500 hover:scale-[1.02] hover:rotate-1 hover:shadow-2xl hover:shadow-purple-500/25 transform-gpu">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-purple-500 via-magenta-500 to-pink-500"></div>
          <div className="relative">
            <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-purple-400 via-magenta-400 to-pink-400 bg-clip-text text-transparent">
              Q&A Community
            </h1>
            <p className="text-purple-200/80 mb-4">
              Ask questions, get peer answers, or hire expert help
            </p>
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-400/30">
                <Heart className="w-4 h-4 text-green-400" />
                <span className="text-green-300">Free community help</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-400/30">
                <Award className="w-4 h-4 text-yellow-400" />
                <span className="text-yellow-300">Paid expert assistance</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-400/30">
                <TrendingUp className="w-4 h-4 text-blue-400" />
                <span className="text-blue-300">Earn by helping others</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs - Cyan Card */}
      <div className="group perspective-1000">
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-gradient-to-r from-cyan-600/30 via-blue-500/20 to-indigo-600/30 backdrop-blur-xl border border-cyan-400/30 p-1 transition-all duration-500 hover:scale-[1.01] hover:shadow-lg hover:shadow-cyan-500/20 transform-gpu">
            <TabsTrigger
              value="browse"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-blue-500 data-[state=active]:text-white transition-all duration-300"
            >
              Browse Questions
            </TabsTrigger>
            <TabsTrigger
              value="ask"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-blue-500 data-[state=active]:text-white transition-all duration-300"
            >
              Ask Question
            </TabsTrigger>
            <TabsTrigger
              value="my-questions"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-blue-500 data-[state=active]:text-white transition-all duration-300"
            >
              My Questions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="browse" className="space-y-6">
            {/* Search and Filters - Emerald/Green Card */}
            <div className="group perspective-1000">
              <Card className="relative overflow-hidden bg-gradient-to-br from-emerald-500/20 via-green-400/15 to-teal-500/20 backdrop-blur-xl border border-emerald-400/30 shadow-xl transition-all duration-500 hover:scale-[1.01] hover:-rotate-0.5 hover:shadow-2xl hover:shadow-emerald-500/25 transform-gpu">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500"></div>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent">
                    <Filter className="w-5 h-5 text-emerald-400" />
                    Find Questions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-emerald-400" />
                    <Input
                      placeholder="Search questions, topics, or tags..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-emerald-500/10 border-emerald-400/30 focus:border-emerald-400 text-emerald-100 placeholder:text-emerald-300/60"
                    />
                  </div>

                  {/* Filters */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block text-emerald-300">
                        Subject
                      </label>
                      <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                        <SelectTrigger className="bg-emerald-500/10 border-emerald-400/30">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {subjects.map((subject) => (
                            <SelectItem key={subject.id} value={subject.id}>
                              {subject.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block text-emerald-300">
                        Type
                      </label>
                      <Select value={selectedType} onValueChange={setSelectedType}>
                        <SelectTrigger className="bg-emerald-500/10 border-emerald-400/30">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Types</SelectItem>
                          <SelectItem value="free">Free Help</SelectItem>
                          <SelectItem value="paid">Paid Help</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block text-emerald-300">
                        Status
                      </label>
                      <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                        <SelectTrigger className="bg-emerald-500/10 border-emerald-400/30">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="open">Open</SelectItem>
                          <SelectItem value="answered">Answered</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block text-emerald-300">
                        Sort By
                      </label>
                      <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger className="bg-emerald-500/10 border-emerald-400/30">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="recent">Most Recent</SelectItem>
                          <SelectItem value="popular">Most Popular</SelectItem>
                          <SelectItem value="bounty">Highest Bounty</SelectItem>
                          <SelectItem value="unanswered">Unanswered</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Results Summary - Orange Card */}
            <div className="group perspective-1000">
              <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-br from-orange-500/20 via-amber-400/15 to-yellow-500/20 border border-orange-400/30 shadow-lg backdrop-blur-sm transition-all duration-500 hover:scale-[1.01] hover:rotate-0.5 hover:shadow-xl hover:shadow-orange-500/20 transform-gpu">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-yellow-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl"></div>
                <span className="font-medium bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-400 bg-clip-text text-transparent relative">
                  {filteredQuestions.length} questions found
                </span>
                <Button
                  onClick={() => setSelectedTab('ask')}
                  className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 relative"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Ask Question
                </Button>
              </div>
            </div>

            {/* Questions List */}
            <div className="space-y-4">
              {filteredQuestions.map((question, index) => {
                // Different color themes for each question card
                const colorThemes = [
                  {
                    bg: 'from-blue-500/15 via-indigo-400/10 to-purple-500/15',
                    border: 'border-blue-400/30',
                    shadow: 'hover:shadow-blue-500/25',
                    top: 'from-blue-500 via-indigo-500 to-purple-500',
                  },
                  {
                    bg: 'from-rose-500/15 via-pink-400/10 to-red-500/15',
                    border: 'border-rose-400/30',
                    shadow: 'hover:shadow-rose-500/25',
                    top: 'from-rose-500 via-pink-500 to-red-500',
                  },
                  {
                    bg: 'from-violet-500/15 via-purple-400/10 to-fuchsia-500/15',
                    border: 'border-violet-400/30',
                    shadow: 'hover:shadow-violet-500/25',
                    top: 'from-violet-500 via-purple-500 to-fuchsia-500',
                  },
                ];
                const theme = colorThemes[index % colorThemes.length];

                return (
                  <div key={question.id} className="group perspective-1000">
                    <Card
                      className={`relative overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:rotate-0.5 hover:shadow-2xl ring-1 ring-white/10 hover:ring-2 bg-gradient-to-br ${theme.bg} ${theme.border} ${theme.shadow} backdrop-blur-xl transform-gpu`}
                    >
                      <div
                        className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${theme.top} opacity-70 group-hover:opacity-100 transition-opacity`}
                      ></div>
                      <CardContent className="p-6">
                        <div className="space-y-4">
                          {/* Question Header */}
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-xl">{getSubjectIcon(question.subject)}</span>
                                <Badge className={getStatusColor(question.status)}>
                                  {getStatusIcon(question.status)}
                                  <span className="ml-1 capitalize">{question.status}</span>
                                </Badge>
                                {question.type === 'paid' && (
                                  <Badge className="bg-yellow-100 text-yellow-800">
                                    <DollarSign className="w-3 h-3 mr-1" />৳{question.bounty}
                                  </Badge>
                                )}
                                {question.type === 'free' && (
                                  <Badge className="bg-green-100 text-green-800">
                                    <Heart className="w-3 h-3 mr-1" />
                                    Free
                                  </Badge>
                                )}
                              </div>
                              <h3 className="text-lg font-semibold mb-2 hover:text-primary cursor-pointer">
                                {question.title}
                              </h3>
                              <p className="text-muted-foreground text-sm line-clamp-2 mb-3">
                                {question.description}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 ml-4">
                              {question.hasImages && (
                                <ImageIcon className="w-4 h-4 text-blue-600" />
                              )}
                              {question.hasVideo && <Video className="w-4 h-4 text-purple-600" />}
                            </div>
                          </div>

                          {/* Tags */}
                          <div className="flex flex-wrap gap-1">
                            {question.tags.map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                #{tag}
                              </Badge>
                            ))}
                          </div>

                          {/* Question Stats */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <img
                                  src={question.askedBy.avatar}
                                  alt={question.askedBy.name}
                                  className="w-5 h-5 rounded-full"
                                />
                                <span>{question.askedBy.name}</span>
                                <span>•</span>
                                <span>{question.askedBy.level}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                <span>{formatTimeAgo(question.createdAt)}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <MessageCircle className="w-4 h-4" />
                                <span>{question.answerCount}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Users className="w-4 h-4" />
                                <span>{question.viewCount}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Star className="w-4 h-4" />
                                <span>{question.upvotes}</span>
                              </div>
                            </div>
                          </div>

                          {/* Best Answer Preview */}
                          {question.bestAnswer && (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                              <div className="flex items-center gap-2 mb-2">
                                <CheckCircle className="w-4 h-4 text-green-600" />
                                <span className="text-sm font-medium text-green-800">
                                  Best Answer
                                </span>
                                {question.bestAnswer.answeredBy.isExpert && (
                                  <Badge className="bg-blue-100 text-blue-800">
                                    <Award className="w-3 h-3 mr-1" />
                                    Expert
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-gray-700 line-clamp-2 mb-2">
                                {question.bestAnswer.content}
                              </p>
                              <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <div className="flex items-center gap-2">
                                  <img
                                    src={question.bestAnswer.answeredBy.avatar}
                                    alt={question.bestAnswer.answeredBy.name}
                                    className="w-4 h-4 rounded-full"
                                  />
                                  <span>{question.bestAnswer.answeredBy.name}</span>
                                  <div className="flex items-center gap-1">
                                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                    <span>{question.bestAnswer.answeredBy.rating}</span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Star className="w-3 h-3" />
                                  <span>{question.bestAnswer.upvotes} upvotes</span>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Action Buttons */}
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 border-violet-400/50 hover:bg-violet-500/10 transition-all duration-300"
                            >
                              View Details
                            </Button>
                            <Button
                              size="sm"
                              className="flex-1 bg-gradient-to-r from-fuchsia-500 to-violet-500 hover:from-fuchsia-600 hover:to-violet-600 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                            >
                              Answer Question
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                );
              })}
            </div>

            {/* No Results */}
            {filteredQuestions.length === 0 && (
              <div className="group perspective-1000">
                <Card className="transition-all duration-500 hover:scale-[1.01] hover:shadow-lg transform-gpu">
                  <CardContent className="p-12 text-center">
                    <HelpCircle className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-xl font-semibold mb-2">No questions found</h3>
                    <p className="text-muted-foreground mb-4">
                      Try adjusting your search criteria or be the first to ask a question!
                    </p>
                    <Button
                      onClick={() => setSelectedTab('ask')}
                      className="bg-gradient-to-r from-fuchsia-500 to-violet-500"
                    >
                      Ask First Question
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="ask" className="space-y-6">
            {/* Ask Question Card - Teal/Emerald */}
            <div className="group perspective-1000">
              <Card className="relative overflow-hidden bg-gradient-to-br from-teal-500/20 via-emerald-400/15 to-green-500/20 backdrop-blur-xl border border-teal-400/30 shadow-xl transition-all duration-500 hover:scale-[1.01] hover:-rotate-0.5 hover:shadow-2xl hover:shadow-teal-500/25 transform-gpu">
                <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-teal-500 via-emerald-500 to-green-500"></div>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent">
                    <Plus className="w-5 h-5 text-teal-400" />
                    Ask a Question
                  </CardTitle>
                  <p className="text-teal-200/80">
                    Get help from our community of learners and experts
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Question Type Selection */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="group relative overflow-hidden border-2 border-green-400/30 bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-xl hover:border-green-400/50 transition-all duration-300 hover:scale-105">
                      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-green-500 to-emerald-500"></div>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <Heart className="w-8 h-8 text-green-400 group-hover:scale-110 transition-transform duration-300" />
                          <div>
                            <h3 className="font-semibold text-green-300">Free Community Help</h3>
                            <p className="text-sm text-green-200">
                              Get answers from fellow students
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="group relative overflow-hidden border-2 border-yellow-400/30 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 backdrop-blur-xl hover:border-yellow-400/50 transition-all duration-300 hover:scale-105">
                      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-yellow-500 to-orange-500"></div>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <Award className="w-8 h-8 text-yellow-400 group-hover:scale-110 transition-transform duration-300" />
                          <div>
                            <h3 className="font-semibold text-yellow-300">Paid Expert Help</h3>
                            <p className="text-sm text-yellow-200">
                              Set a bounty for expert answers
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Question Form */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block text-teal-300">
                          Subject
                        </label>
                        <Select>
                          <SelectTrigger className="bg-teal-500/10 border-teal-400/30">
                            <SelectValue placeholder="Select subject" />
                          </SelectTrigger>
                          <SelectContent>
                            {subjects.slice(1).map((subject) => (
                              <SelectItem key={subject.id} value={subject.id}>
                                {subject.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block text-teal-300">
                          Question Type
                        </label>
                        <Select>
                          <SelectTrigger className="bg-teal-500/10 border-teal-400/30">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="free">Free Community Help</SelectItem>
                            <SelectItem value="paid">Paid Expert Help</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block text-teal-300">
                        Question Title
                      </label>
                      <Input
                        placeholder="Write a clear, specific question title..."
                        className="bg-teal-500/10 border-teal-400/30 focus:border-teal-400 text-teal-100 placeholder:text-teal-300/60"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block text-teal-300">
                        Detailed Description
                      </label>
                      <Textarea
                        placeholder="Provide more context, what you've tried, specific areas where you're stuck..."
                        rows={6}
                        className="bg-teal-500/10 border-teal-400/30 focus:border-teal-400 text-teal-100 placeholder:text-teal-300/60"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block text-teal-300">Tags</label>
                      <Input
                        placeholder="Add relevant tags (e.g. algebra, calculus, homework)"
                        className="bg-teal-500/10 border-teal-400/30 focus:border-teal-400 text-teal-100 placeholder:text-teal-300/60"
                      />
                    </div>

                    {/* Media Upload */}
                    <div>
                      <label className="text-sm font-medium mb-2 block text-teal-300">
                        Attachments (Optional)
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-teal-400/30 hover:bg-teal-500/10"
                        >
                          <ImageIcon className="w-4 h-4 mr-2" />
                          Image
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-teal-400/30 hover:bg-teal-500/10"
                        >
                          <Video className="w-4 h-4 mr-2" />
                          Video
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-teal-400/30 hover:bg-teal-500/10"
                        >
                          <Mic className="w-4 h-4 mr-2" />
                          Audio
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-teal-400/30 hover:bg-teal-500/10"
                        >
                          <FileText className="w-4 h-4 mr-2" />
                          Document
                        </Button>
                      </div>
                    </div>

                    {/* Bounty Setting */}
                    <Card className="bg-yellow-50/10 border-yellow-400/30">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-yellow-300">Set a Bounty (Optional)</h4>
                            <p className="text-sm text-yellow-200/80">
                              Attract expert answers with a reward
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              placeholder="0"
                              className="w-20 text-center bg-yellow-500/10 border-yellow-400/30"
                            />
                            <span className="text-sm font-medium text-yellow-300">৳</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Button className="w-full bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 transform-gpu">
                      <Plus className="w-4 h-4 mr-2" />
                      Post Question
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="my-questions" className="space-y-6">
            <div className="group perspective-1000">
              <Card className="transition-all duration-500 hover:scale-[1.01] hover:shadow-lg transform-gpu">
                <CardContent className="p-12 text-center">
                  <HelpCircle className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-xl font-semibold mb-2">No questions yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Start by asking your first question to get help from the community
                  </p>
                  <Button
                    onClick={() => setSelectedTab('ask')}
                    className="bg-gradient-to-r from-fuchsia-500 to-violet-500"
                  >
                    Ask Your First Question
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
