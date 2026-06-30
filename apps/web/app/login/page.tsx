'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { Button, Input } from '@/components/ui';
import { ApiError } from '@/lib/api';

export default function LoginPage() {
  const { status, login, signup } = useAuth();
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (status === 'authed') router.replace('/');
  }, [status, router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      if (mode === 'login') await login(email, password);
      else await signup(email, password, name || undefined);
      router.replace('/');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-cream px-4">
      <div className="w-full max-w-[440px]">
        <div className="mb-8 flex items-center justify-center gap-3">
          <div className="relative grid h-[48px] w-[48px] place-items-center rounded-[12px] bg-ink font-serif text-2xl font-bold text-white">
            N<span className="absolute right-[6px] top-[6px] h-2 w-2 rounded-full bg-rust" />
          </div>
          <b className="font-serif text-[30px] font-semibold">Neighbrd</b>
        </div>

        <div className="rounded-card border border-line/70 bg-white p-8 shadow-card">
          <h1 className="mb-1.5 font-serif text-[30px] font-semibold">
            {mode === 'login' ? 'Welcome back' : 'Create your account'}
          </h1>
          <p className="mb-7 text-[16px] text-muted">
            {mode === 'login' ? 'Stay close to the people who matter.' : 'Start nurturing your relationships.'}
          </p>

          <form onSubmit={onSubmit} className="space-y-5">
            {mode === 'signup' && (
              <Input label="Name" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
            )}
            <Input
              label="Email"
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              label="Password"
              type="password"
              required
              placeholder={mode === 'signup' ? 'At least 8 characters' : '••••••••'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {error && <div className="rounded-lg bg-[#fbe9e7] px-4 py-3 text-[15px] text-[#c2473f]">{error}</div>}
            <Button type="submit" className="w-full" disabled={busy}>
              {busy ? 'Please wait…' : mode === 'login' ? 'Log in' : 'Sign up'}
            </Button>
          </form>

          <div className="mt-6 text-center text-[15px] text-muted">
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={() => {
                setMode(mode === 'login' ? 'signup' : 'login');
                setError('');
              }}
              className="font-semibold text-rust hover:underline"
            >
              {mode === 'login' ? 'Sign up' : 'Log in'}
            </button>
          </div>
        </div>

        <p className="mt-6 text-center text-[14px] text-muted-2">
          Demo login — <span className="font-medium text-muted">demo@neighbrd.app</span> / <span className="font-medium text-muted">demodemo</span>
        </p>
      </div>
    </main>
  );
}
