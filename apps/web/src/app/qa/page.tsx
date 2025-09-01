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
    {
      id: 4,
      title: 'Physics: Understanding electromagnetic induction',
      description:
        "Can someone help me understand Faraday's law and Lenz's law with practical examples?",
      subject: 'physics',
      type: 'free',
      status: 'open',
      askedBy: {
        name: 'Sadia Begum',
        avatar:
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop&auto=format',
        level: 'University',
      },
      createdAt: '2024-01-12T09:15:00Z',
      answerCount: 0,
      viewCount: 45,
      upvotes: 3,
      tags: ['electromagnetism', 'faraday-law', 'induction'],
      hasImages: false,
    },
    {
      id: 5,
      title: 'Essay writing: How to structure an argumentative essay?',
      description:
        'I need help with organizing my thoughts and creating a strong argumentative essay structure.',
      subject: 'english',
      type: 'free',
      status: 'answered',
      askedBy: {
        name: 'Mahmud Hassan',
        avatar:
          'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=50&h=50&fit=crop&auto=format',
        level: 'High School',
      },
      createdAt: '2024-01-11T13:20:00Z',
      answerCount: 4,
      viewCount: 203,
      upvotes: 25,
      tags: ['essay-writing', 'argumentative', 'structure'],
      bestAnswer: {
        id: 3,
        content:
          'A strong argumentative essay follows a clear structure: Introduction with thesis, body paragraphs with evidence...',
        answeredBy: {
          name: 'Ms. Emily Rodriguez',
          avatar:
            'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=50&h=50&fit=crop&auto=format',
          rating: 4.7,
          isExpert: true,
        },
        createdAt: '2024-01-11T15:45:00Z',
        upvotes: 28,
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
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-fuchsia-500/10 via-violet-500/10 to-cyan-500/10 rounded-xl p-6 border border-white/10">
        <h1 className="text-3xl font-bold mb-2">Q&A Community</h1>
        <p className="text-muted-foreground mb-4">
          Ask questions, get peer answers, or hire expert help
        </p>
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-green-600" />
            <span>Free community help</span>
          </div>
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-yellow-600" />
            <span>Paid expert assistance</span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            <span>Earn by helping others</span>
          </div>
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="browse">Browse Questions</TabsTrigger>
          <TabsTrigger value="ask">Ask Question</TabsTrigger>
          <TabsTrigger value="my-questions">My Questions</TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="space-y-6">
          {/* Search and Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Find Questions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search questions, topics, or tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Subject</label>
                  <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                    <SelectTrigger>
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
                  <label className="text-sm font-medium mb-2 block">Type</label>
                  <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger>
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
                  <label className="text-sm font-medium mb-2 block">Status</label>
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger>
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
                  <label className="text-sm font-medium mb-2 block">Sort By</label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger>
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

          {/* Results Summary */}
          <div className="flex items-center justify-between">
            <span className="font-medium">{filteredQuestions.length} questions found</span>
            <Button
              onClick={() => setSelectedTab('ask')}
              className="bg-gradient-to-r from-fuchsia-500 to-violet-500"
            >
              <Plus className="w-4 h-4 mr-2" />
              Ask Question
            </Button>
          </div>

          {/* Questions List */}
          <div className="space-y-4">
            {filteredQuestions.map((question) => (
              <Card key={question.id} className="hover:shadow-lg transition-shadow">
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
                        {question.hasImages && <ImageIcon className="w-4 h-4 text-blue-600" />}
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
                          <span className="text-sm font-medium text-green-800">Best Answer</span>
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
                      <Button variant="outline" size="sm" className="flex-1">
                        View Details
                      </Button>
                      <Button
                        size="sm"
                        className="flex-1 bg-gradient-to-r from-fuchsia-500 to-violet-500"
                      >
                        Answer Question
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* No Results */}
          {filteredQuestions.length === 0 && (
            <Card>
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
          )}
        </TabsContent>

        <TabsContent value="ask" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Ask a Question
              </CardTitle>
              <p className="text-muted-foreground">
                Get help from our community of learners and experts
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Question Type Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="border-2 border-green-200 bg-green-50">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Heart className="w-8 h-8 text-green-600" />
                      <div>
                        <h3 className="font-semibold text-green-800">Free Community Help</h3>
                        <p className="text-sm text-green-600">Get answers from fellow students</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-2 border-yellow-200 bg-yellow-50">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Award className="w-8 h-8 text-yellow-600" />
                      <div>
                        <h3 className="font-semibold text-yellow-800">Paid Expert Help</h3>
                        <p className="text-sm text-yellow-600">Set a bounty for expert answers</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Question Form */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Subject</label>
                    <Select>
                      <SelectTrigger>
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
                    <label className="text-sm font-medium mb-2 block">Question Type</label>
                    <Select>
                      <SelectTrigger>
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
                  <label className="text-sm font-medium mb-2 block">Question Title</label>
                  <Input placeholder="Write a clear, specific question title..." />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Detailed Description</label>
                  <Textarea
                    placeholder="Provide more context, what you've tried, specific areas where you're stuck..."
                    rows={6}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Tags</label>
                  <Input placeholder="Add relevant tags (e.g. algebra, calculus, homework)" />
                </div>

                {/* Media Upload */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Attachments (Optional)</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    <Button variant="outline" size="sm">
                      <ImageIcon className="w-4 h-4 mr-2" />
                      Image
                    </Button>
                    <Button variant="outline" size="sm">
                      <Video className="w-4 h-4 mr-2" />
                      Video
                    </Button>
                    <Button variant="outline" size="sm">
                      <Mic className="w-4 h-4 mr-2" />
                      Audio
                    </Button>
                    <Button variant="outline" size="sm">
                      <FileText className="w-4 h-4 mr-2" />
                      Document
                    </Button>
                  </div>
                </div>

                {/* Bounty Setting */}
                <Card className="bg-yellow-50 border-yellow-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-yellow-800">Set a Bounty (Optional)</h4>
                        <p className="text-sm text-yellow-600">
                          Attract expert answers with a reward
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Input type="number" placeholder="0" className="w-20 text-center" />
                        <span className="text-sm font-medium">৳</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Button className="w-full bg-gradient-to-r from-fuchsia-500 to-violet-500">
                  <Plus className="w-4 h-4 mr-2" />
                  Post Question
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="my-questions" className="space-y-6">
          <Card>
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
