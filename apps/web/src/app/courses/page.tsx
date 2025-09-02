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
    <div className="space-y-8">
      {/* Enhanced Header with Educational Theme */}
      <div
        className="relative group bg-gradient-to-r from-blue-500/20 via-indigo-600/15 to-purple-500/20 
        rounded-2xl p-8 border border-blue-500/20 backdrop-blur-xl shadow-2xl shadow-blue-500/10
        hover:shadow-3xl hover:shadow-blue-500/20 transition-all duration-700 transform-gpu
        before:absolute before:inset-0 before:bg-gradient-to-r before:from-blue-500/5 before:to-purple-500/5 
        before:rounded-2xl before:opacity-0 before:transition-opacity before:duration-500 hover:before:opacity-100"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-2xl"></div>
        <div className="relative z-10 flex items-center gap-4">
          <div className="p-4 rounded-2xl bg-blue-500/20 group-hover:bg-blue-400/30 transition-all duration-300 group-hover:rotate-6 group-hover:scale-110 transform-gpu">
            <GraduationCap className="h-8 w-8 text-blue-300 group-hover:text-blue-200" />
          </div>
          <div>
            <h1 className="text-4xl font-bold mb-2 text-white group-hover:text-blue-100 transition-colors duration-300">
              {t('nav.courses')}
            </h1>
            <p className="text-blue-300 group-hover:text-blue-200 transition-colors duration-300 text-lg">
              {t('pages.coursesDesc')}
            </p>
          </div>
        </div>
      </div>

      {/* Enhanced Search and Filters Section */}
      <Card
        className="group relative border-0 bg-gradient-to-br from-green-500/20 via-emerald-600/15 to-teal-600/20 
        backdrop-blur-xl shadow-xl shadow-green-500/20 hover:shadow-2xl hover:shadow-green-500/30 
        transition-all duration-500 hover:scale-[1.01] transform-gpu perspective-1000 
        before:absolute before:inset-0 before:bg-gradient-to-r before:from-green-500/10 before:to-emerald-500/10 
        before:rounded-xl before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-100"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-xl"></div>
        <CardHeader className="relative z-10">
          <CardTitle
            className="text-2xl font-bold text-white group-hover:text-green-200 transition-colors duration-300 
            flex items-center gap-3"
          >
            <div className="p-2 rounded-lg bg-green-500/20 group-hover:bg-green-400/30 transition-all duration-300 group-hover:rotate-6">
              <Search className="w-6 h-6 text-green-300 group-hover:text-green-200" />
            </div>
            Find Your Perfect Course
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 relative z-10">
          {/* Enhanced Search */}
          <div className="relative">
            <Search className="absolute left-4 top-4 h-5 w-5 text-green-300" />
            <Input
              placeholder="Search courses, topics, or instructors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 text-lg bg-white/10 border border-green-500/30 text-white 
                placeholder:text-green-300/60 focus:border-green-400 focus:ring-2 focus:ring-green-500/20 
                transition-all duration-300 backdrop-blur-sm hover:bg-white/15"
            />
          </div>

          {/* Enhanced Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label
                className="text-sm font-semibold text-white group-hover:text-green-200 transition-colors duration-300 
                flex items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                Category
              </label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger
                  className="h-11 bg-white/10 border border-green-500/30 text-white 
                  hover:bg-white/15 focus:border-green-400 focus:ring-2 focus:ring-green-500/20 
                  transition-all duration-300 backdrop-blur-sm"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border border-green-500/30">
                  {courseCategories.map((category) => (
                    <SelectItem
                      key={category.id}
                      value={category.id}
                      className="text-white hover:bg-green-500/20"
                    >
                      <div className="flex items-center gap-2">
                        <category.icon className="h-4 w-4" />
                        {category.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label
                className="text-sm font-semibold text-white group-hover:text-green-200 transition-colors duration-300 
                flex items-center gap-2"
              >
                <GraduationCap className="h-4 w-4" />
                Level
              </label>
              <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                <SelectTrigger
                  className="h-11 bg-white/10 border border-green-500/30 text-white 
                  hover:bg-white/15 focus:border-green-400 focus:ring-2 focus:ring-green-500/20 
                  transition-all duration-300 backdrop-blur-sm"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border border-green-500/30">
                  <SelectItem value="all" className="text-white hover:bg-green-500/20">
                    All Levels
                  </SelectItem>
                  <SelectItem value="Beginner" className="text-white hover:bg-green-500/20">
                    Beginner
                  </SelectItem>
                  <SelectItem value="Intermediate" className="text-white hover:bg-green-500/20">
                    Intermediate
                  </SelectItem>
                  <SelectItem value="Advanced" className="text-white hover:bg-green-500/20">
                    Advanced
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label
                className="text-sm font-semibold text-white group-hover:text-green-200 transition-colors duration-300 
                flex items-center gap-2"
              >
                <Heart className="h-4 w-4" />
                Price
              </label>
              <Select value={selectedPrice} onValueChange={setSelectedPrice}>
                <SelectTrigger
                  className="h-11 bg-white/10 border border-green-500/30 text-white 
                  hover:bg-white/15 focus:border-green-400 focus:ring-2 focus:ring-green-500/20 
                  transition-all duration-300 backdrop-blur-sm"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border border-green-500/30">
                  <SelectItem value="all" className="text-white hover:bg-green-500/20">
                    All Courses
                  </SelectItem>
                  <SelectItem value="free" className="text-white hover:bg-green-500/20">
                    Free Only
                  </SelectItem>
                  <SelectItem value="paid" className="text-white hover:bg-green-500/20">
                    Paid Only
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Community Launched Courses */}
      <div className="space-y-6">
        <div
          className="relative group bg-gradient-to-r from-purple-500/10 via-violet-600/10 to-fuchsia-500/10 
          rounded-xl p-6 border border-purple-500/20 backdrop-blur-sm"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/20 group-hover:bg-purple-400/30 transition-all duration-300 group-hover:rotate-6">
                <Heart className="h-6 w-6 text-purple-300" />
              </div>
              <h2 className="text-2xl font-bold text-white group-hover:text-purple-200 transition-colors duration-300">
                Community Launched Courses
              </h2>
            </div>
            <span className="px-4 py-2 rounded-full bg-purple-500/20 text-purple-200 border border-purple-500/30 backdrop-blur-sm">
              {loadingCommunity
                ? 'Loading…'
                : `${communityCourses.length} course${communityCourses.length === 1 ? '' : 's'}`}
            </span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {communityCourses.map((c, index) => {
            const colors = [
              'from-pink-500/20 to-rose-600/20 shadow-pink-500/15 hover:shadow-pink-500/25 border-pink-400/30',
              'from-cyan-500/20 to-blue-600/20 shadow-cyan-500/15 hover:shadow-cyan-500/25 border-cyan-400/30',
              'from-green-500/20 to-emerald-600/20 shadow-green-500/15 hover:shadow-green-500/25 border-emerald-400/30',
              'from-yellow-500/20 to-orange-600/20 shadow-yellow-500/15 hover:shadow-yellow-500/25 border-yellow-400/30',
              'from-purple-500/20 to-violet-600/20 shadow-purple-500/15 hover:shadow-purple-500/25 border-purple-400/30',
            ];
            const color = colors[index % colors.length];
            return (
              <Card
                key={c.id}
                className={`group relative border-0 overflow-hidden bg-gradient-to-br backdrop-blur-xl 
              hover:scale-105 hover:-translate-y-2 transition-all duration-300 transform-gpu perspective-1000 
              cursor-pointer ${color}`}
              >
                <div className="h-36 relative overflow-hidden">
                  {c.thumbnail ? (
                    <img
                      src={c.thumbnail}
                      alt={c.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <div className="h-36 bg-gradient-to-br from-emerald-500/30 to-sky-500/30 backdrop-blur-sm flex items-center justify-center">
                      <BookOpen className="h-12 w-12 text-white/70" />
                    </div>
                  )}
                  {(!c.price || c.price === 0) && (
                    <Badge
                      className="absolute top-3 right-3 bg-green-600/90 text-white border-green-500/30 
                    hover:bg-green-500 transition-all duration-300 backdrop-blur-sm"
                    >
                      FREE
                    </Badge>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
                </div>
                <CardHeader className="relative z-10">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg line-clamp-2 text-white group-hover:scale-105 transition-transform duration-300">
                        {c.title}
                      </CardTitle>
                      <p className="text-sm text-white/70 mt-1">{c.category || 'General'}</p>
                    </div>
                    {c.level && (
                      <Badge className="ml-2 bg-white/20 text-white border-white/30 hover:bg-white/30 transition-all duration-300">
                        {c.level}
                      </Badge>
                    )}
                  </div>
                  {c.description && (
                    <p className="text-sm text-white/80 line-clamp-2 group-hover:text-white transition-colors duration-300">
                      {c.description}
                    </p>
                  )}
                </CardHeader>
                <CardContent className="space-y-4 relative z-10">
                  <div className="flex items-center justify-between">
                    <div className="text-xl font-bold text-white group-hover:scale-110 transition-transform duration-300">
                      {!c.price || c.price === 0 ? 'Free' : `৳${c.price}`}
                    </div>
                    <Button
                      className="bg-gradient-to-r from-white/20 to-white/30 hover:from-white/30 hover:to-white/40 
                    text-white border border-white/30 hover:border-white/50 transition-all duration-300 
                    hover:scale-110 transform-gpu backdrop-blur-sm"
                      size="sm"
                      variant="outline"
                    >
                      <BookOpen className="h-4 w-4 mr-2" />
                      View
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
          {!loadingCommunity && communityCourses.length === 0 && (
            <Card
              className="md:col-span-2 lg:col-span-3 xl:col-span-4 group relative border-0 bg-gradient-to-br 
              from-gray-500/10 to-slate-600/10 backdrop-blur-xl"
            >
              <CardContent className="p-12 text-center">
                <div className="text-6xl mb-4">🚀</div>
                <div className="text-xl font-semibold text-white mb-2">
                  No community courses yet
                </div>
                <div className="text-white/60">Be the first to launch one and inspire others!</div>
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

      {/* Enhanced Courses Grid with Category-Specific Themes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredCourses.map((course) => {
          // Dynamic color themes based on course category
          const getCategoryTheme = (category: string) => {
            switch (category) {
              case 'academic':
                return 'from-blue-500/20 to-indigo-600/20 shadow-blue-500/15 hover:shadow-blue-500/25 border-blue-400/30';
              case 'university':
                return 'from-purple-500/20 to-violet-600/20 shadow-purple-500/15 hover:shadow-purple-500/25 border-purple-400/30';
              case 'medical':
                return 'from-red-500/20 to-pink-600/20 shadow-red-500/15 hover:shadow-red-500/25 border-red-400/30';
              case 'engineering':
                return 'from-orange-500/20 to-amber-600/20 shadow-orange-500/15 hover:shadow-orange-500/25 border-orange-400/30';
              case 'coding':
                return 'from-green-500/20 to-emerald-600/20 shadow-green-500/15 hover:shadow-green-500/25 border-green-400/30';
              case 'language':
                return 'from-cyan-500/20 to-sky-600/20 shadow-cyan-500/15 hover:shadow-cyan-500/25 border-cyan-400/30';
              case 'business':
                return 'from-yellow-500/20 to-orange-600/20 shadow-yellow-500/15 hover:shadow-yellow-500/25 border-yellow-400/30';
              case 'arts':
                return 'from-pink-500/20 to-rose-600/20 shadow-pink-500/15 hover:shadow-pink-500/25 border-pink-400/30';
              case 'science':
                return 'from-teal-500/20 to-cyan-600/20 shadow-teal-500/15 hover:shadow-teal-500/25 border-teal-400/30';
              default:
                return 'from-gray-500/20 to-slate-600/20 shadow-gray-500/15 hover:shadow-gray-500/25 border-gray-400/30';
            }
          };
          const theme = getCategoryTheme(course.category);
          return (
            <Card
              key={course.id}
              className={`group relative border-0 overflow-hidden bg-gradient-to-br backdrop-blur-xl 
            hover:scale-105 hover:-translate-y-2 transition-all duration-300 transform-gpu perspective-1000 
            cursor-pointer ${theme}`}
            >
              <div className="h-40 relative overflow-hidden">
                <img
                  src={course.image}
                  alt={course.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  onError={(e) => {
                    // Enhanced fallback with category-specific gradient
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      const categoryGradients: { [key: string]: string } = {
                        academic: 'from-blue-500/50 to-indigo-500/50',
                        university: 'from-purple-500/50 to-violet-500/50',
                        medical: 'from-red-500/50 to-pink-500/50',
                        engineering: 'from-orange-500/50 to-amber-500/50',
                        coding: 'from-green-500/50 to-emerald-500/50',
                        language: 'from-cyan-500/50 to-sky-500/50',
                        business: 'from-yellow-500/50 to-orange-500/50',
                        arts: 'from-pink-500/50 to-rose-500/50',
                        science: 'from-teal-500/50 to-cyan-500/50',
                      };
                      const gradient =
                        categoryGradients[course.category] ||
                        'from-fuchsia-500/50 to-violet-500/50';
                      parent.className = `h-40 bg-gradient-to-br ${gradient} backdrop-blur-sm flex items-center justify-center relative`;
                      const icon = document.createElement('div');
                      icon.innerHTML =
                        '<svg class="h-16 w-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>';
                      parent.appendChild(icon);
                    }
                  }}
                />
                {course.price === 0 && (
                  <Badge
                    className="absolute top-3 right-3 bg-green-600/90 text-white border-green-500/30 
                  hover:bg-green-500 transition-all duration-300 backdrop-blur-sm hover:scale-110"
                  >
                    FREE
                  </Badge>
                )}
                {course.progress !== undefined && (
                  <Badge
                    className="absolute top-3 left-3 bg-blue-600/90 text-white border-blue-500/30 
                  hover:bg-blue-500 transition-all duration-300 backdrop-blur-sm hover:scale-110"
                  >
                    {course.progress}% Complete
                  </Badge>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
              </div>

              <CardHeader className="relative z-10">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg line-clamp-2 text-white font-bold group-hover:scale-105 transition-transform duration-300">
                      {course.title}
                    </CardTitle>
                    <p className="text-sm text-white/70 mt-1">by {course.instructor}</p>
                  </div>
                  <Badge className="ml-2 bg-white/20 text-white border-white/30 hover:bg-white/30 transition-all duration-300">
                    {course.level}
                  </Badge>
                </div>
                <p className="text-sm text-white/80 line-clamp-2 group-hover:text-white transition-colors duration-300">
                  {course.description}
                </p>
              </CardHeader>

              <CardContent className="space-y-4 relative z-10">
                {/* Enhanced Progress Bar (if enrolled) */}
                {course.progress !== undefined && course.progress > 0 && (
                  <div className="p-3 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20">
                    <div className="flex justify-between text-sm mb-2 text-white">
                      <span className="font-medium">Progress</span>
                      <span className="font-bold">{course.progress}%</span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-green-400 to-emerald-500 h-3 rounded-full transition-all duration-300 
                        shadow-lg shadow-green-500/25"
                        style={{ width: `${course.progress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Enhanced Course Stats */}
                <div className="grid grid-cols-3 gap-2 p-3 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20">
                  <div className="flex flex-col items-center gap-1 text-center">
                    <Clock className="h-4 w-4 text-white/70" />
                    <span className="text-xs text-white font-medium">{course.duration}</span>
                  </div>
                  <div className="flex flex-col items-center gap-1 text-center">
                    <Users className="h-4 w-4 text-white/70" />
                    <span className="text-xs text-white font-medium">
                      {course.students.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex flex-col items-center gap-1 text-center">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs text-white font-medium">{course.rating}</span>
                  </div>
                </div>

                {/* Enhanced Tags */}
                <div className="flex flex-wrap gap-2">
                  {course.tags.slice(0, 3).map((tag) => (
                    <Badge
                      key={tag}
                      className="text-xs bg-white/20 text-white border-white/30 hover:bg-white/30 
                    transition-all duration-300 hover:scale-105"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>

                {/* Enhanced Price and Action */}
                <div className="flex items-center justify-between pt-2">
                  <div className="text-2xl font-bold text-white group-hover:scale-110 transition-transform duration-300">
                    {course.price === 0 ? 'Free' : `৳${course.price}`}
                  </div>
                  <Button
                    className="bg-gradient-to-r from-white/20 to-white/30 hover:from-white/30 hover:to-white/40 
                  text-white border border-white/30 hover:border-white/50 transition-all duration-300 
                  hover:scale-110 transform-gpu backdrop-blur-sm"
                    size="sm"
                    variant="outline"
                  >
                    <BookOpen className="h-4 w-4 mr-2" />
                    {course.progress !== undefined ? 'Continue' : 'Enroll'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Enhanced No Results */}
      {filteredCourses.length === 0 && (
        <Card
          className="group relative border-0 bg-gradient-to-br from-gray-500/10 to-slate-600/10 
          backdrop-blur-xl shadow-xl"
        >
          <CardContent className="p-16 text-center">
            <div className="text-6xl mb-6">📚</div>
            <BookOpen className="w-20 h-20 mx-auto mb-6 text-white/60 group-hover:text-white/80 transition-colors duration-300" />
            <h3 className="text-2xl font-bold mb-4 text-white">No courses found</h3>
            <p className="text-white/70 mb-8 max-w-md mx-auto text-lg">
              Try adjusting your search criteria or browse different categories to discover amazing
              learning opportunities
            </p>
            <Button
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 
                text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300 
                hover:scale-105 transform-gpu"
              onClick={() => {
                setSelectedCategory('all');
                setSelectedLevel('all');
                setSelectedPrice('all');
                setSearchQuery('');
              }}
            >
              <Search className="h-4 w-4 mr-2" />
              Clear All Filters
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
