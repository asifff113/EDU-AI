import { NextRequest } from 'next/server';
import { getApiBaseUrl } from '@/lib/env';

function base() {
  const b = getApiBaseUrl();
  if (b.startsWith('/')) return 'http://localhost:4000';
  return b;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const cookie = req.headers.get('cookie') || '';
  const action = searchParams.get('action') || 'plans';
  const url = action === 'me' ? `${base()}/subscriptions/me` : `${base()}/subscriptions/plans`;
  const res = await fetch(url, { credentials: 'include', headers: { cookie } });
  const data = await res.json().catch(() => []);
  return new Response(JSON.stringify(data), {
    status: res.status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function POST(req: NextRequest) {
  const cookie = req.headers.get('cookie') || '';
  const body = await req.json().catch(() => ({}));
  const res = await fetch(`${base()}/subscriptions`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', cookie },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  return new Response(JSON.stringify(data), {
    status: res.status,
    headers: { 'Content-Type': 'application/json' },
  });
}
