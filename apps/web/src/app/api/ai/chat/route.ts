import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, provider = 'ollama', model } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Messages are required' }, { status: 400 });
    }

    const backendUrl = process.env.BACKEND_URL || 'http://localhost:4000';
    const cookie = request.headers.get('cookie') || '';
    const response = await fetch(`${backendUrl}/ai/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Forward auth cookies if the backend expects them
        ...(cookie ? { cookie } : {}),
      },
      body: JSON.stringify({ messages, provider, model }),
    });

    if (!response.ok) {
      let errorText: string | undefined;
      try {
        errorText = await response.text();
      } catch {}
      const details = {
        message: errorText || 'Failed to process chat',
        status: response.status,
        provider,
        model,
      };
      return NextResponse.json({ error: details }, { status: response.status });
    }

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in AI chat:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
