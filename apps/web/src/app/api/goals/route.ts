import { NextRequest, NextResponse } from 'next/server';
import { getApiBaseUrl } from '@/lib/env';

const base = () => {
  const b = getApiBaseUrl();
  return b.startsWith('/') ? 'http://localhost:4000' : b;
};

export async function GET(req: NextRequest) {
  try {
    const cookie = req.headers.get('cookie') || '';
    const res = await fetch(`${base()}/goals`, {
      credentials: 'include',
      headers: { cookie },
      signal: AbortSignal.timeout(5000), // 5 second timeout
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
    console.error('Goals API error:', error);
    return NextResponse.json({ error: 'Backend service unavailable', goals: [] }, { status: 503 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const cookie = req.headers.get('cookie') || '';
    const body = await req.json().catch(() => ({}));
    const path = body?.path || 'upsert';
    const payload = body?.payload ?? body;

    const res = await fetch(`${base()}/goals/${path}`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', cookie },
      body: JSON.stringify(payload || {}),
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
    console.error('Goals POST API error:', error);
    return NextResponse.json({ error: 'Backend service unavailable' }, { status: 503 });
  }
}
