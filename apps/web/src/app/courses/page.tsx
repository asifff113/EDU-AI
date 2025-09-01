'use client';

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  BookOpen,
  Clock,
  Users,
  Star,
  Search,
  Filter,
  GraduationCap,
  Code,
  Stethoscope,
  Wrench,
  Languages,
  Briefcase,
  Calculator,
  Palette,
  Globe,
  Heart,
} from 'lucide-react';
import { getApiBaseUrl } from '@/lib/env';

type Course = {
  id: number;
  title: string;
  description: string;
  category: string;
  subcategory: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
  students: number;
  rating: number;
  price: number; // 0 for free
  instructor: string;
  image: string;
  progress?: number;
  tags: string[];
};

const courseCategories = [
  { id: 'all', name: 'All Courses', icon: BookOpen },
  { id: 'academic', name: 'Academic (K-12)', icon: GraduationCap },
  { id: 'university', name: 'University', icon: GraduationCap },
  { id: 'medical', name: 'Medical & Health', icon: Stethoscope },
  { id: 'engineering', name: 'Engineering', icon: Wrench },
  { id: 'coding', name: 'Programming', icon: Code },
  { id: 'language', name: 'Languages', icon: Languages },
  { id: 'business', name: 'Business & Skills', icon: Briefcase },
  { id: 'arts', name: 'Arts & Design', icon: Palette },
  { id: 'science', name: 'Science & Math', icon: Calculator },
];

export default function CoursesPage() {
  const { t } = useTranslation('common');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [selectedPrice, setSelectedPrice] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [communityCourses, setCommunityCourses] = useState<any[]>([]);
  const [loadingCommunity, setLoadingCommunity] = useState(false);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoadingCommunity(true);
        const base = getApiBaseUrl();
        const res = await fetch(`${base}/courses`, { credentials: 'include' });
        if (!res.ok) return;
        const data = await res.json();
        setCommunityCourses(Array.isArray(data) ? data : []);
      } catch {
        // ignore
      } finally {
        setLoadingCommunity(false);
      }
    };
    fetchCourses();
  }, []);

  const demoCommonCourses: Course[] = [
    // Academic K-12
    {
      id: 1,
      title: 'Mathematics Grade 10',
      description: 'Complete algebra, geometry, and trigonometry curriculum',
      category: 'academic',
      subcategory: 'mathematics',
      level: 'Intermediate',
      duration: '36 weeks',
      students: 12543,
      rating: 4.8,
      price: 0,
      instructor: 'Dr. Sarah Johnson',
      image:
        'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&h=300&fit=crop&auto=format',
      tags: ['Algebra', 'Geometry', 'Trigonometry'],
    },
    {
      id: 2,
      title: 'Physics Grade 12',
      description: 'Advanced physics concepts and practical applications',
      category: 'academic',
      subcategory: 'physics',
      level: 'Advanced',
      duration: '32 weeks',
      students: 8765,
      rating: 4.9,
      price: 299,
      instructor: 'Prof. Michael Chen',
      image:
        'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=400&h=300&fit=crop&auto=format',
      tags: ['Mechanics', 'Thermodynamics', 'Electromagnetism'],
    },
    {
      id: 3,
      title: 'English Literature Grade 11',
      description: 'Classic and modern literature analysis and writing',
      category: 'academic',
      subcategory: 'english',
      level: 'Intermediate',
      duration: '28 weeks',
      students: 15234,
      rating: 4.7,
      price: 0,
      instructor: 'Ms. Emily Rodriguez',
      image:
        'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop&auto=format',
      tags: ['Literature', 'Writing', 'Analysis'],
    },

    // University Courses
    {
      id: 4,
      title: 'Computer Science Fundamentals',
      description: 'Introduction to algorithms, data structures, and programming',
      category: 'university',
      subcategory: 'computer-science',
      level: 'Beginner',
      duration: '16 weeks',
      students: 25674,
      rating: 4.9,
      price: 599,
      instructor: 'Dr. Alex Thompson',
      image:
        'https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?w=400&h=300&fit=crop&auto=format',
      tags: ['Algorithms', 'Data Structures', 'Programming'],
    },
    {
      id: 5,
      title: 'Advanced Calculus',
      description: 'Multivariable calculus and differential equations',
      category: 'university',
      subcategory: 'mathematics',
      level: 'Advanced',
      duration: '14 weeks',
      students: 7832,
      rating: 4.6,
      price: 449,
      instructor: 'Prof. Maria Gonzalez',
      image:
        'https://images.unsplash.com/photo-1509228627152-72ae9ae6848d?w=400&h=300&fit=crop&auto=format',
      tags: ['Calculus', 'Differential Equations', 'Analysis'],
    },

    // Medical Courses
    {
      id: 6,
      title: 'Human Anatomy & Physiology',
      description: 'Comprehensive study of human body systems',
      category: 'medical',
      subcategory: 'anatomy',
      level: 'Intermediate',
      duration: '20 weeks',
      students: 18945,
      rating: 4.8,
      price: 799,
      instructor: 'Dr. Jennifer Walsh',
      image:
        'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300&fit=crop&auto=format',
      tags: ['Anatomy', 'Physiology', 'Medical'],
    },
    {
      id: 7,
      title: 'First Aid & CPR Certification',
      description: 'Essential emergency response and life-saving techniques',
      category: 'medical',
      subcategory: 'emergency',
      level: 'Beginner',
      duration: '2 weeks',
      students: 45678,
      rating: 4.9,
      price: 149,
      instructor: 'Paramedic John Davis',
      image:
        'https://images.unsplash.com/photo-1584432810601-6c7f27d2362b?w=400&h=300&fit=crop&auto=format',
      tags: ['First Aid', 'CPR', 'Emergency'],
    },

    // Engineering
    {
      id: 8,
      title: 'Mechanical Engineering Basics',
      description: 'Fundamentals of mechanical systems and design',
      category: 'engineering',
      subcategory: 'mechanical',
      level: 'Beginner',
      duration: '18 weeks',
      students: 12876,
      rating: 4.7,
      price: 699,
      instructor: 'Eng. Robert Kim',
      image:
        'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=400&h=300&fit=crop&auto=format',
      tags: ['Mechanics', 'Design', 'Engineering'],
    },
    {
      id: 9,
      title: 'Electrical Circuit Analysis',
      description: 'Advanced electrical circuits and system design',
      category: 'engineering',
      subcategory: 'electrical',
      level: 'Advanced',
      duration: '16 weeks',
      students: 9543,
      rating: 4.8,
      price: 749,
      instructor: 'Dr. Lisa Park',
      image:
        'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop&auto=format',
      tags: ['Circuits', 'Electronics', 'Electrical'],
    },

    // Programming
    {
      id: 10,
      title: 'Python for Beginners',
      description: 'Learn Python programming from scratch',
      category: 'coding',
      subcategory: 'python',
      level: 'Beginner',
      duration: '12 weeks',
      students: 67890,
      rating: 4.9,
      price: 0,
      instructor: 'Dev. Ahmed Hassan',
      image:
        'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=400&h=300&fit=crop&auto=format',
      tags: ['Python', 'Programming', 'Beginner'],
    },
    {
      id: 11,
      title: 'Full-Stack Web Development',
      description: 'Build complete web applications with React and Node.js',
      category: 'coding',
      subcategory: 'web-development',
      level: 'Intermediate',
      duration: '24 weeks',
      students: 34567,
      rating: 4.8,
      price: 899,
      instructor: 'Dev. Sarah Wilson',
      image:
        'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=400&h=300&fit=crop&auto=format',
      tags: ['React', 'Node.js', 'Full-Stack'],
    },
    {
      id: 12,
      title: 'Machine Learning with TensorFlow',
      description: 'Deep learning and neural networks implementation',
      category: 'coding',
      subcategory: 'ai-ml',
      level: 'Advanced',
      duration: '20 weeks',
      students: 15678,
      rating: 4.7,
      price: 1299,
      instructor: 'Dr. Kevin Zhang',
      image:
        'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=300&fit=crop&auto=format',
      tags: ['Machine Learning', 'TensorFlow', 'AI'],
    },

    // Languages
    {
      id: 13,
      title: 'Spanish for Beginners',
      description: 'Learn conversational Spanish from native speakers',
      category: 'language',
      subcategory: 'spanish',
      level: 'Beginner',
      duration: '16 weeks',
      students: 45123,
      rating: 4.8,
      price: 199,
      instructor: 'Prof. Carlos Mendez',
      image:
        'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=300&fit=crop&auto=format',
      tags: ['Spanish', 'Conversation', 'Language'],
    },
    {
      id: 14,
      title: 'Japanese Language & Culture',
      description: 'Comprehensive Japanese language and cultural immersion',
      category: 'language',
      subcategory: 'japanese',
      level: 'Intermediate',
      duration: '32 weeks',
      students: 23456,
      rating: 4.9,
      price: 499,
      instructor: 'Sensei Yuki Tanaka',
      image:
        'https://images.unsplash.com/photo-1528164344705-47542687000d?w=400&h=300&fit=crop&auto=format',
      tags: ['Japanese', 'Culture', 'Language'],
    },

    // Business & Skills
    {
      id: 15,
      title: 'Digital Marketing Mastery',
      description: 'Complete guide to modern digital marketing strategies',
      category: 'business',
      subcategory: 'marketing',
      level: 'Intermediate',
      duration: '14 weeks',
      students: 38901,
      rating: 4.7,
      price: 399,
      instructor: 'Marketing Expert Jane Smith',
      image:
        'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop&auto=format',
      tags: ['Digital Marketing', 'SEO', 'Social Media'],
    },
    {
      id: 16,
      title: 'Project Management Professional',
      description: 'PMP certification preparation and project management skills',
      category: 'business',
      subcategory: 'management',
      level: 'Advanced',
      duration: '18 weeks',
      students: 12345,
      rating: 4.8,
      price: 799,
      instructor: 'PMP David Brown',
      image:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop&auto=format',
      tags: ['Project Management', 'PMP', 'Leadership'],
    },

    // Arts & Design
    {
      id: 17,
      title: 'Digital Art & Illustration',
      description: 'Create stunning digital artwork using modern tools',
      category: 'arts',
      subcategory: 'digital-art',
      level: 'Beginner',
      duration: '12 weeks',
      students: 29876,
      rating: 4.6,
      price: 299,
      instructor: 'Artist Maya Patel',
      image:
        'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=300&fit=crop&auto=format',
      tags: ['Digital Art', 'Illustration', 'Design'],
    },
    {
      id: 18,
      title: 'UI/UX Design Fundamentals',
      description: 'User interface and experience design principles',
      category: 'arts',
      subcategory: 'ui-ux',
      level: 'Intermediate',
      duration: '16 weeks',
      students: 21098,
      rating: 4.9,
      price: 699,
      instructor: 'UX Designer Tom Lee',
      image:
        'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=300&fit=crop&auto=format',
      tags: ['UI Design', 'UX Design', 'User Experience'],
    },

    // Science & Math
    {
      id: 19,
      title: 'Organic Chemistry',
      description: 'Advanced organic chemistry reactions and mechanisms',
      category: 'science',
      subcategory: 'chemistry',
      level: 'Advanced',
      duration: '20 weeks',
      students: 8765,
      rating: 4.5,
      price: 549,
      instructor: 'Dr. Rachel Green',
      image:
        'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=400&h=300&fit=crop&auto=format',
      tags: ['Chemistry', 'Organic', 'Reactions'],
    },
    {
      id: 20,
      title: 'Statistics & Data Analysis',
      description: 'Statistical methods and data interpretation',
      category: 'science',
      subcategory: 'statistics',
      level: 'Intermediate',
      duration: '14 weeks',
      students: 16789,
      rating: 4.7,
      price: 399,
      instructor: 'Prof. Mark Johnson',
      image:
        'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop&auto=format',
      tags: ['Statistics', 'Data Analysis', 'Math'],
    },
  ];

  const filteredCourses = useMemo(() => {
    return demoCommonCourses.filter((course) => {
      const matchesCategory = selectedCategory === 'all' || course.category === selectedCategory;
      const matchesLevel = selectedLevel === 'all' || course.level === selectedLevel;
      const matchesPrice =
        selectedPrice === 'all' ||
        (selectedPrice === 'free' && course.price === 0) ||
        (selectedPrice === 'paid' && course.price > 0);
      const matchesSearch =
        searchQuery === '' ||
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesCategory && matchesLevel && matchesPrice && matchesSearch;
    });
  }, [selectedCategory, selectedLevel, selectedPrice, searchQuery, demoCommonCourses]);

  const CategoryIcon =
    courseCategories.find((cat) => cat.id === selectedCategory)?.icon || BookOpen;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-fuchsia-500/10 via-violet-500/10 to-cyan-500/10 rounded-xl p-6 border border-white/10">
        <h1 className="text-3xl font-bold mb-2">{t('nav.courses')}</h1>
        <p className="text-muted-foreground">{t('pages.coursesDesc')}</p>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Find Your Perfect Course
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search courses, topics, or instructors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Category</label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {courseCategories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Level</label>
              <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="Beginner">Beginner</SelectItem>
                  <SelectItem value="Intermediate">Intermediate</SelectItem>
                  <SelectItem value="Advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Price</label>
              <Select value={selectedPrice} onValueChange={setSelectedPrice}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Courses</SelectItem>
                  <SelectItem value="free">Free Only</SelectItem>
                  <SelectItem value="paid">Paid Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Community Launched Courses */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Community Launched Courses</h2>
          <span className="text-sm text-muted-foreground">
            {loadingCommunity
              ? 'Loading…'
              : `${communityCourses.length} course${communityCourses.length === 1 ? '' : 's'}`}
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {communityCourses.map((c) => (
            <Card key={c.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="h-32 relative overflow-hidden">
                {c.thumbnail ? (
                  <img src={c.thumbnail} alt={c.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="h-32 bg-gradient-to-br from-emerald-500 to-sky-500" />
                )}
                {(!c.price || c.price === 0) && (
                  <Badge className="absolute top-2 right-2 bg-green-600 hover:bg-green-700">
                    FREE
                  </Badge>
                )}
              </div>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg line-clamp-2">{c.title}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">{c.category || 'General'}</p>
                  </div>
                  {c.level && (
                    <Badge variant="outline" className="ml-2">
                      {c.level}
                    </Badge>
                  )}
                </div>
                {c.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">{c.description}</p>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-lg font-bold">
                    {!c.price || c.price === 0 ? 'Free' : `৳${c.price}`}
                  </div>
                  <Button className="bg-gradient-to-r from-emerald-500 to-sky-500" size="sm">
                    View
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {!loadingCommunity && communityCourses.length === 0 && (
            <Card className="md:col-span-2 lg:col-span-3 xl:col-span-4">
              <CardContent className="p-8 text-center text-muted-foreground">
                No community courses yet. Be the first to launch one!
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CategoryIcon className="w-5 h-5" />
          <span className="font-medium">
            {filteredCourses.length} courses found
            {selectedCategory !== 'all' &&
              ` in ${courseCategories.find((cat) => cat.id === selectedCategory)?.name}`}
          </span>
        </div>
        {(selectedCategory !== 'all' ||
          selectedLevel !== 'all' ||
          selectedPrice !== 'all' ||
          searchQuery) && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedCategory('all');
              setSelectedLevel('all');
              setSelectedPrice('all');
              setSearchQuery('');
            }}
          >
            Clear Filters
          </Button>
        )}
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredCourses.map((course) => (
          <Card key={course.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="h-32 relative overflow-hidden">
              <img
                src={course.image}
                alt={course.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback to gradient if image fails to load
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent) {
                    parent.className =
                      'h-32 bg-gradient-to-br from-fuchsia-500 to-violet-500 flex items-center justify-center relative';
                    const icon = document.createElement('div');
                    icon.innerHTML =
                      '<svg class="h-12 w-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>';
                    parent.appendChild(icon);
                  }
                }}
              />
              {course.price === 0 && (
                <Badge className="absolute top-2 right-2 bg-green-600 hover:bg-green-700">
                  FREE
                </Badge>
              )}
              {course.progress !== undefined && (
                <Badge className="absolute top-2 left-2 bg-blue-600 hover:bg-blue-700">
                  {course.progress}% Complete
                </Badge>
              )}
            </div>

            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg line-clamp-2">{course.title}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">by {course.instructor}</p>
                </div>
                <Badge variant="outline" className="ml-2">
                  {course.level}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">{course.description}</p>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Progress Bar (if enrolled) */}
              {course.progress !== undefined && course.progress > 0 && (
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Progress</span>
                    <span>{course.progress}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-fuchsia-500 to-violet-500 h-2 rounded-full"
                      style={{ width: `${course.progress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Course Stats */}
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{course.duration}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{course.students.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span>{course.rating}</span>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1">
                {course.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>

              {/* Price and Action */}
              <div className="flex items-center justify-between">
                <div className="text-lg font-bold">
                  {course.price === 0 ? 'Free' : `৳${course.price}`}
                </div>
                <Button className="bg-gradient-to-r from-fuchsia-500 to-violet-500" size="sm">
                  {course.progress !== undefined ? 'Continue' : 'Enroll Now'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* No Results */}
      {filteredCourses.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No courses found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search criteria or browse different categories
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSelectedCategory('all');
                setSelectedLevel('all');
                setSelectedPrice('all');
                setSearchQuery('');
              }}
            >
              Clear All Filters
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
