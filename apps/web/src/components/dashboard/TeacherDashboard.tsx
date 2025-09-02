'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  BookOpen,
  Calendar,
  TrendingUp,
  MessageSquare,
  FileText,
  Award,
  Clock,
  Plus,
  Eye,
  Star,
  DollarSign,
} from 'lucide-react';

interface TeacherDashboardProps {
  userName: string;
}

export function TeacherDashboard({ userName }: TeacherDashboardProps) {
  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="relative bg-gradient-to-r from-violet-600/15 via-fuchsia-600/10 to-cyan-600/15 rounded-xl p-6 border border-white/10 overflow-hidden">
        <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-violet-600/0 via-fuchsia-600/0 to-cyan-600/0 blur-lg" />
        <h1 className="relative text-2xl font-bold mb-2">Welcome back, Professor {userName}! 👨‍🏫</h1>
        <p className="text-muted-foreground">
          Ready to inspire and educate? Your students are waiting for your guidance.
        </p>
      </div>

      {/* Teacher Stats Grid - Enhanced with Colorful 3D Effects */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Students Card - Blue/Cyan Theme */}
        <Card
          className="group relative border-0 bg-gradient-to-br from-blue-500/20 via-cyan-600/15 to-sky-600/20 
          backdrop-blur-xl shadow-xl shadow-blue-500/20 hover:shadow-2xl hover:shadow-blue-500/30 
          transition-all duration-500 hover:scale-105 hover:-translate-y-2 transform-gpu perspective-1000 
          before:absolute before:inset-0 before:bg-gradient-to-r before:from-blue-500/10 before:to-cyan-600/10 
          before:rounded-xl before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-100"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-xl"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-white group-hover:text-blue-200 transition-colors duration-300">
              Total Students
            </CardTitle>
            <div className="p-2 rounded-lg bg-blue-500/20 group-hover:bg-blue-400/30 transition-all duration-300 group-hover:rotate-12 group-hover:scale-110">
              <Users className="h-4 w-4 text-blue-300 group-hover:text-blue-200" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div
              className="text-3xl font-bold text-white group-hover:text-blue-100 transition-colors duration-300 
              group-hover:scale-110 transform origin-left"
            >
              247
            </div>
            <p className="text-xs text-blue-300 group-hover:text-blue-200 transition-colors duration-300">
              +12 this month
            </p>
          </CardContent>
        </Card>

        {/* Active Courses Card - Green/Emerald Theme */}
        <Card
          className="group relative border-0 bg-gradient-to-br from-green-500/20 via-emerald-600/15 to-teal-600/20 
          backdrop-blur-xl shadow-xl shadow-green-500/20 hover:shadow-2xl hover:shadow-green-500/30 
          transition-all duration-500 hover:scale-105 hover:-translate-y-2 transform-gpu perspective-1000 
          before:absolute before:inset-0 before:bg-gradient-to-r before:from-green-500/10 before:to-emerald-600/10 
          before:rounded-xl before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-100"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-xl"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-white group-hover:text-green-200 transition-colors duration-300">
              Active Courses
            </CardTitle>
            <div className="p-2 rounded-lg bg-green-500/20 group-hover:bg-green-400/30 transition-all duration-300 group-hover:rotate-12 group-hover:scale-110">
              <BookOpen className="h-4 w-4 text-green-300 group-hover:text-green-200" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div
              className="text-3xl font-bold text-white group-hover:text-green-100 transition-colors duration-300 
              group-hover:scale-110 transform origin-left"
            >
              8
            </div>
            <p className="text-xs text-green-300 group-hover:text-green-200 transition-colors duration-300">
              Across 3 subjects
            </p>
          </CardContent>
        </Card>

        {/* Monthly Earnings Card - Yellow/Orange Theme */}
        <Card
          className="group relative border-0 bg-gradient-to-br from-yellow-500/20 via-orange-600/15 to-amber-600/20 
          backdrop-blur-xl shadow-xl shadow-yellow-500/20 hover:shadow-2xl hover:shadow-yellow-500/30 
          transition-all duration-500 hover:scale-105 hover:-translate-y-2 transform-gpu perspective-1000 
          before:absolute before:inset-0 before:bg-gradient-to-r before:from-yellow-500/10 before:to-orange-600/10 
          before:rounded-xl before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-100"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-xl"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-white group-hover:text-yellow-200 transition-colors duration-300">
              Monthly Earnings
            </CardTitle>
            <div className="p-2 rounded-lg bg-yellow-500/20 group-hover:bg-yellow-400/30 transition-all duration-300 group-hover:rotate-12 group-hover:scale-110">
              <DollarSign className="h-4 w-4 text-yellow-300 group-hover:text-yellow-200" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div
              className="text-3xl font-bold text-white group-hover:text-yellow-100 transition-colors duration-300 
              group-hover:scale-110 transform origin-left"
            >
              ৳45,200
            </div>
            <p className="text-xs text-yellow-300 group-hover:text-yellow-200 transition-colors duration-300">
              +8% from last month
            </p>
          </CardContent>
        </Card>

        {/* Course Rating Card - Purple/Pink Theme */}
        <Card
          className="group relative border-0 bg-gradient-to-br from-purple-500/20 via-pink-600/15 to-fuchsia-600/20 
          backdrop-blur-xl shadow-xl shadow-purple-500/20 hover:shadow-2xl hover:shadow-purple-500/30 
          transition-all duration-500 hover:scale-105 hover:-translate-y-2 transform-gpu perspective-1000 
          before:absolute before:inset-0 before:bg-gradient-to-r before:from-purple-500/10 before:to-pink-600/10 
          before:rounded-xl before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-100"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-xl"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-white group-hover:text-purple-200 transition-colors duration-300">
              Course Rating
            </CardTitle>
            <div className="p-2 rounded-lg bg-purple-500/20 group-hover:bg-purple-400/30 transition-all duration-300 group-hover:rotate-12 group-hover:scale-110">
              <Star className="h-4 w-4 text-purple-300 group-hover:text-purple-200" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div
              className="text-3xl font-bold text-white group-hover:text-purple-100 transition-colors duration-300 
              group-hover:scale-110 transform origin-left"
            >
              4.8
            </div>
            <p className="text-xs text-purple-300 group-hover:text-purple-200 transition-colors duration-300">
              Based on 156 reviews
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* My Courses */}
        <div className="lg:col-span-2">
          <Card className="border-white/10 bg-gradient-to-br from-violet-600/15 via-fuchsia-600/10 to-cyan-600/15 backdrop-blur-sm hover:border-white/20 transition-shadow hover:shadow-[0_12px_48px_-12px_rgba(124,58,237,0.45)]">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                My Courses
              </CardTitle>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Create Course
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center">
                    <BookOpen className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium">Advanced Mathematics</p>
                    <p className="text-sm text-muted-foreground">87 students enrolled</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">4.9 ⭐</Badge>
                  <Button size="sm" variant="outline">
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center">
                    <BookOpen className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium">Physics Fundamentals</p>
                    <p className="text-sm text-muted-foreground">124 students enrolled</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">4.7 ⭐</Badge>
                  <Button size="sm" variant="outline">
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center">
                    <BookOpen className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium">Chemistry Lab Techniques</p>
                    <p className="text-sm text-muted-foreground">36 students enrolled</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">4.8 ⭐</Badge>
                  <Button size="sm" variant="outline">
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions & Recent Activity */}
        <div className="space-y-6">
          {/* Scholarships & Learn-to-Earn summary for teachers (their own) */}
          <Card className="border-white/10 bg-gradient-to-br from-violet-600/15 via-fuchsia-600/10 to-cyan-600/15 backdrop-blur-sm hover:border-white/20 transition-shadow hover:shadow-[0_12px_48px_-12px_rgba(124,58,237,0.45)]">
            <CardHeader>
              <CardTitle>Learn-to-Earn Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div id="teacher-scholarships" className="text-sm text-muted-foreground">
                Track your activity-based points and awards.
              </div>
            </CardContent>
          </Card>
          {/* Quick Actions - Enhanced with Colorful 3D Effects */}
          <Card
            className="group relative border-0 bg-gradient-to-br from-indigo-500/20 via-blue-600/15 to-cyan-600/20 
            backdrop-blur-xl shadow-xl shadow-indigo-500/20 hover:shadow-2xl hover:shadow-indigo-500/30 
            transition-all duration-500 hover:scale-105 hover:-translate-y-2 transform-gpu perspective-1000 
            before:absolute before:inset-0 before:bg-gradient-to-r before:from-indigo-500/10 before:to-blue-500/10 
            before:rounded-xl before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-100"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-xl"></div>
            <CardHeader className="relative z-10">
              <CardTitle
                className="text-xl font-bold text-white group-hover:text-indigo-200 transition-colors duration-300 
                flex items-center gap-3"
              >
                <div className="p-2 rounded-lg bg-indigo-500/20 group-hover:bg-indigo-400/30 transition-all duration-300 group-hover:rotate-6">
                  <TrendingUp className="h-5 w-5 text-indigo-300 group-hover:text-indigo-200" />
                </div>
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 relative z-10">
              <Button
                className="w-full justify-start group bg-gradient-to-r from-green-500/20 to-emerald-500/20 
                hover:from-green-500/30 hover:to-emerald-500/30 border-green-500/30 hover:border-green-400 
                text-white hover:text-green-100 transition-all duration-300 hover:scale-105 transform-gpu"
                variant="outline"
              >
                <Plus className="h-4 w-4 mr-2 text-green-300 group-hover:text-green-200" />
                Create New Course
              </Button>
              <Button
                className="w-full justify-start group bg-gradient-to-r from-orange-500/20 to-red-500/20 
                hover:from-orange-500/30 hover:to-red-500/30 border-orange-500/30 hover:border-orange-400 
                text-white hover:text-orange-100 transition-all duration-300 hover:scale-105 transform-gpu"
                variant="outline"
              >
                <FileText className="h-4 w-4 mr-2 text-orange-300 group-hover:text-orange-200" />
                Grade Assignments
              </Button>
              <Button
                className="w-full justify-start group bg-gradient-to-r from-purple-500/20 to-pink-500/20 
                hover:from-purple-500/30 hover:to-pink-500/30 border-purple-500/30 hover:border-purple-400 
                text-white hover:text-purple-100 transition-all duration-300 hover:scale-105 transform-gpu"
                variant="outline"
              >
                <MessageSquare className="h-4 w-4 mr-2 text-purple-300 group-hover:text-purple-200" />
                Answer Q&A
              </Button>
              <Button
                className="w-full justify-start group bg-gradient-to-r from-cyan-500/20 to-sky-500/20 
                hover:from-cyan-500/30 hover:to-sky-500/30 border-cyan-500/30 hover:border-cyan-400 
                text-white hover:text-cyan-100 transition-all duration-300 hover:scale-105 transform-gpu"
                variant="outline"
              >
                <Calendar className="h-4 w-4 mr-2 text-cyan-300 group-hover:text-cyan-200" />
                Schedule Class
              </Button>
            </CardContent>
          </Card>

          {/* Pending Tasks - Enhanced with Red/Orange Theme */}
          <Card
            className="group relative border-0 bg-gradient-to-br from-red-500/20 via-orange-600/15 to-yellow-600/20 
            backdrop-blur-xl shadow-xl shadow-red-500/20 hover:shadow-2xl hover:shadow-red-500/30 
            transition-all duration-500 hover:scale-105 hover:-translate-y-2 transform-gpu perspective-1000 
            before:absolute before:inset-0 before:bg-gradient-to-r before:from-red-500/10 before:to-orange-500/10 
            before:rounded-xl before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-100"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-xl"></div>
            <CardHeader className="relative z-10">
              <CardTitle
                className="text-xl font-bold text-white group-hover:text-red-200 transition-colors duration-300 
                flex items-center gap-3"
              >
                <div className="p-2 rounded-lg bg-red-500/20 group-hover:bg-red-400/30 transition-all duration-300 group-hover:rotate-6">
                  <Clock className="h-5 w-5 text-red-300 group-hover:text-red-200" />
                </div>
                Pending Tasks
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 relative z-10">
              <div
                className="flex items-center justify-between p-3 rounded-lg bg-red-500/10 border border-red-500/20 
                hover:bg-red-500/20 transition-all duration-300 hover:scale-105 transform-gpu group cursor-pointer"
              >
                <div>
                  <p className="font-semibold text-sm text-white group-hover:text-red-100">
                    Grade Math Assignments
                  </p>
                  <p className="text-xs text-red-300 group-hover:text-red-200">23 submissions</p>
                </div>
                <Badge className="bg-red-600/30 text-red-200 border-red-500/30 hover:bg-red-500/40 text-xs">
                  Urgent
                </Badge>
              </div>
              <div
                className="flex items-center justify-between p-3 rounded-lg bg-orange-500/10 border border-orange-500/20 
                hover:bg-orange-500/20 transition-all duration-300 hover:scale-105 transform-gpu group cursor-pointer"
              >
                <div>
                  <p className="font-semibold text-sm text-white group-hover:text-orange-100">
                    Review Physics Lab Reports
                  </p>
                  <p className="text-xs text-orange-300 group-hover:text-orange-200">
                    15 submissions
                  </p>
                </div>
                <Badge className="bg-orange-600/30 text-orange-200 border-orange-500/30 hover:bg-orange-500/40 text-xs">
                  Due Tomorrow
                </Badge>
              </div>
              <div
                className="flex items-center justify-between p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 
                hover:bg-yellow-500/20 transition-all duration-300 hover:scale-105 transform-gpu group cursor-pointer"
              >
                <div>
                  <p className="font-semibold text-sm text-white group-hover:text-yellow-100">
                    Update Course Materials
                  </p>
                  <p className="text-xs text-yellow-300 group-hover:text-yellow-200">
                    Chemistry course
                  </p>
                </div>
                <Badge className="bg-yellow-600/30 text-yellow-200 border-yellow-500/30 hover:bg-yellow-500/40 text-xs">
                  This Week
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Recent Messages - Enhanced with Green/Teal Theme */}
          <Card
            className="group relative border-0 bg-gradient-to-br from-teal-500/20 via-cyan-600/15 to-sky-600/20 
            backdrop-blur-xl shadow-xl shadow-teal-500/20 hover:shadow-2xl hover:shadow-teal-500/30 
            transition-all duration-500 hover:scale-105 hover:-translate-y-2 transform-gpu perspective-1000 
            before:absolute before:inset-0 before:bg-gradient-to-r before:from-teal-500/10 before:to-cyan-500/10 
            before:rounded-xl before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-100"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-xl"></div>
            <CardHeader className="relative z-10">
              <CardTitle
                className="text-xl font-bold text-white group-hover:text-teal-200 transition-colors duration-300 
                flex items-center gap-3"
              >
                <div className="p-2 rounded-lg bg-teal-500/20 group-hover:bg-teal-400/30 transition-all duration-300 group-hover:rotate-6">
                  <MessageSquare className="h-5 w-5 text-teal-300 group-hover:text-teal-200" />
                </div>
                Recent Messages
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 relative z-10">
              <div
                className="p-3 rounded-lg bg-teal-500/10 border border-teal-500/20 hover:bg-teal-500/20 
                transition-all duration-300 hover:scale-105 transform-gpu group cursor-pointer"
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold text-sm text-white group-hover:text-teal-100">
                    Sarah Johnson
                  </p>
                  <p className="text-xs text-teal-300 group-hover:text-teal-200">2 min ago</p>
                </div>
                <p className="text-sm text-teal-300 group-hover:text-teal-200">
                  Question about calculus integration...
                </p>
              </div>
              <div
                className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/20 hover:bg-cyan-500/20 
                transition-all duration-300 hover:scale-105 transform-gpu group cursor-pointer"
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold text-sm text-white group-hover:text-cyan-100">
                    Mike Chen
                  </p>
                  <p className="text-xs text-cyan-300 group-hover:text-cyan-200">15 min ago</p>
                </div>
                <p className="text-sm text-cyan-300 group-hover:text-cyan-200">
                  Need help with physics homework...
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
