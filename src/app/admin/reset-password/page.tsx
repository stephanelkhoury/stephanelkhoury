'use client';

import Link from 'next/link';
import { FormEvent, Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import AuthShell, { useAuthText } from '@/components/auth/AuthShell';

function ResetForm() {
  const { t } = useAuthText();
  const token = useSearchParams()?.get('token') ?? '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError('');
    if (password !== confirm) { setError(t('mismatch')); return; }
    setLoading(true);
    try {
      const response = await fetch('/api/admin/auth/reset', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, password }) });
      const data = await response.json();
      if (!response.ok) setError(data.error || 'The password could not be saved.');
      else setDone(true);
    } catch {
      setError('Could not reach the server. Try again.');
    } finally {
      setLoading(false);
    }
  }

  if (!token) return <p role="alert" className="auth-error">{t('noToken')}</p>;
  if (done) return <><p role="status" className="auth-ok">{t('saved')}</p><Link href="/admin/sign-in" className="auth-button" style={{ display: 'grid', placeItems: 'center', textDecoration: 'none' }}>{t('signIn')}</Link></>;

  return (
    <form onSubmit={onSubmit} noValidate>
      {error && <p role="alert" className="auth-error">{error}</p>}
      <label className="auth-field"><span>{t('newPassword')}</span>
        <input type="password" autoComplete="new-password" value={password} onChange={e => setPassword(e.target.value)} required autoFocus />
      </label>
      <label className="auth-field"><span>{t('confirm')}</span>
        <input type="password" autoComplete="new-password" value={confirm} onChange={e => setConfirm(e.target.value)} required />
      </label>
      <p className="auth-hint">{t('hint')}</p>
      <button type="submit" className="auth-button" disabled={loading}>{t('save')}</button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return <AuthShell heading={t => t('resetTitle')}><Suspense fallback={null}><ResetForm /></Suspense></AuthShell>;
}
