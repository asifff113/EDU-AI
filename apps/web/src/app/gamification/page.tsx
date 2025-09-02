'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge as UIBadge } from '@/components/ui/badge';
import { Badge } from '@/components/ui/badge';
import { useEffect, useState } from 'react';
import { getApiBaseUrl } from '@/lib/env';
import { io } from 'socket.io-client';

type Profile = { xp: number; points: number; level: number; rankName: string };
type LBRow = {
  userId: string;
  name: string;
  xp: number;
  points: number;
  level: number;
  rank: string;
};

export default function GamificationPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [badges, setBadges] = useState<any[]>([]);
  const [lbXp, setLbXp] = useState<LBRow[]>([]);
  const [lbPts, setLbPts] = useState<LBRow[]>([]);

  const load = async () => {
    const base = getApiBaseUrl();
    const [me, lxp, lpt, earned] = await Promise.all([
      fetch('/api/gamification')
        .then((r) => r.json())
        .catch(() => null),
      fetch(`${base}/gamification/leaderboard?type=xp&limit=10`, { credentials: 'include' })
        .then((r) => r.json())
        .catch(() => []),
      fetch(`${base}/gamification/leaderboard?type=points&limit=10`, { credentials: 'include' })
        .then((r) => r.json())
        .catch(() => []),
      fetch(`${base}/gamification/achievements`, { credentials: 'include' })
        .then((r) => r.json())
        .catch(() => []),
    ]);
    setProfile(me);
    setLbXp(lxp || []);
    setLbPts(lpt || []);
    setBadges(earned || []);
  };

  useEffect(() => {
    load();
    const s = io(`${getApiBaseUrl()}/gamification`, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      auth: { userId: 'me' },
    });
    s.on('gamification:update', () => load());
    return () => {
      s.close();
    };
  }, []);

  return (
    <div className="space-y-8">
      {/* Enhanced Gaming Header */}
      <div
        className="relative group bg-gradient-to-r from-purple-500/20 via-fuchsia-600/15 to-pink-500/20 
        rounded-2xl p-8 border border-purple-500/20 backdrop-blur-xl shadow-2xl shadow-purple-500/10
        hover:shadow-3xl hover:shadow-purple-500/20 transition-all duration-700 transform-gpu
        before:absolute before:inset-0 before:bg-gradient-to-r before:from-purple-500/5 before:to-pink-500/5 
        before:rounded-2xl before:opacity-0 before:transition-opacity before:duration-500 hover:before:opacity-100"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-2xl"></div>
        <div className="relative z-10 flex items-center gap-4">
          <div className="p-4 rounded-2xl bg-purple-500/20 group-hover:bg-purple-400/30 transition-all duration-300 group-hover:rotate-6 group-hover:scale-110 transform-gpu">
            <div className="text-3xl">🎮</div>
          </div>
          <div>
            <h1 className="text-4xl font-bold mb-2 text-white group-hover:text-purple-100 transition-colors duration-300">
              Gamification Hub
            </h1>
            <p className="text-purple-300 group-hover:text-purple-200 transition-colors duration-300 text-lg">
              Level up your learning journey with achievements and rewards!
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Enhanced Your Progress Card - Gold Achievement Theme */}
        <Card
          className="group relative border-0 bg-gradient-to-br from-yellow-500/20 via-amber-600/15 to-orange-600/20 
          backdrop-blur-xl shadow-xl shadow-yellow-500/20 hover:shadow-2xl hover:shadow-yellow-500/30 
          transition-all duration-500 hover:scale-105 hover:-translate-y-2 transform-gpu perspective-1000 
          before:absolute before:inset-0 before:bg-gradient-to-r before:from-yellow-500/10 before:to-amber-500/10 
          before:rounded-xl before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-100"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-xl"></div>
          <CardHeader className="relative z-10">
            <CardTitle
              className="text-2xl font-bold text-white group-hover:text-yellow-200 transition-colors duration-300 
              flex items-center gap-3"
            >
              <div className="p-2 rounded-lg bg-yellow-500/20 group-hover:bg-yellow-400/30 transition-all duration-300 group-hover:rotate-6">
                <div className="text-2xl">🏆</div>
              </div>
              Your Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 relative z-10">
            {profile ? (
              <div className="space-y-6">
                {/* Enhanced XP Display */}
                <div className="p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-yellow-500/30">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-white font-semibold flex items-center gap-2">
                      ⚡ Experience Points
                    </span>
                    <Badge
                      className="bg-yellow-500/30 text-yellow-200 border-yellow-400/30 hover:bg-yellow-400/40 
                      transition-all duration-300 hover:scale-110 px-3 py-1"
                    >
                      {profile.xp.toLocaleString()} XP
                    </Badge>
                  </div>
                  <Progress
                    value={Math.min(100, ((profile.xp % 100) / 100) * 100)}
                    className="h-4 bg-gray-700"
                  />
                  <div className="text-xs text-yellow-300 mt-2">
                    Next level: {100 - (profile.xp % 100)} XP to go
                  </div>
                </div>

                {/* Enhanced Points Display */}
                <div className="p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-orange-500/30">
                  <div className="flex items-center justify-between">
                    <span className="text-white font-semibold flex items-center gap-2">
                      🪙 Total Points
                    </span>
                    <Badge
                      className="bg-orange-500/30 text-orange-200 border-orange-400/30 hover:bg-orange-400/40 
                      transition-all duration-300 hover:scale-110 px-3 py-1"
                    >
                      {profile.points.toLocaleString()}
                    </Badge>
                  </div>
                </div>

                {/* Enhanced Level & Rank */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-green-500/30 text-center">
                    <div className="text-2xl mb-2">🎯</div>
                    <div className="text-white font-semibold">Level</div>
                    <Badge
                      className="bg-green-500/30 text-green-200 border-green-400/30 hover:bg-green-400/40 
                      transition-all duration-300 hover:scale-110 mt-2 text-lg px-3 py-1"
                    >
                      {profile.level}
                    </Badge>
                  </div>
                  <div className="p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-purple-500/30 text-center">
                    <div className="text-2xl mb-2">👑</div>
                    <div className="text-white font-semibold">Rank</div>
                    <Badge
                      className="bg-purple-500/30 text-purple-200 border-purple-400/30 hover:bg-purple-400/40 
                      transition-all duration-300 hover:scale-110 mt-2 px-3 py-1"
                    >
                      {profile.rankName}
                    </Badge>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center">
                <div className="text-4xl mb-4">🎲</div>
                <div className="text-xl font-semibold text-white">Loading your stats...</div>
                <div className="text-yellow-300 text-sm mt-2">Calculating achievements</div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Enhanced Leaderboards Card - Competitive Red/Orange Theme */}
        <Card
          className="group relative border-0 bg-gradient-to-br from-red-500/20 via-orange-600/15 to-pink-600/20 
          backdrop-blur-xl shadow-xl shadow-red-500/20 hover:shadow-2xl hover:shadow-red-500/30 
          transition-all duration-500 hover:scale-105 hover:-translate-y-2 transform-gpu perspective-1000 
          before:absolute before:inset-0 before:bg-gradient-to-r before:from-red-500/10 before:to-orange-500/10 
          before:rounded-xl before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-100"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-xl"></div>
          <CardHeader className="relative z-10">
            <CardTitle
              className="text-2xl font-bold text-white group-hover:text-red-200 transition-colors duration-300 
              flex items-center gap-3"
            >
              <div className="p-2 rounded-lg bg-red-500/20 group-hover:bg-red-400/30 transition-all duration-300 group-hover:rotate-6">
                <div className="text-2xl">🥇</div>
              </div>
              Leaderboards
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 relative z-10">
            <div className="grid grid-cols-2 gap-6">
              {/* Top XP Leaderboard */}
              <div className="p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-yellow-500/30">
                <div className="font-bold text-white mb-4 flex items-center gap-2 text-lg">
                  ⚡ Top XP Champions
                </div>
                <div className="space-y-3">
                  {lbXp.map((r, i) => {
                    const medals = ['🥇', '🥈', '🥉'];
                    const colors = [
                      'from-yellow-500/30 to-amber-500/30 text-yellow-200 border-yellow-400/50',
                      'from-gray-400/30 to-slate-500/30 text-gray-200 border-gray-400/50',
                      'from-orange-500/30 to-amber-600/30 text-orange-200 border-orange-400/50',
                    ];
                    const color =
                      i < 3
                        ? colors[i]
                        : 'from-blue-500/20 to-cyan-500/20 text-blue-200 border-blue-400/30';
                    return (
                      <div
                        key={r.userId}
                        className={`p-3 rounded-lg bg-gradient-to-r backdrop-blur-sm border 
                        hover:scale-105 transition-all duration-300 transform-gpu ${color}`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-medium flex items-center gap-2">
                            <span className="text-lg">{medals[i] || `#${i + 1}`}</span>
                            {r.name}
                          </span>
                          <Badge className="bg-white/20 text-white border-white/30">
                            {r.xp.toLocaleString()} XP
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                  {lbXp.length === 0 && (
                    <div className="text-center p-4 text-white/60">No players yet</div>
                  )}
                </div>
              </div>

              {/* Top Points Leaderboard */}
              <div className="p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-orange-500/30">
                <div className="font-bold text-white mb-4 flex items-center gap-2 text-lg">
                  🪙 Top Point Earners
                </div>
                <div className="space-y-3">
                  {lbPts.map((r, i) => {
                    const medals = ['🥇', '🥈', '🥉'];
                    const colors = [
                      'from-yellow-500/30 to-amber-500/30 text-yellow-200 border-yellow-400/50',
                      'from-gray-400/30 to-slate-500/30 text-gray-200 border-gray-400/50',
                      'from-orange-500/30 to-amber-600/30 text-orange-200 border-orange-400/50',
                    ];
                    const color =
                      i < 3
                        ? colors[i]
                        : 'from-purple-500/20 to-violet-500/20 text-purple-200 border-purple-400/30';
                    return (
                      <div
                        key={r.userId}
                        className={`p-3 rounded-lg bg-gradient-to-r backdrop-blur-sm border 
                        hover:scale-105 transition-all duration-300 transform-gpu ${color}`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-medium flex items-center gap-2">
                            <span className="text-lg">{medals[i] || `#${i + 1}`}</span>
                            {r.name}
                          </span>
                          <Badge className="bg-white/20 text-white border-white/30">
                            {r.points.toLocaleString()} pts
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                  {lbPts.length === 0 && (
                    <div className="text-center p-4 text-white/60">No players yet</div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Live Feed - Cyan Activity Theme */}
      <Card
        className="group relative border-0 bg-gradient-to-br from-cyan-500/20 via-teal-600/15 to-blue-600/20 
        backdrop-blur-xl shadow-xl shadow-cyan-500/20 hover:shadow-2xl hover:shadow-cyan-500/30 
        transition-all duration-500 hover:scale-[1.01] transform-gpu perspective-1000 
        before:absolute before:inset-0 before:bg-gradient-to-r before:from-cyan-500/10 before:to-teal-500/10 
        before:rounded-xl before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-100"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-xl"></div>
        <CardHeader className="relative z-10">
          <CardTitle
            className="text-2xl font-bold text-white group-hover:text-cyan-200 transition-colors duration-300 
            flex items-center gap-3"
          >
            <div className="p-2 rounded-lg bg-cyan-500/20 group-hover:bg-cyan-400/30 transition-all duration-300 group-hover:rotate-6">
              <div className="text-2xl">📡</div>
            </div>
            Live Activity Feed
          </CardTitle>
        </CardHeader>
        <CardContent className="relative z-10">
          <div
            id="student-gamification"
            className="min-h-[100px] p-6 rounded-xl bg-white/10 backdrop-blur-sm 
            border border-cyan-500/30"
          ></div>
          <div className="text-center p-6 text-cyan-300">
            <div className="text-4xl mb-2">⚡</div>
            <div className="font-medium">Real-time activity updates will appear here</div>
            <div className="text-sm text-white/60 mt-1">Complete actions to see live updates!</div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Badges - Rainbow Achievement Theme */}
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
              <div className="text-2xl">🏅</div>
            </div>
            Achievement Badges
          </CardTitle>
        </CardHeader>
        <CardContent className="relative z-10">
          {badges.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-6xl mb-4">🎖️</div>
              <div className="text-xl font-semibold text-white mb-2">No badges earned yet</div>
              <div className="text-emerald-300">
                Complete activities and challenges to unlock awesome badges!
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {badges.map((b: any, index: number) => {
                const badgeColors = [
                  'from-yellow-500/20 to-amber-500/20 shadow-yellow-500/15 hover:shadow-yellow-500/25 border-yellow-400/30',
                  'from-blue-500/20 to-cyan-500/20 shadow-blue-500/15 hover:shadow-blue-500/25 border-blue-400/30',
                  'from-purple-500/20 to-violet-500/20 shadow-purple-500/15 hover:shadow-purple-500/25 border-purple-400/30',
                  'from-green-500/20 to-emerald-500/20 shadow-green-500/15 hover:shadow-green-500/25 border-green-400/30',
                  'from-red-500/20 to-pink-500/20 shadow-red-500/15 hover:shadow-red-500/25 border-red-400/30',
                  'from-orange-500/20 to-yellow-500/20 shadow-orange-500/15 hover:shadow-orange-500/25 border-orange-400/30',
                ];
                const color = badgeColors[index % badgeColors.length];
                return (
                  <div
                    key={b.code}
                    className={`group relative p-6 rounded-xl bg-gradient-to-br backdrop-blur-sm border 
                    hover:scale-105 hover:-translate-y-1 transition-all duration-300 transform-gpu cursor-pointer ${color}`}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="text-3xl group-hover:scale-110 transition-transform duration-300">
                        {b.icon || '🏅'}
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-white group-hover:scale-105 transition-transform duration-300">
                          {b.name}
                        </div>
                        <UIBadge className="bg-white/20 text-white border-white/30 hover:bg-white/30 transition-all duration-300 mt-2">
                          +{b.xpReward || 100} XP
                        </UIBadge>
                      </div>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-xl"></div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
