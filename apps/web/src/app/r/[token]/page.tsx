'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ResumePublicPage() {
  const { t } = useTranslation('common');
  const params = useParams<{ token: string }>();
  const [resume, setResume] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/jobs/resume/share/${params.token}`)
      .then((r) => r.json())
      .then(setResume)
      .catch(() => {});
  }, [params.token]);

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-fuchsia-500/10 via-purple-500/10 to-cyan-500/10 rounded-xl p-6 border border-white/10">
        <h1 className="text-3xl font-bold mb-2">{t('nav.resume')}</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{resume?.headline || 'Candidate'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {resume?.summary && <div className="text-sm">{resume.summary}</div>}
          {resume?.skills && resume.skills.length > 0 && (
            <div className="text-sm">Skills: {resume.skills.join(', ')}</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
