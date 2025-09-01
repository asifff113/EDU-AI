'use client';

import { useState, useEffect } from 'react';
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
import { useAppContext } from '@/contexts/AppContext';
import {
  User,
  Camera,
  Mail,
  Phone,
  MapPin,
  Calendar,
  GraduationCap,
  BookOpen,
  Award,
  Save,
  Edit,
  Star,
  Settings,
  Bell,
  Lock,
  Eye,
  EyeOff,
} from 'lucide-react';

type UserRole = 'student' | 'teacher' | 'qa_solver';

type ProfileData = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  bio?: string;
  location?: string;
  dateOfBirth?: string;
  avatar?: string;
  role: UserRole;
  // Role-specific fields
  studyLevel?: string;
  interests?: string[];
  coursesCompleted?: number;
  subjects?: string[];
  hourlyRate?: number;
  experience?: number;
  qualifications?: string[];
  expertise?: string[];
  solvedQuestions?: number;
  // Stats
  rating: number;
  reviewCount: number;
  joinedDate: string;
  isProfilePublic: boolean;
};

export default function ProfilePage() {
  const { user } = useAppContext();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showPasswordChange, setShowPasswordChange] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      console.log('Fetching profile for user:', user);

      // First check if we're authenticated by testing /auth/me
      const authResponse = await fetch('/api/auth', {
        credentials: 'include',
      });
      console.log('Auth check response:', authResponse.status);

      // Try the test endpoint first to see if API connection works
      const testResponse = await fetch('/api/profile/test', {
        credentials: 'include',
      });
      console.log('Test endpoint response:', testResponse.status);
      if (testResponse.ok) {
        const testData = await testResponse.json();
        console.log('Test data:', testData);
      }

      const response = await fetch('/api/profile', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        console.log('Profile data received:', data);
        setProfileData(data);
      } else {
        const errorText = await response.text();
        console.error('Failed to fetch profile:', response.status, response.statusText, errorText);

        // Show authentication error to user
        if (response.status === 401) {
          console.warn('Authentication failed - you may need to log in again');
        }

        // If user is authenticated, show error and still provide edit functionality
        if (user) {
          // Parse the user name to get firstName and lastName
          const nameParts = user.name.split(' ');
          const firstName = nameParts[0] || 'User';
          const lastName = nameParts.slice(1).join(' ') || '';

          setProfileData({
            id: user.id || 'current-user',
            firstName: firstName,
            lastName: lastName,
            email: 'user@example.com', // We'll get this from the real API later
            role: 'student',
            rating: 0.0,
            reviewCount: 0,
            joinedDate: new Date().toISOString(),
            isProfilePublic: true,
          });
        } else {
          // Fallback mock data
          setProfileData({
            id: 'mock-user',
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com',
            role: 'student',
            rating: 0.0,
            reviewCount: 0,
            joinedDate: new Date().toISOString(),
            isProfilePublic: true,
          });
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);

      // If user is authenticated, use their basic info
      if (user) {
        // Parse the user name to get firstName and lastName
        const nameParts = user.name.split(' ');
        const firstName = nameParts[0] || 'User';
        const lastName = nameParts.slice(1).join(' ') || '';

        setProfileData({
          id: user.id || 'current-user',
          firstName: firstName,
          lastName: lastName,
          email: 'user@example.com', // We'll get this from the real API later
          role: 'student',
          rating: 0.0,
          reviewCount: 0,
          joinedDate: new Date().toISOString(),
          isProfilePublic: true,
        });
      } else {
        // Fallback mock data
        setProfileData({
          id: 'mock-user',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          role: 'student',
          rating: 0.0,
          reviewCount: 0,
          joinedDate: new Date().toISOString(),
          isProfilePublic: true,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!profileData) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(profileData),
      });

      if (response.ok) {
        setIsEditing(false);
        await fetchProfile();
      } else {
        console.error('Failed to save profile');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (file: File) => {
    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const response = await fetch('/api/profile/avatar', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setProfileData((prev) => (prev ? { ...prev, avatar: data.avatarUrl } : null));
      }
    } catch (error) {
      console.error('Error uploading avatar:', error);
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

  if (isLoading || !profileData) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="bg-gray-200 rounded-lg h-64 animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-fuchsia-500/10 via-violet-500/10 to-cyan-500/10 rounded-xl p-6 border border-white/10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Profile</h1>
            <p className="text-muted-foreground">
              Manage your account settings and public profile information
            </p>
            {user && (
              <div className="text-sm text-green-600 mt-2">✅ Logged in as: {user.email}</div>
            )}
          </div>
          <div className="flex gap-2">
            {!isEditing ? (
              <Button
                onClick={() => setIsEditing(true)}
                className="bg-gradient-to-r from-fuchsia-500 to-violet-500"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveProfile}
                  disabled={isLoading}
                  className="bg-gradient-to-r from-emerald-500 to-teal-500"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile">Profile Information</TabsTrigger>
          <TabsTrigger value="settings">Account Settings</TabsTrigger>
          <TabsTrigger value="privacy">Privacy & Security</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          {/* Profile Picture and Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar Section */}
              <div className="flex items-center gap-6">
                <div className="relative">
                  <img
                    src={
                      profileData.avatar ||
                      `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(profileData.firstName + ' ' + profileData.lastName)}&backgroundType=gradientLinear`
                    }
                    alt="Profile"
                    className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                  />
                  {isEditing && (
                    <label className="absolute bottom-0 right-0 bg-primary text-primary-foreground p-2 rounded-full cursor-pointer hover:bg-primary/90 transition-colors">
                      <Camera className="w-4 h-4" />
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageUpload(file);
                        }}
                      />
                    </label>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-2xl font-bold">
                      {profileData.firstName} {profileData.lastName}
                    </h2>
                    <Badge className={getRoleColor(profileData.role)}>
                      {getRoleName(profileData.role)}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span>{profileData.rating}</span>
                      <span>({profileData.reviewCount} reviews)</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>Joined {new Date(profileData.joinedDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">First Name</label>
                  {isEditing ? (
                    <Input
                      value={profileData.firstName}
                      onChange={(e) =>
                        setProfileData({ ...profileData, firstName: e.target.value })
                      }
                    />
                  ) : (
                    <p className="p-2 bg-muted/50 rounded">{profileData.firstName}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Last Name</label>
                  {isEditing ? (
                    <Input
                      value={profileData.lastName}
                      onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                    />
                  ) : (
                    <p className="p-2 bg-muted/50 rounded">{profileData.lastName}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Email</label>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    {isEditing ? (
                      <Input
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      />
                    ) : (
                      <p className="p-2 bg-muted/50 rounded flex-1">{profileData.email}</p>
                    )}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Phone</label>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    {isEditing ? (
                      <Input
                        type="tel"
                        value={profileData.phone || ''}
                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                        placeholder="Enter phone number"
                      />
                    ) : (
                      <p className="p-2 bg-muted/50 rounded flex-1">
                        {profileData.phone || 'Not provided'}
                      </p>
                    )}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Location</label>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    {isEditing ? (
                      <Input
                        value={profileData.location || ''}
                        onChange={(e) =>
                          setProfileData({ ...profileData, location: e.target.value })
                        }
                        placeholder="City, Country"
                      />
                    ) : (
                      <p className="p-2 bg-muted/50 rounded flex-1">
                        {profileData.location || 'Not provided'}
                      </p>
                    )}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Date of Birth</label>
                  {isEditing ? (
                    <Input
                      type="date"
                      value={profileData.dateOfBirth || ''}
                      onChange={(e) =>
                        setProfileData({ ...profileData, dateOfBirth: e.target.value })
                      }
                    />
                  ) : (
                    <p className="p-2 bg-muted/50 rounded">
                      {profileData.dateOfBirth
                        ? new Date(profileData.dateOfBirth).toLocaleDateString()
                        : 'Not provided'}
                    </p>
                  )}
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="text-sm font-medium mb-2 block">Bio</label>
                {isEditing ? (
                  <Textarea
                    value={profileData.bio || ''}
                    onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                    placeholder="Tell others about yourself, your interests, and your goals..."
                    rows={4}
                  />
                ) : (
                  <p className="p-3 bg-muted/50 rounded min-h-[100px]">
                    {profileData.bio || 'No bio provided yet.'}
                  </p>
                )}
              </div>

              {/* Role Selection */}
              <div>
                <label className="text-sm font-medium mb-2 block">Role</label>
                {isEditing ? (
                  <Select
                    value={profileData.role}
                    onValueChange={(value: UserRole) =>
                      setProfileData({ ...profileData, role: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="teacher">Teacher</SelectItem>
                      <SelectItem value="qa_solver">Q&A Solver</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Badge className={getRoleColor(profileData.role)}>
                    {getRoleName(profileData.role)}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Role-specific Information */}
          {profileData.role === 'student' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="w-5 h-5" />
                  Student Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Study Level</label>
                  {isEditing ? (
                    <Select
                      value={profileData.studyLevel || ''}
                      onValueChange={(value) =>
                        setProfileData({ ...profileData, studyLevel: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select study level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high-school">High School</SelectItem>
                        <SelectItem value="university-1">University - 1st Year</SelectItem>
                        <SelectItem value="university-2">University - 2nd Year</SelectItem>
                        <SelectItem value="university-3">University - 3rd Year</SelectItem>
                        <SelectItem value="university-4">University - 4th Year</SelectItem>
                        <SelectItem value="masters">Master's Degree</SelectItem>
                        <SelectItem value="phd">PhD</SelectItem>
                        <SelectItem value="professional">Professional</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="p-2 bg-muted/50 rounded">
                      {profileData.studyLevel || 'Not specified'}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Interests (comma-separated)
                  </label>
                  {isEditing ? (
                    <Input
                      value={profileData.interests?.join(', ') || ''}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          interests: e.target.value.split(', ').filter((i) => i.trim()),
                        })
                      }
                      placeholder="Mathematics, Physics, Programming, etc."
                    />
                  ) : (
                    <div className="flex flex-wrap gap-1">
                      {profileData.interests?.map((interest, index) => (
                        <Badge key={index} variant="secondary">
                          {interest}
                        </Badge>
                      )) || <span className="text-muted-foreground">No interests specified</span>}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {profileData.role === 'teacher' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Teaching Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Subjects (comma-separated)
                  </label>
                  {isEditing ? (
                    <Input
                      value={profileData.subjects?.join(', ') || ''}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          subjects: e.target.value.split(', ').filter((s) => s.trim()),
                        })
                      }
                      placeholder="Mathematics, Physics, Chemistry, etc."
                    />
                  ) : (
                    <div className="flex flex-wrap gap-1">
                      {profileData.subjects?.map((subject, index) => (
                        <Badge key={index} variant="secondary">
                          {subject}
                        </Badge>
                      )) || <span className="text-muted-foreground">No subjects specified</span>}
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Hourly Rate (৳)</label>
                    {isEditing ? (
                      <Input
                        type="number"
                        value={profileData.hourlyRate || ''}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            hourlyRate: parseInt(e.target.value) || 0,
                          })
                        }
                        placeholder="1500"
                      />
                    ) : (
                      <p className="p-2 bg-muted/50 rounded">৳{profileData.hourlyRate || 0}/hour</p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Experience (years)</label>
                    {isEditing ? (
                      <Input
                        type="number"
                        value={profileData.experience || ''}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            experience: parseInt(e.target.value) || 0,
                          })
                        }
                        placeholder="5"
                      />
                    ) : (
                      <p className="p-2 bg-muted/50 rounded">{profileData.experience || 0} years</p>
                    )}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Qualifications (comma-separated)
                  </label>
                  {isEditing ? (
                    <Textarea
                      value={profileData.qualifications?.join(', ') || ''}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          qualifications: e.target.value.split(', ').filter((q) => q.trim()),
                        })
                      }
                      placeholder="PhD in Mathematics, M.Ed in Education, etc."
                      rows={3}
                    />
                  ) : (
                    <div className="flex flex-wrap gap-1">
                      {profileData.qualifications?.map((qual, index) => (
                        <Badge key={index} variant="outline">
                          {qual}
                        </Badge>
                      )) || (
                        <span className="text-muted-foreground">No qualifications specified</span>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {profileData.role === 'qa_solver' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Q&A Solver Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Expertise Areas (comma-separated)
                  </label>
                  {isEditing ? (
                    <Input
                      value={profileData.expertise?.join(', ') || ''}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          expertise: e.target.value.split(', ').filter((e) => e.trim()),
                        })
                      }
                      placeholder="Programming, Mathematics, Physics, etc."
                    />
                  ) : (
                    <div className="flex flex-wrap gap-1">
                      {profileData.expertise?.map((exp, index) => (
                        <Badge key={index} variant="secondary">
                          {exp}
                        </Badge>
                      )) || <span className="text-muted-foreground">No expertise specified</span>}
                    </div>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Questions Solved</label>
                  <p className="p-2 bg-muted/50 rounded">
                    {profileData.solvedQuestions || 0} questions
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Account Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Public Profile</h4>
                  <p className="text-sm text-muted-foreground">
                    Allow others to see your profile in the "All Profiles" section
                  </p>
                </div>
                <Button
                  variant={profileData.isProfilePublic ? 'default' : 'outline'}
                  onClick={() =>
                    setProfileData({
                      ...profileData,
                      isProfilePublic: !profileData.isProfilePublic,
                    })
                  }
                >
                  {profileData.isProfilePublic ? 'Public' : 'Private'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5" />
                Privacy & Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Change Password</h4>
                  <p className="text-sm text-muted-foreground">
                    Update your account password for better security
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setShowPasswordChange(!showPasswordChange)}
                >
                  {showPasswordChange ? (
                    <EyeOff className="w-4 h-4 mr-2" />
                  ) : (
                    <Eye className="w-4 h-4 mr-2" />
                  )}
                  {showPasswordChange ? 'Hide' : 'Change Password'}
                </Button>
              </div>

              {showPasswordChange && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Current Password</label>
                    <Input type="password" placeholder="Enter current password" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">New Password</label>
                    <Input type="password" placeholder="Enter new password" />
                  </div>
                  <div className="md:col-span-2">
                    <Button className="bg-gradient-to-r from-fuchsia-500 to-violet-500">
                      Update Password
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
