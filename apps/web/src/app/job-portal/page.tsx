'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Briefcase, Send } from 'lucide-react';
import { io, Socket } from 'socket.io-client';

type Company = { id: string; name: string; website?: string };
type Job = {
  id: string;
  title: string;
  type: string;
  location?: string;
  remote: boolean;
  description?: string;
  requirements?: string;
  salaryMin?: number;
  salaryMax?: number;
  company: Company;
};
type Application = { id: string; status: string; job: Job };

export default function JobPortalPage() {
  const { t } = useTranslation('common');
  const [q, setQ] = useState('');
  const [type, setType] = useState('');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [apps, setApps] = useState<Application[]>([]);
  const [cover, setCover] = useState('');
  const [activeJobId, setActiveJobId] = useState<string>('');
  const [sock, setSock] = useState<Socket | null>(null);

  const load = async () => {
    const res = await fetch(
      `/api/jobs?q=${encodeURIComponent(q)}&type=${encodeURIComponent(type)}`,
      { credentials: 'include' },
    );
    const data = await res.json();
    const array = Array.isArray(data) ? data : [];
    if (array.length === 0) {
      // Fallback demo jobs to avoid empty state if API not reachable yet
      setJobs([
        {
          id: 'demo-1',
          title: 'Data Analyst Intern',
          type: 'internship',
          location: 'Remote',
          remote: true,
          description: 'Assist with dashboards and reporting.',
          company: { id: 'demo', name: 'Demo Corp' } as any,
        } as any,
        {
          id: 'demo-2',
          title: 'Junior Frontend Developer',
          type: 'full-time',
          location: 'Remote',
          remote: true,
          description: 'Build UI with React/Next.js',
          company: { id: 'demo', name: 'Demo Corp' } as any,
        } as any,
        {
          id: 'demo-3',
          title: 'Cloud Engineer (Intern)',
          type: 'internship',
          location: 'Dhaka',
          remote: false,
          description: 'Support cloud ops and CI/CD',
          company: { id: 'demo', name: 'CloudNine' } as any,
        } as any,
      ]);
    } else {
      setJobs(array);
    }
  };
  const loadApps = async () => {
    const res = await fetch(`/api/jobs?action=applications`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    const data = await res.json();
    setApps(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    load();
    const s = io('/jobs', { withCredentials: true, transports: ['websocket', 'polling'] });
    setSock(s);
    s.on('jobs:new', () => load());
    s.on('applications:update', () => loadApps());
    return () => {
      s.disconnect();
    };
  }, []);

  const apply = async (jobId: string) => {
    setActiveJobId(jobId);
    const res = await fetch('/api/jobs?action=apply', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobId, coverLetter: cover }),
    });
    if (res.ok) {
      setCover('');
      await loadApps();
      alert('Application submitted');
    } else {
      const err = await res.json().catch(() => ({}));
      alert(err?.message || 'Failed to apply');
    }
    setActiveJobId('');
  };

  return (
    <div className="space-y-8" suppressHydrationWarning>
      {/* Enhanced Professional Header */}
      <div
        className="relative group bg-gradient-to-r from-slate-600/20 via-blue-700/15 to-indigo-600/20 
        rounded-2xl p-8 border border-slate-500/20 backdrop-blur-xl shadow-2xl shadow-slate-500/10
        hover:shadow-3xl hover:shadow-blue-500/20 transition-all duration-700 transform-gpu
        before:absolute before:inset-0 before:bg-gradient-to-r before:from-slate-600/5 before:to-blue-700/5 
        before:rounded-2xl before:opacity-0 before:transition-opacity before:duration-500 hover:before:opacity-100"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-2xl"></div>
        <div className="relative z-10 flex items-center gap-4">
          <div className="p-4 rounded-2xl bg-slate-600/20 group-hover:bg-slate-500/30 transition-all duration-300 group-hover:rotate-6 group-hover:scale-110 transform-gpu">
            <Briefcase className="h-8 w-8 text-slate-300 group-hover:text-slate-200" />
          </div>
          <div>
            <h1 className="text-4xl font-bold mb-2 text-white group-hover:text-slate-100 transition-colors duration-300">
              {t('pages.jobPortalTitle')}
            </h1>
            <p className="text-slate-300 group-hover:text-slate-200 transition-colors duration-300 text-lg">
              {t('pages.jobPortalDesc')}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Enhanced Job Listings - Professional Blue Theme */}
        <Card
          className="lg:col-span-2 group relative border-0 bg-gradient-to-br from-blue-600/20 via-indigo-700/15 to-slate-700/20 
          backdrop-blur-xl shadow-xl shadow-blue-600/20 hover:shadow-2xl hover:shadow-blue-600/30 
          transition-all duration-500 hover:scale-[1.01] transform-gpu perspective-1000 
          before:absolute before:inset-0 before:bg-gradient-to-r before:from-blue-600/10 before:to-indigo-600/10 
          before:rounded-xl before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-100"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-xl"></div>
          <CardHeader className="relative z-10">
            <CardTitle
              className="text-2xl font-bold text-white group-hover:text-blue-200 transition-colors duration-300 
              flex items-center gap-3"
            >
              <div className="p-2 rounded-lg bg-blue-600/20 group-hover:bg-blue-500/30 transition-all duration-300 group-hover:rotate-6">
                <div className="text-2xl">💼</div>
              </div>
              Career Opportunities
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 relative z-10">
            {/* Enhanced Search Section */}
            <div className="p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-blue-500/30">
              <div className="flex flex-col sm:flex-row gap-3">
                <Input
                  placeholder="Search title, company..."
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  className="flex-1 bg-white/10 border border-blue-500/30 text-white placeholder:text-blue-300/60 
                    focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 backdrop-blur-sm"
                />
                <Input
                  placeholder="Type (full-time, internship)"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="bg-white/10 border border-blue-500/30 text-white placeholder:text-blue-300/60 
                    focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 backdrop-blur-sm"
                />
                <Button
                  onClick={load}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 
                    text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300 
                    hover:scale-110 transform-gpu"
                >
                  Search
                </Button>
              </div>
            </div>
            {/* Enhanced Job Cards */}
            <div className="space-y-4">
              {jobs.map((j, index) => {
                const jobColors = [
                  'from-emerald-500/20 to-green-600/20 shadow-emerald-500/15 hover:shadow-emerald-500/25 border-emerald-400/30',
                  'from-blue-500/20 to-indigo-600/20 shadow-blue-500/15 hover:shadow-blue-500/25 border-blue-400/30',
                  'from-purple-500/20 to-violet-600/20 shadow-purple-500/15 hover:shadow-purple-500/25 border-purple-400/30',
                  'from-orange-500/20 to-amber-600/20 shadow-orange-500/15 hover:shadow-orange-500/25 border-orange-400/30',
                  'from-pink-500/20 to-rose-600/20 shadow-pink-500/15 hover:shadow-pink-500/25 border-pink-400/30',
                ];
                const color = jobColors[index % jobColors.length];
                return (
                  <div
                    key={j.id}
                    className={`group relative p-6 rounded-xl bg-gradient-to-br backdrop-blur-sm border 
                    hover:scale-105 hover:-translate-y-1 transition-all duration-300 transform-gpu cursor-pointer ${color}`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-xl"></div>
                    <div className="relative z-10">
                      {/* Job Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-white group-hover:scale-105 transition-transform duration-300">
                            {j.title}
                          </h3>
                          <p className="text-lg text-white/80 group-hover:text-white transition-colors duration-300 mt-1">
                            {j.company?.name}
                          </p>
                        </div>
                        <div className="flex flex-col gap-2">
                          <Badge
                            className={`${
                              j.type === 'full-time'
                                ? 'bg-green-500/30 text-green-200 border-green-400/30'
                                : 'bg-blue-500/30 text-blue-200 border-blue-400/30'
                            } transition-all duration-300 hover:scale-110`}
                          >
                            {j.type}
                          </Badge>
                          {j.remote && (
                            <Badge
                              className="bg-purple-500/30 text-purple-200 border-purple-400/30 
                            transition-all duration-300 hover:scale-110"
                            >
                              Remote
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Job Details */}
                      <div className="mb-4">
                        <div className="text-white/70 mb-2 flex items-center gap-2">
                          📍 {j.location || 'Anywhere'}
                        </div>
                        {j.description && (
                          <p className="text-white/80 group-hover:text-white transition-colors duration-300">
                            {j.description}
                          </p>
                        )}
                        {j.salaryMin && j.salaryMax && (
                          <div className="mt-2 text-green-300 font-semibold">
                            ৳{j.salaryMin.toLocaleString()} - ৳{j.salaryMax.toLocaleString()}
                          </div>
                        )}
                      </div>

                      {/* Application Section */}
                      <div className="space-y-3 p-4 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20">
                        <Input
                          placeholder="Short cover letter (optional)"
                          value={activeJobId === j.id ? cover : ''}
                          onChange={(e) => setCover(e.target.value)}
                          className="bg-white/10 border border-white/30 text-white placeholder:text-white/60 
                          focus:border-white/50 focus:ring-2 focus:ring-white/20 transition-all duration-300 backdrop-blur-sm"
                        />
                        <Button
                          onClick={() => apply(j.id)}
                          disabled={activeJobId === j.id}
                          className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 
                          text-white shadow-lg shadow-green-500/25 hover:shadow-green-500/40 transition-all duration-300 
                          hover:scale-105 transform-gpu disabled:opacity-50"
                        >
                          <Send className="h-4 w-4 mr-2" />
                          {activeJobId === j.id ? 'Applying...' : 'Apply Now'}
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
              {jobs.length === 0 && (
                <div className="p-12 text-center">
                  <div className="text-6xl mb-4">🔍</div>
                  <div className="text-xl font-semibold text-white mb-2">
                    No opportunities found
                  </div>
                  <div className="text-blue-300">
                    Try adjusting your search criteria or check back later for new postings
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Enhanced My Applications - Success Green Theme */}
        <Card
          className="group relative border-0 bg-gradient-to-br from-green-500/20 via-emerald-600/15 to-teal-600/20 
          backdrop-blur-xl shadow-xl shadow-green-500/20 hover:shadow-2xl hover:shadow-green-500/30 
          transition-all duration-500 hover:scale-105 hover:-translate-y-2 transform-gpu perspective-1000 
          before:absolute before:inset-0 before:bg-gradient-to-r before:from-green-500/10 before:to-emerald-500/10 
          before:rounded-xl before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-100"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-xl"></div>
          <CardHeader className="relative z-10">
            <CardTitle
              className="text-xl font-bold text-white group-hover:text-green-200 transition-colors duration-300 
              flex items-center gap-3"
            >
              <div className="p-2 rounded-lg bg-green-500/20 group-hover:bg-green-400/30 transition-all duration-300 group-hover:rotate-6">
                <div className="text-2xl">📊</div>
              </div>
              My Applications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 relative z-10">
            {/* Enhanced Refresh Button */}
            <Button
              onClick={loadApps}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 
                text-white shadow-lg shadow-green-500/25 hover:shadow-green-500/40 transition-all duration-300 
                hover:scale-105 transform-gpu"
            >
              <Users className="h-4 w-4 mr-2" />
              Refresh Applications
            </Button>

            {/* Enhanced Applications List */}
            <div className="space-y-3">
              {apps.map((a, index) => {
                const statusColors = {
                  pending:
                    'from-yellow-500/20 to-amber-500/20 border-yellow-400/30 text-yellow-200',
                  reviewing: 'from-blue-500/20 to-cyan-500/20 border-blue-400/30 text-blue-200',
                  accepted:
                    'from-green-500/20 to-emerald-500/20 border-green-400/30 text-green-200',
                  rejected: 'from-red-500/20 to-pink-500/20 border-red-400/30 text-red-200',
                };
                const statusColor =
                  statusColors[a.status as keyof typeof statusColors] || statusColors.pending;
                return (
                  <div
                    key={a.id}
                    className={`group relative p-4 rounded-xl bg-gradient-to-br backdrop-blur-sm border 
                    hover:scale-105 hover:-translate-y-1 transition-all duration-300 transform-gpu cursor-pointer ${statusColor}`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-xl"></div>
                    <div className="relative z-10">
                      <div className="font-bold text-white group-hover:scale-105 transition-transform duration-300 mb-2">
                        {a.job.title}
                      </div>
                      <div className="text-sm text-white/80 mb-2">{a.job.company?.name}</div>
                      <Badge
                        className={`bg-white/20 text-white border-white/30 hover:bg-white/30 transition-all duration-300 capitalize`}
                      >
                        {a.status}
                      </Badge>
                    </div>
                  </div>
                );
              })}
              {apps.length === 0 && (
                <div className="p-8 text-center">
                  <div className="text-4xl mb-4">🎯</div>
                  <div className="text-lg font-semibold text-white mb-2">No applications yet</div>
                  <div className="text-green-300 text-sm">
                    Start applying to track your career progress here!
                  </div>
                </div>
              )}
            </div>

            {/* Career Progress Summary */}
            {apps.length > 0 && (
              <div className="p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-green-500/30">
                <h4 className="font-bold text-white mb-3 flex items-center gap-2">
                  📈 Application Summary
                </h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="text-center p-2 rounded-lg bg-white/10">
                    <div className="font-bold text-white text-lg">{apps.length}</div>
                    <div className="text-green-300">Total Applied</div>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-white/10">
                    <div className="font-bold text-white text-lg">
                      {apps.filter((a) => a.status === 'accepted').length}
                    </div>
                    <div className="text-green-300">Accepted</div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
