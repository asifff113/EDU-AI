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
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          {t('pages.resourcesTitle')}
        </h1>
        <p className="text-gray-600 mt-2">{t('pages.resourcesDesc')}</p>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search resources, authors, tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Category" />
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
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Type" />
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
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="popular">Most Popular</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="recent">Most Recent</SelectItem>
                <SelectItem value="views">Most Viewed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Upload Button */}
          <Button
            onClick={() => setShowUploadDialog(true)}
            className="bg-gradient-to-r from-purple-600 to-blue-600"
          >
            <Upload className="h-4 w-4 mr-2" />
            Contribute
          </Button>
        </div>

        {/* Results count */}
        <div className="text-sm text-gray-600">
          Showing {filteredResources.length} of {resources.length} resources
        </div>
      </div>

      {/* Resources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredResources.map((resource) => (
          <Card key={resource.id} className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="pb-3">
              {/* Thumbnail */}
              <div className="relative mb-3">
                <img
                  src={resource.thumbnail}
                  alt={resource.title}
                  className="w-full h-40 object-cover rounded-lg"
                />
                <div className="absolute top-2 left-2">
                  <Badge variant="secondary" className="flex items-center gap-1">
                    {getTypeIcon(resource.type)}
                    {resource.type}
                  </Badge>
                </div>
                {resource.isVerified && (
                  <div className="absolute top-2 right-2">
                    <Badge variant="default" className="bg-green-500">
                      ✓ Verified
                    </Badge>
                  </div>
                )}
              </div>

              <CardTitle className="text-lg line-clamp-2">{resource.title}</CardTitle>
              <CardDescription className="line-clamp-2">{resource.description}</CardDescription>
            </CardHeader>

            <CardContent className="space-y-3">
              {/* Author and Date */}
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <User className="h-3 w-3" />
                <span>{resource.author}</span>
                <span>•</span>
                <Calendar className="h-3 w-3" />
                <span>{new Date(resource.uploadDate).toLocaleDateString()}</span>
              </div>

              {/* Stats */}
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Download className="h-3 w-3" />
                    <span>{resource.downloads.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    <span>{resource.views.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span>{resource.rating}</span>
                  </div>
                </div>
              </div>

              {/* File Info */}
              {resource.fileSize && (
                <div className="text-xs text-gray-500">
                  Size: {formatFileSize(resource.fileSize)}
                  {resource.duration && ` • Duration: ${formatDuration(resource.duration)}`}
                </div>
              )}

              {/* Tags */}
              <div className="flex flex-wrap gap-1">
                {resource.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {resource.tags.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{resource.tags.length - 3}
                  </Badge>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button
                  onClick={() => handleDownload(resource)}
                  className="flex-1"
                  variant={resource.isFree ? 'default' : 'outline'}
                >
                  {resource.externalUrl ? (
                    <>
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Visit
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      {resource.isFree ? 'Download' : `৳${resource.price}`}
                    </>
                  )}
                </Button>
                <Button variant="ghost" size="sm">
                  <Heart className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
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
