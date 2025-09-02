'use client';

import { useState, useEffect } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
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
  BookOpen,
  FileText,
  Download,
  Upload,
  Search,
  Filter,
  Star,
  Eye,
  Calendar,
  User,
  Tag,
  Play,
  Volume2,
  Image,
  Video,
  Headphones,
  FileImage,
  Plus,
  ExternalLink,
  Heart,
  Share2,
  Clock,
  TrendingUp,
} from 'lucide-react';

interface Resource {
  id: string;
  title: string;
  description: string;
  type:
    | 'book'
    | 'article'
    | 'journal'
    | 'notes'
    | 'pdf'
    | 'question-bank'
    | 'video'
    | 'audio'
    | 'image'
    | 'text';
  category: string;
  subject: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  format: 'pdf' | 'doc' | 'txt' | 'mp4' | 'mp3' | 'jpg' | 'png' | 'url';
  fileUrl?: string;
  externalUrl?: string;
  fileSize?: string;
  duration?: string;
  author: string;
  contributorId: string;
  contributorName: string;
  uploadDate: string;
  downloads: number;
  views: number;
  rating: number;
  reviewCount: number;
  tags: string[];
  isVerified: boolean;
  isFree: boolean;
  price?: number;
  thumbnail?: string;
}

const resourceCategories = [
  { id: 'all', name: 'All Resources', count: 0 },
  { id: 'academic', name: 'Academic', count: 0 },
  { id: 'programming', name: 'Programming & Tech', count: 0 },
  { id: 'science', name: 'Science & Research', count: 0 },
  { id: 'mathematics', name: 'Mathematics', count: 0 },
  { id: 'literature', name: 'Literature & Language', count: 0 },
  { id: 'business', name: 'Business & Economics', count: 0 },
  { id: 'medical', name: 'Medical & Health', count: 0 },
  { id: 'engineering', name: 'Engineering', count: 0 },
  { id: 'arts', name: 'Arts & Design', count: 0 },
  { id: 'history', name: 'History & Social Studies', count: 0 },
];

const resourceTypes = [
  { id: 'all', name: 'All Types', icon: BookOpen },
  { id: 'book', name: 'Books', icon: BookOpen },
  { id: 'article', name: 'Articles', icon: FileText },
  { id: 'journal', name: 'Journals', icon: FileText },
  { id: 'notes', name: 'Notes', icon: FileText },
  { id: 'pdf', name: 'PDFs', icon: FileText },
  { id: 'question-bank', name: 'Question Banks', icon: FileText },
  { id: 'video', name: 'Videos', icon: Video },
  { id: 'audio', name: 'Audio', icon: Headphones },
  { id: 'image', name: 'Images', icon: FileImage },
  { id: 'text', name: 'Text Resources', icon: FileText },
];

// Demo resources with real educational content
const demoResources: Resource[] = [
  {
    id: '1',
    title: 'Introduction to Machine Learning',
    description:
      'Comprehensive guide covering the fundamentals of machine learning, including supervised and unsupervised learning algorithms, neural networks, and practical applications.',
    type: 'book',
    category: 'programming',
    subject: 'Machine Learning',
    level: 'intermediate',
    format: 'pdf',
    fileUrl: '/resources/ml-intro.pdf',
    fileSize: '15.2 MB',
    author: 'Dr. Andrew Ng',
    contributorId: 'user1',
    contributorName: 'AI Researcher',
    uploadDate: '2024-01-15',
    downloads: 2847,
    views: 5692,
    rating: 4.8,
    reviewCount: 156,
    tags: ['machine-learning', 'algorithms', 'python', 'data-science'],
    isVerified: true,
    isFree: true,
    thumbnail: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400&h=300&fit=crop',
  },
  {
    id: '2',
    title: 'Calculus and Analytical Geometry',
    description:
      'Complete textbook covering differential and integral calculus, limits, derivatives, and their applications in engineering and physics.',
    type: 'book',
    category: 'mathematics',
    subject: 'Calculus',
    level: 'advanced',
    format: 'pdf',
    fileUrl: '/resources/calculus-book.pdf',
    fileSize: '28.5 MB',
    author: 'Prof. James Stewart',
    contributorId: 'user2',
    contributorName: 'Math Professor',
    uploadDate: '2024-01-10',
    downloads: 4521,
    views: 8934,
    rating: 4.9,
    reviewCount: 203,
    tags: ['calculus', 'mathematics', 'derivatives', 'integrals'],
    isVerified: true,
    isFree: true,
    thumbnail: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&h=300&fit=crop',
  },
  {
    id: '3',
    title: 'Organic Chemistry Mechanisms',
    description:
      'Visual guide to organic chemistry reaction mechanisms with step-by-step illustrations and practice problems.',
    type: 'notes',
    category: 'science',
    subject: 'Chemistry',
    level: 'intermediate',
    format: 'pdf',
    fileUrl: '/resources/organic-chem-notes.pdf',
    fileSize: '12.8 MB',
    author: 'Dr. Paula Bruice',
    contributorId: 'user3',
    contributorName: 'Chemistry Student',
    uploadDate: '2024-01-08',
    downloads: 1893,
    views: 3247,
    rating: 4.7,
    reviewCount: 89,
    tags: ['chemistry', 'organic', 'mechanisms', 'reactions'],
    isVerified: true,
    isFree: true,
    thumbnail: 'https://images.unsplash.com/photo-1554475901-4538ddfbccc2?w=400&h=300&fit=crop',
  },
  {
    id: '4',
    title: 'Python Programming Tutorial Series',
    description:
      'Complete video series covering Python from basics to advanced topics including web development, data science, and automation.',
    type: 'video',
    category: 'programming',
    subject: 'Python Programming',
    level: 'beginner',
    format: 'mp4',
    fileUrl: '/resources/python-tutorial.mp4',
    duration: '8h 45m',
    fileSize: '2.1 GB',
    author: 'Corey Schafer',
    contributorId: 'user4',
    contributorName: 'Python Developer',
    uploadDate: '2024-01-05',
    downloads: 3264,
    views: 12847,
    rating: 4.9,
    reviewCount: 421,
    tags: ['python', 'programming', 'tutorial', 'beginner'],
    isVerified: true,
    isFree: true,
    thumbnail: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=400&h=300&fit=crop',
  },
  {
    id: '5',
    title: 'World History Timeline',
    description:
      'Interactive timeline covering major world events from ancient civilizations to modern times with detailed explanations.',
    type: 'article',
    category: 'history',
    subject: 'World History',
    level: 'intermediate',
    format: 'url',
    externalUrl: 'https://www.worldhistory.org/timeline/',
    author: 'World History Encyclopedia',
    contributorId: 'user5',
    contributorName: 'History Teacher',
    uploadDate: '2024-01-03',
    downloads: 0,
    views: 5621,
    rating: 4.6,
    reviewCount: 134,
    tags: ['history', 'timeline', 'civilizations', 'events'],
    isVerified: true,
    isFree: true,
    thumbnail: 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=400&h=300&fit=crop',
  },
  {
    id: '6',
    title: 'Medical Anatomy Audio Lectures',
    description:
      'Professional audio lectures covering human anatomy systems with detailed explanations and medical terminology.',
    type: 'audio',
    category: 'medical',
    subject: 'Human Anatomy',
    level: 'advanced',
    format: 'mp3',
    fileUrl: '/resources/anatomy-lectures.mp3',
    duration: '12h 30m',
    fileSize: '450 MB',
    author: 'Dr. Frank Netter',
    contributorId: 'user6',
    contributorName: 'Medical Student',
    uploadDate: '2024-01-01',
    downloads: 1547,
    views: 2893,
    rating: 4.8,
    reviewCount: 67,
    tags: ['anatomy', 'medical', 'lectures', 'terminology'],
    isVerified: true,
    isFree: true,
    thumbnail: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300&fit=crop',
  },
  {
    id: '7',
    title: 'Engineering Physics Question Bank',
    description:
      'Comprehensive collection of solved and unsolved problems in engineering physics covering mechanics, thermodynamics, and electromagnetism.',
    type: 'question-bank',
    category: 'engineering',
    subject: 'Engineering Physics',
    level: 'intermediate',
    format: 'pdf',
    fileUrl: '/resources/physics-questions.pdf',
    fileSize: '8.7 MB',
    author: 'Prof. Resnick & Halliday',
    contributorId: 'user7',
    contributorName: 'Engineering Student',
    uploadDate: '2023-12-28',
    downloads: 2156,
    views: 4328,
    rating: 4.7,
    reviewCount: 98,
    tags: ['physics', 'engineering', 'questions', 'problems'],
    isVerified: true,
    isFree: true,
    thumbnail: 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=400&h=300&fit=crop',
  },
  {
    id: '8',
    title: 'Business Strategy Case Studies',
    description:
      'Real-world business case studies from Fortune 500 companies with detailed analysis and strategic insights.',
    type: 'journal',
    category: 'business',
    subject: 'Business Strategy',
    level: 'advanced',
    format: 'pdf',
    fileUrl: '/resources/business-cases.pdf',
    fileSize: '18.3 MB',
    author: 'Harvard Business Review',
    contributorId: 'user8',
    contributorName: 'MBA Student',
    uploadDate: '2023-12-25',
    downloads: 3847,
    views: 7294,
    rating: 4.9,
    reviewCount: 187,
    tags: ['business', 'strategy', 'case-studies', 'management'],
    isVerified: true,
    isFree: false,
    price: 29.99,
    thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop',
  },
];

export default function ResourcesPage() {
  const { t } = useTranslation('common');
  const { user } = useAppContext();
  const [resources, setResources] = useState<Resource[]>(demoResources);
  const [filteredResources, setFilteredResources] = useState<Resource[]>(demoResources);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('popular');
  const [isLoading, setIsLoading] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);

  // Filter and search logic
  useEffect(() => {
    let filtered = resources;

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((resource) => resource.category === selectedCategory);
    }

    // Type filter
    if (selectedType !== 'all') {
      filtered = filtered.filter((resource) => resource.type === selectedType);
    }

    // Level filter
    if (selectedLevel !== 'all') {
      filtered = filtered.filter((resource) => resource.level === selectedLevel);
    }

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (resource) =>
          resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          resource.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          resource.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
          resource.author.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    // Sort
    switch (sortBy) {
      case 'popular':
        filtered.sort((a, b) => b.downloads - a.downloads);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'recent':
        filtered.sort(
          (a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime(),
        );
        break;
      case 'views':
        filtered.sort((a, b) => b.views - a.views);
        break;
      default:
        break;
    }

    setFilteredResources(filtered);
  }, [resources, selectedCategory, selectedType, selectedLevel, searchQuery, sortBy]);

  const handleDownload = (resource: Resource) => {
    if (resource.externalUrl) {
      window.open(resource.externalUrl, '_blank');
    } else {
      // Simulate download
      const link = document.createElement('a');
      link.href = resource.fileUrl || '#';
      link.download = `${resource.title}.${resource.format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Update download count
      setResources((prev) =>
        prev.map((r) => (r.id === resource.id ? { ...r, downloads: r.downloads + 1 } : r)),
      );
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="h-4 w-4" />;
      case 'audio':
        return <Headphones className="h-4 w-4" />;
      case 'image':
        return <FileImage className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const formatFileSize = (size: string) => size;
  const formatDuration = (duration: string) => duration;

  return (
    <div className="container mx-auto p-6 max-w-7xl space-y-8">
      {/* Learning Treasure Vault Header */}
      <div
        className="relative group bg-gradient-to-r from-purple-600/20 via-violet-700/15 to-indigo-600/20 
         rounded-2xl p-8 border border-purple-600/20 backdrop-blur-xl shadow-2xl shadow-purple-600/10
         hover:shadow-3xl hover:shadow-purple-600/20 transition-all duration-700 transform-gpu
         before:absolute before:inset-0 before:bg-gradient-to-r before:from-purple-600/5 before:to-violet-700/5 
         before:rounded-2xl before:opacity-0 before:transition-opacity before:duration-500 hover:before:opacity-100"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-2xl"></div>
        <div className="relative z-10 flex items-center gap-4">
          <div className="p-4 rounded-2xl bg-purple-600/20 group-hover:bg-purple-500/30 transition-all duration-300 group-hover:rotate-6 group-hover:scale-110 transform-gpu">
            <div className="text-3xl">📚</div>
          </div>
          <div>
            <h1 className="text-4xl font-bold mb-2 text-white group-hover:text-purple-100 transition-colors duration-300">
              Learning Treasure Vault
            </h1>
            <p className="text-purple-300 group-hover:text-purple-200 transition-colors duration-300 text-lg">
              Discover a vast collection of educational resources to fuel your knowledge journey
            </p>
          </div>
        </div>
      </div>

      {/* Enhanced Search and Filters - Discovery Theme */}
      <div className="relative group bg-gradient-to-br from-emerald-500/20 via-green-600/15 to-teal-500/20 
        backdrop-blur-xl shadow-xl shadow-emerald-500/20 hover:shadow-2xl hover:shadow-emerald-500/30
        transition-all duration-500 hover:scale-[1.01] hover:-translate-y-1 transform-gpu perspective-1000
        before:absolute before:inset-0 before:bg-gradient-to-r before:from-emerald-500/10 before:to-green-600/10 
        before:rounded-xl before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-100
        rounded-2xl p-6 border border-emerald-500/20">
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-2xl"></div>
        <div className="relative z-10 space-y-6">
          <div className="text-xl font-semibold text-emerald-200 flex items-center gap-2">
            <div className="text-2xl">🔍</div>
            Discover Knowledge
          </div>
          
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Enhanced Search */}
            <div className="flex-1">
              <div className="relative group/search">
                <Search className="absolute left-3 top-3 h-5 w-5 text-emerald-400 group-hover/search:text-emerald-300 transition-colors duration-300 z-10" />
                <Input
                  placeholder="🌟 Search resources, authors, tags, subjects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 bg-emerald-500/10 border-emerald-400/30 text-white placeholder:text-emerald-300 
                    focus:border-emerald-300 focus:ring-emerald-400/20 transition-all duration-300
                    hover:bg-emerald-500/20 group-hover/search:scale-105 transform-gpu"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-green-500/5 rounded-lg opacity-0 
                  group-hover/search:opacity-100 transition-opacity duration-300 -z-10"></div>
              </div>
            </div>

            {/* Smart Filters */}
            <div className="flex flex-wrap gap-3">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[180px] bg-green-500/10 border-green-400/30 text-white 
                  hover:bg-green-500/20 transition-all duration-300 hover:scale-105 transform-gpu">
                  <SelectValue placeholder="📚 Category" />
                </SelectTrigger>
                <SelectContent>
                  {resourceCategories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-[140px] bg-green-500/10 border-green-400/30 text-white 
                  hover:bg-green-500/20 transition-all duration-300 hover:scale-105 transform-gpu">
                  <SelectValue placeholder="🎯 Type" />
                </SelectTrigger>
                <SelectContent>
                  {resourceTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      <div className="flex items-center gap-2">
                        <type.icon className="h-4 w-4" />
                        {type.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                <SelectTrigger className="w-[140px] bg-green-500/10 border-green-400/30 text-white 
                  hover:bg-green-500/20 transition-all duration-300 hover:scale-105 transform-gpu">
                  <SelectValue placeholder="📈 Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[140px] bg-green-500/10 border-green-400/30 text-white 
                  hover:bg-green-500/20 transition-all duration-300 hover:scale-105 transform-gpu">
                  <SelectValue placeholder="⚡ Sort" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="popular">Most Popular</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="recent">Most Recent</SelectItem>
                  <SelectItem value="views">Most Viewed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Contribute Button */}
            <Button
              onClick={() => setShowUploadDialog(true)}
              className="bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 
                text-white shadow-lg shadow-yellow-500/25 hover:shadow-yellow-500/40 transition-all duration-300 
                hover:scale-110 hover:-translate-y-1 transform-gpu border-0"
            >
              <Upload className="h-4 w-4 mr-2" />
              🎁 Contribute
            </Button>
          </div>

          {/* Enhanced Results Count */}
          <div className="flex items-center gap-3 text-emerald-200">
            <div className="text-lg">📊</div>
            <span className="font-semibold">
              Showing <span className="text-yellow-300 text-lg">{filteredResources.length}</span> of{' '}
              <span className="text-yellow-300 text-lg">{resources.length}</span> learning treasures
            </span>
          </div>
        </div>
      </div>

      {/* Enhanced Learning Resources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredResources.map((resource, index) => {
          // Dynamic color themes based on category
          const getCategoryTheme = (category: string) => {
            switch (category) {
              case 'programming':
                return 'from-green-500/20 to-emerald-600/20 shadow-green-500/15 hover:shadow-green-500/25 border-green-400/30';
              case 'mathematics':
                return 'from-orange-500/20 to-amber-600/20 shadow-orange-500/15 hover:shadow-orange-500/25 border-orange-400/30';
              case 'science':
                return 'from-blue-500/20 to-cyan-600/20 shadow-blue-500/15 hover:shadow-blue-500/25 border-blue-400/30';
              case 'academic':
                return 'from-purple-500/20 to-violet-600/20 shadow-purple-500/15 hover:shadow-purple-500/25 border-purple-400/30';
              case 'medical':
                return 'from-red-500/20 to-pink-600/20 shadow-red-500/15 hover:shadow-red-500/25 border-red-400/30';
              case 'business':
                return 'from-yellow-500/20 to-amber-600/20 shadow-yellow-500/15 hover:shadow-yellow-500/25 border-yellow-400/30';
              case 'engineering':
                return 'from-slate-500/20 to-gray-600/20 shadow-slate-500/15 hover:shadow-slate-500/25 border-slate-400/30';
              case 'literature':
                return 'from-pink-500/20 to-rose-600/20 shadow-pink-500/15 hover:shadow-pink-500/25 border-pink-400/30';
              case 'arts':
                return 'from-indigo-500/20 to-purple-600/20 shadow-indigo-500/15 hover:shadow-indigo-500/25 border-indigo-400/30';
              case 'history':
                return 'from-teal-500/20 to-cyan-600/20 shadow-teal-500/15 hover:shadow-teal-500/25 border-teal-400/30';
              default:
                return 'from-gray-500/20 to-slate-600/20 shadow-gray-500/15 hover:shadow-gray-500/25 border-gray-400/30';
            }
          };

          const theme = getCategoryTheme(resource.category);

          return (
            <Card key={resource.id} className={`group relative border-0 bg-gradient-to-br backdrop-blur-xl 
              hover:scale-105 hover:-translate-y-2 transition-all duration-300 transform-gpu perspective-1000 
              cursor-pointer ${theme}
              before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/5 before:to-transparent 
              before:rounded-xl before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-100`}>
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-xl"></div>
              <CardHeader className="pb-3 relative z-10">
                {/* Enhanced Thumbnail */}
                <div className="relative mb-4 group/thumbnail">
                  <img
                    src={resource.thumbnail}
                    alt={resource.title}
                    className="w-full h-40 object-cover rounded-xl group-hover/thumbnail:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent rounded-xl"></div>
                  <div className="absolute top-3 left-3">
                    <Badge className="bg-gradient-to-r from-slate-700 to-gray-800 text-white shadow-lg shadow-black/25 
                      group-hover:shadow-black/40 transition-all duration-300 group-hover:scale-105 transform-gpu border-0
                      flex items-center gap-1">
                      {getTypeIcon(resource.type)}
                      <span className="capitalize">{resource.type}</span>
                    </Badge>
                  </div>
                  {resource.isVerified && (
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/25 
                        group-hover:shadow-green-500/40 transition-all duration-300 group-hover:scale-105 transform-gpu border-0">
                        ✓ Verified
                      </Badge>
                    </div>
                  )}
                  {!resource.isFree && resource.price && (
                    <div className="absolute bottom-3 right-3">
                      <Badge className="bg-gradient-to-r from-yellow-500 to-amber-600 text-yellow-900 shadow-lg shadow-yellow-500/25 
                        group-hover:shadow-yellow-500/40 transition-all duration-300 group-hover:scale-105 transform-gpu border-0">
                        ৳{resource.price}
                      </Badge>
                    </div>
                  )}
                </div>

                <CardTitle className="text-lg line-clamp-2 text-white group-hover:text-gray-100 transition-colors duration-300 mb-2">
                  {resource.title}
                </CardTitle>
                <CardDescription className="line-clamp-2 text-gray-300 group-hover:text-gray-200 transition-colors duration-300">
                  {resource.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4 relative z-10">
                {/* Enhanced Author and Date */}
                <div className="flex items-center gap-2 text-sm p-2 rounded-lg bg-white/5 group-hover:bg-white/10 transition-all duration-300">
                  <User className="h-4 w-4 text-blue-300" />
                  <span className="text-white font-medium">{resource.author}</span>
                  <span className="text-gray-400">•</span>
                  <Calendar className="h-4 w-4 text-green-300" />
                  <span className="text-gray-300">{new Date(resource.uploadDate).toLocaleDateString()}</span>
                </div>

                {/* Enhanced Stats */}
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="flex items-center gap-1 text-cyan-300 group-hover:text-cyan-200 transition-colors duration-300 
                    p-2 rounded-lg bg-cyan-500/10">
                    <Download className="h-3 w-3" />
                    <span className="font-medium">{resource.downloads.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1 text-blue-300 group-hover:text-blue-200 transition-colors duration-300 
                    p-2 rounded-lg bg-blue-500/10">
                    <Eye className="h-3 w-3" />
                    <span className="font-medium">{resource.views.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1 text-yellow-300 group-hover:text-yellow-200 transition-colors duration-300 
                    p-2 rounded-lg bg-yellow-500/10">
                    <Star className="h-3 w-3 fill-current" />
                    <span className="font-medium">{resource.rating}</span>
                  </div>
                </div>

                {/* Enhanced File Info */}
                {resource.fileSize && (
                  <div className="text-xs text-gray-300 p-2 rounded-lg bg-white/5 font-medium">
                    📁 {formatFileSize(resource.fileSize)}
                    {resource.duration && (
                      <>
                        <span className="mx-2 text-gray-400">•</span>
                        <span>⏱️ {formatDuration(resource.duration)}</span>
                      </>
                    )}
                  </div>
                )}

                {/* Enhanced Tags */}
                <div className="flex flex-wrap gap-1">
                  {resource.tags.slice(0, 3).map((tag, i) => (
                    <Badge key={tag} className="text-xs bg-white/10 text-gray-300 border-white/20 hover:bg-white/20 
                      transition-all duration-300 cursor-pointer group-hover:scale-105 transform-gpu">
                      #{tag}
                    </Badge>
                  ))}
                  {resource.tags.length > 3 && (
                    <Badge className="text-xs bg-white/10 text-gray-300 border-white/20 hover:bg-white/20 
                      transition-all duration-300 cursor-pointer group-hover:scale-105 transform-gpu">
                      +{resource.tags.length - 3}
                    </Badge>
                  )}
                </div>

                {/* Enhanced Actions */}
                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={() => handleDownload(resource)}
                    className={`flex-1 transition-all duration-300 hover:scale-105 transform-gpu ${
                      resource.isFree 
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 border-0' 
                        : 'bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-white shadow-lg shadow-yellow-500/25 hover:shadow-yellow-500/40 border-0'
                    }`}
                  >
                    {resource.externalUrl ? (
                      <>
                        <ExternalLink className="h-4 w-4 mr-2" />
                        🌐 Visit
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4 mr-2" />
                        {resource.isFree ? '📥 Download' : `💰 ৳${resource.price}`}
                      </>
                    )}
                  </Button>
                  <Button 
                    size="sm" 
                    className="bg-pink-500/20 hover:bg-pink-400/30 text-pink-300 hover:text-pink-200 
                      transition-all duration-300 hover:scale-110 transform-gpu"
                  >
                    <Heart className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    className="bg-green-500/20 hover:bg-green-400/30 text-green-300 hover:text-green-200 
                      transition-all duration-300 hover:scale-110 transform-gpu"
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* No results */}
      {filteredResources.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No resources found</h3>
          <p className="text-gray-600 mb-4">Try adjusting your search criteria or filters</p>
          <Button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
              setSelectedType('all');
              setSelectedLevel('all');
            }}
          >
            Clear Filters
          </Button>
        </div>
      )}

      {/* Upload Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Contribute a Resource</DialogTitle>
            <DialogDescription>Share educational resources with the community</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Resource Title</Label>
              <Input id="title" placeholder="Enter resource title" />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" placeholder="Describe your resource" rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Category</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {resourceCategories.slice(1).map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="type">Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {resourceTypes.slice(1).map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="file">Upload File</Label>
              <Input id="file" type="file" />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowUploadDialog(false)}>
                Cancel
              </Button>
              <Button>Upload Resource</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
