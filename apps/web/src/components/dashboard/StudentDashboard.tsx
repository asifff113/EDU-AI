'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  BookOpen,
  Calendar,
  TrendingUp,
  Users,
  Clock,
  Award,
  Target,
  PlayCircle,
  FileText,
  Brain,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { getApiBaseUrl } from '@/lib/env';

interface StudentDashboardProps {
  userName: string;
}

export function StudentDashboard({ userName }: StudentDashboardProps) {
  const [isLive, setIsLive] = useState(false);
  useEffect(() => {
    // Fetch recent certificates for the logged in user and inject simple cards
    fetch('/api/certificates?action=mine', { credentials: 'include' })
      .then((r) => r.json())
      .then((list) => {
        const container = document.getElementById('dashboard-certificates');
        if (!container) return;
        container.innerHTML = '';
        (Array.isArray(list) ? list.slice(0, 3) : []).forEach((c: any) => {
          const el = document.createElement('div');
          el.className = 'p-3 rounded border bg-background/50';
          el.innerHTML = `<div class="font-medium">${c.title}</div><div class="text-xs text-muted-foreground">${new Date(c.issuedAt).toLocaleDateString()}</div><div class="text-xs">Serial: ${c.serial}</div>`;
          container.appendChild(el);
        });
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    // Scholarships widget
    const load = () => {
      fetch('/api/scholarships', { credentials: 'include' })
        .then((r) => r.json())
        .then((data) => {
          const container = document.getElementById('dashboard-scholarships');
          if (!container) return;
          container.innerHTML = '';
          const summary = document.createElement('div');
          summary.className = 'p-3 rounded border bg-background/50 mb-2';
          summary.innerHTML = `<div class="font-medium">Points: ${data.totalPoints ?? 0}</div>`;
          container.appendChild(summary);
          const awards = Array.isArray(data.awards) ? data.awards.slice(0, 3) : [];
          awards.forEach((a: any) => {
            const el = document.createElement('div');
            el.className = 'p-3 rounded border bg-background/50 text-xs';
            el.innerHTML = `<div class="font-medium capitalize">${a.kind} — ${a.points} pts</div><div class="text-muted-foreground">${a.reason ?? ''}</div>`;
            container.appendChild(el);
          });
        })
        .catch(() => {});
    };
    load();
    const s = io(`${getApiBaseUrl()}/scholarships`, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
    });
    s.on('connect', () => setIsLive(true));
    s.on('scholarships:update', load);
    return () => {
      s.disconnect();
    };
  }, []);

  useEffect(() => {
    // Gamification live updates
    const base = getApiBaseUrl();
    const s = io(`${base}/gamification`, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      auth: { userId: 'me' },
    });
    s.on('connect', () => setIsLive(true));
    const container = document.getElementById('student-gamification');
    const onUpdate = (m: any) => {
      if (!container) return;
      const el = document.createElement('div');
      el.className = 'p-2 rounded border bg-background/50 text-xs mb-2';
      el.innerHTML = `<div class="font-medium">+${m.pointsDelta || m.xpDelta} pts/xp</div>`;
      container.prepend(el);
    };
    s.on('gamification:update', onUpdate);
    return () => {
      s.off('gamification:update', onUpdate);
      s.close();
    };
  }, []);

  useEffect(() => {
    // Daily Goals: load and realtime
    const loadGoals = async () => {
      const list = await fetch('/api/goals', { credentials: 'include' })
        .then((r) => r.json())
        .catch(() => []);
      const container = document.getElementById('dashboard-goals');
      if (!container) return;
      container.innerHTML = '';
      (Array.isArray(list) ? list.slice(0, 4) : []).forEach((g: any) => {
        const el = document.createElement('div');
        el.className =
          'p-3 rounded border bg-background/50 text-sm flex items-center justify-between';
        el.innerHTML = `<span>${g.title}</span><span class="text-xs text-muted-foreground">${g.targetMinutes}m</span>`;
        container.appendChild(el);
      });
    };
    loadGoals();
    import('socket.io-client').then(({ io }) => {
      const s = io(`${getApiBaseUrl()}/goals`, {
        withCredentials: true,
        transports: ['websocket', 'polling'],
        auth: { userId: 'me' },
      });
      s.on('connect', () => setIsLive(true));
      s.on('goals:update', loadGoals);
      s.on('goals:log', loadGoals);
      return () => s.close();
    });
  }, []);

  useEffect(() => {
    // Skills: minimal progress visualization & realtime
    const loadSkills = async () => {
      const base = getApiBaseUrl();
      const data = await fetch('/api/skills', { credentials: 'include' })
        .then((r) => r.json())
        .catch(() => ({ nodes: [], progress: [] }));
      const container = document.getElementById('dashboard-skills');
      if (!container) return;
      container.innerHTML = '';
      const completed = new Set(
        (data.progress || []).filter((p: any) => p.completed).map((p: any) => p.nodeId),
      );
      (data.nodes || []).slice(0, 6).forEach((n: any) => {
        const el = document.createElement('div');
        el.className =
          'p-3 rounded border bg-background/50 text-sm flex items-center justify-between';
        el.innerHTML = `<span>${n.title}</span><span class="text-xs ${completed.has(n.id) ? 'text-emerald-600' : 'text-muted-foreground'}">${completed.has(n.id) ? 'Done' : 'Pending'}</span>`;
        container.appendChild(el);
      });
    };
    loadSkills();
    import('socket.io-client').then(({ io }) => {
      const s = io(`${getApiBaseUrl()}/skills`, {
        withCredentials: true,
        transports: ['websocket', 'polling'],
        auth: { userId: 'me' },
      });
      s.on('connect', () => setIsLive(true));
      s.on('skills:update', loadSkills);
      return () => s.close();
    });
  }, []);
  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="relative bg-gradient-to-r from-violet-500/15 via-fuchsia-500/10 to-cyan-500/15 rounded-xl p-6 border border-white/10 overflow-hidden">
        <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-violet-500/0 via-fuchsia-500/0 to-cyan-500/0 blur-lg" />
        <div className="relative flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">Welcome back, {userName}! 🎓</h1>
            <p className="text-muted-foreground">
              Ready to continue your learning journey? Let&apos;s achieve your goals today.
            </p>
          </div>
          {isLive && (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              Live
            </div>
          )}
        </div>
      </div>

      {/* Student Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="relative border-white/10 bg-gradient-to-br from-violet-600/15 via-fuchsia-600/10 to-cyan-600/15 backdrop-blur-sm hover:border-white/20 transition-shadow hover:shadow-[0_12px_48px_-12px_rgba(124,58,237,0.45)]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">+2 from last month</p>
          </CardContent>
        </Card>

        <Card className="relative border-white/10 bg-gradient-to-br from-violet-600/15 via-fuchsia-600/10 to-cyan-600/15 backdrop-blur-sm hover:border-white/20 transition-shadow hover:shadow-[0_12px_48px_-12px_rgba(56,189,248,0.35)]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Study Hours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">32.5</div>
            <p className="text-xs text-muted-foreground">This week</p>
          </CardContent>
        </Card>

        <Card className="relative border-white/10 bg-gradient-to-br from-violet-600/15 via-fuchsia-600/10 to-cyan-600/15 backdrop-blur-sm hover:border-white/20 transition-shadow hover:shadow-[0_12px_48px_-12px_rgba(124,58,237,0.35)]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assignments Due</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-orange-600">Due this week</p>
          </CardContent>
        </Card>

        <Card className="relative border-white/10 bg-gradient-to-br from-violet-600/15 via-fuchsia-600/10 to-cyan-600/15 backdrop-blur-sm hover:border-white/20 transition-shadow hover:shadow-[0_12px_48px_-12px_rgba(56,189,248,0.35)]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Certificates</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">7</div>
            <p className="text-xs text-green-600">+1 this month</p>
          </CardContent>
        </Card>
      </div>

      {/* Certificates summary */}
      <Card className="relative border-white/10 bg-gradient-to-br from-violet-600/15 via-fuchsia-600/10 to-cyan-600/15 backdrop-blur-sm hover:border-white/20 transition-shadow hover:shadow-[0_12px_48px_-12px_rgba(124,58,237,0.45)]">
        <CardHeader>
          <CardTitle>Recent Certificates</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            id="dashboard-certificates"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3"
          ></div>
          <div className="mt-3">
            <a href="/certificates" className="underline text-sm">
              View all certificates →
            </a>
          </div>
        </CardContent>
      </Card>

      {/* Scholarships & Learn-to-Earn */}
      <Card className="relative border-white/10 bg-gradient-to-br from-violet-600/15 via-fuchsia-600/10 to-cyan-600/15 backdrop-blur-sm hover:border-white/20 transition-shadow hover:shadow-[0_12px_48px_-12px_rgba(56,189,248,0.35)]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" /> Micro-Scholarships & Learn-to-Earn
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            id="dashboard-scholarships"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3"
          ></div>
          <div className="mt-3 text-xs text-muted-foreground">
            Earn points via merit-based, activity-based, and need-based options. High scores may
            unlock free premium subscription or course discounts.
          </div>
        </CardContent>
      </Card>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Current Courses */}
        <div className="lg:col-span-2">
          <Card className="relative border-white/10 bg-gradient-to-br from-violet-600/15 via-fuchsia-600/10 to-cyan-600/15 backdrop-blur-sm hover:border-white/20 transition-shadow hover:shadow-[0_12px_48px_-12px_rgba(124,58,237,0.45)]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Current Courses
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center">
                      <Brain className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium">Machine Learning Fundamentals</p>
                      <p className="text-sm text-muted-foreground">AI & Data Science</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="secondary">75%</Badge>
                  </div>
                </div>
                <Progress value={75} className="h-2" />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium">Advanced React Development</p>
                      <p className="text-sm text-muted-foreground">Web Development</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="secondary">60%</Badge>
                  </div>
                </div>
                <Progress value={60} className="h-2" />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center">
                      <Target className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium">Data Structures & Algorithms</p>
                      <p className="text-sm text-muted-foreground">Computer Science</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="secondary">45%</Badge>
                  </div>
                </div>
                <Progress value={45} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          {/* Daily Goals */}
          <Card className="relative border-white/10 bg-white/[0.04] backdrop-blur-sm hover:border-white/20 transition-shadow hover:shadow-[0_12px_48px_-12px_rgba(124,58,237,0.45)]">
            <CardHeader>
              <CardTitle>Daily Goals & Streak</CardTitle>
            </CardHeader>
            <CardContent>
              <div id="dashboard-goals" className="space-y-2"></div>
              <div className="mt-2 text-xs text-muted-foreground">
                Track study targets and keep your streak going.
              </div>
            </CardContent>
          </Card>

          <Card className="relative border-white/10 bg-white/[0.04] backdrop-blur-sm hover:border-white/20 transition-shadow hover:shadow-[0_12px_48px_-12px_rgba(56,189,248,0.35)]">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start" variant="outline">
                <PlayCircle className="h-4 w-4 mr-2" />
                Resume Learning
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Calendar className="h-4 w-4 mr-2" />
                View Schedule
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                Submit Assignment
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Users className="h-4 w-4 mr-2" />
                Join Study Group
              </Button>
            </CardContent>
          </Card>

          {/* Upcoming Deadlines */}
          <Card className="relative border-white/10 bg-white/[0.04] backdrop-blur-sm hover:border-white/20 transition-shadow hover:shadow-[0_12px_48px_-12px_rgba(124,58,237,0.35)]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Upcoming Deadlines
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">ML Project</p>
                  <p className="text-xs text-muted-foreground">Machine Learning</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-medium text-red-600">2 days</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">React Quiz</p>
                  <p className="text-xs text-muted-foreground">Web Development</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-medium text-orange-600">5 days</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">Algorithm Analysis</p>
                  <p className="text-xs text-muted-foreground">Computer Science</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-medium text-green-600">1 week</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Skill Tree Snapshot */}
          <Card className="relative border-white/10 bg-white/[0.04] backdrop-blur-sm hover:border-white/20 transition-shadow hover:shadow-[0_12px_48px_-12px_rgba(56,189,248,0.35)]">
            <CardHeader>
              <CardTitle>Skill Tree</CardTitle>
            </CardHeader>
            <CardContent>
              <div id="dashboard-skills" className="space-y-2"></div>
              <div className="mt-2 text-xs text-muted-foreground">
                Visualize milestones and achievement paths.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
