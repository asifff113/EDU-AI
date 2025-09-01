import { NextRequest, NextResponse } from 'next/server';
import { getApiBaseUrl } from '@/lib/env';

const base = () => {
  const b = getApiBaseUrl();
  return b.startsWith('/') ? 'http://localhost:4000' : b;
};

export async function GET(req: NextRequest) {
  const cookie = req.headers.get('cookie') || '';
  const url = new URL(req.url);
  const path = url.searchParams.get('path') || 'me';
  const res = await fetch(`${base()}/gamification/${path}`, {
    headers: { cookie },
    credentials: 'include',
  });
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}

export async function POST(req: NextRequest) {
  const cookie = req.headers.get('cookie') || '';
  const body = await req.json().catch(() => ({}));
  const path = (body && body.path) || 'add';
  const payload = body && body.payload ? body.payload : body;
  const res = await fetch(`${base()}/gamification/${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', cookie },
    credentials: 'include',
    body: JSON.stringify(payload || {}),
  });
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
