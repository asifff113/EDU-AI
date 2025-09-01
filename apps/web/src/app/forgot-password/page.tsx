'use client';
import { useState } from 'react';
import { getApiBaseUrl } from '@/lib/env';

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<'email' | 'code' | 'reset'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  async function handleSendCode(e: React.FormEvent) {
    e.preventDefault();
    setStatus('loading');
    setError(null);

    try {
      const res = await fetch(`${getApiBaseUrl()}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to send reset code');
      }

      setStatus('success');
      setStep('code');
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  }

  async function handleVerifyCode(e: React.FormEvent) {
    e.preventDefault();
    setStatus('loading');
    setError(null);

    try {
      const res = await fetch(`${getApiBaseUrl()}/auth/verify-reset-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Invalid code');
      }

      setStatus('success');
      setStep('reset');
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setStatus('loading');
    setError(null);

    try {
      const res = await fetch(`${getApiBaseUrl()}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to reset password');
      }

      setStatus('success');
      // Redirect to login after success
      window.location.href = '/login';
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  }

  if (step === 'email') {
    return (
      <div className="max-w-md mx-auto mt-16 w-full">
        <h1 className="text-5xl font-extrabold mb-8 bg-gradient-to-r from-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
          Forgot Password
        </h1>
        <form onSubmit={handleSendCode} className="space-y-4">
          <input
            className="w-full rounded-md bg-white/5 border border-white/10 px-3 py-2"
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button
            disabled={status === 'loading'}
            className="w-full rounded-md px-4 py-3 bg-gradient-to-r from-fuchsia-500 via-violet-400 to-cyan-400 text-white text-lg font-semibold disabled:opacity-50"
          >
            {status === 'loading' ? 'Sending...' : 'Send Reset Code'}
          </button>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <div className="text-center">
            <a href="/login" className="text-sm text-white/70 hover:text-white transition-colors">
              Back to Login
            </a>
          </div>
        </form>
      </div>
    );
  }

  if (step === 'code') {
    return (
      <div className="max-w-md mx-auto mt-16 w-full">
        <h1 className="text-5xl font-extrabold mb-8 bg-gradient-to-r from-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
          Enter Reset Code
        </h1>
        <p className="text-white/70 mb-4">We sent a reset code to {email}</p>
        <form onSubmit={handleVerifyCode} className="space-y-4">
          <input
            className="w-full rounded-md bg-white/5 border border-white/10 px-3 py-2"
            placeholder="6-digit code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            maxLength={6}
            required
          />
          <button
            disabled={status === 'loading'}
            className="w-full rounded-md px-4 py-3 bg-gradient-to-r from-fuchsia-500 via-violet-400 to-cyan-400 text-white text-lg font-semibold disabled:opacity-50"
          >
            {status === 'loading' ? 'Verifying...' : 'Verify Code'}
          </button>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <div className="text-center">
            <button
              type="button"
              onClick={() => setStep('email')}
              className="text-sm text-white/70 hover:text-white transition-colors"
            >
              Back to Email
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-16 w-full">
      <h1 className="text-5xl font-extrabold mb-8 bg-gradient-to-r from-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
        Reset Password
      </h1>
      <form onSubmit={handleResetPassword} className="space-y-4">
        <input
          className="w-full rounded-md bg-white/5 border border-white/10 px-3 py-2"
          placeholder="New password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <input
          className="w-full rounded-md bg-white/5 border border-white/10 px-3 py-2"
          placeholder="Confirm new password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        <button
          disabled={status === 'loading'}
          className="w-full rounded-md px-4 py-3 bg-gradient-to-r from-fuchsia-500 via-violet-400 to-cyan-400 text-white text-lg font-semibold disabled:opacity-50"
        >
          {status === 'loading' ? 'Resetting...' : 'Reset Password'}
        </button>
        {error && <p className="text-red-400 text-sm">{error}</p>}
      </form>
    </div>
  );
}
