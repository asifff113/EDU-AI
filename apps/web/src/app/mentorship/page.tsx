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
    <div className="space-y-8" suppressHydrationWarning>
      {/* Guidance Sanctuary Header */}
      <div
        className="relative group bg-gradient-to-r from-amber-500/20 via-orange-600/15 to-yellow-500/20 
         rounded-2xl p-8 border border-amber-500/20 backdrop-blur-xl shadow-2xl shadow-amber-500/10
         hover:shadow-3xl hover:shadow-amber-500/20 transition-all duration-700 transform-gpu
         before:absolute before:inset-0 before:bg-gradient-to-r before:from-amber-500/5 before:to-orange-500/5 
         before:rounded-2xl before:opacity-0 before:transition-opacity before:duration-500 hover:before:opacity-100"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-2xl"></div>
        <div className="relative z-10 flex items-center gap-4">
          <div className="p-4 rounded-2xl bg-amber-500/20 group-hover:bg-amber-400/30 transition-all duration-300 group-hover:rotate-6 group-hover:scale-110 transform-gpu">
            <div className="text-3xl">🤝</div>
          </div>
          <div>
            <h1 className="text-4xl font-bold mb-2 text-white group-hover:text-amber-100 transition-colors duration-300">
              Guidance Sanctuary
            </h1>
            <p className="text-amber-300 group-hover:text-amber-200 transition-colors duration-300 text-lg">
              Connect with experienced mentors and unlock your potential through expert guidance
            </p>
          </div>
        </div>
      </div>

      {/* Find Mentors - Trust & Knowledge Theme */}
      <Card
        className="group relative border-0 bg-gradient-to-br from-blue-500/20 via-indigo-600/15 to-cyan-500/20 
        backdrop-blur-xl shadow-xl shadow-blue-500/20 hover:shadow-2xl hover:shadow-blue-500/30
        transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1 transform-gpu perspective-1000
        before:absolute before:inset-0 before:bg-gradient-to-r before:from-blue-500/10 before:to-indigo-600/10 
        before:rounded-xl before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-100"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-xl"></div>
        <CardHeader className="relative z-10">
          <CardTitle className="flex items-center gap-3 text-white group-hover:text-blue-200 transition-colors duration-300">
            <div className="p-2 rounded-lg bg-blue-500/20 group-hover:bg-blue-400/30 transition-all duration-300 group-hover:rotate-12 group-hover:scale-110">
              <Users className="h-5 w-5 text-blue-300 group-hover:text-blue-200" />
            </div>
            <span className="text-xl font-bold">Discover Expert Mentors</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 relative z-10">
          <div className="flex gap-3">
            <Input
              placeholder="Search by name or expertise (e.g., AI, Finance, Design)"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="bg-blue-500/10 border-blue-400/30 text-white placeholder:text-blue-300 
                focus:border-blue-300 focus:ring-blue-400/20 transition-all duration-300
                hover:bg-blue-500/20"
            />
            <Button
              onClick={load}
              className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 
                text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300 
                hover:scale-110 transform-gpu border-0"
            >
              🔍 Search
            </Button>
          </div>

          <div className="space-y-4">
            <div className="text-lg font-semibold text-blue-200 flex items-center gap-2">
              <div className="text-xl">👨‍🏫</div>
              Featured Mentors
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {featured.map((m, index) => {
                const mentorColors = [
                  'from-blue-500/25 to-indigo-500/25 border-blue-400/40 shadow-blue-500/20',
                  'from-indigo-500/25 to-cyan-500/25 border-indigo-400/40 shadow-indigo-500/20',
                  'from-cyan-500/25 to-blue-500/25 border-cyan-400/40 shadow-cyan-500/20',
                ];
                const color = mentorColors[index % mentorColors.length];
                const isSelected = selectedMentorId === m.user.id;

                return (
                  <div
                    key={m.id}
                    className={`group/mentor relative p-4 rounded-xl bg-gradient-to-br backdrop-blur-sm border 
                      hover:scale-105 hover:-translate-y-1 transition-all duration-300 transform-gpu cursor-pointer shadow-lg ${color} 
                      ${isSelected ? 'ring-2 ring-blue-400 shadow-blue-400/50' : ''}`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-xl"></div>
                    <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="relative">
                          <img
                            src={m.user.avatar || '/api/placeholder/48'}
                            className="h-12 w-12 rounded-full object-cover ring-2 ring-blue-400/30 group-hover/mentor:ring-blue-300/50 transition-all duration-300"
                            onError={(e) => ((e.target as HTMLImageElement).style.display = 'none')}
                          />
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate text-white group-hover/mentor:text-blue-100 transition-colors duration-300">
                            {[m.user.firstName, m.user.lastName].filter(Boolean).join(' ') ||
                              m.user.email}
                          </div>
                          <div className="text-xs text-blue-300 group-hover/mentor:text-blue-200 transition-colors duration-300 line-clamp-1">
                            {m.headline || '🌟 Professional Mentor'}
                          </div>
                        </div>
                      </div>

                      <div className="mb-3 flex flex-wrap gap-1">
                        {m.expertise.slice(0, 4).map((x, i) => (
                          <Badge
                            key={x}
                            className="text-xs bg-blue-500/20 text-blue-200 border-blue-400/30 hover:bg-blue-400/30 transition-colors duration-300"
                          >
                            {x}
                          </Badge>
                        ))}
                      </div>

                      <div className="mb-3 text-xs text-blue-200 group-hover/mentor:text-blue-100 transition-colors duration-300 space-y-1">
                        {m.years && (
                          <div className="flex items-center gap-1">
                            <span>⏳</span>
                            <span>{m.years} years experience</span>
                          </div>
                        )}
                        {m.availability && (
                          <div className="flex items-center gap-1">
                            <span>📅</span>
                            <span>{m.availability}</span>
                          </div>
                        )}
                        {m.rate && (
                          <div className="flex items-center gap-1">
                            <span>💰</span>
                            <span>${m.rate}/hr</span>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => setSelectedMentorId(m.user.id)}
                          className={`flex-1 transition-all duration-300 hover:scale-105 transform-gpu ${
                            isSelected
                              ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-500/40'
                              : 'bg-blue-500/20 hover:bg-blue-400/30 text-blue-200 hover:text-blue-100 border border-blue-400/50'
                          }`}
                        >
                          <MessageSquare className="h-4 w-4 mr-1" />
                          {isSelected ? '✅ Selected' : 'Select'}
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => (window.location.href = `/chat?u=${m.user.id}`)}
                          className="bg-indigo-500/20 hover:bg-indigo-400/30 text-indigo-200 hover:text-indigo-100 
                            border border-indigo-400/50 hover:border-indigo-300 transition-all duration-300 hover:scale-105 transform-gpu"
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
              {featured.length === 0 && (
                <div className="col-span-full text-center text-blue-300 py-8">
                  <div className="text-4xl mb-2">🔍</div>
                  <div className="text-sm mb-2">No mentors found</div>
                  <div className="text-xs text-blue-400">Try adjusting your search terms</div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Request Mentorship - Growth & New Beginnings Theme */}
      <Card
        className="group relative border-0 bg-gradient-to-br from-green-500/20 via-emerald-600/15 to-teal-500/20 
        backdrop-blur-xl shadow-xl shadow-green-500/20 hover:shadow-2xl hover:shadow-green-500/30
        transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1 transform-gpu perspective-1000
        before:absolute before:inset-0 before:bg-gradient-to-r before:from-green-500/10 before:to-emerald-600/10 
        before:rounded-xl before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-100"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-xl"></div>
        <CardHeader className="relative z-10">
          <CardTitle className="flex items-center gap-3 text-white group-hover:text-green-200 transition-colors duration-300">
            <div className="p-2 rounded-lg bg-green-500/20 group-hover:bg-green-400/30 transition-all duration-300 group-hover:rotate-12 group-hover:scale-110">
              <Briefcase className="h-5 w-5 text-green-300 group-hover:text-green-200" />
            </div>
            <span className="text-xl font-bold">Request Personalized Mentorship</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 relative z-10">
          <div className="space-y-4">
            <div className="text-lg font-semibold text-green-200 flex items-center gap-2 mb-4">
              <div className="text-xl">🌱</div>
              Start Your Growth Journey
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-green-200">Mentorship Topic</label>
                <Input
                  placeholder="e.g., Career in Data Science, Leadership Skills..."
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="bg-green-500/10 border-green-400/30 text-white placeholder:text-green-300 
                    focus:border-green-300 focus:ring-green-400/20 transition-all duration-300
                    hover:bg-green-500/20"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-emerald-200">Your Message</label>
                <Input
                  placeholder="Tell your mentor about your goals and challenges..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="bg-emerald-500/10 border-emerald-400/30 text-white placeholder:text-emerald-300 
                    focus:border-emerald-300 focus:ring-emerald-400/20 transition-all duration-300
                    hover:bg-emerald-500/20"
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-400/20">
              <div className="flex items-center gap-3">
                <div className="text-2xl">{selectedMentorId ? '✅' : '❓'}</div>
                <div>
                  <div className="text-sm font-medium text-white">
                    {selectedMentorId ? 'Mentor Selected' : 'Select a Mentor First'}
                  </div>
                  <div className="text-xs text-green-300">
                    {selectedMentorId
                      ? 'You can now send your mentorship request'
                      : 'Choose from the mentors above to continue'}
                  </div>
                </div>
              </div>
              <Button
                onClick={request}
                disabled={!selectedMentorId}
                className={`transition-all duration-300 hover:scale-110 transform-gpu ${
                  !selectedMentorId
                    ? 'bg-gray-500/50 text-gray-300 cursor-not-allowed'
                    : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg shadow-green-500/25 hover:shadow-green-500/40'
                }`}
              >
                <Send className="h-4 w-4 mr-2" />
                Send Request
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="text-center p-4 rounded-xl bg-green-500/10 border border-green-400/20">
                <div className="text-2xl mb-2">🎯</div>
                <div className="text-xs font-medium text-green-200">Define Goals</div>
                <div className="text-xs text-green-300 mt-1">Clear objectives for growth</div>
              </div>
              <div className="text-center p-4 rounded-xl bg-emerald-500/10 border border-emerald-400/20">
                <div className="text-2xl mb-2">🤝</div>
                <div className="text-xs font-medium text-emerald-200">Connect & Learn</div>
                <div className="text-xs text-emerald-300 mt-1">Build lasting relationships</div>
              </div>
              <div className="text-center p-4 rounded-xl bg-teal-500/10 border border-teal-400/20">
                <div className="text-2xl mb-2">🚀</div>
                <div className="text-xs font-medium text-teal-200">Accelerate Growth</div>
                <div className="text-xs text-teal-300 mt-1">Unlock your potential</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mentorship Materials - Learning & Development Theme */}
      <Card
        className="group relative border-0 bg-gradient-to-br from-purple-500/20 via-violet-600/15 to-indigo-500/20 
        backdrop-blur-xl shadow-xl shadow-purple-500/20 hover:shadow-2xl hover:shadow-purple-500/30
        transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1 transform-gpu perspective-1000
        before:absolute before:inset-0 before:bg-gradient-to-r before:from-purple-500/10 before:to-violet-600/10 
        before:rounded-xl before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-100"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-xl"></div>
        <CardHeader className="relative z-10">
          <CardTitle className="flex items-center gap-3 text-white group-hover:text-purple-200 transition-colors duration-300">
            <div className="p-2 rounded-lg bg-purple-500/20 group-hover:bg-purple-400/30 transition-all duration-300 group-hover:rotate-12 group-hover:scale-110">
              <BookOpen className="h-5 w-5 text-purple-300 group-hover:text-purple-200" />
            </div>
            <span className="text-xl font-bold">Mentorship Learning Resources</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="space-y-6">
            <div className="text-lg font-semibold text-purple-200 flex items-center gap-2">
              <div className="text-xl">📚</div>
              Curated Learning Materials
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {materials.map((r, index) => {
                const materialColors = [
                  'from-purple-500/25 to-violet-500/25 border-purple-400/40 shadow-purple-500/20',
                  'from-violet-500/25 to-indigo-500/25 border-violet-400/40 shadow-violet-500/20',
                  'from-indigo-500/25 to-purple-500/25 border-indigo-400/40 shadow-indigo-500/20',
                ];
                const color = materialColors[index % materialColors.length];
                const typeIcon = r.type === 'video' ? '🎥' : r.type === 'pdf' ? '📄' : '🌐';
                const typeColor =
                  r.type === 'video'
                    ? 'text-red-300'
                    : r.type === 'pdf'
                      ? 'text-blue-300'
                      : 'text-green-300';

                return (
                  <div
                    key={r.id}
                    className={`group/material relative p-4 rounded-xl bg-gradient-to-br backdrop-blur-sm border 
                    hover:scale-105 hover:-translate-y-1 transition-all duration-300 transform-gpu cursor-pointer shadow-lg ${color}`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-xl"></div>
                    <div className="relative z-10">
                      <div className="font-medium mb-2 text-white group-hover/material:text-purple-100 transition-colors duration-300 text-sm line-clamp-1">
                        {r.title}
                      </div>
                      <div className="text-xs text-purple-200 group-hover/material:text-purple-100 transition-colors duration-300 line-clamp-2 mb-3">
                        {r.description}
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-lg">{typeIcon}</span>
                          <div>
                            <div className="capitalize font-medium text-white">{r.type}</div>
                            <div className={`text-xs ${typeColor}`}>
                              {r.type === 'video'
                                ? 'Visual Learning'
                                : r.type === 'pdf'
                                  ? 'Document'
                                  : 'Web Resource'}
                            </div>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          className="bg-purple-500/20 hover:bg-purple-400/30 text-purple-200 hover:text-purple-100 
                            border border-purple-400/50 hover:border-purple-300 transition-all duration-300 hover:scale-110 transform-gpu"
                        >
                          <span className="text-xs">View</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
              {materials.length === 0 && (
                <div className="col-span-full text-center text-purple-300 py-12">
                  <div className="text-6xl mb-4">📖</div>
                  <div className="text-lg font-medium mb-2">Learning Resources Coming Soon</div>
                  <div className="text-sm text-purple-400 mb-4">
                    We're curating the best mentorship materials for your journey
                  </div>
                  <div className="flex items-center justify-center gap-6 text-xs text-purple-400">
                    <div className="flex items-center gap-2">
                      <span>🎥</span>
                      <span>Video Guides</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>📄</span>
                      <span>PDF Resources</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>🌐</span>
                      <span>Web Articles</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {materials.length > 0 && (
              <div className="p-6 rounded-xl bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border border-purple-400/20">
                <div className="text-center space-y-2">
                  <div className="text-purple-200 font-medium flex items-center justify-center gap-2">
                    <span>💡</span>
                    <span>Pro Tip</span>
                  </div>
                  <div className="text-sm text-purple-300">
                    Combine these resources with regular mentor sessions for maximum impact on your
                    personal and professional development.
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
