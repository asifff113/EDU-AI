import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:4000';
    const response = await fetch(`${backendUrl}/ai/providers`);

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch providers' }, { status: response.status });
    }

    const providers = await response.json();
    return NextResponse.json(providers);
  } catch (error) {
    console.error('Error fetching AI providers:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
