'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type Job = { id: string; title: string; type: string };

export default function CompanyPage() {
  const { t } = useTranslation('common');
  const params = useParams<{ id: string }>();
  const [company, setCompany] = useState<any>(null);
  const [jobs, setJobs] = useState<Job[]>([]);

  useEffect(() => {
    const load = async () => {
      const res = await fetch(`/api/companies/${params.id}`, { credentials: 'include' });
      const data = await res.json();
      setCompany(data.company);
      setJobs(Array.isArray(data.jobs) ? data.jobs : []);
    };
    load();
  }, [params.id]);

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-sky-500/10 rounded-xl p-6 border border-white/10">
        <h1 className="text-3xl font-bold mb-2">{company?.name || 'Company'}</h1>
        {company?.website && (
          <a className="underline text-sm" href={company.website} target="_blank">
            {company.website}
          </a>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Open Roles</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {jobs.map((j) => (
            <div key={j.id} className="p-3 rounded border bg-background/50">
              <div className="font-medium">{j.title}</div>
              <div className="text-xs opacity-80">{j.type}</div>
            </div>
          ))}
          {jobs.length === 0 && (
            <div className="text-sm text-muted-foreground">No active roles.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
