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
    return () => s.close();
  }, []);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Your Progress</CardTitle>
        </CardHeader>
        <CardContent>
          {profile ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span>XP</span>
                <Badge variant="secondary">{profile.xp}</Badge>
              </div>
              <Progress value={Math.min(100, ((profile.xp % 100) / 100) * 100)} className="h-2" />
              <div className="flex items-center justify-between">
                <span>Points</span>
                <Badge variant="secondary">{profile.points}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Level</span>
                <Badge>{profile.level}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Rank</span>
                <Badge>{profile.rankName}</Badge>
              </div>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">Loading...</div>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Leaderboards</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <div className="font-medium mb-2">Top XP</div>
              <div className="space-y-2">
                {lbXp.map((r, i) => (
                  <div key={r.userId} className="text-sm flex justify-between">
                    <span>
                      {i + 1}. {r.name}
                    </span>
                    <span>{r.xp} XP</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="font-medium mb-2">Top Points</div>
              <div className="space-y-2">
                {lbPts.map((r, i) => (
                  <div key={r.userId} className="text-sm flex justify-between">
                    <span>
                      {i + 1}. {r.name}
                    </span>
                    <span>{r.points} pts</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Live Feed</CardTitle>
        </CardHeader>
        <CardContent>
          <div id="student-gamification" className="text-xs text-muted-foreground"></div>
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Badges</CardTitle>
        </CardHeader>
        <CardContent>
          {badges.length === 0 ? (
            <div className="text-sm text-muted-foreground">No badges earned yet.</div>
          ) : (
            <div className="flex flex-wrap gap-3">
              {badges.map((b: any) => (
                <div
                  key={b.code}
                  className="p-3 rounded border bg-background/50 text-sm flex items-center gap-2"
                >
                  <span>{b.icon || '🏅'}</span>
                  <span className="font-medium">{b.name}</span>
                  <UIBadge variant="secondary" className="ml-2">
                    +{b.xpReward} XP
                  </UIBadge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
