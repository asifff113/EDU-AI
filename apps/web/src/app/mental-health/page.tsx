'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Activity,
  Brain,
  Coffee,
  Heart,
  Headphones,
  Timer,
  CalendarClock,
  Phone,
  Play,
  Pause,
  RefreshCw,
} from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import { getApiBaseUrl } from '@/lib/env';
import ClientOnly from '@/components/ClientOnly';

type Log = {
  id: string;
  startedAt: string;
  duration: number;
  subject?: string;
  mood?: string;
  notes?: string;
};
type Mind = { id: string; title: string; kind: string; duration?: number };
type Slot = { id: string; userId: string; startTime: string; endTime: string; isBooked: boolean };

export default function MentalHealthPage() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [subject, setSubject] = useState('');
  const [mood, setMood] = useState('neutral');
  const [notes, setNotes] = useState('');
  const [running, setRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [mind, setMind] = useState<Mind[]>([]);
  const [slots, setSlots] = useState<Slot[]>([]);
  const timerRef = useRef<any>(null);
  const socketRef = useRef<Socket | null>(null);
  const base = getApiBaseUrl();

  useEffect(() => {
    const s = io(`${base}/wellness`, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
    });
    socketRef.current = s;
    s.on('logs:update', (log: any) =>
      setLogs((prev) => [log, ...(Array.isArray(prev) ? prev : [])]),
    );
    return () => s.disconnect();
  }, []);

  const tick = () => setSeconds((x) => x + 1);

  const start = () => {
    if (running) return;
    setRunning(true);
    timerRef.current = setInterval(tick, 1000);
  };
  const pause = () => {
    setRunning(false);
    if (timerRef.current) clearInterval(timerRef.current);
  };
  const reset = () => {
    pause();
    setSeconds(0);
  };
  const minutes = useMemo(() => Math.floor(seconds / 60), [seconds]);

  const saveLog = async () => {
    const res = await fetch('/api/wellness', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        action: 'study-log',
        startedAt: new Date().toISOString(),
        duration: minutes,
        subject,
        mood,
        notes,
      }),
    });
    if (res.ok) {
      setSubject('');
      setNotes('');
      setMood('neutral');
      reset();
    }
  };

  const book = async (id: string) => {
    const res = await fetch('/api/wellness', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ action: 'book', id }),
    });
    if (res.ok) {
      setSlots((prev) => prev.map((s) => (s.id === id ? { ...s, isBooked: true } : s)));
      alert('Slot booked. A counselor will contact you.');
    }
  };

  const load = async () => {
    const [logsRes, mindRes, slotsRes] = await Promise.all([
      fetch('/api/wellness?action=logs', { credentials: 'include' }),
      fetch('/api/wellness?action=mindfulness', { credentials: 'include' }),
      fetch('/api/wellness?action=slots', { credentials: 'include' }),
    ]);
    const lj = await logsRes.json().catch(() => []);
    const mj = await mindRes.json().catch(() => []);
    const sj = await slotsRes.json().catch(() => []);
    setLogs(Array.isArray(lj) ? lj : []);
    setMind(Array.isArray(mj) ? mj : []);
    setSlots(Array.isArray(sj) ? sj : []);
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-cyan-500/10 rounded-xl p-6 border border-white/10">
        <h1 className="text-3xl font-bold mb-2">Mental Health & Wellness</h1>
        <p className="text-muted-foreground">
          Burnout prevention, mental health support, and mindfulness integration — in real time.
        </p>
      </div>

      {/* Burnout Prevention */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" /> Burnout Prevention
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3 rounded border bg-background/50">
              <div className="text-sm mb-2">Study timer</div>
              <div className="text-2xl font-bold tabular-nums">
                {String(Math.floor(seconds / 60)).padStart(2, '0')}:
                {String(seconds % 60).padStart(2, '0')}
              </div>
              <ClientOnly fallback={<div className="mt-2 h-8" />}>
                <div className="mt-2 flex gap-2">
                  <Button size="sm" onClick={start}>
                    <Play className="h-4 w-4 mr-1" /> Start
                  </Button>
                  <Button size="sm" variant="outline" onClick={pause}>
                    <Pause className="h-4 w-4 mr-1" /> Pause
                  </Button>
                  <Button size="sm" variant="ghost" onClick={reset}>
                    <RefreshCw className="h-4 w-4 mr-1" /> Reset
                  </Button>
                </div>
              </ClientOnly>
            </div>
            <div className="p-3 rounded border bg-background/50">
              <div className="text-sm mb-2">Study pattern</div>
              <div className="text-xs text-muted-foreground">
                We analyze your sessions to suggest breaks.
              </div>
              <div className="text-xs mt-1">
                Break suggestion: {minutes >= 25 ? 'Take 5 minutes.' : 'Keep focusing.'}
              </div>
            </div>
            <div className="p-3 rounded border bg-background/50">
              <div className="text-sm mb-2">Workload balance</div>
              <div className="text-xs text-muted-foreground">
                Distribute subjects across days to avoid overload.
              </div>
            </div>
          </div>

          <ClientOnly fallback={<div className="h-16" />}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Input
                placeholder="Subject (e.g., Calculus)"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
              <Input
                placeholder="Mood (happy/stressed/neutral)"
                value={mood}
                onChange={(e) => setMood(e.target.value)}
              />
              <Input placeholder="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
            <Button onClick={saveLog}>
              <Timer className="h-4 w-4 mr-1" /> Save session
            </Button>
          </ClientOnly>

          <div className="pt-3">
            <div className="text-sm font-medium mb-2">Recent sessions</div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {(Array.isArray(logs) ? logs : []).map((l) => (
                <div key={l.id} className="p-3 rounded border bg-background/50 text-xs">
                  <div className="font-medium">{l.subject || 'Study'}</div>
                  <div>
                    {new Date(l.startedAt).toLocaleString()} • {l.duration} min • {l.mood || '—'}
                  </div>
                </div>
              ))}
              {(Array.isArray(logs) ? logs : []).length === 0 && (
                <div className="text-xs text-muted-foreground">No logs yet.</div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mental Health Support */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" /> Mental Health Support
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3 rounded border bg-background/50">
              <div className="text-sm mb-2">Counselor access</div>
              <div className="text-xs text-muted-foreground">Book a 1:1 support slot.</div>
            </div>
            <div className="p-3 rounded border bg-background/50">
              <div className="text-sm mb-2">Stress management</div>
              <div className="text-xs text-muted-foreground">
                Breathing, grounding, and reframing tips.
              </div>
            </div>
            <div className="p-3 rounded border bg-background/50">
              <div className="text-sm mb-2">Wellness resources</div>
              <div className="text-xs text-muted-foreground">Curated articles and videos.</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {slots.map((s) => (
              <div
                key={s.id}
                className="p-3 rounded border bg-background/50 text-xs flex items-center justify-between"
              >
                <div>
                  <div className="font-medium">{new Date(s.startTime).toLocaleString()}</div>
                  <div className="text-muted-foreground">
                    {new Date(s.endTime).toLocaleTimeString()} •{' '}
                    {s.isBooked ? 'Booked' : 'Available'}
                  </div>
                </div>
                <Button size="sm" disabled={s.isBooked} onClick={() => book(s.id)}>
                  <Phone className="h-4 w-4 mr-1" /> {s.isBooked ? 'Booked' : 'Book'}
                </Button>
              </div>
            ))}
            {slots.length === 0 && <div className="text-xs text-muted-foreground">No slots.</div>}
          </div>
        </CardContent>
      </Card>

      {/* Mindfulness */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" /> Mindfulness
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {mind.map((m) => (
              <div
                key={m.id}
                className="p-3 rounded border bg-background/50 text-sm flex items-center justify-between"
              >
                <div>
                  <div className="font-medium">{m.title}</div>
                  <div className="text-xs text-muted-foreground capitalize">
                    {m.kind}
                    {m.duration ? ` • ${m.duration}m` : ''}
                  </div>
                </div>
                <Button size="sm" variant="secondary">
                  <Headphones className="h-4 w-4 mr-1" /> Start
                </Button>
              </div>
            ))}
            {mind.length === 0 && (
              <div className="text-xs text-muted-foreground">No content yet.</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
