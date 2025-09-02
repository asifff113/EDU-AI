'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Users,
  BookOpen,
  TrendingUp,
  Shield,
  AlertTriangle,
  Settings,
  BarChart3,
  DollarSign,
  MessageSquare,
  FileText,
  Award,
  Activity,
} from 'lucide-react';

interface AdminDashboardProps {
  userName: string;
}

export function AdminDashboard({ userName }: AdminDashboardProps) {
  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="relative bg-gradient-to-r from-violet-500/15 via-fuchsia-500/10 to-cyan-500/15 rounded-xl p-6 border border-white/10 overflow-hidden">
        <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-violet-500/0 via-fuchsia-500/0 to-cyan-500/0 blur-lg" />
        <h1 className="relative text-2xl font-bold mb-2">Welcome back, Admin {userName}! ⚡</h1>
        <p className="text-muted-foreground">
          Monitor platform performance and manage the learning ecosystem.
        </p>
      </div>

      {/* Admin Stats Grid - Enhanced with Colorful 3D Effects */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Users Card - Electric Blue/Cyan Theme */}
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
              Total Users
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
              12,847
            </div>
            <p className="text-xs text-blue-300 group-hover:text-blue-200 transition-colors duration-300">
              +234 this week
            </p>
          </CardContent>
        </Card>

        {/* Active Courses Card - Emerald/Green Theme */}
        <Card
          className="group relative border-0 bg-gradient-to-br from-emerald-500/20 via-green-600/15 to-teal-600/20 
          backdrop-blur-xl shadow-xl shadow-emerald-500/20 hover:shadow-2xl hover:shadow-emerald-500/30 
          transition-all duration-500 hover:scale-105 hover:-translate-y-2 transform-gpu perspective-1000 
          before:absolute before:inset-0 before:bg-gradient-to-r before:from-emerald-500/10 before:to-green-600/10 
          before:rounded-xl before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-100"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-xl"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-white group-hover:text-emerald-200 transition-colors duration-300">
              Active Courses
            </CardTitle>
            <div className="p-2 rounded-lg bg-emerald-500/20 group-hover:bg-emerald-400/30 transition-all duration-300 group-hover:rotate-12 group-hover:scale-110">
              <BookOpen className="h-4 w-4 text-emerald-300 group-hover:text-emerald-200" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div
              className="text-3xl font-bold text-white group-hover:text-emerald-100 transition-colors duration-300 
              group-hover:scale-110 transform origin-left"
            >
              1,234
            </div>
            <p className="text-xs text-emerald-300 group-hover:text-emerald-200 transition-colors duration-300">
              89% completion rate
            </p>
          </CardContent>
        </Card>

        {/* Revenue Card - Gold/Yellow Theme */}
        <Card
          className="group relative border-0 bg-gradient-to-br from-yellow-500/20 via-amber-600/15 to-orange-600/20 
          backdrop-blur-xl shadow-xl shadow-yellow-500/20 hover:shadow-2xl hover:shadow-yellow-500/30 
          transition-all duration-500 hover:scale-105 hover:-translate-y-2 transform-gpu perspective-1000 
          before:absolute before:inset-0 before:bg-gradient-to-r before:from-yellow-500/10 before:to-amber-600/10 
          before:rounded-xl before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-100"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-xl"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-white group-hover:text-yellow-200 transition-colors duration-300">
              Revenue
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
              ৳2.4M
            </div>
            <p className="text-xs text-yellow-300 group-hover:text-yellow-200 transition-colors duration-300">
              +12% this month
            </p>
          </CardContent>
        </Card>

        {/* System Health Card - Purple/Violet Theme */}
        <Card
          className="group relative border-0 bg-gradient-to-br from-violet-500/20 via-purple-600/15 to-fuchsia-600/20 
          backdrop-blur-xl shadow-xl shadow-violet-500/20 hover:shadow-2xl hover:shadow-violet-500/30 
          transition-all duration-500 hover:scale-105 hover:-translate-y-2 transform-gpu perspective-1000 
          before:absolute before:inset-0 before:bg-gradient-to-r before:from-violet-500/10 before:to-purple-600/10 
          before:rounded-xl before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-100"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-xl"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-white group-hover:text-violet-200 transition-colors duration-300">
              System Health
            </CardTitle>
            <div className="p-2 rounded-lg bg-violet-500/20 group-hover:bg-violet-400/30 transition-all duration-300 group-hover:rotate-12 group-hover:scale-110">
              <Activity className="h-4 w-4 text-violet-300 group-hover:text-violet-200" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div
              className="text-3xl font-bold text-white group-hover:text-violet-100 transition-colors duration-300 
              group-hover:scale-110 transform origin-left"
            >
              99.8%
            </div>
            <p className="text-xs text-violet-300 group-hover:text-violet-200 transition-colors duration-300">
              All systems operational
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Platform Overview */}
        <div className="lg:col-span-2">
          <Card className="border-white/10 bg-gradient-to-br from-violet-600/15 via-fuchsia-600/10 to-cyan-600/15 backdrop-blur-sm hover:border-white/20 transition-shadow hover:shadow-[0_12px_48px_-12px_rgba(124,58,237,0.45)]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Platform Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* User Distribution */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">User Distribution</span>
                  <span className="text-sm text-muted-foreground">12,847 total</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      <span className="text-sm">Students</span>
                    </div>
                    <span className="text-sm">10,234 (79.7%)</span>
                  </div>
                  <Progress value={79.7} className="h-2" />
                </div>
                <div className="space-y-2 mt-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span className="text-sm">Teachers</span>
                    </div>
                    <span className="text-sm">1,847 (14.4%)</span>
                  </div>
                  <Progress value={14.4} className="h-2" />
                </div>
                <div className="space-y-2 mt-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                      <span className="text-sm">Q&A Solvers</span>
                    </div>
                    <span className="text-sm">756 (5.9%)</span>
                  </div>
                  <Progress value={5.9} className="h-2" />
                </div>
              </div>

              {/* Recent Activity */}
              <div>
                <h4 className="text-sm font-medium mb-3">Recent Platform Activity</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                        <Users className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">234 new user registrations</p>
                        <p className="text-xs text-muted-foreground">Last 24 hours</p>
                      </div>
                    </div>
                    <Badge variant="secondary">+18%</Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                        <BookOpen className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">45 new courses published</p>
                        <p className="text-xs text-muted-foreground">This week</p>
                      </div>
                    </div>
                    <Badge variant="secondary">+12%</Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                        <MessageSquare className="h-4 w-4 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">1,234 Q&A interactions</p>
                        <p className="text-xs text-muted-foreground">Today</p>
                      </div>
                    </div>
                    <Badge variant="secondary">+8%</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Admin Controls & Alerts */}
        <div className="space-y-6">
          {/* Admin Controls - Enhanced with Red/Pink Theme */}
          <Card
            className="group relative border-0 bg-gradient-to-br from-red-500/20 via-pink-600/15 to-rose-600/20 
            backdrop-blur-xl shadow-xl shadow-red-500/20 hover:shadow-2xl hover:shadow-red-500/30 
            transition-all duration-500 hover:scale-105 hover:-translate-y-2 transform-gpu perspective-1000 
            before:absolute before:inset-0 before:bg-gradient-to-r before:from-red-500/10 before:to-pink-500/10 
            before:rounded-xl before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-100"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-xl"></div>
            <CardHeader className="relative z-10">
              <CardTitle
                className="text-xl font-bold text-white group-hover:text-red-200 transition-colors duration-300 
                flex items-center gap-3"
              >
                <div className="p-2 rounded-lg bg-red-500/20 group-hover:bg-red-400/30 transition-all duration-300 group-hover:rotate-6">
                  <Shield className="h-5 w-5 text-red-300 group-hover:text-red-200" />
                </div>
                Admin Controls
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 relative z-10">
              <Button
                className="w-full justify-start group bg-gradient-to-r from-blue-500/20 to-cyan-500/20 
                hover:from-blue-500/30 hover:to-cyan-500/30 border-blue-500/30 hover:border-blue-400 
                text-white hover:text-blue-100 transition-all duration-300 hover:scale-105 transform-gpu"
                variant="outline"
              >
                <Users className="h-4 w-4 mr-2 text-blue-300 group-hover:text-blue-200" />
                Manage Users
              </Button>
              <Button
                className="w-full justify-start group bg-gradient-to-r from-green-500/20 to-emerald-500/20 
                hover:from-green-500/30 hover:to-emerald-500/30 border-green-500/30 hover:border-green-400 
                text-white hover:text-green-100 transition-all duration-300 hover:scale-105 transform-gpu"
                variant="outline"
              >
                <BookOpen className="h-4 w-4 mr-2 text-green-300 group-hover:text-green-200" />
                Review Courses
              </Button>
              <Button
                className="w-full justify-start group bg-gradient-to-r from-orange-500/20 to-yellow-500/20 
                hover:from-orange-500/30 hover:to-yellow-500/30 border-orange-500/30 hover:border-orange-400 
                text-white hover:text-orange-100 transition-all duration-300 hover:scale-105 transform-gpu"
                variant="outline"
              >
                <FileText className="h-4 w-4 mr-2 text-orange-300 group-hover:text-orange-200" />
                Content Moderation
              </Button>
              <Button
                className="w-full justify-start group bg-gradient-to-r from-purple-500/20 to-violet-500/20 
                hover:from-purple-500/30 hover:to-violet-500/30 border-purple-500/30 hover:border-purple-400 
                text-white hover:text-purple-100 transition-all duration-300 hover:scale-105 transform-gpu"
                variant="outline"
              >
                <Settings className="h-4 w-4 mr-2 text-purple-300 group-hover:text-purple-200" />
                System Settings
              </Button>
            </CardContent>
          </Card>

          {/* System Alerts - Enhanced with Orange/Yellow Theme */}
          <Card
            className="group relative border-0 bg-gradient-to-br from-orange-500/20 via-yellow-600/15 to-amber-600/20 
            backdrop-blur-xl shadow-xl shadow-orange-500/20 hover:shadow-2xl hover:shadow-orange-500/30 
            transition-all duration-500 hover:scale-105 hover:-translate-y-2 transform-gpu perspective-1000 
            before:absolute before:inset-0 before:bg-gradient-to-r before:from-orange-500/10 before:to-yellow-500/10 
            before:rounded-xl before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-100"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-xl"></div>
            <CardHeader className="relative z-10">
              <CardTitle
                className="text-xl font-bold text-white group-hover:text-orange-200 transition-colors duration-300 
                flex items-center gap-3"
              >
                <div className="p-2 rounded-lg bg-orange-500/20 group-hover:bg-orange-400/30 transition-all duration-300 group-hover:rotate-6">
                  <AlertTriangle className="h-5 w-5 text-orange-300 group-hover:text-orange-200" />
                </div>
                System Alerts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 relative z-10">
              <div
                className="flex items-start gap-3 p-3 rounded-lg bg-orange-500/10 border border-orange-500/20 
                hover:bg-orange-500/20 transition-all duration-300 hover:scale-105 transform-gpu group cursor-pointer"
              >
                <AlertTriangle className="h-4 w-4 text-orange-300 group-hover:text-orange-200 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-white group-hover:text-orange-100">
                    Server Load High
                  </p>
                  <p className="text-xs text-orange-300 group-hover:text-orange-200">
                    API response time increased by 15%
                  </p>
                </div>
              </div>

              <div
                className="flex items-start gap-3 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 
                hover:bg-blue-500/20 transition-all duration-300 hover:scale-105 transform-gpu group cursor-pointer"
              >
                <Shield className="h-4 w-4 text-blue-300 group-hover:text-blue-200 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-white group-hover:text-blue-100">
                    Security Scan Complete
                  </p>
                  <p className="text-xs text-blue-300 group-hover:text-blue-200">
                    No vulnerabilities detected
                  </p>
                </div>
              </div>

              <div
                className="flex items-start gap-3 p-3 rounded-lg bg-green-500/10 border border-green-500/20 
                hover:bg-green-500/20 transition-all duration-300 hover:scale-105 transform-gpu group cursor-pointer"
              >
                <Activity className="h-4 w-4 text-green-300 group-hover:text-green-200 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-white group-hover:text-green-100">
                    Backup Successful
                  </p>
                  <p className="text-xs text-green-300 group-hover:text-green-200">
                    Daily backup completed at 2:00 AM
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats - Enhanced with Teal/Cyan Theme */}
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
                  <TrendingUp className="h-5 w-5 text-teal-300 group-hover:text-teal-200" />
                </div>
                Quick Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 relative z-10">
              <div
                className="flex items-center justify-between p-3 rounded-lg bg-teal-500/10 border border-teal-500/20 
                hover:bg-teal-500/20 transition-all duration-300 hover:scale-105 transform-gpu group cursor-pointer"
              >
                <span className="text-sm text-white group-hover:text-teal-100">
                  Active Sessions
                </span>
                <span className="text-lg font-bold text-teal-200 group-hover:text-teal-100">
                  2,847
                </span>
              </div>
              <div
                className="flex items-center justify-between p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/20 
                hover:bg-cyan-500/20 transition-all duration-300 hover:scale-105 transform-gpu group cursor-pointer"
              >
                <span className="text-sm text-white group-hover:text-cyan-100">
                  Questions Today
                </span>
                <span className="text-lg font-bold text-cyan-200 group-hover:text-cyan-100">
                  456
                </span>
              </div>
              <div
                className="flex items-center justify-between p-3 rounded-lg bg-sky-500/10 border border-sky-500/20 
                hover:bg-sky-500/20 transition-all duration-300 hover:scale-105 transform-gpu group cursor-pointer"
              >
                <span className="text-sm text-white group-hover:text-sky-100">
                  Course Completions
                </span>
                <span className="text-lg font-bold text-sky-200 group-hover:text-sky-100">89</span>
              </div>
              <div
                className="flex items-center justify-between p-3 rounded-lg bg-red-500/10 border border-red-500/20 
                hover:bg-red-500/20 transition-all duration-300 hover:scale-105 transform-gpu group cursor-pointer"
              >
                <span className="text-sm text-white group-hover:text-red-100">Support Tickets</span>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-red-200 group-hover:text-red-100">
                    12
                  </span>
                  <Badge className="bg-red-600/30 text-red-200 border-red-500/30 hover:bg-red-500/40 text-xs">
                    Urgent
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
