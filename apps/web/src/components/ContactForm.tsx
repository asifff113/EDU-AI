'use client';
import { useState, useEffect } from 'react';
import { getApiBaseUrl } from '@/lib/env';

export function ContactForm() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  // Ensure component is mounted to prevent hydration mismatches
  useEffect(() => {
    setMounted(true);
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('sending');
    setError(null);
    const formData = new FormData(e.currentTarget);
    const payload = {
      name: String(formData.get('name') || ''),
      email: String(formData.get('email') || ''),
      message: String(formData.get('message') || ''),
    };
    try {
      const res = await fetch(`${getApiBaseUrl()}/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      setStatus('success');
      e.currentTarget.reset();
    } catch (err: unknown) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  }

  // Render nothing during SSR to prevent hydration mismatches from browser extensions
  if (!mounted) {
    return (
      <form className="w-full max-w-xl mx-auto grid gap-4">
        <input
          className="px-4 py-3 rounded-md bg-white/5 border border-white/10"
          placeholder="Your name"
          disabled
        />
        <input
          className="px-4 py-3 rounded-md bg-white/5 border border-white/10"
          placeholder="you@example.com"
          disabled
        />
        <textarea
          className="px-4 py-3 rounded-md bg-white/5 border border-white/10"
          placeholder="Message (optional)"
          rows={4}
          disabled
        />
        <button
          disabled
          className="px-6 py-3 rounded-md bg-gradient-to-r from-fuchsia-500 to-cyan-500 text-white font-semibold shadow-lg shadow-fuchsia-500/25 disabled:opacity-60"
        >
          Get in touch
        </button>
      </form>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="w-full max-w-xl mx-auto grid gap-4"
      suppressHydrationWarning
    >
      <input
        id="contact-name"
        name="name"
        placeholder="Your name"
        required
        className="px-4 py-3 rounded-md bg-white/5 border border-white/10"
        suppressHydrationWarning
      />
      <input
        id="contact-email"
        name="email"
        placeholder="you@example.com"
        type="email"
        required
        className="px-4 py-3 rounded-md bg-white/5 border border-white/10"
        suppressHydrationWarning
      />
      <textarea
        id="contact-message"
        name="message"
        placeholder="Message (optional)"
        rows={4}
        className="px-4 py-3 rounded-md bg-white/5 border border-white/10"
        suppressHydrationWarning
      />
      <button
        disabled={status === 'sending'}
        className="px-6 py-3 rounded-md bg-gradient-to-r from-fuchsia-500 to-cyan-500 text-white font-semibold shadow-lg shadow-fuchsia-500/25 disabled:opacity-60"
        suppressHydrationWarning
      >
        {status === 'sending' ? 'Sending...' : 'Get in touch'}
      </button>
      {status === 'success' && <p className="text-green-400">Thanks! We will reach out shortly.</p>}
      {status === 'error' && <p className="text-red-400">{error}</p>}
    </form>
  );
}
