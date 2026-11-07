'use client';

import { FormEvent, useEffect, useState } from 'react';
import { KeyRound, MonitorSmartphone, ShieldCheck } from 'lucide-react';

type Me = { role: string; user: { email: string; name: string; totpEnabled: boolean; lastLoginAt: string | null } | null; kind: string };
type SessionRow = { id: string; userAgent: string | null; ipAddress: string | null; createdAt: string; lastSeenAt: string; current: boolean };

const field = 'min-h-11 w-full border border-ops-border-strong bg-ops-bg px-3 text-ops-text outline-none focus:border-ops-accent';
const primary = 'inline-flex min-h-11 items-center justify-center gap-2 bg-ops-accent-strong px-4 text-sm font-semibold text-ops-on-accent hover:bg-ops-accent-strong/90 disabled:cursor-not-allowed disabled:opacity-50';
const secondary = 'inline-flex min-h-10 items-center justify-center gap-2 border border-ops-border-strong px-3 text-sm text-ops-text hover:bg-ops-accent/10 disabled:opacity-50';

async function post(path: string, body: unknown) {
  const response = await fetch(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const data = await response.json().catch(() => ({}));
  return { ok: response.ok, data };
}

export default function AccountWorkspace() {
  const [me, setMe] = useState<Me | null>(null);
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [setup, setSetup] = useState<{ secret: string; qr: string } | null>(null);
  const [code, setCode] = useState('');
  const [disablePassword, setDisablePassword] = useState('');
  const [disableCode, setDisableCode] = useState('');

  const [reloadKey, setReloadKey] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    Promise.all([fetch('/api/admin/auth/session', { cache: 'no-store', signal: controller.signal }), fetch('/api/admin/auth/sessions', { cache: 'no-store', signal: controller.signal })]).then(async ([profile, list]) => {
      if (profile.ok) setMe(await profile.json());
      if (list.ok) setSessions((await list.json()).sessions);
    }).catch(() => undefined);
    return () => controller.abort();
  }, [reloadKey]);

  async function run(action: () => Promise<{ ok: boolean; data: { error?: string } }>, success: string) {
    setBusy(true); setError(''); setNotice('');
    try {
      const result = await action();
      if (!result.ok) setError(result.data.error ?? 'That did not work.');
      else { setNotice(success); setReloadKey(value => value + 1); }
    } finally { setBusy(false); }
  }

  const changePassword = (event: FormEvent) => { event.preventDefault(); void run(() => post('/api/admin/auth/account', { action: 'change-password', currentPassword: current, newPassword: next }).then(result => { if (result.ok) { setCurrent(''); setNext(''); } return result; }), 'Password changed. Other devices were signed out.'); };
  const startSetup = () => void run(async () => { const result = await post('/api/admin/auth/account', { action: 'totp-setup' }); if (result.ok) setSetup(result.data); return result; }, 'Scan the QR code, then enter the 6-digit code to finish.');
  const enable = (event: FormEvent) => { event.preventDefault(); void run(() => post('/api/admin/auth/account', { action: 'totp-enable', code }).then(result => { if (result.ok) { setSetup(null); setCode(''); } return result; }), 'Two-factor authentication is on.'); };
  const disable = (event: FormEvent) => { event.preventDefault(); void run(() => post('/api/admin/auth/account', { action: 'totp-disable', password: disablePassword, code: disableCode }).then(result => { if (result.ok) { setDisablePassword(''); setDisableCode(''); } return result; }), 'Two-factor authentication is off.'); };

  if (me && me.kind === 'token') return <section className="space-y-3"><h1 className="text-3xl">Account &amp; security</h1><p className="text-ops-muted">You are using the automation API token. Sign in with your email and password to manage a personal account.</p></section>;

  return (
    <section className="space-y-8">
      <header>
        <p className="text-xs uppercase tracking-widest text-ops-subtle">Your account</p>
        <h1 className="text-3xl">Account &amp; security</h1>
        <p className="mt-2 text-sm text-ops-muted">{me?.user ? `${me.user.name} · ${me.user.email} · ${me.role.toLowerCase()}` : 'Loading…'}</p>
      </header>
      {error && <p role="alert" className="border border-ops-red/40 bg-ops-red/10 px-3 py-2 text-sm text-ops-red">{error}</p>}
      {notice && <p role="status" className="border border-ops-green/40 bg-ops-green/10 px-3 py-2 text-sm text-ops-green">{notice}</p>}

      <div className="grid gap-6 lg:grid-cols-2">
        <form onSubmit={changePassword} className="space-y-4 border border-ops-border bg-ops-surface p-5">
          <h2 className="flex items-center gap-2 text-lg"><KeyRound size={18} aria-hidden="true" /> Change password</h2>
          <label className="block space-y-2 text-sm"><span>Current password</span><input type="password" autoComplete="current-password" className={field} value={current} onChange={e => setCurrent(e.target.value)} required /></label>
          <label className="block space-y-2 text-sm"><span>New password</span><input type="password" autoComplete="new-password" className={field} value={next} onChange={e => setNext(e.target.value)} required /></label>
          <p className="text-xs text-ops-subtle">At least 10 characters with letters and a number. Changing it signs out your other devices.</p>
          <button className={primary} disabled={busy}>Save password</button>
        </form>

        <div className="space-y-4 border border-ops-border bg-ops-surface p-5">
          <h2 className="flex items-center gap-2 text-lg"><ShieldCheck size={18} aria-hidden="true" /> Two-factor authentication</h2>
          {me?.user?.totpEnabled ? (
            <form onSubmit={disable} className="space-y-3">
              <p className="text-sm text-ops-green">On. A code from your authenticator app is required at sign-in.</p>
              <label className="block space-y-2 text-sm"><span>Password</span><input type="password" className={field} value={disablePassword} onChange={e => setDisablePassword(e.target.value)} required /></label>
              <label className="block space-y-2 text-sm"><span>Current code</span><input inputMode="numeric" className={field} value={disableCode} onChange={e => setDisableCode(e.target.value)} required /></label>
              <button className={secondary} disabled={busy}>Turn off two-factor</button>
            </form>
          ) : setup ? (
            <form onSubmit={enable} className="space-y-3">
              {/* eslint-disable-next-line @next/next/no-img-element -- data URL generated on the server */}
              <img src={setup.qr} alt="Authenticator QR code" width={180} height={180} className="border border-ops-border p-2" />
              <p className="text-xs text-ops-muted">Cannot scan? Enter this key: <code className="break-all text-ops-text">{setup.secret}</code></p>
              <label className="block space-y-2 text-sm"><span>6-digit code</span><input inputMode="numeric" autoComplete="one-time-code" className={field} value={code} onChange={e => setCode(e.target.value)} required /></label>
              <button className={primary} disabled={busy}>Turn on two-factor</button>
            </form>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-ops-muted">Add a second step with an authenticator app such as Google Authenticator or 1Password.</p>
              <button type="button" className={primary} onClick={startSetup} disabled={busy}>Set up two-factor</button>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-3 border border-ops-border bg-ops-surface p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 text-lg"><MonitorSmartphone size={18} aria-hidden="true" /> Where you are signed in</h2>
          <button type="button" className={secondary} disabled={busy || sessions.length < 2} onClick={() => void run(() => post('/api/admin/auth/sessions', { action: 'revoke-others' }), 'Signed out of every other device.')}>Sign out everywhere else</button>
        </div>
        <ul className="divide-y divide-ops-border text-sm">
          {sessions.map(item => (
            <li key={item.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <div className="min-w-0">
                <p className="truncate">{(item.userAgent ?? 'Unknown device').slice(0, 90)}{item.current && <span className="ml-2 text-xs text-ops-green">This device</span>}</p>
                <p className="text-xs text-ops-subtle">{item.ipAddress ?? 'IP unknown'} · last active {new Date(item.lastSeenAt).toLocaleString()}</p>
              </div>
              {!item.current && <button type="button" className={secondary} disabled={busy} onClick={() => void run(() => post('/api/admin/auth/sessions', { action: 'revoke', id: item.id }), 'Session ended.')}>End session</button>}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
