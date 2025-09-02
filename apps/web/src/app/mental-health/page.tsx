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
    return () => {
      s.disconnect();
    };
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
    <div className="space-y-8">
      {/* Wellness Sanctuary Header */}
      <div
        className="relative group bg-gradient-to-r from-teal-500/20 via-cyan-600/15 to-blue-500/20 
         rounded-2xl p-8 border border-teal-500/20 backdrop-blur-xl shadow-2xl shadow-teal-500/10
         hover:shadow-3xl hover:shadow-teal-500/20 transition-all duration-700 transform-gpu
         before:absolute before:inset-0 before:bg-gradient-to-r before:from-teal-500/5 before:to-blue-500/5 
         before:rounded-2xl before:opacity-0 before:transition-opacity before:duration-500 hover:before:opacity-100"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-2xl"></div>
        <div className="relative z-10 flex items-center gap-4">
          <div className="p-4 rounded-2xl bg-teal-500/20 group-hover:bg-teal-400/30 transition-all duration-300 group-hover:rotate-6 group-hover:scale-110 transform-gpu">
            <div className="text-3xl">🧘</div>
          </div>
          <div>
            <h1 className="text-4xl font-bold mb-2 text-white group-hover:text-teal-100 transition-colors duration-300">
              Wellness Sanctuary
            </h1>
            <p className="text-teal-300 group-hover:text-teal-200 transition-colors duration-300 text-lg">
              Your peaceful space for mental wellness, mindfulness, and holistic healing
            </p>
          </div>
        </div>
      </div>

      {/* Burnout Prevention - Growth & Peace Theme */}
      <Card
        className="group relative border-0 bg-gradient-to-br from-emerald-500/20 via-green-600/15 to-teal-500/20 
        backdrop-blur-xl shadow-xl shadow-emerald-500/20 hover:shadow-2xl hover:shadow-emerald-500/30
        transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1 transform-gpu perspective-1000
        before:absolute before:inset-0 before:bg-gradient-to-r before:from-emerald-500/10 before:to-green-600/10 
        before:rounded-xl before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-100"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-xl"></div>
        <CardHeader className="relative z-10">
          <CardTitle className="flex items-center gap-3 text-white group-hover:text-emerald-200 transition-colors duration-300">
            <div className="p-2 rounded-lg bg-emerald-500/20 group-hover:bg-emerald-400/30 transition-all duration-300 group-hover:rotate-12 group-hover:scale-110">
              <Activity className="h-5 w-5 text-emerald-300 group-hover:text-emerald-200" />
            </div>
            <span className="text-xl font-bold">Burnout Prevention</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Study Timer Card */}
            <div
              className="group/timer relative p-4 rounded-xl border border-emerald-400/30 bg-gradient-to-br from-emerald-500/20 to-green-500/20 
              backdrop-blur-sm hover:scale-105 hover:-translate-y-1 transition-all duration-300 transform-gpu cursor-pointer"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-xl"></div>
              <div className="relative z-10">
                <div className="text-sm mb-3 text-emerald-200 group-hover/timer:text-emerald-100 transition-colors duration-300">
                  Study Timer
                </div>
                <div
                  className="text-3xl font-bold tabular-nums text-white group-hover/timer:text-emerald-100 transition-colors duration-300 
                  group-hover/timer:scale-110 transform origin-left"
                >
                  {String(Math.floor(seconds / 60)).padStart(2, '0')}:
                  {String(seconds % 60).padStart(2, '0')}
                </div>
                <ClientOnly fallback={<div className="mt-3 h-8" />}>
                  <div className="mt-3 flex gap-2">
                    <Button
                      size="sm"
                      onClick={start}
                      className="bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 
                        text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all duration-300 
                        hover:scale-110 transform-gpu border-0"
                    >
                      <Play className="h-4 w-4 mr-1" /> Start
                    </Button>
                    <Button
                      size="sm"
                      onClick={pause}
                      className="bg-emerald-500/20 hover:bg-emerald-400/30 text-emerald-200 hover:text-emerald-100 
                        border border-emerald-400/50 hover:border-emerald-300 transition-all duration-300 hover:scale-110 transform-gpu"
                    >
                      <Pause className="h-4 w-4 mr-1" /> Pause
                    </Button>
                    <Button
                      size="sm"
                      onClick={reset}
                      className="bg-transparent hover:bg-emerald-500/20 text-emerald-300 hover:text-emerald-200 
                        transition-all duration-300 hover:scale-110 transform-gpu"
                    >
                      <RefreshCw className="h-4 w-4 mr-1" /> Reset
                    </Button>
                  </div>
                </ClientOnly>
              </div>
            </div>

            {/* Study Pattern Card */}
            <div
              className="group/pattern relative p-4 rounded-xl border border-green-400/30 bg-gradient-to-br from-green-500/20 to-teal-500/20 
              backdrop-blur-sm hover:scale-105 hover:-translate-y-1 transition-all duration-300 transform-gpu cursor-pointer"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-xl"></div>
              <div className="relative z-10">
                <div className="text-sm mb-3 text-green-200 group-hover/pattern:text-green-100 transition-colors duration-300">
                  Study Pattern
                </div>
                <div className="text-xs text-green-300 group-hover/pattern:text-green-200 transition-colors duration-300 mb-2">
                  AI analyzes your sessions to suggest optimal breaks
                </div>
                <div
                  className="text-xs text-white font-medium bg-green-500/20 px-2 py-1 rounded-full 
                  group-hover/pattern:bg-green-400/30 transition-colors duration-300"
                >
                  {minutes >= 25 ? '🌿 Take 5 minutes.' : '✨ Keep focusing.'}
                </div>
              </div>
            </div>

            {/* Workload Balance Card */}
            <div
              className="group/balance relative p-4 rounded-xl border border-teal-400/30 bg-gradient-to-br from-teal-500/20 to-cyan-500/20 
              backdrop-blur-sm hover:scale-105 hover:-translate-y-1 transition-all duration-300 transform-gpu cursor-pointer"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-xl"></div>
              <div className="relative z-10">
                <div className="text-sm mb-3 text-teal-200 group-hover/balance:text-teal-100 transition-colors duration-300">
                  Workload Balance
                </div>
                <div className="text-xs text-teal-300 group-hover/balance:text-teal-200 transition-colors duration-300">
                  Smart distribution across subjects to prevent overwhelm
                </div>
                <div className="mt-2">
                  <div className="text-xs text-white font-medium">⚖️ Maintaining harmony</div>
                </div>
              </div>
            </div>
          </div>

          <ClientOnly fallback={<div className="h-16" />}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                placeholder="Subject (e.g., Calculus)"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="bg-emerald-500/10 border-emerald-400/30 text-white placeholder:text-emerald-300 
                  focus:border-emerald-300 focus:ring-emerald-400/20 transition-all duration-300
                  hover:bg-emerald-500/20"
              />
              <Input
                placeholder="Mood (happy/stressed/neutral)"
                value={mood}
                onChange={(e) => setMood(e.target.value)}
                className="bg-green-500/10 border-green-400/30 text-white placeholder:text-green-300 
                  focus:border-green-300 focus:ring-green-400/20 transition-all duration-300
                  hover:bg-green-500/20"
              />
              <Input
                placeholder="Notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="bg-teal-500/10 border-teal-400/30 text-white placeholder:text-teal-300 
                  focus:border-teal-300 focus:ring-teal-400/20 transition-all duration-300
                  hover:bg-teal-500/20"
              />
            </div>
            <Button
              onClick={saveLog}
              className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 
                text-white shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all duration-300 
                hover:scale-110 hover:-translate-y-1 transform-gpu border-0"
            >
              <Timer className="h-4 w-4 mr-2" />
              <span>Save Wellness Session</span>
            </Button>
          </ClientOnly>

          <div className="pt-6">
            <div className="text-lg font-semibold mb-4 text-emerald-200 flex items-center gap-2">
              <div className="text-xl">📊</div>
              Recent Wellness Sessions
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {(Array.isArray(logs) ? logs : []).map((l, index) => {
                const sessionColors = [
                  'from-emerald-500/25 to-green-500/25 border-emerald-400/40 shadow-emerald-500/20',
                  'from-green-500/25 to-teal-500/25 border-green-400/40 shadow-green-500/20',
                  'from-teal-500/25 to-cyan-500/25 border-teal-400/40 shadow-teal-500/20',
                ];
                const color = sessionColors[index % sessionColors.length];
                const moodEmoji = l.mood === 'happy' ? '😊' : l.mood === 'stressed' ? '😤' : '😐';

                return (
                  <div
                    key={l.id}
                    className={`group relative p-4 rounded-xl bg-gradient-to-br backdrop-blur-sm border 
                    hover:scale-105 hover:-translate-y-1 transition-all duration-300 transform-gpu cursor-pointer shadow-lg ${color}`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-xl"></div>
                    <div className="relative z-10">
                      <div className="font-medium text-white group-hover:text-emerald-100 transition-colors duration-300 text-sm mb-2">
                        {l.subject || 'Study Session'}
                      </div>
                      <div className="text-xs text-emerald-200 group-hover:text-emerald-100 transition-colors duration-300 space-y-1">
                        <div>📅 {new Date(l.startedAt).toLocaleDateString()}</div>
                        <div>⏱️ {l.duration} minutes</div>
                        <div className="flex items-center gap-1">
                          {moodEmoji} <span className="capitalize">{l.mood || 'neutral'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              {(Array.isArray(logs) ? logs : []).length === 0 && (
                <div className="col-span-full text-center text-emerald-300 py-8">
                  <div className="text-4xl mb-2">🌱</div>
                  <div className="text-sm">Begin your wellness journey - no sessions yet.</div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mental Health Support - Heart & Emotional Care Theme */}
      <Card
        className="group relative border-0 bg-gradient-to-br from-pink-500/20 via-rose-600/15 to-red-500/20 
        backdrop-blur-xl shadow-xl shadow-pink-500/20 hover:shadow-2xl hover:shadow-pink-500/30
        transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1 transform-gpu perspective-1000
        before:absolute before:inset-0 before:bg-gradient-to-r before:from-pink-500/10 before:to-rose-600/10 
        before:rounded-xl before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-100"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-xl"></div>
        <CardHeader className="relative z-10">
          <CardTitle className="flex items-center gap-3 text-white group-hover:text-pink-200 transition-colors duration-300">
            <div className="p-2 rounded-lg bg-pink-500/20 group-hover:bg-pink-400/30 transition-all duration-300 group-hover:rotate-12 group-hover:scale-110">
              <Heart className="h-5 w-5 text-pink-300 group-hover:text-pink-200" />
            </div>
            <span className="text-xl font-bold">Mental Health Support</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Counselor Access Card */}
            <div
              className="group/counselor relative p-4 rounded-xl border border-pink-400/30 bg-gradient-to-br from-pink-500/20 to-rose-500/20 
              backdrop-blur-sm hover:scale-105 hover:-translate-y-1 transition-all duration-300 transform-gpu cursor-pointer"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-xl"></div>
              <div className="relative z-10">
                <div className="text-sm mb-3 text-pink-200 group-hover/counselor:text-pink-100 transition-colors duration-300">
                  💝 Counselor Access
                </div>
                <div className="text-xs text-pink-300 group-hover/counselor:text-pink-200 transition-colors duration-300">
                  Professional 1:1 support sessions for emotional guidance
                </div>
                <div className="mt-2">
                  <div
                    className="text-xs text-white font-medium bg-pink-500/20 px-2 py-1 rounded-full 
                    group-hover/counselor:bg-pink-400/30 transition-colors duration-300"
                  >
                    Available 24/7
                  </div>
                </div>
              </div>
            </div>

            {/* Stress Management Card */}
            <div
              className="group/stress relative p-4 rounded-xl border border-rose-400/30 bg-gradient-to-br from-rose-500/20 to-red-500/20 
              backdrop-blur-sm hover:scale-105 hover:-translate-y-1 transition-all duration-300 transform-gpu cursor-pointer"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-xl"></div>
              <div className="relative z-10">
                <div className="text-sm mb-3 text-rose-200 group-hover/stress:text-rose-100 transition-colors duration-300">
                  🌸 Stress Management
                </div>
                <div className="text-xs text-rose-300 group-hover/stress:text-rose-200 transition-colors duration-300">
                  Breathing exercises, grounding techniques & cognitive reframing
                </div>
                <div className="mt-2">
                  <div className="text-xs text-white font-medium">🧘‍♀️ Find your calm</div>
                </div>
              </div>
            </div>

            {/* Wellness Resources Card */}
            <div
              className="group/resources relative p-4 rounded-xl border border-red-400/30 bg-gradient-to-br from-red-500/20 to-pink-500/20 
              backdrop-blur-sm hover:scale-105 hover:-translate-y-1 transition-all duration-300 transform-gpu cursor-pointer"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-xl"></div>
              <div className="relative z-10">
                <div className="text-sm mb-3 text-red-200 group-hover/resources:text-red-100 transition-colors duration-300">
                  🌺 Wellness Resources
                </div>
                <div className="text-xs text-red-300 group-hover/resources:text-red-200 transition-colors duration-300">
                  Curated articles, videos & guided healing content
                </div>
                <div className="mt-2">
                  <div className="text-xs text-white font-medium">📚 Expert guidance</div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="text-lg font-semibold text-pink-200 flex items-center gap-2">
              <div className="text-xl">🗓️</div>
              Counseling Sessions
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {slots.map((s, index) => {
                const slotColors = [
                  'from-pink-500/25 to-rose-500/25 border-pink-400/40 shadow-pink-500/20',
                  'from-rose-500/25 to-red-500/25 border-rose-400/40 shadow-rose-500/20',
                  'from-red-500/25 to-pink-500/25 border-red-400/40 shadow-red-500/20',
                ];
                const color = slotColors[index % slotColors.length];

                return (
                  <div
                    key={s.id}
                    className={`group relative p-4 rounded-xl bg-gradient-to-br backdrop-blur-sm border 
                      hover:scale-105 hover:-translate-y-1 transition-all duration-300 transform-gpu shadow-lg ${color}`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-xl"></div>
                    <div className="relative z-10 flex items-center justify-between">
                      <div>
                        <div className="font-medium text-white group-hover:text-pink-100 transition-colors duration-300 text-sm">
                          {new Date(s.startTime).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-pink-200 group-hover:text-pink-100 transition-colors duration-300">
                          {new Date(s.startTime).toLocaleTimeString()} -{' '}
                          {new Date(s.endTime).toLocaleTimeString()}
                        </div>
                        <div className="text-xs mt-1">
                          <span
                            className={`px-2 py-1 rounded-full text-white font-medium ${
                              s.isBooked
                                ? 'bg-rose-500/30 text-rose-200'
                                : 'bg-green-500/30 text-green-200'
                            }`}
                          >
                            {s.isBooked ? '💔 Booked' : '💖 Available'}
                          </span>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        disabled={s.isBooked}
                        onClick={() => book(s.id)}
                        className={`transition-all duration-300 hover:scale-110 transform-gpu ${
                          s.isBooked
                            ? 'bg-gray-500/50 text-gray-300 cursor-not-allowed'
                            : 'bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white shadow-lg shadow-pink-500/25 hover:shadow-pink-500/40'
                        }`}
                      >
                        <Phone className="h-4 w-4 mr-1" />
                        {s.isBooked ? 'Booked' : 'Book Now'}
                      </Button>
                    </div>
                  </div>
                );
              })}
              {slots.length === 0 && (
                <div className="col-span-full text-center text-pink-300 py-8">
                  <div className="text-4xl mb-2">💕</div>
                  <div className="text-sm">No counseling slots available at the moment.</div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mindfulness - Meditation & Brain Focus Theme */}
      <Card
        className="group relative border-0 bg-gradient-to-br from-purple-500/20 via-indigo-600/15 to-violet-500/20 
        backdrop-blur-xl shadow-xl shadow-purple-500/20 hover:shadow-2xl hover:shadow-purple-500/30
        transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1 transform-gpu perspective-1000
        before:absolute before:inset-0 before:bg-gradient-to-r before:from-purple-500/10 before:to-indigo-600/10 
        before:rounded-xl before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-100"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-xl"></div>
        <CardHeader className="relative z-10">
          <CardTitle className="flex items-center gap-3 text-white group-hover:text-purple-200 transition-colors duration-300">
            <div className="p-2 rounded-lg bg-purple-500/20 group-hover:bg-purple-400/30 transition-all duration-300 group-hover:rotate-12 group-hover:scale-110">
              <Brain className="h-5 w-5 text-purple-300 group-hover:text-purple-200" />
            </div>
            <span className="text-xl font-bold">Mindfulness & Meditation</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="space-y-4">
            <div className="text-lg font-semibold text-purple-200 flex items-center gap-2 mb-6">
              <div className="text-xl">🧠</div>
              Guided Mind Practices
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mind.map((m, index) => {
                const mindfulnessColors = [
                  'from-purple-500/25 to-indigo-500/25 border-purple-400/40 shadow-purple-500/20',
                  'from-indigo-500/25 to-violet-500/25 border-indigo-400/40 shadow-indigo-500/20',
                  'from-violet-500/25 to-purple-500/25 border-violet-400/40 shadow-violet-500/20',
                ];
                const color = mindfulnessColors[index % mindfulnessColors.length];
                const durationIcon =
                  m.duration && m.duration <= 10
                    ? '⚡'
                    : m.duration && m.duration <= 20
                      ? '🌊'
                      : '🌙';
                const kindEmoji =
                  m.kind === 'meditation'
                    ? '🧘‍♀️'
                    : m.kind === 'breathing'
                      ? '🌬️'
                      : m.kind === 'relaxation'
                        ? '☁️'
                        : '✨';

                return (
                  <div
                    key={m.id}
                    className={`group relative p-4 rounded-xl bg-gradient-to-br backdrop-blur-sm border 
                      hover:scale-105 hover:-translate-y-1 transition-all duration-300 transform-gpu shadow-lg ${color}`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-xl"></div>
                    <div className="relative z-10 flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-white group-hover:text-purple-100 transition-colors duration-300 text-sm mb-2 flex items-center gap-2">
                          <span>{kindEmoji}</span>
                          <span>{m.title}</span>
                        </div>
                        <div className="text-xs text-purple-200 group-hover:text-purple-100 transition-colors duration-300 capitalize flex items-center gap-2">
                          <span className="px-2 py-1 bg-purple-500/20 rounded-full">{m.kind}</span>
                          {m.duration && (
                            <span className="px-2 py-1 bg-indigo-500/20 rounded-full flex items-center gap-1">
                              {durationIcon} {m.duration}m
                            </span>
                          )}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        className="ml-3 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 
                          text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-300 
                          hover:scale-110 transform-gpu border-0"
                      >
                        <Headphones className="h-4 w-4 mr-1" /> Begin
                      </Button>
                    </div>
                  </div>
                );
              })}
              {mind.length === 0 && (
                <div className="col-span-full text-center text-purple-300 py-8">
                  <div className="text-4xl mb-2">🌸</div>
                  <div className="text-sm mb-4">Your mindfulness journey awaits</div>
                  <div className="text-xs text-purple-400">
                    Guided meditations and breathing exercises will be available soon
                  </div>
                </div>
              )}
            </div>

            {mind.length > 0 && (
              <div className="mt-8 p-6 rounded-xl bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border border-purple-400/20">
                <div className="text-center space-y-2">
                  <div className="text-purple-200 font-medium">🌟 Mindfulness Tip</div>
                  <div className="text-sm text-purple-300">
                    Consistency is key to mindfulness practice. Even 5 minutes daily can transform
                    your mental clarity.
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
