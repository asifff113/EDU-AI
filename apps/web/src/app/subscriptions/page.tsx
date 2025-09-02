'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Users, CalendarCheck, Zap, Check } from 'lucide-react';
import { io } from 'socket.io-client';
import { getApiBaseUrl } from '@/lib/env';

type Plan = { id: string; name: string; interval: string; price: number; features: string[] };
type Sub = { id: string; status: string; plan: Plan };

export default function SubscriptionsPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [mine, setMine] = useState<Sub | null>(null);
  const [loading, setLoading] = useState(false);
  const base = getApiBaseUrl();
  const FALLBACK_PLANS: Plan[] = [
    {
      id: 'fallback-month',
      name: 'Monthly',
      interval: 'monthly',
      price: 4.99,
      features: ['All basic features', 'Community access'],
    },
    {
      id: 'fallback-annual',
      name: 'Annual',
      interval: 'yearly',
      price: 49.99,
      features: ['2 months free', 'Priority support'],
    },
    {
      id: 'fallback-family',
      name: 'Family',
      interval: 'family',
      price: 99.99,
      features: ['Up to 5 members', 'Family dashboard'],
    },
  ];

  const load = async () => {
    const [p, m] = await Promise.all([
      fetch('/api/subscriptions?action=plans', { credentials: 'include' })
        .then((r) => r.json())
        .catch(() => []),
      fetch('/api/subscriptions?action=me', { credentials: 'include' })
        .then((r) => r.json())
        .catch(() => null),
    ]);
    setPlans(Array.isArray(p) && p.length ? p : FALLBACK_PLANS);
    setMine(m && m.plan ? m : null);
  };

  useEffect(() => {
    load();
    const s = io(`${base}/subscriptions`, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
    });
    s.on('plans:update', load);
    return () => {
      s.disconnect();
    };
  }, []);

  const subscribe = async (planId: string) => {
    setLoading(true);
    const res = await fetch('/api/subscriptions', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ planId }),
    });
    setLoading(false);
    if (res.ok) load();
  };

  return (
    <div className="space-y-6 relative">
      {/* Header - Indigo/Fuchsia Card */}
      <div className="group perspective-1000">
        <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600/20 via-fuchsia-500/15 to-cyan-400/20 rounded-xl p-6 border border-indigo-400/30 shadow-xl backdrop-blur-sm transition-all duration-500 hover:scale-[1.02] hover:rotate-1 hover:shadow-2xl hover:shadow-indigo-500/25 transform-gpu">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-fuchsia-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-cyan-500"></div>
          <div className="relative">
            <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-indigo-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
              Subscription Plans
            </h1>
            <p className="text-indigo-200/80">
              Monthly plans, annual discounts, and family packages with real-time updates.
            </p>
          </div>
        </div>
      </div>

      {mine && (
        <div className="group perspective-1000">
          <Card className="relative overflow-hidden bg-gradient-to-br from-emerald-500/20 via-green-400/15 to-teal-500/20 backdrop-blur-xl border border-emerald-400/30 shadow-xl transition-all duration-500 hover:scale-[1.01] hover:-rotate-0.5 hover:shadow-2xl hover:shadow-emerald-500/25 transform-gpu">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500"></div>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent">
                <Check className="h-5 w-5" /> Current Subscription
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{mine.plan.name}</div>
                  <div className="text-sm text-muted-foreground capitalize">
                    {mine.plan.interval}
                  </div>
                </div>
                <Badge>${mine.plan.price.toFixed(2)}</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((pl, index) => {
          const colorThemes = [
            {
              bg: 'from-blue-500/20 via-indigo-400/15 to-purple-500/20',
              border: 'border-blue-400/30',
              shadow: 'hover:shadow-blue-500/25',
              top: 'from-blue-500 via-indigo-500 to-purple-500',
            },
            {
              bg: 'from-orange-500/20 via-amber-400/15 to-yellow-500/20',
              border: 'border-orange-400/30',
              shadow: 'hover:shadow-orange-500/25',
              top: 'from-orange-500 via-amber-500 to-yellow-500',
            },
            {
              bg: 'from-rose-500/20 via-pink-400/15 to-red-500/20',
              border: 'border-rose-400/30',
              shadow: 'hover:shadow-rose-500/25',
              top: 'from-rose-500 via-pink-500 to-red-500',
            },
          ];
          const theme = colorThemes[index % colorThemes.length];

          return (
            <div key={pl.id} className="group perspective-1000">
              <Card
                className={`relative overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:rotate-1 hover:shadow-2xl ring-1 ring-white/10 hover:ring-2 bg-gradient-to-br ${theme.bg} ${theme.border} ${theme.shadow} backdrop-blur-xl transform-gpu`}
              >
                <div
                  className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${theme.top} opacity-70 group-hover:opacity-100 transition-opacity`}
                ></div>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {pl.interval === 'monthly' && <CalendarCheck className="h-5 w-5" />}
                    {pl.interval === 'yearly' && <Zap className="h-5 w-5" />}
                    {pl.interval === 'family' && <Users className="h-5 w-5" />}
                    {pl.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-3xl font-bold">
                    ${pl.price.toFixed(2)}{' '}
                    <span className="text-sm font-normal text-muted-foreground">
                      / {pl.interval === 'yearly' ? 'year' : pl.interval}
                    </span>
                  </div>
                  <ul className="text-sm list-disc pl-5 space-y-1">
                    {pl.features.map((f, i) => (
                      <li key={i}>{f}</li>
                    ))}
                  </ul>
                  <div className="text-xs text-muted-foreground">
                    {pl.interval === 'yearly' &&
                      'Includes free premium resources and certificates.'}
                    {pl.interval === 'monthly' &&
                      'Includes 50% off paid resources and certificates.'}
                    {pl.interval === 'family' &&
                      'Includes 75% off for all family members (coming soon).'}
                  </div>
                  <Button
                    disabled={loading}
                    onClick={() => subscribe(pl.id)}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 transform-gpu"
                  >
                    <DollarSign className="h-4 w-4 mr-1" />{' '}
                    {mine?.plan?.id === pl.id ? 'Current Plan' : 'Choose Plan'}
                  </Button>
                </CardContent>
              </Card>
            </div>
          );
        })}
        {plans.length === 0 && (
          <div className="text-sm text-muted-foreground col-span-full text-center py-8">
            No plans available.
          </div>
        )}
      </div>
    </div>
  );
}
