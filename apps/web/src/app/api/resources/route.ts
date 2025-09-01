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
  const qs = searchParams.toString();
  const res = await fetch(`${base()}/resources?${qs}`, {
    credentials: 'include',
    headers: { cookie },
  });
  const data = await res.json().catch(() => []);
  return new Response(JSON.stringify(data), {
    status: res.status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function POST(req: NextRequest) {
  const cookie = req.headers.get('cookie') || '';
  const formData = await req.formData();
  const res = await fetch(`${base()}/resources`, {
    method: 'POST',
    credentials: 'include',
    headers: { cookie },
    body: formData as any,
  });
  const data = await res.json().catch(() => ({}));
  return new Response(JSON.stringify(data), {
    status: res.status,
    headers: { 'Content-Type': 'application/json' },
  });
}

// Removed duplicate route handlers to avoid redeclaration errors
