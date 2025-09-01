import { NextRequest } from 'next/server';
import { getApiBaseUrl } from '@/lib/env';

const base = () => {
  const b = getApiBaseUrl();
  return b.startsWith('/') ? 'http://localhost:4000' : b;
};

export async function GET(req: NextRequest) {
  const cookie = req.headers.get('cookie') || '';
  const res = await fetch(`${base()}/notifications`, {
    credentials: 'include',
    headers: { cookie },
  });
  const data = await res.json().catch(() => ({ unread: 0, list: [] }));
  return new Response(JSON.stringify(data), {
    status: res.status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function POST(req: NextRequest) {
  const cookie = req.headers.get('cookie') || '';
  const body = await req.json().catch(() => ({}));
  const res = await fetch(`${base()}/notifications`, {
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
