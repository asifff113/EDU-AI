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

      {/* QA Solver Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-white/10 bg-gradient-to-br from-violet-600/15 via-fuchsia-600/10 to-cyan-600/15 backdrop-blur-sm hover:border-white/20 transition-shadow hover:shadow-[0_12px_48px_-12px_rgba(124,58,237,0.45)]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Questions Solved</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,247</div>
            <p className="text-xs text-muted-foreground">+23 this week</p>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-gradient-to-br from-violet-600/15 via-fuchsia-600/10 to-cyan-600/15 backdrop-blur-sm hover:border-white/20 transition-shadow hover:shadow-[0_12px_48px_-12px_rgba(56,189,248,0.35)]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94%</div>
            <p className="text-xs text-green-600">Above average</p>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-gradient-to-br from-violet-600/15 via-fuchsia-600/10 to-cyan-600/15 backdrop-blur-sm hover:border-white/20 transition-shadow hover:shadow-[0_12px_48px_-12px_rgba(124,58,237,0.35)]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">৳28,500</div>
            <p className="text-xs text-green-600">+15% from last month</p>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-gradient-to-br from-violet-600/15 via-fuchsia-600/10 to-cyan-600/15 backdrop-blur-sm hover:border-white/20 transition-shadow hover:shadow-[0_12px_48px_-12px_rgba(56,189,248,0.35)]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.9</div>
            <p className="text-xs text-muted-foreground">Based on 456 reviews</p>
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
          <Card className="border-white/10 bg-gradient-to-br from-violet-600/15 via-fuchsia-600/10 to-cyan-600/15 backdrop-blur-sm hover:border-white/20 transition-shadow hover:shadow-[0_12px_48px_-12px_rgba(124,58,237,0.45)]">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start" variant="outline">
                <MessageSquare className="h-4 w-4 mr-2" />
                Browse New Questions
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Clock className="h-4 w-4 mr-2" />
                View My Answers
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <TrendingUp className="h-4 w-4 mr-2" />
                View Earnings
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Award className="h-4 w-4 mr-2" />
                My Achievements
              </Button>
            </CardContent>
          </Card>

          {/* Subject Expertise */}
          <Card className="border-white/10 bg-gradient-to-br from-violet-600/15 via-fuchsia-600/10 to-cyan-600/15 backdrop-blur-sm hover:border-white/20 transition-shadow hover:shadow-[0_12px_48px_-12px_rgba(56,189,248,0.35)]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Subject Expertise
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Mathematics</span>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">Expert</Badge>
                  <span className="text-xs text-muted-foreground">4.9⭐</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Physics</span>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">Expert</Badge>
                  <span className="text-xs text-muted-foreground">4.8⭐</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Chemistry</span>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">Advanced</Badge>
                  <span className="text-xs text-muted-foreground">4.7⭐</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Biology</span>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">Intermediate</Badge>
                  <span className="text-xs text-muted-foreground">4.5⭐</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="border-white/10 bg-gradient-to-br from-violet-600/15 via-fuchsia-600/10 to-cyan-600/15 backdrop-blur-sm hover:border-white/20 transition-shadow hover:shadow-[0_12px_48px_-12px_rgba(124,58,237,0.35)]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-sm">Solved Algebra Problem</p>
                  <div className="flex items-center gap-1">
                    <CheckCircle className="h-3 w-3 text-green-600" />
                    <span className="text-xs text-green-600">৳120</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">2 hours ago • 5⭐ rating</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-sm">Physics Explanation</p>
                  <div className="flex items-center gap-1">
                    <CheckCircle className="h-3 w-3 text-green-600" />
                    <span className="text-xs text-green-600">৳180</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">5 hours ago • 4⭐ rating</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-sm">Chemistry Help</p>
                  <div className="flex items-center gap-1">
                    <AlertCircle className="h-3 w-3 text-orange-600" />
                    <span className="text-xs text-orange-600">Pending</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">1 day ago • Awaiting review</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
