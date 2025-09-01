import { NextRequest } from 'next/server';
import { getApiBaseUrl } from '@/lib/env';

function base() {
  const b = getApiBaseUrl();
  return b.startsWith('/') ? 'http://localhost:4000' : b;
}

export async function GET(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
  const res = await fetch(`${base()}/companies/${params.id}`, { credentials: 'include' });
  const data = await res.json().catch(() => ({}));
  return new Response(JSON.stringify(data), {
    status: res.status,
    headers: { 'Content-Type': 'application/json' },
  });
}
