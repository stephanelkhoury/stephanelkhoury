'use client';

import Link from 'next/link';
import { FormEvent, Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AuthShell, { useAuthText } from '@/components/auth/AuthShell';

function SignInForm() {
  const { t } = useAuthText();
  const router = useRouter();
  const search = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [needsCode, setNeedsCode] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, ...(needsCode ? { code } : {}) }),
      });
      const data = await response.json();
      if (data.needsCode) { setNeedsCode(true); return; }
      if (!response.ok) { setError(data.error || 'Sign-in failed.'); return; }
      const next = search?.get('next') ?? null;
      router.push(next && next.startsWith('/admin') && !next.startsWith('//') ? next : '/admin/multigraphic-ai/overview');
      router.refresh();
    } catch {
      setError('Could not reach the server. Try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate>
      {error && <p role="alert" className="auth-error">{error}</p>}
      <label className="auth-field"><span>{t('email')}</span>
        <input type="email" name="email" autoComplete="username" value={email} onChange={e => setEmail(e.target.value)} required autoFocus disabled={needsCode} />
      </label>
      <label className="auth-field"><span>{t('password')}</span>
        <input type="password" name="password" autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} required disabled={needsCode} />
      </label>
      {needsCode && (
        <label className="auth-field"><span>{t('code')}</span>
          <input inputMode="numeric" autoComplete="one-time-code" maxLength={8} value={code} onChange={e => setCode(e.target.value)} required autoFocus />
        </label>
      )}
      {needsCode && <p className="auth-hint">{t('codeHelp')}</p>}
      <button type="submit" className="auth-button" disabled={loading}>{loading ? t('signingIn') : t('signIn')}</button>
      <p className="auth-links"><Link href="/admin/forgot-password">{t('forgot')}</Link></p>
    </form>
  );
}

export default function AdminSignInPage() {
  return (
    <AuthShell heading={t => t('title')}>
      <Suspense fallback={null}><SignInForm /></Suspense>
    </AuthShell>
  );
}
