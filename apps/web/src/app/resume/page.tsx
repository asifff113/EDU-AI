'use client';

import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function ResumePage() {
  const { t } = useTranslation('common');
  const [headline, setHeadline] = useState('');
  const [summary, setSummary] = useState('');
  const [skills, setSkills] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const printRef = useRef<HTMLDivElement | null>(null);

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/jobs?action=resume', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          headline,
          summary,
          skills: skills
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean),
        }),
      });
      if (!res.ok) alert('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const exportPdf = () => {
    window.print();
  };

  const [shareUrl, setShareUrl] = useState('');
  useEffect(() => {
    fetch('/api/jobs?action=resume', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    }).catch(() => {});
    fetch('/api/jobs/resume/me', { credentials: 'include' })
      .then((r) => r.json())
      .then((r) => {
        if (r?.shareToken) setShareUrl(`${location.origin}/r/${r.shareToken}`);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-fuchsia-500/10 via-purple-500/10 to-cyan-500/10 rounded-xl p-6 border border-white/10">
        <h1 className="text-3xl font-bold mb-2">{t('nav.resume')}</h1>
        <p className="text-muted-foreground">Create your resume and export as PDF.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Resume</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input
            placeholder="Headline (e.g., Junior Data Scientist)"
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
          />
          <Input
            placeholder="Professional summary"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
          />
          <Input
            placeholder="Skills (comma separated)"
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
          />
          <div className="flex gap-2">
            <Button onClick={save} disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </Button>
            <Button variant="secondary" onClick={exportPdf}>
              Export PDF
            </Button>
            {shareUrl && (
              <a className="underline text-sm" href={shareUrl} target="_blank">
                Share link
              </a>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
