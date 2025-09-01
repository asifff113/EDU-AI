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
  const q = (searchParams.get('q') || '').toLowerCase();
  const cookie = req.headers.get('cookie') || '';
  // Use public profiles endpoint and filter client-side if q provided
  const url = `${base}/profile/public`;
  const res = await fetch(url, { credentials: 'include', headers: { cookie } });
  const all = (await res.json().catch(() => [])) as any[];
  const data = q
    ? all.filter((p) => {
        const name = [p.firstName, p.lastName].filter(Boolean).join(' ').toLowerCase();
        const bio = (p.bio || '').toLowerCase();
        const email = (p.email || '').toLowerCase();
        return name.includes(q) || bio.includes(q) || email.includes(q);
      })
    : all;
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
