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
      const response = await fetch('/api/profiles', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setProfiles(data);
      } else {
        console.error('Failed to fetch profiles');
        // Fallback to demo data on error
        setProfiles(demoProfiles);
      }
    } catch (error) {
      console.error('Error fetching profiles:', error);
      // Fallback to demo data on error
      setProfiles(demoProfiles);
    } finally {
      setIsLoading(false);
    }
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
        'https://images.unsplash.com/photo-1494790108755-2616c6286ca8?w=150&h=150&fit=crop&auto=format',
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
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&auto=format',
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
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&auto=format',
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
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&auto=format',
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
        'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&auto=format',
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
        'https://images.unsplash.com/photo-1566492031773-4f4e44671d66?w=150&h=150&fit=crop&auto=format',
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
      id: 7,
      name: 'Nadia Islam',
      role: 'student',
      avatar:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&auto=format',
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
      id: 8,
      name: 'Karim Rahman',
      role: 'student',
      avatar:
        'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&h=150&fit=crop&auto=format',
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
      id: 9,
      name: 'Sadia Begum',
      role: 'student',
      avatar:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&auto=format',
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
      id: 10,
      name: 'Tanvir Hasan',
      role: 'student',
      avatar:
        'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=150&h=150&fit=crop&auto=format',
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
  ];

  const filteredProfiles = useMemo(() => {
    let filtered = profiles.filter((profile) => {
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
        filtered.sort((a, b) => a.name.localeCompare(b.name));
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
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-fuchsia-500/10 via-violet-500/10 to-cyan-500/10 rounded-xl p-6 border border-white/10">
        <h1 className="text-3xl font-bold mb-2">{t('pages.profilesTitle')}</h1>
        <p className="text-muted-foreground">{t('pages.profilesDesc')}</p>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Find People
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, bio, subjects, or location..."
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

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CategoryIcon className="w-5 h-5" />
          <span className="font-medium">
            {filteredProfiles.length} profiles found
            {selectedCategory !== 'all' &&
              ` in ${profileCategories.find((cat) => cat.id === selectedCategory)?.name}`}
          </span>
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
          {filteredProfiles.map((profile) => {
            const RoleIcon = getRoleIcon(profile.role);
            return (
              <Card key={profile.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex items-start gap-4">
                    <div className="relative">
                      <img
                        src={
                          profile.avatar ||
                          `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(profile.firstName + ' ' + profile.lastName)}&backgroundType=gradientLinear`
                        }
                        alt={`${profile.firstName} ${profile.lastName}`}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                      {profile.isOnline && (
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full"></div>
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
