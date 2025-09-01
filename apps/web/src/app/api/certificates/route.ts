import { NextRequest } from 'next/server';
import { getApiBaseUrl } from '@/lib/env';

function resolveBase() {
  const b = getApiBaseUrl();
  if (b.startsWith('/')) return 'http://localhost:4000';
  return b;
}

export async function GET(req: NextRequest) {
  const base = resolveBase();
  const { searchParams } = new URL(req.url);
  const action = searchParams.get('action') || 'mine';
  const cookie = req.headers.get('cookie') || '';
  let url = `${base}/certificates/mine`;
  if (action === 'templates') url = `${base}/certificates/templates`;
  if (action === 'verify') {
    const code = searchParams.get('code') || '';
    url = `${base}/certificates/verify/${encodeURIComponent(code)}`;
  }
  const res = await fetch(url, { credentials: 'include', headers: { cookie } });
  const data = await res.json().catch(() => ({}));
  return new Response(JSON.stringify(data), {
    status: res.status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function POST(req: NextRequest) {
  const base = resolveBase();
  const body = await req.json();
  const cookie = req.headers.get('cookie') || '';
  const res = await fetch(`${base}/certificates/issue`, {
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
