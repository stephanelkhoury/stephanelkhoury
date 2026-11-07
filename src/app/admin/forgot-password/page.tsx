'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import AuthShell, { useAuthText } from '@/components/auth/AuthShell';

function ForgotForm() {
  const { t } = useAuthText();
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await fetch('/api/admin/auth/forgot', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) });
      const data = await response.json();
      if (!response.ok) setError(data.error || 'Could not send the link.');
      else setDone(true);
    } catch {
      setError('Could not reach the server. Try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate>
      <p className="auth-sub" style={{ marginTop: -10 }}>{t('forgotText')}</p>
      {error && <p role="alert" className="auth-error">{error}</p>}
      {done && <p role="status" className="auth-ok">{t('sent')}</p>}
      <label className="auth-field"><span>{t('email')}</span>
        <input type="email" autoComplete="username" value={email} onChange={e => setEmail(e.target.value)} required autoFocus />
      </label>
      <button type="submit" className="auth-button" disabled={loading}>{t('send')}</button>
      <p className="auth-links"><Link href="/admin/sign-in">{t('back')}</Link></p>
    </form>
  );
}

export default function ForgotPasswordPage() {
  return <AuthShell heading={t => t('forgotTitle')}><ForgotForm /></AuthShell>;
}
