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
        (Array.isArray(list) ? list.slice(0, 3) : []).forEach((c: any, index: number) => {
          const el = document.createElement('div');
          const colors = [
            'from-blue-500/20 to-cyan-500/20 shadow-blue-500/10 hover:shadow-blue-500/20 border-blue-400/20',
            'from-green-500/20 to-emerald-500/20 shadow-green-500/10 hover:shadow-green-500/20 border-emerald-400/20',
            'from-purple-500/20 to-pink-500/20 shadow-purple-500/10 hover:shadow-purple-500/20 border-purple-400/20',
          ];
          const textColors = ['text-blue-300', 'text-emerald-300', 'text-purple-300'];
          const color = colors[index % colors.length];
          const textColor = textColors[index % textColors.length];

          el.className = `p-4 rounded-xl border bg-gradient-to-br ${color} backdrop-blur-sm 
            hover:scale-105 transition-all duration-300 transform-gpu group cursor-pointer`;
          el.innerHTML = `
            <div class="font-semibold text-white group-hover:${textColor.replace('300', '200')} transition-colors duration-300 text-sm">
              ${c.title}
            </div>
            <div class="text-xs ${textColor} group-hover:${textColor.replace('300', '200')} transition-colors duration-300 mt-1">
              ${new Date(c.issuedAt).toLocaleDateString()}
            </div>
            <div class="text-xs ${textColor}/80 group-hover:${textColor.replace('300', '200')} transition-colors duration-300 mt-1">
              Serial: ${c.serial}
            </div>
          `;
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Active Courses Card - Purple/Violet Theme */}
        <Card
          className="group relative border-0 bg-gradient-to-br from-violet-500/20 via-purple-600/15 to-indigo-600/20 
          backdrop-blur-xl shadow-xl shadow-violet-500/20 hover:shadow-2xl hover:shadow-violet-500/30 
          transition-all duration-500 hover:scale-105 hover:-translate-y-2 transform-gpu perspective-1000 
          before:absolute before:inset-0 before:bg-gradient-to-r before:from-violet-500/10 before:to-purple-600/10 
          before:rounded-xl before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-100"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-xl"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-white group-hover:text-violet-200 transition-colors duration-300">
              Active Courses
            </CardTitle>
            <div className="p-2 rounded-lg bg-violet-500/20 group-hover:bg-violet-400/30 transition-all duration-300 group-hover:rotate-12 group-hover:scale-110">
              <BookOpen className="h-4 w-4 text-violet-300 group-hover:text-violet-200" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div
              className="text-3xl font-bold text-white group-hover:text-violet-100 transition-colors duration-300 
              group-hover:scale-110 transform origin-left"
            >
              5
            </div>
            <p className="text-xs text-violet-300 group-hover:text-violet-200 transition-colors duration-300">
              +2 from last month
            </p>
          </CardContent>
        </Card>

        {/* Study Hours Card - Cyan/Blue Theme */}
        <Card
          className="group relative border-0 bg-gradient-to-br from-cyan-500/20 via-sky-600/15 to-blue-600/20 
          backdrop-blur-xl shadow-xl shadow-cyan-500/20 hover:shadow-2xl hover:shadow-cyan-500/30 
          transition-all duration-500 hover:scale-105 hover:-translate-y-2 transform-gpu perspective-1000 
          before:absolute before:inset-0 before:bg-gradient-to-r before:from-cyan-500/10 before:to-sky-600/10 
          before:rounded-xl before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-100"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-xl"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-white group-hover:text-cyan-200 transition-colors duration-300">
              Study Hours
            </CardTitle>
            <div className="p-2 rounded-lg bg-cyan-500/20 group-hover:bg-cyan-400/30 transition-all duration-300 group-hover:rotate-12 group-hover:scale-110">
              <Clock className="h-4 w-4 text-cyan-300 group-hover:text-cyan-200" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div
              className="text-3xl font-bold text-white group-hover:text-cyan-100 transition-colors duration-300 
              group-hover:scale-110 transform origin-left"
            >
              32.5
            </div>
            <p className="text-xs text-cyan-300 group-hover:text-cyan-200 transition-colors duration-300">
              This week
            </p>
          </CardContent>
        </Card>

        {/* Assignments Due Card - Orange/Red Theme */}
        <Card
          className="group relative border-0 bg-gradient-to-br from-orange-500/20 via-red-500/15 to-pink-600/20 
          backdrop-blur-xl shadow-xl shadow-orange-500/20 hover:shadow-2xl hover:shadow-orange-500/30 
          transition-all duration-500 hover:scale-105 hover:-translate-y-2 transform-gpu perspective-1000 
          before:absolute before:inset-0 before:bg-gradient-to-r before:from-orange-500/10 before:to-red-500/10 
          before:rounded-xl before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-100"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-xl"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-white group-hover:text-orange-200 transition-colors duration-300">
              Assignments Due
            </CardTitle>
            <div className="p-2 rounded-lg bg-orange-500/20 group-hover:bg-orange-400/30 transition-all duration-300 group-hover:rotate-12 group-hover:scale-110">
              <Calendar className="h-4 w-4 text-orange-300 group-hover:text-orange-200" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div
              className="text-3xl font-bold text-white group-hover:text-orange-100 transition-colors duration-300 
              group-hover:scale-110 transform origin-left"
            >
              3
            </div>
            <p className="text-xs text-orange-300 group-hover:text-orange-200 transition-colors duration-300">
              Due this week
            </p>
          </CardContent>
        </Card>

        {/* Certificates Card - Green/Emerald Theme */}
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
              Certificates
            </CardTitle>
            <div className="p-2 rounded-lg bg-emerald-500/20 group-hover:bg-emerald-400/30 transition-all duration-300 group-hover:rotate-12 group-hover:scale-110">
              <Award className="h-4 w-4 text-emerald-300 group-hover:text-emerald-200" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div
              className="text-3xl font-bold text-white group-hover:text-emerald-100 transition-colors duration-300 
              group-hover:scale-110 transform origin-left"
            >
              7
            </div>
            <p className="text-xs text-emerald-300 group-hover:text-emerald-200 transition-colors duration-300">
              +1 this month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Certificates Section - Enhanced with 3D Effects */}
      <Card
        className="group relative border-0 bg-gradient-to-br from-purple-500/15 via-pink-600/10 to-rose-600/15 
        backdrop-blur-xl shadow-2xl shadow-purple-500/10 hover:shadow-3xl hover:shadow-purple-500/20 
        transition-all duration-700 hover:scale-[1.02] transform-gpu perspective-1000 
        before:absolute before:inset-0 before:bg-gradient-to-r before:from-purple-500/5 before:to-pink-500/5 
        before:rounded-xl before:opacity-0 before:transition-opacity before:duration-500 hover:before:opacity-100"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-xl"></div>
        <CardHeader className="relative z-10">
          <CardTitle
            className="text-xl font-bold text-white group-hover:text-purple-200 transition-colors duration-300 
            flex items-center gap-3"
          >
            <div className="p-2 rounded-lg bg-purple-500/20 group-hover:bg-purple-400/30 transition-all duration-300 group-hover:rotate-6">
              <Award className="h-5 w-5 text-purple-300 group-hover:text-purple-200" />
            </div>
            Recent Certificates
          </CardTitle>
        </CardHeader>
        <CardContent className="relative z-10">
          <div
            id="dashboard-certificates"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3"
          ></div>
          <div className="mt-6">
            <Button
              asChild
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 
              text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-300 
              hover:scale-105 transform-gpu"
            >
              <a href="/certificates" className="flex items-center gap-2">
                <Award className="h-4 w-4" />
                View all certificates →
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Scholarships & Learn-to-Earn Section - Enhanced with 3D Effects */}
      <Card
        className="group relative border-0 bg-gradient-to-br from-yellow-500/15 via-orange-600/10 to-red-600/15 
        backdrop-blur-xl shadow-2xl shadow-yellow-500/10 hover:shadow-3xl hover:shadow-yellow-500/20 
        transition-all duration-700 hover:scale-[1.02] transform-gpu perspective-1000 
        before:absolute before:inset-0 before:bg-gradient-to-r before:from-yellow-500/5 before:to-orange-500/5 
        before:rounded-xl before:opacity-0 before:transition-opacity before:duration-500 hover:before:opacity-100"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-xl"></div>
        <CardHeader className="relative z-10">
          <CardTitle
            className="text-xl font-bold text-white group-hover:text-yellow-200 transition-colors duration-300 
            flex items-center gap-3"
          >
            <div className="p-2 rounded-lg bg-yellow-500/20 group-hover:bg-yellow-400/30 transition-all duration-300 group-hover:rotate-6">
              <Award className="h-5 w-5 text-yellow-300 group-hover:text-yellow-200" />
            </div>
            Micro-Scholarships & Learn-to-Earn
          </CardTitle>
        </CardHeader>
        <CardContent className="relative z-10">
          <div
            id="dashboard-scholarships"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          ></div>
          <div className="mt-4 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
            <p className="text-sm text-yellow-200 group-hover:text-yellow-100 transition-colors duration-300">
              🌟 Earn points via merit-based, activity-based, and need-based options. High scores
              may unlock free premium subscription or course discounts!
            </p>
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
          {/* Daily Goals & Streak - Teal/Turquoise Theme */}
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
                  <Target className="h-5 w-5 text-teal-300 group-hover:text-teal-200" />
                </div>
                Daily Goals & Streak
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <div id="dashboard-goals" className="space-y-3"></div>
              <div className="mt-4 p-3 rounded-lg bg-teal-500/10 border border-teal-500/20">
                <p className="text-sm text-teal-200 group-hover:text-teal-100 transition-colors duration-300">
                  🎯 Track study targets and keep your streak going.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions - Blue/Indigo Theme */}
          <Card
            className="group relative border-0 bg-gradient-to-br from-blue-500/20 via-indigo-600/15 to-purple-600/20 
            backdrop-blur-xl shadow-xl shadow-blue-500/20 hover:shadow-2xl hover:shadow-blue-500/30 
            transition-all duration-500 hover:scale-105 hover:-translate-y-2 transform-gpu perspective-1000 
            before:absolute before:inset-0 before:bg-gradient-to-r before:from-blue-500/10 before:to-indigo-500/10 
            before:rounded-xl before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-100"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-xl"></div>
            <CardHeader className="relative z-10">
              <CardTitle
                className="text-xl font-bold text-white group-hover:text-blue-200 transition-colors duration-300 
                flex items-center gap-3"
              >
                <div className="p-2 rounded-lg bg-blue-500/20 group-hover:bg-blue-400/30 transition-all duration-300 group-hover:rotate-6">
                  <Brain className="h-5 w-5 text-blue-300 group-hover:text-blue-200" />
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
                <PlayCircle className="h-4 w-4 mr-2 text-green-300 group-hover:text-green-200" />
                Resume Learning
              </Button>
              <Button
                className="w-full justify-start group bg-gradient-to-r from-cyan-500/20 to-sky-500/20 
                hover:from-cyan-500/30 hover:to-sky-500/30 border-cyan-500/30 hover:border-cyan-400 
                text-white hover:text-cyan-100 transition-all duration-300 hover:scale-105 transform-gpu"
                variant="outline"
              >
                <Calendar className="h-4 w-4 mr-2 text-cyan-300 group-hover:text-cyan-200" />
                View Schedule
              </Button>
              <Button
                className="w-full justify-start group bg-gradient-to-r from-orange-500/20 to-red-500/20 
                hover:from-orange-500/30 hover:to-red-500/30 border-orange-500/30 hover:border-orange-400 
                text-white hover:text-orange-100 transition-all duration-300 hover:scale-105 transform-gpu"
                variant="outline"
              >
                <FileText className="h-4 w-4 mr-2 text-orange-300 group-hover:text-orange-200" />
                Submit Assignment
              </Button>
              <Button
                className="w-full justify-start group bg-gradient-to-r from-purple-500/20 to-pink-500/20 
                hover:from-purple-500/30 hover:to-pink-500/30 border-purple-500/30 hover:border-purple-400 
                text-white hover:text-purple-100 transition-all duration-300 hover:scale-105 transform-gpu"
                variant="outline"
              >
                <Users className="h-4 w-4 mr-2 text-purple-300 group-hover:text-purple-200" />
                Join Study Group
              </Button>
            </CardContent>
          </Card>

          {/* Upcoming Deadlines - Red/Pink Theme */}
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
                  <Calendar className="h-5 w-5 text-red-300 group-hover:text-red-200" />
                </div>
                Upcoming Deadlines
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 relative z-10">
              <div
                className="flex items-center justify-between p-3 rounded-lg bg-red-500/10 border border-red-500/20 
                hover:bg-red-500/20 transition-all duration-300 hover:scale-105 transform-gpu group cursor-pointer"
              >
                <div>
                  <p className="font-semibold text-sm text-white group-hover:text-red-100">
                    ML Project
                  </p>
                  <p className="text-xs text-red-300 group-hover:text-red-200">Machine Learning</p>
                </div>
                <div className="text-right">
                  <p
                    className="text-xs font-bold text-red-200 bg-red-600/30 px-2 py-1 rounded-full 
                    group-hover:bg-red-500/40 transition-colors duration-300"
                  >
                    2 days
                  </p>
                </div>
              </div>
              <div
                className="flex items-center justify-between p-3 rounded-lg bg-orange-500/10 border border-orange-500/20 
                hover:bg-orange-500/20 transition-all duration-300 hover:scale-105 transform-gpu group cursor-pointer"
              >
                <div>
                  <p className="font-semibold text-sm text-white group-hover:text-orange-100">
                    React Quiz
                  </p>
                  <p className="text-xs text-orange-300 group-hover:text-orange-200">
                    Web Development
                  </p>
                </div>
                <div className="text-right">
                  <p
                    className="text-xs font-bold text-orange-200 bg-orange-600/30 px-2 py-1 rounded-full 
                    group-hover:bg-orange-500/40 transition-colors duration-300"
                  >
                    5 days
                  </p>
                </div>
              </div>
              <div
                className="flex items-center justify-between p-3 rounded-lg bg-green-500/10 border border-green-500/20 
                hover:bg-green-500/20 transition-all duration-300 hover:scale-105 transform-gpu group cursor-pointer"
              >
                <div>
                  <p className="font-semibold text-sm text-white group-hover:text-green-100">
                    Algorithm Analysis
                  </p>
                  <p className="text-xs text-green-300 group-hover:text-green-200">
                    Computer Science
                  </p>
                </div>
                <div className="text-right">
                  <p
                    className="text-xs font-bold text-green-200 bg-green-600/30 px-2 py-1 rounded-full 
                    group-hover:bg-green-500/40 transition-colors duration-300"
                  >
                    1 week
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Skill Tree - Green/Lime Theme */}
          <Card
            className="group relative border-0 bg-gradient-to-br from-lime-500/20 via-green-600/15 to-emerald-600/20 
            backdrop-blur-xl shadow-xl shadow-lime-500/20 hover:shadow-2xl hover:shadow-lime-500/30 
            transition-all duration-500 hover:scale-105 hover:-translate-y-2 transform-gpu perspective-1000 
            before:absolute before:inset-0 before:bg-gradient-to-r before:from-lime-500/10 before:to-green-500/10 
            before:rounded-xl before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-100"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-xl"></div>
            <CardHeader className="relative z-10">
              <CardTitle
                className="text-xl font-bold text-white group-hover:text-lime-200 transition-colors duration-300 
                flex items-center gap-3"
              >
                <div className="p-2 rounded-lg bg-lime-500/20 group-hover:bg-lime-400/30 transition-all duration-300 group-hover:rotate-6">
                  <TrendingUp className="h-5 w-5 text-lime-300 group-hover:text-lime-200" />
                </div>
                Skill Tree
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <div id="dashboard-skills" className="space-y-3"></div>
              <div className="mt-4 p-3 rounded-lg bg-lime-500/10 border border-lime-500/20">
                <p className="text-sm text-lime-200 group-hover:text-lime-100 transition-colors duration-300">
                  🌳 Visualize milestones and achievement paths.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
