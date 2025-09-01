'use client';

import { useEffect, useMemo, useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Users, Briefcase, Video, BookOpen, MessageSquare, Globe, Send } from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import { getApiBaseUrl } from '@/lib/env';
import { useTranslation } from 'react-i18next';

type Mentor = {
  id: string;
  user: {
    id: string;
    firstName?: string;
    lastName?: string;
    avatar?: string;
    email?: string;
    rating?: number;
    reviewCount?: number;
  };
  headline?: string;
  expertise: string[];
  years?: number;
  availability?: string;
  rate?: number;
  bio?: string;
};

export default function MentorshipPage() {
  const { t } = useTranslation('common');
  const [q, setQ] = useState('');
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [topic, setTopic] = useState('');
  const [message, setMessage] = useState('');
  const [selectedMentorId, setSelectedMentorId] = useState<string>('');
  const [materials, setMaterials] = useState<any[]>([]);
  const socketRef = useRef<Socket | null>(null);

  const base = getApiBaseUrl();

  const load = async () => {
    const res = await fetch(`/api/mentorship?q=${encodeURIComponent(q)}`, {
      credentials: 'include',
    });
    const data = await res.json().catch(() => []);
    setMentors(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    load();
    // demo materials pulled from resources when available
    (async () => {
      try {
        const r = await fetch(`/api/resources?search=mentorship`, { credentials: 'include' });
        const d = await r.json();
        setMaterials(Array.isArray(d) ? d.slice(0, 6) : []);
      } catch {
        setMaterials([]);
      }
    })();
    const s = io(`${base}/mentorship`, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
    });
    socketRef.current = s;
    s.on('requests:update', () => load());
    return () => {
      s.disconnect();
      socketRef.current = null;
    };
  }, []);

  const request = async () => {
    if (!selectedMentorId) return;
    const res = await fetch('/api/mentorship', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ mentorId: selectedMentorId, topic, message }),
    });
    if (res.ok) {
      socketRef.current?.emit('requests:update', {} as any);
      setTopic('');
      setMessage('');
      alert('Request sent');
    } else {
      alert('Failed to send request');
    }
  };

  const featured = useMemo(() => mentors.slice(0, 6), [mentors]);

  return (
    <div className="space-y-6" suppressHydrationWarning>
      <div className="bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-cyan-500/10 rounded-xl p-6 border border-white/10">
        <h1 className="text-3xl font-bold mb-2">{t('pages.mentorshipTitle')}</h1>
        <p className="text-muted-foreground">{t('pages.mentorshipDesc')}</p>
      </div>

      {/* Search mentors */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" /> Find Mentors
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input
              placeholder="Search by name or expertise (e.g., AI, Finance, Design)"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <Button onClick={load}>Search</Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {featured.map((m) => (
              <div
                key={m.id}
                className={`p-4 rounded border bg-background/50 ${selectedMentorId === m.user.id ? 'ring-2 ring-emerald-400' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <img
                    src={m.user.avatar || '/api/placeholder/48'}
                    className="h-10 w-10 rounded-full object-cover"
                    onError={(e) => ((e.target as HTMLImageElement).style.display = 'none')}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">
                      {[m.user.firstName, m.user.lastName].filter(Boolean).join(' ') ||
                        m.user.email}
                    </div>
                    <div className="text-xs text-muted-foreground line-clamp-1">
                      {m.headline || 'Mentor'}
                    </div>
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {m.expertise.slice(0, 4).map((x) => (
                    <Badge key={x} variant="outline" className="text-xs">
                      {x}
                    </Badge>
                  ))}
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  {m.years ? `${m.years} yrs` : ''} {m.availability ? `• ${m.availability}` : ''}{' '}
                  {m.rate ? `• $${m.rate}/hr` : ''}
                </div>
                <div className="mt-2 flex gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setSelectedMentorId(m.user.id)}
                  >
                    <MessageSquare className="h-4 w-4 mr-1" /> Select
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => (window.location.href = `/chat?u=${m.user.id}`)}
                  >
                    <Send className="h-4 w-4 mr-1" /> Chat
                  </Button>
                </div>
              </div>
            ))}
            {featured.length === 0 && (
              <div className="text-sm text-muted-foreground">No mentors found.</div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Request mentorship */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" /> Request Mentorship
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Input
              placeholder="Topic (e.g., Career in Data Science)"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
            <Input
              placeholder="Message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <Button onClick={request} disabled={!selectedMentorId}>
              Send Request
            </Button>
          </div>
          <div className="text-xs text-muted-foreground">Select a mentor from above first.</div>
        </CardContent>
      </Card>

      {/* Mentorship materials */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" /> Mentorship Materials
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {materials.map((r) => (
              <div key={r.id} className="p-4 rounded border bg-background/50">
                <div className="font-medium mb-1 line-clamp-1">{r.title}</div>
                <div className="text-xs text-muted-foreground line-clamp-2">{r.description}</div>
                <div className="mt-2 flex items-center gap-2 text-xs">
                  {r.type === 'video' ? (
                    <Video className="h-3 w-3" />
                  ) : r.type === 'pdf' ? (
                    <BookOpen className="h-3 w-3" />
                  ) : (
                    <Globe className="h-3 w-3" />
                  )}
                  <span className="capitalize">{r.type}</span>
                </div>
              </div>
            ))}
            {materials.length === 0 && (
              <div className="text-sm text-muted-foreground">No materials yet.</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
