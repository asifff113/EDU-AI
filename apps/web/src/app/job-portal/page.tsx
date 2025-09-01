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
    <div className="space-y-6" suppressHydrationWarning>
      <div className="bg-gradient-to-r from-emerald-500/10 via-blue-500/10 to-cyan-500/10 rounded-xl p-6 border border-white/10">
        <h1 className="text-3xl font-bold mb-2">{t('pages.jobPortalTitle')}</h1>
        <p className="text-muted-foreground">{t('pages.jobPortalDesc')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Listings */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Opportunities</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Search title, company..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
              <Input
                placeholder="Type (full-time, internship)"
                value={type}
                onChange={(e) => setType(e.target.value)}
              />
              <Button onClick={load}>Search</Button>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {jobs.map((j) => (
                <div key={j.id} className="p-4 rounded border bg-background/50">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">
                      {j.title} — <span className="opacity-80">{j.company?.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{j.type}</Badge>
                      {j.remote && <Badge variant="outline">Remote</Badge>}
                    </div>
                  </div>
                  <div className="text-sm opacity-80">{j.location || 'Anywhere'}</div>
                  {j.description && <div className="mt-1 text-sm">{j.description}</div>}
                  <div className="mt-2 flex items-center gap-2">
                    <Input
                      placeholder="Short cover letter (optional)"
                      value={activeJobId === j.id ? cover : ''}
                      onChange={(e) => setCover(e.target.value)}
                    />
                    <Button onClick={() => apply(j.id)} disabled={activeJobId === j.id}>
                      <Send className="h-4 w-4 mr-2" />
                      Apply
                    </Button>
                  </div>
                </div>
              ))}
              {jobs.length === 0 && (
                <div className="text-sm text-muted-foreground">No jobs yet.</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Applications & Resume quick status */}
        <Card>
          <CardHeader>
            <CardTitle>My Applications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="secondary" onClick={loadApps}>
              <Users className="h-4 w-4 mr-2" />
              Refresh Applications
            </Button>
            <div className="space-y-2">
              {apps.map((a) => (
                <div key={a.id} className="p-3 rounded border bg-background/50">
                  <div className="font-medium">{a.job.title}</div>
                  <div className="text-xs opacity-80">
                    {a.job.company?.name} — {a.status}
                  </div>
                </div>
              ))}
              {apps.length === 0 && (
                <div className="text-sm text-muted-foreground">No applications yet.</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
