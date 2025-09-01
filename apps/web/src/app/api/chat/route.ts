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
  const q = searchParams.get('q') || '';
  const cookie = req.headers.get('cookie') || '';
  const url = `${base}/chat/search?q=${encodeURIComponent(q)}`;
  const res = await fetch(url, { credentials: 'include', headers: { cookie } });
  const data = await res.json().catch(() => []);
  return new Response(JSON.stringify(data), {
    status: res.status,
    headers: { 'Content-Type': 'application/json' },
  });
}
