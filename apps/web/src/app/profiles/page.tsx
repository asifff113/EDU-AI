'use client';

import { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { useRouter } from 'next/navigation';
import {
  Search,
  Filter,
  User,
  GraduationCap,
  BookOpen,
  HelpCircle,
  MessageCircle,
  Phone,
  Video,
  Star,
  MapPin,
  Clock,
  Award,
  Users,
} from 'lucide-react';

type UserRole = 'student' | 'teacher' | 'qa_solver';

type Profile = {
  id: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  avatar: string;
  bio: string;
  location: string;
  rating: number;
  reviewCount: number;
  isOnline: boolean;
  joinedDate: string;
  // Teacher specific
  subjects?: string[];
  hourlyRate?: number;
  experience?: number;
  qualifications?: string[];
  // QA Solver specific
  expertise?: string[];
  solvedQuestions?: number;
  // Student specific
  studyLevel?: string;
  interests?: string[];
  coursesCompleted?: number;
};

const profileCategories = [
  { id: 'all', name: 'All Profiles', icon: Users },
  { id: 'student', name: 'Students', icon: User },
  { id: 'teacher', name: 'Teachers', icon: GraduationCap },
  { id: 'qa_solver', name: 'Q&A Solvers', icon: HelpCircle },
];

export default function AllProfilesPage() {
  const { t } = useTranslation('common');
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('rating');
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    try {
      setIsLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

      try {
        const response = await fetch(`${apiUrl}/profile/public`, {
          credentials: 'include',
        });
        if (response.ok) {
          const apiProfiles = await response.json();
          if (Array.isArray(apiProfiles) && apiProfiles.length > 0) {
            // Merge API profiles with demo profiles for better visuals
            // Add avatar URLs to API profiles
            const enhancedApiProfiles = apiProfiles.map((profile, index) => ({
              ...profile,
              avatar: profile.avatar || getDemoAvatar(index),
            }));

            // Add a few demo profiles to supplement for visual demonstration
            const supplementaryDemoProfiles = demoProfiles.slice(
              0,
              Math.max(0, 8 - apiProfiles.length),
            );
            const combinedProfiles = [...enhancedApiProfiles, ...supplementaryDemoProfiles];
            setProfiles(combinedProfiles);
            console.log(
              `Loaded ${apiProfiles.length} real users + ${supplementaryDemoProfiles.length} demo profiles`,
            );
          } else {
            // No API profiles, use demo profiles
            setProfiles(demoProfiles);
            console.log('No API profiles found, using demo profiles');
          }
        } else {
          // API failed, use demo profiles
          setProfiles(demoProfiles);
          console.log('API failed, using demo profiles');
        }
      } catch (apiError) {
        // API not available, use demo profiles
        setProfiles(demoProfiles);
        console.log('API not available, using demo profiles with real human pictures');
      }
    } catch (error) {
      console.error('Error loading profiles:', error);
      setProfiles(demoProfiles);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to get demo avatars for API profiles
  const getDemoAvatar = (index: number) => {
    const avatars = [
      'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=200&h=200&fit=crop&auto=format&q=80',
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&auto=format&q=80',
      'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop&auto=format&q=80',
      'https://images.unsplash.com/photo-1566492031773-4f4e44671d66?w=200&h=200&fit=crop&auto=format&q=80',
      'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=200&h=200&fit=crop&auto=format&q=80',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&auto=format&q=80',
      'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=200&h=200&fit=crop&auto=format&q=80',
      'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&h=200&fit=crop&auto=format&q=80',
    ];
    return avatars[index % avatars.length];
  };

  // Demo profiles data
  const demoProfiles: Profile[] = [
    // Teachers
    {
      id: 'demo-1',
      firstName: 'Sarah',
      lastName: 'Johnson',
      role: 'teacher',
      avatar:
        'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=200&h=200&fit=crop&auto=format&q=80',
      bio: 'Experienced mathematics teacher with 15+ years in education. Specializing in advanced calculus and algebra.',
      location: 'Dhaka, Bangladesh',
      rating: 4.9,
      reviewCount: 127,
      isOnline: true,
      joinedDate: '2020-03-15',
      subjects: ['Mathematics', 'Calculus', 'Algebra', 'Statistics'],
      hourlyRate: 1500,
      experience: 15,
      qualifications: ['PhD in Mathematics', 'M.Ed in Education', 'B.Sc in Mathematics'],
    },
    {
      id: '2',
      firstName: 'Prof. Michael',
      lastName: 'Chen',
      role: 'teacher',
      avatar:
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&auto=format&q=80',
      bio: 'Physics professor and researcher. Passionate about making complex physics concepts easy to understand.',
      location: 'Chittagong, Bangladesh',
      rating: 4.8,
      reviewCount: 89,
      isOnline: false,
      joinedDate: '2019-08-22',
      subjects: ['Physics', 'Quantum Mechanics', 'Thermodynamics', 'Electromagnetism'],
      hourlyRate: 1800,
      experience: 12,
      qualifications: ['PhD in Physics', 'M.Sc in Applied Physics'],
    },
    {
      id: '3',
      firstName: 'Ms. Emily',
      lastName: 'Rodriguez',
      role: 'teacher',
      avatar:
        'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop&auto=format&q=80',
      bio: 'English literature enthusiast with expertise in creative writing and literary analysis.',
      location: 'Sylhet, Bangladesh',
      rating: 4.7,
      reviewCount: 156,
      isOnline: true,
      joinedDate: '2021-01-10',
      subjects: ['English Literature', 'Creative Writing', 'Grammar', 'Essay Writing'],
      hourlyRate: 1200,
      experience: 8,
      qualifications: ['M.A in English Literature', 'B.A in English'],
    },

    // Q&A Solvers
    {
      id: '4',
      firstName: 'Ahmed',
      lastName: 'Hassan',
      role: 'qa_solver',
      avatar:
        'https://images.unsplash.com/photo-1566492031773-4f4e44671d66?w=200&h=200&fit=crop&auto=format&q=80',
      bio: 'Computer Science expert specializing in programming and algorithm problems. Quick and accurate solutions.',
      location: 'Dhaka, Bangladesh',
      rating: 4.9,
      reviewCount: 234,
      isOnline: true,
      joinedDate: '2020-11-05',
      expertise: ['Programming', 'Algorithms', 'Data Structures', 'Web Development'],
      solvedQuestions: 1247,
    },
    {
      id: '5',
      firstName: 'Dr. Fatima',
      lastName: 'Khan',
      role: 'qa_solver',
      avatar:
        'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=200&h=200&fit=crop&auto=format&q=80',
      bio: 'Mathematics and statistics expert. Helping students with complex mathematical problems for 5+ years.',
      location: 'Rajshahi, Bangladesh',
      rating: 4.8,
      reviewCount: 178,
      isOnline: false,
      joinedDate: '2019-06-18',
      expertise: ['Mathematics', 'Statistics', 'Calculus', 'Linear Algebra'],
      solvedQuestions: 892,
    },
    {
      id: '6',
      firstName: 'Rashid',
      lastName: 'Ahmed',
      role: 'qa_solver',
      avatar:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&auto=format&q=80',
      bio: 'Chemistry specialist with extensive knowledge in organic and inorganic chemistry. Lab experience included.',
      location: 'Khulna, Bangladesh',
      rating: 4.6,
      reviewCount: 95,
      isOnline: true,
      joinedDate: '2021-09-12',
      expertise: ['Chemistry', 'Organic Chemistry', 'Biochemistry', 'Lab Techniques'],
      solvedQuestions: 456,
    },

    // Students
    {
      id: '7',
      firstName: 'Nadia',
      lastName: 'Islam',
      role: 'student',
      avatar:
        'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=200&h=200&fit=crop&auto=format&q=80',
      bio: 'Computer Science student passionate about AI and machine learning. Always eager to learn new technologies.',
      location: 'Dhaka, Bangladesh',
      rating: 4.5,
      reviewCount: 23,
      isOnline: true,
      joinedDate: '2022-02-14',
      studyLevel: 'University - 3rd Year',
      interests: ['Programming', 'AI/ML', 'Web Development', 'Data Science'],
      coursesCompleted: 12,
    },
    {
      id: '8',
      firstName: 'Karim',
      lastName: 'Rahman',
      role: 'student',
      avatar:
        'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&h=200&fit=crop&auto=format&q=80',
      bio: 'Medical student interested in surgery and patient care. Active in study groups and peer learning.',
      location: 'Chittagong, Bangladesh',
      rating: 4.3,
      reviewCount: 18,
      isOnline: false,
      joinedDate: '2021-08-30',
      studyLevel: 'Medical College - 2nd Year',
      interests: ['Medicine', 'Surgery', 'Anatomy', 'Physiology'],
      coursesCompleted: 8,
    },
    {
      id: '9',
      firstName: 'Sadia',
      lastName: 'Begum',
      role: 'student',
      avatar:
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&auto=format&q=80',
      bio: 'Business administration student with focus on marketing and entrepreneurship. Future business leader.',
      location: 'Sylhet, Bangladesh',
      rating: 4.4,
      reviewCount: 31,
      isOnline: true,
      joinedDate: '2022-01-20',
      studyLevel: 'University - 2nd Year',
      interests: ['Business', 'Marketing', 'Entrepreneurship', 'Finance'],
      coursesCompleted: 15,
    },
    {
      id: '10',
      firstName: 'Tanvir',
      lastName: 'Hasan',
      role: 'student',
      avatar:
        'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=200&h=200&fit=crop&auto=format&q=80',
      bio: 'High school student preparing for university entrance. Strong in mathematics and sciences.',
      location: 'Barisal, Bangladesh',
      rating: 4.2,
      reviewCount: 12,
      isOnline: true,
      joinedDate: '2023-03-10',
      studyLevel: 'High School - Grade 12',
      interests: ['Mathematics', 'Physics', 'Chemistry', 'Engineering'],
      coursesCompleted: 6,
    },

    // Additional diverse profiles with real human pictures
    {
      id: '11',
      firstName: 'Maria',
      lastName: 'Garcia',
      role: 'teacher',
      avatar:
        'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop&auto=format&q=80',
      bio: 'Spanish language instructor with native fluency. Passionate about teaching language and culture.',
      location: 'Dhaka, Bangladesh',
      rating: 4.8,
      reviewCount: 92,
      isOnline: true,
      joinedDate: '2020-05-15',
      subjects: ['Spanish', 'Language Arts', 'Cultural Studies', 'Communication'],
      hourlyRate: 1400,
      experience: 10,
      qualifications: ['M.A in Spanish Literature', 'TESOL Certification'],
    },
    {
      id: '12',
      firstName: 'David',
      lastName: 'Kim',
      role: 'qa_solver',
      avatar:
        'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&h=200&fit=crop&auto=format&q=80',
      bio: 'Software engineer specializing in full-stack development and system design. Quick problem solver.',
      location: 'Chittagong, Bangladesh',
      rating: 4.9,
      reviewCount: 156,
      isOnline: true,
      joinedDate: '2021-02-20',
      expertise: ['JavaScript', 'React', 'Node.js', 'System Design', 'Algorithms'],
      solvedQuestions: 890,
    },
    {
      id: '13',
      firstName: 'Amira',
      lastName: 'Hassan',
      role: 'student',
      avatar:
        'https://images.unsplash.com/photo-1594736797933-d0400e808744?w=200&h=200&fit=crop&auto=format&q=80',
      bio: 'Pre-med student with strong background in biology and chemistry. Aspiring doctor.',
      location: 'Sylhet, Bangladesh',
      rating: 4.6,
      reviewCount: 34,
      isOnline: false,
      joinedDate: '2022-09-10',
      studyLevel: 'University - 3rd Year',
      interests: ['Biology', 'Chemistry', 'Medicine', 'Research'],
      coursesCompleted: 18,
    },
    {
      id: '14',
      firstName: 'James',
      lastName: 'Wilson',
      role: 'teacher',
      avatar:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&auto=format&q=80',
      bio: 'History professor specializing in world history and social studies. Engaging storyteller.',
      location: 'Rajshahi, Bangladesh',
      rating: 4.7,
      reviewCount: 78,
      isOnline: true,
      joinedDate: '2019-11-30',
      subjects: ['History', 'Social Studies', 'Political Science', 'Geography'],
      hourlyRate: 1600,
      experience: 14,
      qualifications: ['PhD in History', 'M.A in Political Science'],
    },
    {
      id: '15',
      firstName: 'Priya',
      lastName: 'Sharma',
      role: 'qa_solver',
      avatar:
        'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop&auto=format&q=80',
      bio: 'Data scientist with expertise in machine learning and statistical analysis. Research enthusiast.',
      location: 'Dhaka, Bangladesh',
      rating: 4.8,
      reviewCount: 124,
      isOnline: true,
      joinedDate: '2020-08-12',
      expertise: ['Data Science', 'Machine Learning', 'Python', 'Statistics', 'AI'],
      solvedQuestions: 645,
    },
  ];

  const filteredProfiles = useMemo(() => {
    // Ensure profiles is always an array
    const profilesArray = Array.isArray(profiles) ? profiles : [];
    const filtered = profilesArray.filter((profile) => {
      const matchesCategory = selectedCategory === 'all' || profile.role === selectedCategory;
      const fullName = `${profile.firstName} ${profile.lastName}`;
      const matchesSearch =
        searchQuery === '' ||
        fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        profile.bio.toLowerCase().includes(searchQuery.toLowerCase()) ||
        profile.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        profile.subjects?.some((subject) =>
          subject.toLowerCase().includes(searchQuery.toLowerCase()),
        ) ||
        profile.expertise?.some((exp) => exp.toLowerCase().includes(searchQuery.toLowerCase())) ||
        profile.interests?.some((int) => int.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesCategory && matchesSearch;
    });

    // Sort profiles
    switch (sortBy) {
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'reviews':
        filtered.sort((a, b) => b.reviewCount - a.reviewCount);
        break;
      case 'name':
        filtered.sort((a, b) =>
          `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`),
        );
        break;
      case 'online':
        filtered.sort((a, b) => (b.isOnline ? 1 : 0) - (a.isOnline ? 1 : 0));
        break;
    }

    return filtered;
  }, [selectedCategory, searchQuery, sortBy, profiles]);

  const CategoryIcon = profileCategories.find((cat) => cat.id === selectedCategory)?.icon || Users;

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'teacher':
        return GraduationCap;
      case 'qa_solver':
        return HelpCircle;
      case 'student':
        return User;
      default:
        return User;
    }
  };

  const getRoleName = (role: UserRole) => {
    switch (role) {
      case 'teacher':
        return 'Teacher';
      case 'qa_solver':
        return 'Q&A Solver';
      case 'student':
        return 'Student';
      default:
        return 'User';
    }
  };

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case 'teacher':
        return 'bg-blue-100 text-blue-800';
      case 'qa_solver':
        return 'bg-green-100 text-green-800';
      case 'student':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6 relative">
      {/* Ambient gradient glows */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-fuchsia-500/20 blur-3xl"></div>
        <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-cyan-500/20 blur-3xl"></div>
      </div>
      {/* Header - Vibrant Purple/Pink Card */}
      <div className="group perspective-1000">
        <div className="relative overflow-hidden bg-gradient-to-br from-purple-600/20 via-pink-500/15 to-rose-400/20 rounded-xl p-6 border border-purple-400/30 shadow-xl backdrop-blur-sm transition-all duration-500 hover:scale-[1.02] hover:rotate-1 hover:shadow-2xl hover:shadow-purple-500/25 transform-gpu">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500"></div>
          <div className="relative">
            <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-purple-400 via-pink-400 to-rose-400 bg-clip-text text-transparent">
              {t('pages.profilesTitle')}
            </h1>
            <p className="text-purple-200/80">{t('pages.profilesDesc')}</p>
          </div>
        </div>
      </div>

      {/* Search and Filters - Cyan/Teal Card */}
      <div className="group perspective-1000">
        <Card className="relative overflow-hidden bg-gradient-to-br from-cyan-500/20 via-teal-400/15 to-emerald-500/20 backdrop-blur-xl border border-cyan-400/30 shadow-xl transition-all duration-500 hover:scale-[1.01] hover:-rotate-1 hover:shadow-2xl hover:shadow-cyan-500/25 transform-gpu">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-500"></div>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent">
              <Filter className="w-5 h-5 text-cyan-400" />
              Find People
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-cyan-400" />
              <Input
                placeholder="Search by name, bio, subjects, or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-cyan-500/10 border-cyan-400/30 focus:border-cyan-400 text-cyan-100 placeholder:text-cyan-300/60"
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
                    {profileCategories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
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
                    <SelectItem value="rating">Highest Rating</SelectItem>
                    <SelectItem value="reviews">Most Reviews</SelectItem>
                    <SelectItem value="name">Name (A-Z)</SelectItem>
                    <SelectItem value="online">Online First</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedCategory('all');
                    setSearchQuery('');
                    setSortBy('rating');
                  }}
                  className="w-full"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Results Summary - Orange/Yellow Card */}
      <div className="group perspective-1000">
        <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-br from-orange-500/20 via-amber-400/15 to-yellow-500/20 border border-orange-400/30 shadow-lg backdrop-blur-sm transition-all duration-500 hover:scale-[1.01] hover:rotate-0.5 hover:shadow-xl hover:shadow-orange-500/20 transform-gpu">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-yellow-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl"></div>
          <div className="flex items-center gap-2 relative">
            <CategoryIcon className="w-5 h-5 text-orange-400" />
            <span className="font-medium bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-400 bg-clip-text text-transparent">
              {filteredProfiles.length} profiles found
              {selectedCategory !== 'all' &&
                ` in ${profileCategories.find((cat) => cat.id === selectedCategory)?.name}`}
            </span>
          </div>
        </div>
      </div>

      {/* Profiles Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <Card key={index} className="overflow-hidden">
              <CardHeader className="pb-4">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-full animate-pulse"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-3 bg-gray-200 rounded w-4/5 animate-pulse"></div>
                  <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProfiles.map((profile, index) => {
            const RoleIcon = getRoleIcon(profile.role);
            // Cycle through different color themes for each profile card
            const colorThemes = [
              {
                bg: 'from-blue-500/15 via-indigo-400/10 to-purple-500/15',
                border: 'border-blue-400/30',
                shadow: 'hover:shadow-blue-500/25',
                ring: 'hover:ring-blue-400/40',
                top: 'from-blue-500 via-indigo-500 to-purple-500',
              },
              {
                bg: 'from-emerald-500/15 via-green-400/10 to-teal-500/15',
                border: 'border-emerald-400/30',
                shadow: 'hover:shadow-emerald-500/25',
                ring: 'hover:ring-emerald-400/40',
                top: 'from-emerald-500 via-green-500 to-teal-500',
              },
              {
                bg: 'from-rose-500/15 via-pink-400/10 to-red-500/15',
                border: 'border-rose-400/30',
                shadow: 'hover:shadow-rose-500/25',
                ring: 'hover:ring-rose-400/40',
                top: 'from-rose-500 via-pink-500 to-red-500',
              },
              {
                bg: 'from-violet-500/15 via-purple-400/10 to-fuchsia-500/15',
                border: 'border-violet-400/30',
                shadow: 'hover:shadow-violet-500/25',
                ring: 'hover:ring-violet-400/40',
                top: 'from-violet-500 via-purple-500 to-fuchsia-500',
              },
              {
                bg: 'from-cyan-500/15 via-sky-400/10 to-blue-500/15',
                border: 'border-cyan-400/30',
                shadow: 'hover:shadow-cyan-500/25',
                ring: 'hover:ring-cyan-400/40',
                top: 'from-cyan-500 via-sky-500 to-blue-500',
              },
              {
                bg: 'from-orange-500/15 via-amber-400/10 to-yellow-500/15',
                border: 'border-orange-400/30',
                shadow: 'hover:shadow-orange-500/25',
                ring: 'hover:ring-orange-400/40',
                top: 'from-orange-500 via-amber-500 to-yellow-500',
              },
            ];
            const theme = colorThemes[index % colorThemes.length];
            return (
              <div key={profile.id} className="group perspective-1000">
                <Card
                  className={`relative overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:rotate-1 hover:shadow-2xl ring-1 ring-white/10 hover:ring-2 ${theme.ring} bg-gradient-to-br ${theme.bg} ${theme.border} ${theme.shadow} backdrop-blur-xl transform-gpu`}
                >
                  <div
                    className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${theme.top} opacity-70 group-hover:opacity-100 transition-opacity`}
                  ></div>
                  <CardHeader className="pb-4">
                    <div className="flex items-start gap-4">
                      <div className="relative [transform:perspective(1000px)] group/avatar">
                        {/* Enhanced Avatar with Gradient Border and Glow */}
                        <div className="relative p-1 rounded-full bg-gradient-to-br from-white/20 via-white/10 to-transparent shadow-2xl">
                          <div className="relative p-0.5 rounded-full bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 group-hover/avatar:from-cyan-400 group-hover/avatar:via-violet-400 group-hover/avatar:to-rose-400 transition-all duration-500">
                            <img
                              src={
                                profile.avatar ||
                                `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(profile.firstName + ' ' + profile.lastName)}&backgroundType=gradientLinear&backgroundColor=3b82f6,8b5cf6,ec4899,06b6d4,10b981`
                              }
                              alt={`${profile.firstName} ${profile.lastName}`}
                              className="w-20 h-20 rounded-full object-cover shadow-xl transition-all duration-500 [transform:translateZ(0)] group-hover:[transform:rotateY(8deg)_rotateX(3deg)_translateZ(8px)] group-hover/avatar:scale-105 border-2 border-white/20"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(profile.firstName + ' ' + profile.lastName)}&backgroundColor=3b82f6,8b5cf6,ec4899,06b6d4,10b981`;
                              }}
                            />
                          </div>
                          {/* Animated Glow Effect */}
                          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-400/20 via-purple-400/20 to-pink-400/20 blur-md opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-500 animate-pulse"></div>
                        </div>
                        {/* Enhanced Online Status */}
                        {profile.isOnline && (
                          <div className="absolute -bottom-1 -right-1 flex items-center justify-center">
                            <div className="w-6 h-6 bg-green-500 border-3 border-white rounded-full shadow-lg animate-pulse"></div>
                            <div className="absolute w-6 h-6 bg-green-400 rounded-full animate-ping opacity-30"></div>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold truncate">
                            {profile.firstName} {profile.lastName}
                          </h3>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={getRoleColor(profile.role)}>
                            <RoleIcon className="w-3 h-3 mr-1" />
                            {getRoleName(profile.role)}
                          </Badge>
                          {profile.isOnline && (
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                              Online
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
                          <MapPin className="w-3 h-3" />
                          <span className="truncate">{profile.location}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium">{profile.rating}</span>
                          <span className="text-sm text-muted-foreground">
                            ({profile.reviewCount} reviews)
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Bio */}
                    <p className="text-sm text-muted-foreground line-clamp-3">{profile.bio}</p>

                    {/* Role-specific information */}
                    {profile.role === 'teacher' && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Rate:</span>
                          <span className="font-medium">৳{profile.hourlyRate}/hour</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Experience:</span>
                          <span className="font-medium">{profile.experience} years</span>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground mb-2">Subjects:</p>
                          <div className="flex flex-wrap gap-1">
                            {profile.subjects?.slice(0, 3).map((subject) => (
                              <Badge key={subject} variant="outline" className="text-xs">
                                {subject}
                              </Badge>
                            ))}
                            {profile.subjects && profile.subjects.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{profile.subjects.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {profile.role === 'qa_solver' && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Questions Solved:</span>
                          <span className="font-medium">{profile.solvedQuestions}</span>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground mb-2">Expertise:</p>
                          <div className="flex flex-wrap gap-1">
                            {profile.expertise?.slice(0, 3).map((exp) => (
                              <Badge key={exp} variant="outline" className="text-xs">
                                {exp}
                              </Badge>
                            ))}
                            {profile.expertise && profile.expertise.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{profile.expertise.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {profile.role === 'student' && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Study Level:</span>
                          <span className="font-medium text-xs">{profile.studyLevel}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Courses Completed:</span>
                          <span className="font-medium">{profile.coursesCompleted}</span>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground mb-2">Interests:</p>
                          <div className="flex flex-wrap gap-1">
                            {profile.interests?.slice(0, 3).map((interest) => (
                              <Badge key={interest} variant="outline" className="text-xs">
                                {interest}
                              </Badge>
                            ))}
                            {profile.interests && profile.interests.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{profile.interests.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        className="flex-1 bg-gradient-to-r from-fuchsia-500 to-violet-500"
                        onClick={() => router.push(`/chat?u=${profile.id}`)}
                      >
                        <MessageCircle className="w-4 h-4 mr-1" />
                        Chat
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => router.push(`/chat?u=${profile.id}&call=audio`)}
                      >
                        <Phone className="w-4 h-4 mr-1" />
                        Call
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => router.push(`/chat?u=${profile.id}&call=video`)}
                      >
                        <Video className="w-4 h-4 mr-1" />
                        Video
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      )}

      {/* No Results */}
      {!isLoading && filteredProfiles.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No profiles found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search criteria or browse different categories
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSelectedCategory('all');
                setSearchQuery('');
                setSortBy('rating');
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
