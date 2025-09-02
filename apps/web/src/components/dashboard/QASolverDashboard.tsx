'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  MessageSquare,
  TrendingUp,
  Award,
  Clock,
  DollarSign,
  Star,
  CheckCircle,
  AlertCircle,
  Brain,
  Target,
  BookOpen,
} from 'lucide-react';

interface QASolverDashboardProps {
  userName: string;
}

export function QASolverDashboard({ userName }: QASolverDashboardProps) {
  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="relative bg-gradient-to-r from-violet-500/15 via-fuchsia-500/10 to-cyan-500/15 rounded-xl p-6 border border-white/10 overflow-hidden">
        <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-violet-500/0 via-fuchsia-500/0 to-cyan-500/0 blur-lg" />
        <h1 className="relative text-2xl font-bold mb-2">Welcome back, {userName}! 🧠</h1>
        <p className="text-muted-foreground">
          Ready to help students solve their problems? Your expertise makes a difference!
        </p>
      </div>

      {/* QA Solver Stats Grid - Enhanced with Colorful 3D Effects */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Questions Solved Card - Green/Emerald Theme */}
        <Card className="group relative border-0 bg-gradient-to-br from-green-500/20 via-emerald-600/15 to-teal-600/20 
          backdrop-blur-xl shadow-xl shadow-green-500/20 hover:shadow-2xl hover:shadow-green-500/30 
          transition-all duration-500 hover:scale-105 hover:-translate-y-2 transform-gpu perspective-1000 
          before:absolute before:inset-0 before:bg-gradient-to-r before:from-green-500/10 before:to-emerald-600/10 
          before:rounded-xl before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-100">
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-xl"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-white group-hover:text-green-200 transition-colors duration-300">Questions Solved</CardTitle>
            <div className="p-2 rounded-lg bg-green-500/20 group-hover:bg-green-400/30 transition-all duration-300 group-hover:rotate-12 group-hover:scale-110">
              <CheckCircle className="h-4 w-4 text-green-300 group-hover:text-green-200" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold text-white group-hover:text-green-100 transition-colors duration-300 
              group-hover:scale-110 transform origin-left">1,247</div>
            <p className="text-xs text-green-300 group-hover:text-green-200 transition-colors duration-300">+23 this week</p>
          </CardContent>
        </Card>

        {/* Success Rate Card - Blue/Sky Theme */}
        <Card className="group relative border-0 bg-gradient-to-br from-blue-500/20 via-sky-600/15 to-cyan-600/20 
          backdrop-blur-xl shadow-xl shadow-blue-500/20 hover:shadow-2xl hover:shadow-blue-500/30 
          transition-all duration-500 hover:scale-105 hover:-translate-y-2 transform-gpu perspective-1000 
          before:absolute before:inset-0 before:bg-gradient-to-r before:from-blue-500/10 before:to-sky-600/10 
          before:rounded-xl before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-100">
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-xl"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-white group-hover:text-blue-200 transition-colors duration-300">Success Rate</CardTitle>
            <div className="p-2 rounded-lg bg-blue-500/20 group-hover:bg-blue-400/30 transition-all duration-300 group-hover:rotate-12 group-hover:scale-110">
              <Target className="h-4 w-4 text-blue-300 group-hover:text-blue-200" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold text-white group-hover:text-blue-100 transition-colors duration-300 
              group-hover:scale-110 transform origin-left">94%</div>
            <p className="text-xs text-blue-300 group-hover:text-blue-200 transition-colors duration-300">Above average</p>
          </CardContent>
        </Card>

        {/* Monthly Earnings Card - Gold/Amber Theme */}
        <Card className="group relative border-0 bg-gradient-to-br from-amber-500/20 via-yellow-600/15 to-orange-600/20 
          backdrop-blur-xl shadow-xl shadow-amber-500/20 hover:shadow-2xl hover:shadow-amber-500/30 
          transition-all duration-500 hover:scale-105 hover:-translate-y-2 transform-gpu perspective-1000 
          before:absolute before:inset-0 before:bg-gradient-to-r before:from-amber-500/10 before:to-yellow-600/10 
          before:rounded-xl before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-100">
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-xl"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-white group-hover:text-amber-200 transition-colors duration-300">Monthly Earnings</CardTitle>
            <div className="p-2 rounded-lg bg-amber-500/20 group-hover:bg-amber-400/30 transition-all duration-300 group-hover:rotate-12 group-hover:scale-110">
              <DollarSign className="h-4 w-4 text-amber-300 group-hover:text-amber-200" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold text-white group-hover:text-amber-100 transition-colors duration-300 
              group-hover:scale-110 transform origin-left">৳28,500</div>
            <p className="text-xs text-amber-300 group-hover:text-amber-200 transition-colors duration-300">+15% from last month</p>
          </CardContent>
        </Card>

        {/* Rating Card - Purple/Pink Theme */}
        <Card className="group relative border-0 bg-gradient-to-br from-purple-500/20 via-violet-600/15 to-fuchsia-600/20 
          backdrop-blur-xl shadow-xl shadow-purple-500/20 hover:shadow-2xl hover:shadow-purple-500/30 
          transition-all duration-500 hover:scale-105 hover:-translate-y-2 transform-gpu perspective-1000 
          before:absolute before:inset-0 before:bg-gradient-to-r before:from-purple-500/10 before:to-violet-600/10 
          before:rounded-xl before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-100">
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-xl"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-white group-hover:text-purple-200 transition-colors duration-300">Rating</CardTitle>
            <div className="p-2 rounded-lg bg-purple-500/20 group-hover:bg-purple-400/30 transition-all duration-300 group-hover:rotate-12 group-hover:scale-110">
              <Star className="h-4 w-4 text-purple-300 group-hover:text-purple-200" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold text-white group-hover:text-purple-100 transition-colors duration-300 
              group-hover:scale-110 transform origin-left">4.9</div>
            <p className="text-xs text-purple-300 group-hover:text-purple-200 transition-colors duration-300">Based on 456 reviews</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Questions */}
        <div className="lg:col-span-2">
          <Card className="border-white/10 bg-gradient-to-br from-violet-600/15 via-fuchsia-600/10 to-cyan-600/15 backdrop-blur-sm hover:border-white/20 transition-shadow hover:shadow-[0_12px_48px_-12px_rgba(124,58,237,0.45)]">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Pending Questions
              </CardTitle>
              <Badge variant="secondary">12 new</Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start justify-between p-4 border rounded-lg">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                    <Brain className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-sm">Calculus Integration Problem</p>
                      <Badge variant="outline" className="text-xs">
                        Mathematics
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Need help solving ∫(2x³ + 5x² - 3x + 1)dx. Can you show step by step?
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>Posted by: Alex Kumar</span>
                      <span>•</span>
                      <span>2 hours ago</span>
                      <span>•</span>
                      <span className="text-green-600">৳150</span>
                    </div>
                  </div>
                </div>
                <Button size="sm">Answer</Button>
              </div>

              <div className="flex items-start justify-between p-4 border rounded-lg">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center">
                    <BookOpen className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-sm">Organic Chemistry Mechanism</p>
                      <Badge variant="outline" className="text-xs">
                        Chemistry
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Explain the SN2 reaction mechanism for the given compound...
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>Posted by: Maria Santos</span>
                      <span>•</span>
                      <span>4 hours ago</span>
                      <span>•</span>
                      <span className="text-green-600">৳200</span>
                    </div>
                  </div>
                </div>
                <Button size="sm">Answer</Button>
              </div>

              <div className="flex items-start justify-between p-4 border rounded-lg">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <Target className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-sm">Physics Kinematics Problem</p>
                      <Badge variant="outline" className="text-xs">
                        Physics
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      A car accelerates from rest at 2 m/s². Find velocity after 10 seconds...
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>Posted by: John Smith</span>
                      <span>•</span>
                      <span>6 hours ago</span>
                      <span>•</span>
                      <span className="text-green-600">৳100</span>
                    </div>
                  </div>
                </div>
                <Button size="sm">Answer</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats & Actions */}
        <div className="space-y-6">
          {/* Quick Actions - Enhanced with Indigo/Blue Theme */}
          <Card className="group relative border-0 bg-gradient-to-br from-indigo-500/20 via-blue-600/15 to-cyan-600/20 
            backdrop-blur-xl shadow-xl shadow-indigo-500/20 hover:shadow-2xl hover:shadow-indigo-500/30 
            transition-all duration-500 hover:scale-105 hover:-translate-y-2 transform-gpu perspective-1000 
            before:absolute before:inset-0 before:bg-gradient-to-r before:from-indigo-500/10 before:to-blue-500/10 
            before:rounded-xl before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-100">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-xl"></div>
            <CardHeader className="relative z-10">
              <CardTitle className="text-xl font-bold text-white group-hover:text-indigo-200 transition-colors duration-300 
                flex items-center gap-3">
                <div className="p-2 rounded-lg bg-indigo-500/20 group-hover:bg-indigo-400/30 transition-all duration-300 group-hover:rotate-6">
                  <Brain className="h-5 w-5 text-indigo-300 group-hover:text-indigo-200" />
                </div>
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 relative z-10">
              <Button className="w-full justify-start group bg-gradient-to-r from-teal-500/20 to-cyan-500/20 
                hover:from-teal-500/30 hover:to-cyan-500/30 border-teal-500/30 hover:border-teal-400 
                text-white hover:text-teal-100 transition-all duration-300 hover:scale-105 transform-gpu" variant="outline">
                <MessageSquare className="h-4 w-4 mr-2 text-teal-300 group-hover:text-teal-200" />
                Browse New Questions
              </Button>
              <Button className="w-full justify-start group bg-gradient-to-r from-orange-500/20 to-yellow-500/20 
                hover:from-orange-500/30 hover:to-yellow-500/30 border-orange-500/30 hover:border-orange-400 
                text-white hover:text-orange-100 transition-all duration-300 hover:scale-105 transform-gpu" variant="outline">
                <Clock className="h-4 w-4 mr-2 text-orange-300 group-hover:text-orange-200" />
                View My Answers
              </Button>
              <Button className="w-full justify-start group bg-gradient-to-r from-green-500/20 to-emerald-500/20 
                hover:from-green-500/30 hover:to-emerald-500/30 border-green-500/30 hover:border-green-400 
                text-white hover:text-green-100 transition-all duration-300 hover:scale-105 transform-gpu" variant="outline">
                <TrendingUp className="h-4 w-4 mr-2 text-green-300 group-hover:text-green-200" />
                View Earnings
              </Button>
              <Button className="w-full justify-start group bg-gradient-to-r from-purple-500/20 to-pink-500/20 
                hover:from-purple-500/30 hover:to-pink-500/30 border-purple-500/30 hover:border-purple-400 
                text-white hover:text-purple-100 transition-all duration-300 hover:scale-105 transform-gpu" variant="outline">
                <Award className="h-4 w-4 mr-2 text-purple-300 group-hover:text-purple-200" />
                My Achievements
              </Button>
            </CardContent>
          </Card>

          {/* Subject Expertise - Enhanced with Pink/Rose Theme */}
          <Card className="group relative border-0 bg-gradient-to-br from-pink-500/20 via-rose-600/15 to-fuchsia-600/20 
            backdrop-blur-xl shadow-xl shadow-pink-500/20 hover:shadow-2xl hover:shadow-pink-500/30 
            transition-all duration-500 hover:scale-105 hover:-translate-y-2 transform-gpu perspective-1000 
            before:absolute before:inset-0 before:bg-gradient-to-r before:from-pink-500/10 before:to-rose-500/10 
            before:rounded-xl before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-100">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-xl"></div>
            <CardHeader className="relative z-10">
              <CardTitle className="text-xl font-bold text-white group-hover:text-pink-200 transition-colors duration-300 
                flex items-center gap-3">
                <div className="p-2 rounded-lg bg-pink-500/20 group-hover:bg-pink-400/30 transition-all duration-300 group-hover:rotate-6">
                  <Brain className="h-5 w-5 text-pink-300 group-hover:text-pink-200" />
                </div>
                Subject Expertise
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 relative z-10">
              <div className="flex items-center justify-between p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 
                hover:bg-blue-500/20 transition-all duration-300 hover:scale-105 transform-gpu group cursor-pointer">
                <span className="text-sm font-semibold text-white group-hover:text-blue-100">Mathematics</span>
                <div className="flex items-center gap-2">
                  <Badge className="bg-blue-600/30 text-blue-200 border-blue-500/30 hover:bg-blue-500/40">Expert</Badge>
                  <span className="text-xs text-blue-300 group-hover:text-blue-200">4.9⭐</span>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10 border border-green-500/20 
                hover:bg-green-500/20 transition-all duration-300 hover:scale-105 transform-gpu group cursor-pointer">
                <span className="text-sm font-semibold text-white group-hover:text-green-100">Physics</span>
                <div className="flex items-center gap-2">
                  <Badge className="bg-green-600/30 text-green-200 border-green-500/30 hover:bg-green-500/40">Expert</Badge>
                  <span className="text-xs text-green-300 group-hover:text-green-200">4.8⭐</span>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-orange-500/10 border border-orange-500/20 
                hover:bg-orange-500/20 transition-all duration-300 hover:scale-105 transform-gpu group cursor-pointer">
                <span className="text-sm font-semibold text-white group-hover:text-orange-100">Chemistry</span>
                <div className="flex items-center gap-2">
                  <Badge className="bg-orange-600/30 text-orange-200 border-orange-500/30 hover:bg-orange-500/40">Advanced</Badge>
                  <span className="text-xs text-orange-300 group-hover:text-orange-200">4.7⭐</span>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-purple-500/10 border border-purple-500/20 
                hover:bg-purple-500/20 transition-all duration-300 hover:scale-105 transform-gpu group cursor-pointer">
                <span className="text-sm font-semibold text-white group-hover:text-purple-100">Biology</span>
                <div className="flex items-center gap-2">
                  <Badge className="bg-purple-600/30 text-purple-200 border-purple-500/30 hover:bg-purple-500/40">Intermediate</Badge>
                  <span className="text-xs text-purple-300 group-hover:text-purple-200">4.5⭐</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity - Enhanced with Lime/Green Theme */}
          <Card className="group relative border-0 bg-gradient-to-br from-lime-500/20 via-green-600/15 to-emerald-600/20 
            backdrop-blur-xl shadow-xl shadow-lime-500/20 hover:shadow-2xl hover:shadow-lime-500/30 
            transition-all duration-500 hover:scale-105 hover:-translate-y-2 transform-gpu perspective-1000 
            before:absolute before:inset-0 before:bg-gradient-to-r before:from-lime-500/10 before:to-green-500/10 
            before:rounded-xl before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-100">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-xl"></div>
            <CardHeader className="relative z-10">
              <CardTitle className="text-xl font-bold text-white group-hover:text-lime-200 transition-colors duration-300 
                flex items-center gap-3">
                <div className="p-2 rounded-lg bg-lime-500/20 group-hover:bg-lime-400/30 transition-all duration-300 group-hover:rotate-6">
                  <Clock className="h-5 w-5 text-lime-300 group-hover:text-lime-200" />
                </div>
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 relative z-10">
              <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 hover:bg-green-500/20 
                transition-all duration-300 hover:scale-105 transform-gpu group cursor-pointer">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold text-sm text-white group-hover:text-green-100">Solved Algebra Problem</p>
                  <div className="flex items-center gap-1">
                    <CheckCircle className="h-3 w-3 text-green-300 group-hover:text-green-200" />
                    <span className="text-xs text-green-300 group-hover:text-green-200">৳120</span>
                  </div>
                </div>
                <p className="text-xs text-green-300 group-hover:text-green-200">2 hours ago • 5⭐ rating</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 
                transition-all duration-300 hover:scale-105 transform-gpu group cursor-pointer">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold text-sm text-white group-hover:text-blue-100">Physics Explanation</p>
                  <div className="flex items-center gap-1">
                    <CheckCircle className="h-3 w-3 text-blue-300 group-hover:text-blue-200" />
                    <span className="text-xs text-blue-300 group-hover:text-blue-200">৳180</span>
                  </div>
                </div>
                <p className="text-xs text-blue-300 group-hover:text-blue-200">5 hours ago • 4⭐ rating</p>
              </div>
              <div className="p-3 rounded-lg bg-orange-500/10 border border-orange-500/20 hover:bg-orange-500/20 
                transition-all duration-300 hover:scale-105 transform-gpu group cursor-pointer">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold text-sm text-white group-hover:text-orange-100">Chemistry Help</p>
                  <div className="flex items-center gap-1">
                    <AlertCircle className="h-3 w-3 text-orange-300 group-hover:text-orange-200" />
                    <span className="text-xs text-orange-300 group-hover:text-orange-200">Pending</span>
                  </div>
                </div>
                <p className="text-xs text-orange-300 group-hover:text-orange-200">1 day ago • Awaiting review</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
