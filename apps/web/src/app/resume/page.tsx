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
    <div className="space-y-6 relative">
      {/* Header - Orange/Amber Card */}
      <div className="group perspective-1000">
        <div className="relative overflow-hidden bg-gradient-to-br from-orange-600/20 via-amber-500/15 to-yellow-400/20 rounded-xl p-6 border border-orange-400/30 shadow-xl backdrop-blur-sm transition-all duration-500 hover:scale-[1.02] hover:rotate-1 hover:shadow-2xl hover:shadow-orange-500/25 transform-gpu">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500"></div>
          <div className="relative">
            <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-400 bg-clip-text text-transparent">
              {t('nav.resume')}
            </h1>
            <p className="text-orange-200/80">Create your resume and export as PDF.</p>
          </div>
        </div>
      </div>

      {/* Resume Builder Card - Indigo/Blue */}
      <div className="group perspective-1000">
        <Card className="relative overflow-hidden bg-gradient-to-br from-indigo-500/20 via-blue-400/15 to-sky-500/20 backdrop-blur-xl border border-indigo-400/30 shadow-xl transition-all duration-500 hover:scale-[1.01] hover:-rotate-0.5 hover:shadow-2xl hover:shadow-indigo-500/25 transform-gpu">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-indigo-500 via-blue-500 to-sky-500"></div>
          <CardHeader>
            <CardTitle className="bg-gradient-to-r from-indigo-400 to-blue-400 bg-clip-text text-transparent">
              Resume Builder
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              placeholder="Headline (e.g., Junior Data Scientist)"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              className="bg-indigo-500/10 border-indigo-400/30 focus:border-indigo-400 text-indigo-100 placeholder:text-indigo-300/60"
            />
            <Input
              placeholder="Professional summary"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="bg-indigo-500/10 border-indigo-400/30 focus:border-indigo-400 text-indigo-100 placeholder:text-indigo-300/60"
            />
            <Input
              placeholder="Skills (comma separated)"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              className="bg-indigo-500/10 border-indigo-400/30 focus:border-indigo-400 text-indigo-100 placeholder:text-indigo-300/60"
            />

            {/* Action Buttons Section - Rose/Pink Card */}
            <div className="group mt-6">
              <div className="relative overflow-hidden bg-gradient-to-br from-rose-500/20 via-pink-400/15 to-red-500/20 rounded-lg p-4 border border-rose-400/30 shadow-lg backdrop-blur-sm transition-all duration-500 hover:scale-[1.01] hover:rotate-0.5 hover:shadow-xl hover:shadow-rose-500/20 transform-gpu">
                <div className="absolute inset-0 bg-gradient-to-br from-rose-500/10 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-rose-500 via-pink-500 to-red-500"></div>
                <div className="flex gap-2 relative">
                  <Button
                    onClick={save}
                    disabled={saving}
                    className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 transform-gpu"
                  >
                    {saving ? 'Saving...' : 'Save'}
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={exportPdf}
                    className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 transform-gpu text-white"
                  >
                    Export PDF
                  </Button>
                  {shareUrl && (
                    <a
                      className="underline text-sm text-rose-300 hover:text-rose-200 transition-colors flex items-center"
                      href={shareUrl}
                      target="_blank"
                    >
                      Share link
                    </a>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
