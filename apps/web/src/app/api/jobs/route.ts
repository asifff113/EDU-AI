import { NextRequest } from 'next/server';
import { getApiBaseUrl } from '@/lib/env';

function base() {
  const b = getApiBaseUrl();
  return b.startsWith('/') ? 'http://localhost:4000' : b;
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const q = url.searchParams.get('q') || '';
  const type = url.searchParams.get('type') || '';
  const res = await fetch(
    `${base()}/jobs?q=${encodeURIComponent(q)}&type=${encodeURIComponent(type)}`,
    { credentials: 'include', headers: { cookie: req.headers.get('cookie') || '' } },
  );
  const data = await res.json().catch(() => []);
  return new Response(JSON.stringify(data), {
    status: res.status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function POST(req: NextRequest) {
  const url = new URL(req.url);
  const action = url.searchParams.get('action');
  const payload = await req.json();
  const cookie = req.headers.get('cookie') || '';
  let endpoint = '';
  if (action === 'apply') endpoint = '/jobs/apply';
  else if (action === 'resume') endpoint = '/jobs/resume';
  else if (action === 'applications') endpoint = '/jobs/applications';
  else if (action === 'post') endpoint = '/jobs/post';
  else if (action === 'applicants') endpoint = '/jobs/applicants';
  else if (action === 'set-status') endpoint = '/jobs/set-status';
  const res = await fetch(`${base()}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', cookie },
    credentials: 'include',
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  return new Response(JSON.stringify(data), {
    status: res.status,
    headers: { 'Content-Type': 'application/json' },
  });
}
