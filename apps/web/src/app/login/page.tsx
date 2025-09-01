'use client';

import { useState } from 'react';
import { getApiBaseUrl } from '@/lib/env';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Call backend login which will set an httpOnly cookie on success
      const base = getApiBaseUrl();
      const res = await fetch(`${base}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Invalid credentials');
      }

      // Redirect to dashboard or from query param
      const params = new URLSearchParams(window.location.search);
      const from = params.get('from') || '/dashboard';
      window.location.href = from;
    } catch (err: unknown) {
      let msg = 'Login failed';
      if (err && typeof err === 'object' && 'message' in err) {
        msg = (err as { message?: string }).message ?? msg;
      } else if (typeof err === 'string') {
        msg = err;
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto mt-16 w-full">
      <h1 className="text-5xl font-extrabold mb-8 bg-gradient-to-r from-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
        Login
      </h1>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <input
          className="w-full rounded-md bg-white/5 border border-white/10 px-3 py-2"
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className="w-full rounded-md bg-white/5 border border-white/10 px-3 py-2"
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md px-4 py-3 bg-gradient-to-r from-fuchsia-500 via-violet-400 to-cyan-400 text-white text-lg font-semibold"
        >
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
        {error && <div className="text-red-400 mt-2">{error}</div>}
        <div className="text-center mt-4">
          <a
            href="/forgot-password"
            className="text-sm text-white/70 hover:text-white transition-colors"
          >
            Forgot your password?
          </a>
        </div>
      </form>
    </div>
  );
}
