import { NextRequest } from 'next/server';
import { getApiBaseUrl } from '@/lib/env';

function resolveBase() {
  const b = getApiBaseUrl();
  if (b.startsWith('/')) return 'http://localhost:4000';
  return b;
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  // Expect { certificateId } or { templateId, title }
  const base = resolveBase();
  const cookie = req.headers.get('cookie') || '';
  const res = await fetch(`${base}/certificates/pdf`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', cookie },
    body: JSON.stringify(body),
  });
  const blob = await res.arrayBuffer().catch(() => null);
  if (!blob) return new Response('Failed', { status: 500 });
  return new Response(Buffer.from(blob), {
    status: res.status,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline; filename="certificate.pdf"',
    },
  });
}
