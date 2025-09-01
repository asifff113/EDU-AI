'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Award, ShieldCheck, Link as LinkIcon, FileDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';

type Template = {
  id: string;
  name: string;
  description?: string;
  kind: string;
  isPaid: boolean;
  price?: number;
  bgUrl?: string;
  requiresExam?: boolean;
  examCategory?: string | null;
  minPercentage?: number | null;
  category?: string | null;
};

type Certificate = {
  id: string;
  title: string;
  issuedAt: string;
  serial: string;
  verificationCode: string;
  pdfUrl?: string;
  template: Template;
};

export default function CertificatesPage() {
  const { t } = useTranslation('common');
  const [templates, setTemplates] = useState<Template[]>([]);
  const [mine, setMine] = useState<Certificate[]>([]);
  const [issuing, setIssuing] = useState<string | null>(null);
  const [verifyCode, setVerifyCode] = useState('');
  const [verifyResult, setVerifyResult] = useState<any | null>(null);

  const FALLBACK_TEMPLATES: Template[] = [
    {
      id: 'fallback-analyst',
      name: 'Data Analyst',
      description: 'Prove analyst skills',
      kind: 'verified',
      isPaid: false,
      requiresExam: true,
      examCategory: 'data',
      minPercentage: 60,
      category: 'Career',
    },
    {
      id: 'fallback-scientist',
      name: 'Data Scientist',
      description: 'Prove DS skills',
      kind: 'verified',
      isPaid: true,
      price: 4.99,
      requiresExam: true,
      examCategory: 'data',
      minPercentage: 65,
      category: 'Career',
    },
    {
      id: 'fallback-engineer',
      name: 'Data Engineer',
      description: 'Prove DE skills',
      kind: 'verified',
      isPaid: true,
      price: 4.99,
      requiresExam: true,
      examCategory: 'data',
      minPercentage: 60,
      category: 'Career',
    },
    {
      id: 'fallback-ai-dev',
      name: 'AI Engineer for Developers',
      description: 'Foundational AI engineer skills',
      kind: 'verified',
      isPaid: true,
      price: 5.99,
      requiresExam: true,
      examCategory: 'programming',
      minPercentage: 70,
      category: 'Career',
    },
    {
      id: 'fallback-ai-ds',
      name: 'AI Engineer for Data Scientists',
      description: 'AI engineering with DS background',
      kind: 'verified',
      isPaid: true,
      price: 5.99,
      requiresExam: true,
      examCategory: 'data',
      minPercentage: 70,
      category: 'Career',
    },
    {
      id: 'fallback-english',
      name: 'English Proficiency',
      description: 'Pass English proficiency exam',
      kind: 'verified',
      isPaid: false,
      requiresExam: true,
      examCategory: 'language',
      minPercentage: 55,
      category: 'Language',
    },
    {
      id: 'fallback-math',
      name: 'Mathematics Aptitude',
      description: 'Pass Mathematics exam',
      kind: 'verified',
      isPaid: false,
      requiresExam: true,
      examCategory: 'mathematics',
      minPercentage: 60,
      category: 'Mathematics',
    },
    {
      id: 'fallback-cloud',
      name: 'Cloud Practitioner',
      description: 'Cloud fundamentals credential',
      kind: 'verified',
      isPaid: true,
      price: 3.99,
      requiresExam: true,
      examCategory: 'cloud',
      minPercentage: 60,
      category: 'Cloud',
    },
    {
      id: 'fallback-security',
      name: 'Cybersecurity Fundamentals',
      description: 'Security basics credential',
      kind: 'verified',
      isPaid: true,
      price: 3.99,
      requiresExam: true,
      examCategory: 'security',
      minPercentage: 60,
      category: 'Security',
    },
    {
      id: 'fallback-completion',
      name: 'Course Completion',
      description: 'Awarded upon completing a course',
      kind: 'completion',
      isPaid: false,
      category: 'General',
    },
    {
      id: 'fallback-verified',
      name: 'Verified Credential',
      description: 'Identity and skill verified',
      kind: 'verified',
      isPaid: true,
      price: 9.99,
      category: 'General',
    },
    {
      id: 'fallback-chain',
      name: 'Blockchain Record',
      description: 'Immutable on-chain proof of achievement',
      kind: 'blockchain',
      isPaid: true,
      price: 4.99,
      category: 'General',
    },
  ];

  const load = async () => {
    const [tplRes, mineRes] = await Promise.all([
      fetch('/api/certificates?action=templates', { credentials: 'include' }),
      fetch('/api/certificates?action=mine', { credentials: 'include' }),
    ]);
    const tplJson = await tplRes.json().catch(() => []);
    const mineJson = await mineRes.json().catch(() => []);
    const array = Array.isArray(tplJson) ? tplJson : [];
    setTemplates(array.length > 0 ? array : FALLBACK_TEMPLATES);
    setMine(Array.isArray(mineJson) ? mineJson : []);
  };

  useEffect(() => {
    load();
  }, []);

  const issue = async (templateId: string) => {
    setIssuing(templateId);
    try {
      const res = await fetch('/api/certificates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ templateId }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}) as any);
        alert(err?.message || 'Issuance failed. Please pass the required exam or try again.');
      } else {
        await load();
      }
    } finally {
      setIssuing(null);
    }
  };

  const verify = async () => {
    const res = await fetch(
      `/api/certificates?action=verify&code=${encodeURIComponent(verifyCode)}`,
      {
        credentials: 'include',
      },
    );
    setVerifyResult(await res.json());
  };

  const generatePdf = async (certificateId: string) => {
    const res = await fetch('/api/certificates/pdf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ certificateId }),
    });
    if (!res.ok) {
      alert('Failed to generate PDF');
      return;
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'certificate.pdf';
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-6" suppressHydrationWarning>
      <div className="bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-cyan-500/10 rounded-xl p-6 border border-white/10">
        <h1 className="text-3xl font-bold mb-2">{t('pages.certificatesTitle')}</h1>
        <p className="text-muted-foreground">{t('pages.certificatesDesc')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Templates / Issue */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Available Certificates</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-6">
            {templates.length > 0 &&
              Object.entries(
                templates.reduce<Record<string, Template[]>>((acc, t) => {
                  const key = t.category || 'General';
                  (acc[key] ||= []).push(t);
                  return acc;
                }, {}),
              ).map(([cat, list]) => (
                <div key={cat} className="space-y-3">
                  <div className="text-sm font-semibold opacity-80">{cat}</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {list.map((t) => (
                      <div
                        key={t.id}
                        className="p-4 rounded border bg-background/50 flex flex-col gap-2"
                      >
                        <div className="flex items-center justify-between">
                          <div className="font-medium">{t.name}</div>
                          <Badge variant={t.isPaid ? 'default' : 'secondary'}>
                            {t.isPaid ? `Paid${t.price ? ` $${t.price}` : ''}` : 'Free'}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">{t.description}</div>
                        {t.requiresExam && (
                          <div className="text-xs text-amber-500">
                            Requires {t.examCategory || 'an'} exam
                            {t.minPercentage ? ` (>= ${t.minPercentage}%)` : ''}
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-xs">
                          <Award className="h-4 w-4" /> {t.kind}
                        </div>
                        <div className="mt-2">
                          <Button
                            disabled={issuing === t.id}
                            onClick={() => issue(t.id)}
                            className="w-full"
                          >
                            {issuing === t.id ? 'Issuing...' : 'Get certificate'}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            {templates.length === 0 && (
              <div className="text-sm text-muted-foreground">No templates yet.</div>
            )}
          </CardContent>
        </Card>

        {/* Verify */}
        <Card>
          <CardHeader>
            <CardTitle>Verify a certificate</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Input
              placeholder="Enter verification code"
              value={verifyCode}
              onChange={(e) => setVerifyCode(e.target.value)}
            />
            <Button onClick={verify} disabled={!verifyCode.trim()}>
              Verify
            </Button>
            {verifyResult && (
              <div className="text-xs break-all p-2 rounded border bg-background/40">
                <div className="font-medium mb-1">
                  {verifyResult?.title} — {verifyResult?.user?.email}
                </div>
                <div>Serial: {verifyResult?.serial}</div>
                <div>Issued: {verifyResult?.issuedAt}</div>
                <div className="flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3" /> Valid
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* My certificates */}
      <Card>
        <CardHeader>
          <CardTitle>My Certificates</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mine.map((c) => (
            <div key={c.id} className="p-4 rounded border bg-background/50">
              <div className="font-medium mb-1">{c.title}</div>
              <div className="text-xs text-muted-foreground">
                Issued {new Date(c.issuedAt).toLocaleDateString()}
              </div>
              <div className="text-xs">Serial: {c.serial}</div>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="secondary">{c.template.kind}</Badge>
                <a
                  className="text-xs inline-flex items-center gap-1 underline"
                  href={`/?code=${c.verificationCode}`}
                >
                  <LinkIcon className="h-3 w-3" /> Verify link
                </a>
                <button
                  className="text-xs inline-flex items-center gap-1 underline"
                  onClick={() => generatePdf(c.id)}
                >
                  <FileDown className="h-3 w-3" /> PDF
                </button>
              </div>
            </div>
          ))}
          {mine.length === 0 && (
            <div className="text-sm text-muted-foreground">No certificates yet.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
