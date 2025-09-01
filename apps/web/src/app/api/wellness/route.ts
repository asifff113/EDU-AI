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
  const action = searchParams.get('action') || 'mindfulness';
  const url =
    action === 'logs'
      ? `${base()}/wellness/logs`
      : action === 'slots'
        ? `${base()}/wellness/slots`
        : `${base()}/wellness/mindfulness`;
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
  const action = body?.action || 'study-log';
  const endpoint =
    action === 'book'
      ? `${base()}/wellness/slots/${encodeURIComponent(body.id)}/book`
      : `${base()}/wellness/study-log`;
  const res = await fetch(endpoint, {
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
