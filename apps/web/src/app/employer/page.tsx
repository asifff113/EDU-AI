'use client';

import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

type Job = {
  id: string;
  title: string;
  type: string;
  location?: string;
  isOpen?: boolean;
  createdAt?: string;
  applicants?: number;
  company?: { name: string };
};
type Applicant = {
  id: string;
  status: string;
  user: { id: string; email: string; firstName?: string; lastName?: string };
};

export default function EmployerPage() {
  const { t } = useTranslation('common');
  const [myJobs, setMyJobs] = useState<Job[]>([]);
  const [jobsFilter, setJobsFilter] = useState<{ q: string; type: string; open: string }>({
    q: '',
    type: 'all',
    open: 'all',
  });
  const [title, setTitle] = useState('');
  const [type, setType] = useState('internship');
  const [companyName, setCompanyName] = useState('');
  const [selectedJobId, setSelectedJobId] = useState<string>('');
  const [applicants, setApplicants] = useState<Applicant[]>([]);

  const loadMine = async () => {
    // Load all jobs (backend may scope to owner); for UI demo, reuse public list and filter
    const res = await fetch('/api/jobs', { credentials: 'include' });
    const data = await res.json().catch(() => []);
    setMyJobs(Array.isArray(data) ? data : []);
  };

  const post = async () => {
    const res = await fetch('/api/jobs?action=post', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, type, companyName }),
    });
    if (res.ok) {
      setTitle('');
      setCompanyName('');
      alert('Job posted');
      await loadMine();
    } else {
      alert('Failed to post');
    }
  };

  const viewApplicants = async (jobId: string) => {
    setSelectedJobId(jobId);
    const res = await fetch('/api/jobs?action=applicants', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobId }),
    });
    const data = await res.json();
    setApplicants(Array.isArray(data) ? data : []);
  };

  const setStatus = async (applicationId: string, status: string) => {
    const res = await fetch('/api/jobs?action=set-status', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ applicationId, status }),
    });
    if (res.ok) {
      await viewApplicants(selectedJobId);
    }
  };

  useEffect(() => {
    loadMine();
  }, []);

  const filteredJobs = useMemo(() => {
    return myJobs.filter((j) => {
      const qOk =
        !jobsFilter.q ||
        j.title?.toLowerCase().includes(jobsFilter.q.toLowerCase()) ||
        j.company?.name?.toLowerCase().includes(jobsFilter.q.toLowerCase());
      const typeOk = jobsFilter.type === 'all' || j.type === jobsFilter.type;
      const openOk = jobsFilter.open === 'all' || String(j.isOpen) === jobsFilter.open;
      return qOk && typeOk && openOk;
    });
  }, [myJobs, jobsFilter]);

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-indigo-500/10 rounded-xl p-6 border border-white/10">
        <h1 className="text-3xl font-bold mb-2">{t('pages.employerTitle')}</h1>
        <p className="text-muted-foreground">{t('pages.employerDesc')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Post a Job</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              placeholder="Job title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <Input
              placeholder="Type (full-time, internship)"
              value={type}
              onChange={(e) => setType(e.target.value)}
            />
            <Input
              placeholder="Company name"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
            />
            <Button onClick={post}>Post</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Applicants</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {applicants.map((a) => (
              <div key={a.id} className="p-3 rounded border bg-background/50">
                <div className="font-medium">{a.user.firstName || a.user.email}</div>
                <div className="text-xs opacity-80">Status: {a.status}</div>
                <div className="mt-2 flex gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setStatus(a.id, 'shortlisted')}
                  >
                    Shortlist
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setStatus(a.id, 'accepted')}>
                    Accept
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => setStatus(a.id, 'rejected')}
                  >
                    Reject
                  </Button>
                </div>
              </div>
            ))}
            {applicants.length === 0 && (
              <div className="text-sm text-muted-foreground">No applicants yet.</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Jobs Table */}
      <Card>
        <CardHeader>
          <CardTitle>My Job Posts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-3">
            <Input
              placeholder="Search by title or company..."
              value={jobsFilter.q}
              onChange={(e) => setJobsFilter((s) => ({ ...s, q: e.target.value }))}
              className="w-64"
            />
            <Input
              placeholder="Type (e.g., internship, full-time)"
              value={jobsFilter.type}
              onChange={(e) => setJobsFilter((s) => ({ ...s, type: e.target.value }))}
              className="w-48"
            />
            <Input
              placeholder="Open? (true/false/all)"
              value={jobsFilter.open}
              onChange={(e) => setJobsFilter((s) => ({ ...s, open: e.target.value }))}
              className="w-40"
            />
          </div>
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left">
                  <th className="p-2">Title</th>
                  <th className="p-2">Type</th>
                  <th className="p-2">Company</th>
                  <th className="p-2">Location</th>
                  <th className="p-2">Open</th>
                  <th className="p-2">Applicants</th>
                  <th className="p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredJobs.map((j) => (
                  <tr key={j.id} className="border-t">
                    <td className="p-2 font-medium">{j.title}</td>
                    <td className="p-2">{j.type}</td>
                    <td className="p-2">{j.company?.name || '-'}</td>
                    <td className="p-2">{j.location || '-'}</td>
                    <td className="p-2">{String(j.isOpen ?? true)}</td>
                    <td className="p-2">{j.applicants ?? '-'}</td>
                    <td className="p-2">
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => viewApplicants(j.id)}>
                          View Applicants
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredJobs.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-4 text-muted-foreground">
                      No jobs found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
