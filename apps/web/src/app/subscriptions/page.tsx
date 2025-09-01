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
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-indigo-500/10 via-fuchsia-500/10 to-cyan-500/10 rounded-xl p-6 border border-white/10">
        <h1 className="text-3xl font-bold mb-2">Subscription Plans</h1>
        <p className="text-muted-foreground">
          Monthly plans, annual discounts, and family packages with real-time updates.
        </p>
      </div>

      {mine && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Check className="h-5 w-5" /> Current Subscription
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">{mine.plan.name}</div>
                <div className="text-sm text-muted-foreground capitalize">{mine.plan.interval}</div>
              </div>
              <Badge>${mine.plan.price.toFixed(2)}</Badge>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((pl) => (
          <Card key={pl.id} className="border-white/10">
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
                {pl.interval === 'yearly' && 'Includes free premium resources and certificates.'}
                {pl.interval === 'monthly' && 'Includes 50% off paid resources and certificates.'}
                {pl.interval === 'family' &&
                  'Includes 75% off for all family members (coming soon).'}
              </div>
              <Button disabled={loading} onClick={() => subscribe(pl.id)} className="w-full">
                <DollarSign className="h-4 w-4 mr-1" />{' '}
                {mine?.plan?.id === pl.id ? 'Current Plan' : 'Choose Plan'}
              </Button>
            </CardContent>
          </Card>
        ))}
        {plans.length === 0 && (
          <div className="text-sm text-muted-foreground">No plans available.</div>
        )}
      </div>
    </div>
  );
}
