'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from 'react-i18next';

type Result = { id: string; title: string; type: string; url: string };

export default function SearchPage() {
  const { t } = useTranslation('common');
  const params = useSearchParams();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Result[]>([]);

  useEffect(() => {
    const q = params?.get('q') || '';
    setQuery(q);
    (async () => {
      const items: Result[] = [];
      // Jobs
      const jobsRes = await fetch(`/api/jobs?q=${encodeURIComponent(q)}`, {
        credentials: 'include',
      });
      const jobs = await jobsRes.json().catch(() => []);
      for (const j of Array.isArray(jobs) ? jobs : [])
        items.push({ id: j.id, title: `Job: ${j.title}`, type: 'job', url: '/job-portal' });
      // Courses
      const coursesRes = await fetch('/api/courses', { credentials: 'include' }).catch(
        () => null as any,
      );
      const courses = coursesRes ? await coursesRes.json().catch(() => []) : [];
      for (const c of Array.isArray(courses) ? courses : [])
        if ((c.title || '').toLowerCase().includes(q.toLowerCase()))
          items.push({
            id: c.id || c.title,
            title: `Course: ${c.title}`,
            type: 'course',
            url: '/courses',
          });
      // Resources
      const resRes = await fetch(`/api/resources?search=${encodeURIComponent(q)}`, {
        credentials: 'include',
      }).catch(() => null as any);
      const resources = resRes ? await resRes.json().catch(() => []) : [];
      for (const r of Array.isArray(resources) ? resources : [])
        items.push({
          id: r.id,
          title: `Resource: ${r.title}`,
          type: 'resource',
          url: '/resources',
        });
      // Profiles
      try {
        const profilesRes = await fetch(`/api/profiles?q=${encodeURIComponent(q)}`, {
          credentials: 'include',
        });
        const profiles = await profilesRes.json().catch(() => []);
        for (const p of Array.isArray(profiles) ? profiles : []) {
          const fullName =
            [p.firstName, p.lastName].filter(Boolean).join(' ') || p.username || p.email;
          items.push({
            id: p.id,
            title: `Profile: ${fullName}`,
            type: 'profile',
            url: '/profiles',
          });
        }
      } catch {}

      // Forums (boards/topics/posts)
      try {
        const forumsRes = await fetch(`/api/forums?q=${encodeURIComponent(q)}`, {
          credentials: 'include',
        });
        const forums = await forumsRes.json().catch(() => []);
        for (const f of Array.isArray(forums) ? forums : []) {
          const label = f.title || f.name || f.content || 'Forum';
          items.push({
            id: f.id || label,
            title: `Forum: ${label}`,
            type: 'forum',
            url: '/discussion-forums',
          });
        }
      } catch {}

      // Chat users
      try {
        const chatRes = await fetch(`/api/chat?q=${encodeURIComponent(q)}`, {
          credentials: 'include',
        });
        const chatUsers = await chatRes.json().catch(() => []);
        for (const u of Array.isArray(chatUsers) ? chatUsers : []) {
          const fullName =
            [u.firstName, u.lastName].filter(Boolean).join(' ') || u.username || u.email;
          items.push({
            id: u.id,
            title: `Chat: ${fullName}`,
            type: 'chat',
            url: `/chat?u=${u.id}`,
          });
        }
      } catch {}

      setResults(items);
    })();
  }, [params]);

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-cyan-500/10 rounded-xl p-6 border border-white/10">
        <h1 className="text-3xl font-bold mb-2">Search</h1>
        <p className="text-muted-foreground">Results for “{query}”.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Results</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {results.map((r) => (
            <a
              key={r.id}
              className="block p-3 rounded border bg-background/50 hover:bg-accent"
              href={r.url}
            >
              {r.title}
            </a>
          ))}
          {results.length === 0 && <div className="text-sm text-muted-foreground">No results.</div>}
        </CardContent>
      </Card>
    </div>
  );
}
