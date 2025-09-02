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
    <div className="space-y-8" suppressHydrationWarning>
      {/* Enhanced Header with Achievement Theme */}
      <div
        className="relative group bg-gradient-to-r from-yellow-500/20 via-amber-600/15 to-orange-500/20 
        rounded-2xl p-8 border border-yellow-500/20 backdrop-blur-xl shadow-2xl shadow-yellow-500/10
        hover:shadow-3xl hover:shadow-yellow-500/20 transition-all duration-700 transform-gpu
        before:absolute before:inset-0 before:bg-gradient-to-r before:from-yellow-500/5 before:to-orange-500/5 
        before:rounded-2xl before:opacity-0 before:transition-opacity before:duration-500 hover:before:opacity-100"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-2xl"></div>
        <div className="relative z-10 flex items-center gap-4">
          <div className="p-4 rounded-2xl bg-yellow-500/20 group-hover:bg-yellow-400/30 transition-all duration-300 group-hover:rotate-6 group-hover:scale-110 transform-gpu">
            <Award className="h-8 w-8 text-yellow-300 group-hover:text-yellow-200" />
          </div>
          <div>
            <h1 className="text-4xl font-bold mb-2 text-white group-hover:text-yellow-100 transition-colors duration-300">
              {t('pages.certificatesTitle')}
            </h1>
            <p className="text-yellow-300 group-hover:text-yellow-200 transition-colors duration-300 text-lg">
              {t('pages.certificatesDesc')}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Templates / Issue - Enhanced with Purple/Violet Theme */}
        <Card
          className="lg:col-span-2 group relative border-0 bg-gradient-to-br from-purple-500/20 via-violet-600/15 to-fuchsia-600/20 
          backdrop-blur-xl shadow-xl shadow-purple-500/20 hover:shadow-2xl hover:shadow-purple-500/30 
          transition-all duration-500 hover:scale-[1.02] transform-gpu perspective-1000 
          before:absolute before:inset-0 before:bg-gradient-to-r before:from-purple-500/10 before:to-violet-500/10 
          before:rounded-xl before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-100"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-xl"></div>
          <CardHeader className="relative z-10">
            <CardTitle
              className="text-2xl font-bold text-white group-hover:text-purple-200 transition-colors duration-300 
              flex items-center gap-3"
            >
              <div className="p-2 rounded-lg bg-purple-500/20 group-hover:bg-purple-400/30 transition-all duration-300 group-hover:rotate-6">
                <Award className="h-6 w-6 text-purple-300 group-hover:text-purple-200" />
              </div>
              Available Certificates
            </CardTitle>
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
                <div key={cat} className="space-y-4 relative z-10">
                  <div
                    className="text-lg font-bold text-white group-hover:text-purple-200 transition-colors duration-300 
                    px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm"
                  >
                    {cat}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {list.map((t) => {
                      // Dynamic color themes based on category
                      const getThemeByCategory = (category: string) => {
                        switch (category) {
                          case 'Career':
                            return 'from-yellow-500/20 to-amber-600/20 shadow-yellow-500/10 hover:shadow-yellow-500/25 border-yellow-400/20 text-yellow-300 hover:text-yellow-200';
                          case 'Language':
                            return 'from-blue-500/20 to-cyan-600/20 shadow-blue-500/10 hover:shadow-blue-500/25 border-blue-400/20 text-blue-300 hover:text-blue-200';
                          case 'Mathematics':
                            return 'from-purple-500/20 to-violet-600/20 shadow-purple-500/10 hover:shadow-purple-500/25 border-purple-400/20 text-purple-300 hover:text-purple-200';
                          case 'Cloud':
                            return 'from-sky-500/20 to-cyan-600/20 shadow-sky-500/10 hover:shadow-sky-500/25 border-sky-400/20 text-sky-300 hover:text-sky-200';
                          case 'Security':
                            return 'from-red-500/20 to-orange-600/20 shadow-red-500/10 hover:shadow-red-500/25 border-red-400/20 text-red-300 hover:text-red-200';
                          default:
                            return 'from-green-500/20 to-emerald-600/20 shadow-green-500/10 hover:shadow-green-500/25 border-green-400/20 text-green-300 hover:text-green-200';
                        }
                      };
                      const theme = getThemeByCategory(t.category || 'General');
                      return (
                        <div
                          key={t.id}
                          className={`group relative p-6 rounded-xl border bg-gradient-to-br backdrop-blur-sm 
                          hover:scale-105 hover:-translate-y-1 transition-all duration-300 transform-gpu perspective-1000
                          cursor-pointer ${theme} flex flex-col gap-3`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="font-semibold text-white group-hover:scale-105 transition-transform duration-300">
                              {t.name}
                            </div>
                            <Badge
                              className={`${
                                t.isPaid
                                  ? 'bg-gradient-to-r from-violet-500 to-purple-500 text-white border-violet-400'
                                  : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white border-green-400'
                              } transition-all duration-300 hover:scale-110`}
                            >
                              {t.isPaid ? `৳${t.price || '4.99'}` : 'Free'}
                            </Badge>
                          </div>
                          <div className="text-sm text-white/80 group-hover:text-white transition-colors duration-300">
                            {t.description}
                          </div>
                          {t.requiresExam && (
                            <div
                              className="text-xs px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-200
                            flex items-center gap-2 w-fit"
                            >
                              <ShieldCheck className="h-3 w-3" />
                              Requires {t.examCategory || 'an'} exam
                              {t.minPercentage ? ` (≥ ${t.minPercentage}%)` : ''}
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-xs px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm w-fit">
                            <Award className="h-4 w-4" />
                            <span className="capitalize font-medium">{t.kind}</span>
                          </div>
                          <div className="mt-4">
                            <Button
                              disabled={issuing === t.id}
                              onClick={() => issue(t.id)}
                              className="w-full bg-gradient-to-r from-white/10 to-white/20 hover:from-white/20 hover:to-white/30 
                              text-white border border-white/20 hover:border-white/40 transition-all duration-300 
                              hover:scale-105 hover:shadow-lg transform-gpu backdrop-blur-sm"
                              variant="outline"
                            >
                              {issuing === t.id ? 'Issuing...' : 'Get Certificate'}
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            {templates.length === 0 && (
              <div className="text-lg text-white/60 p-8 text-center">
                No templates available yet.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Verification Section - Enhanced with Cyan/Blue Theme */}
        <Card
          className="group relative border-0 bg-gradient-to-br from-cyan-500/20 via-blue-600/15 to-sky-600/20 
          backdrop-blur-xl shadow-xl shadow-cyan-500/20 hover:shadow-2xl hover:shadow-cyan-500/30 
          transition-all duration-500 hover:scale-105 hover:-translate-y-2 transform-gpu perspective-1000 
          before:absolute before:inset-0 before:bg-gradient-to-r before:from-cyan-500/10 before:to-blue-500/10 
          before:rounded-xl before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-100"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-xl"></div>
          <CardHeader className="relative z-10">
            <CardTitle
              className="text-xl font-bold text-white group-hover:text-cyan-200 transition-colors duration-300 
              flex items-center gap-3"
            >
              <div className="p-2 rounded-lg bg-cyan-500/20 group-hover:bg-cyan-400/30 transition-all duration-300 group-hover:rotate-6">
                <ShieldCheck className="h-5 w-5 text-cyan-300 group-hover:text-cyan-200" />
              </div>
              Verify Certificate
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 relative z-10">
            <Input
              placeholder="Enter verification code"
              value={verifyCode}
              onChange={(e) => setVerifyCode(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-white/10 border border-cyan-500/30 text-white 
                placeholder:text-cyan-300/60 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 
                transition-all duration-300 backdrop-blur-sm"
            />
            <Button
              onClick={verify}
              disabled={!verifyCode.trim()}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 
                text-white shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all duration-300 
                hover:scale-105 transform-gpu disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ShieldCheck className="h-4 w-4 mr-2" />
              Verify Certificate
            </Button>
            {verifyResult && (
              <div
                className="p-4 rounded-xl bg-gradient-to-r from-green-500/20 to-emerald-500/20 
                border border-green-500/30 backdrop-blur-sm"
              >
                <div className="font-semibold mb-2 text-white flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-green-300" />
                  Certificate Verified ✓
                </div>
                <div className="text-sm text-green-200 space-y-1">
                  <div>
                    <strong>Title:</strong> {verifyResult?.title}
                  </div>
                  <div>
                    <strong>Holder:</strong> {verifyResult?.user?.email}
                  </div>
                  <div>
                    <strong>Serial:</strong> {verifyResult?.serial}
                  </div>
                  <div>
                    <strong>Issued:</strong> {new Date(verifyResult?.issuedAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* My Certificates - Enhanced with Gold/Green Achievement Theme */}
      <Card
        className="group relative border-0 bg-gradient-to-br from-emerald-500/20 via-green-600/15 to-teal-600/20 
        backdrop-blur-xl shadow-xl shadow-emerald-500/20 hover:shadow-2xl hover:shadow-emerald-500/30 
        transition-all duration-500 hover:scale-[1.01] transform-gpu perspective-1000 
        before:absolute before:inset-0 before:bg-gradient-to-r before:from-emerald-500/10 before:to-green-500/10 
        before:rounded-xl before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-100"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-xl"></div>
        <CardHeader className="relative z-10">
          <CardTitle
            className="text-2xl font-bold text-white group-hover:text-emerald-200 transition-colors duration-300 
            flex items-center gap-3"
          >
            <div className="p-2 rounded-lg bg-emerald-500/20 group-hover:bg-emerald-400/30 transition-all duration-300 group-hover:rotate-6">
              <Award className="h-6 w-6 text-emerald-300 group-hover:text-emerald-200" />
            </div>
            My Earned Certificates
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
          {mine.map((c, index) => {
            const colors = [
              'from-yellow-500/20 to-amber-600/20 shadow-yellow-500/15 hover:shadow-yellow-500/25 border-yellow-400/30',
              'from-green-500/20 to-emerald-600/20 shadow-green-500/15 hover:shadow-green-500/25 border-green-400/30',
              'from-blue-500/20 to-cyan-600/20 shadow-blue-500/15 hover:shadow-blue-500/25 border-blue-400/30',
              'from-purple-500/20 to-violet-600/20 shadow-purple-500/15 hover:shadow-purple-500/25 border-purple-400/30',
              'from-pink-500/20 to-rose-600/20 shadow-pink-500/15 hover:shadow-pink-500/25 border-pink-400/30',
            ];
            const color = colors[index % colors.length];
            return (
              <div
                key={c.id}
                className={`group relative p-6 rounded-xl border bg-gradient-to-br backdrop-blur-sm 
              hover:scale-105 hover:-translate-y-2 transition-all duration-300 transform-gpu perspective-1000
              cursor-pointer ${color}`}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-xl"></div>
                <div className="relative z-10">
                  <div className="font-bold text-white mb-2 group-hover:scale-105 transition-transform duration-300">
                    {c.title}
                  </div>
                  <div className="text-sm text-white/80 mb-2">
                    Issued {new Date(c.issuedAt).toLocaleDateString()}
                  </div>
                  <div className="text-xs text-white/60 mb-3">Serial: {c.serial}</div>
                  <div className="flex flex-wrap gap-2 mt-4">
                    <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30 transition-all duration-300">
                      <Award className="h-3 w-3 mr-1" />
                      {c.template.kind}
                    </Badge>
                    <a
                      className="text-xs inline-flex items-center gap-1 px-2 py-1 rounded-full bg-cyan-500/20 
                      text-cyan-200 border border-cyan-500/30 hover:bg-cyan-500/30 transition-all duration-300"
                      href={`/?code=${c.verificationCode}`}
                    >
                      <LinkIcon className="h-3 w-3" /> Verify
                    </a>
                    <button
                      className="text-xs inline-flex items-center gap-1 px-2 py-1 rounded-full bg-orange-500/20 
                      text-orange-200 border border-orange-500/30 hover:bg-orange-500/30 transition-all duration-300"
                      onClick={() => generatePdf(c.id)}
                    >
                      <FileDown className="h-3 w-3" /> PDF
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
          {mine.length === 0 && (
            <div className="col-span-full text-center p-12">
              <div className="text-6xl mb-4">🏆</div>
              <div className="text-xl font-semibold text-white mb-2">
                No certificates earned yet
              </div>
              <div className="text-white/60">
                Complete courses and pass exams to earn your first certificate!
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
