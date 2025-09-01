import { NextRequest, NextResponse } from 'next/server';
import { getApiBaseUrl } from '@/lib/env';

const base = () => {
  const b = getApiBaseUrl();
  return b.startsWith('/') ? 'http://localhost:4000' : b;
};

export async function GET(req: NextRequest) {
  try {
    const cookie = req.headers.get('cookie') || '';
    const res = await fetch(`${base()}/skills/tree`, {
      credentials: 'include',
      headers: { cookie },
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) {
      return NextResponse.json({ error: 'Backend service unavailable' }, { status: res.status });
    }

    const contentType = res.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      return NextResponse.json({ error: 'Invalid response from backend' }, { status: 502 });
    }

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error('Skills API error:', error);
    return NextResponse.json(
      { error: 'Backend service unavailable', nodes: [], progress: [] },
      { status: 503 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const cookie = req.headers.get('cookie') || '';
    const body = await req.json().catch(() => ({}));

    const res = await fetch(`${base()}/skills/complete`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', cookie },
      body: JSON.stringify(body || {}),
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) {
      return NextResponse.json({ error: 'Backend service unavailable' }, { status: res.status });
    }

    const contentType = res.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      return NextResponse.json({ error: 'Invalid response from backend' }, { status: 502 });
    }

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error('Skills POST API error:', error);
    return NextResponse.json({ error: 'Backend service unavailable' }, { status: 503 });
  }
}
