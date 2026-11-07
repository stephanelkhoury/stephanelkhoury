'use client';

import { FormEvent, useEffect, useState } from 'react';
import { Copy, UserPlus } from 'lucide-react';

type Member = { id: string; email: string; name: string; role: 'OWNER' | 'ADMIN' | 'MEMBER' | 'CLIENT'; status: string; passwordSet: boolean; totpEnabled: boolean; lastLoginAt: string | null; disabled: boolean };

const field = 'min-h-11 w-full border border-ops-border-strong bg-ops-bg px-3 text-ops-text outline-none focus:border-ops-accent';
const primary = 'inline-flex min-h-11 items-center justify-center gap-2 bg-ops-accent-strong px-4 text-sm font-semibold text-ops-on-accent hover:bg-ops-accent-strong/90 disabled:cursor-not-allowed disabled:opacity-50';
const small = 'inline-flex min-h-9 items-center justify-center border border-ops-border-strong px-3 text-xs text-ops-text hover:bg-ops-accent/10 disabled:opacity-50';
const roleHelp: Record<Member['role'], string> = { OWNER: 'Full control', ADMIN: 'Manages the team and settings', MEMBER: 'Works in the workspace', CLIENT: 'Client access' };

export default function TeamWorkspace() {
  const [members, setMembers] = useState<Member[]>([]);
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [link, setLink] = useState('');
  const [busy, setBusy] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'ADMIN' | 'MEMBER' | 'CLIENT'>('MEMBER');

  const [reloadKey, setReloadKey] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/admin/team', { cache: 'no-store', signal: controller.signal }).then(async response => {
      const data = await response.json().catch(() => ({}));
      if (!response.ok) { setError(data.error ?? 'The team could not be loaded.'); return; }
      setMembers(data.members); setEmailEnabled(data.emailEnabled);
    }).catch(() => undefined);
    return () => controller.abort();
  }, [reloadKey]);

  async function send(path: string, body: unknown, success: string) {
    setBusy(true); setError(''); setNotice(''); setLink('');
    try {
      const response = await fetch(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) { setError(data.error ?? 'That did not work.'); return false; }
      setNotice(data.setupUrl && !data.emailSent ? `${success} Email is not set up yet, so copy the link below and send it yourself.` : success);
      if (data.setupUrl) setLink(data.setupUrl);
      setReloadKey(value => value + 1);
      return true;
    } finally { setBusy(false); }
  }

  async function invite(event: FormEvent) {
    event.preventDefault();
    if (await send('/api/admin/team', { name, email, role }, 'Invitation created.')) { setName(''); setEmail(''); }
  }

  return (
    <section className="space-y-8">
      <header>
        <p className="text-xs uppercase tracking-widest text-ops-subtle">People with access</p>
        <h1 className="text-3xl">Team</h1>
        <p className="mt-2 max-w-2xl text-sm text-ops-muted">Invite teammates and clients. Each person signs in with their own email and password. Invite links work once and expire after 72 hours.</p>
      </header>
      {error && <p role="alert" className="border border-ops-red/40 bg-ops-red/10 px-3 py-2 text-sm text-ops-red">{error}</p>}
      {notice && <p role="status" className="border border-ops-green/40 bg-ops-green/10 px-3 py-2 text-sm text-ops-green">{notice}</p>}
      {link && (
        <div className="flex flex-wrap items-center gap-3 border border-ops-border bg-ops-surface p-3 text-sm">
          <code className="min-w-0 flex-1 break-all text-ops-text">{link}</code>
          <button type="button" className={small} onClick={() => void navigator.clipboard.writeText(link)}><Copy size={13} aria-hidden="true" />&nbsp;Copy link</button>
        </div>
      )}
      {!emailEnabled && <p className="text-xs text-ops-amber">Email sending is not configured yet (SMTP_HOST, SMTP_USER, SMTP_PASS). Links are shown here to copy until it is.</p>}

      <form onSubmit={invite} className="grid gap-4 border border-ops-border bg-ops-surface p-5 md:grid-cols-[1fr_1fr_180px_auto] md:items-end">
        <label className="block space-y-2 text-sm"><span>Name</span><input className={field} value={name} onChange={e => setName(e.target.value)} required minLength={2} /></label>
        <label className="block space-y-2 text-sm"><span>Email</span><input type="email" className={field} value={email} onChange={e => setEmail(e.target.value)} required /></label>
        <label className="block space-y-2 text-sm"><span>Role</span>
          <select className={field} value={role} onChange={e => setRole(e.target.value as typeof role)}>
            <option value="MEMBER">Team member</option><option value="ADMIN">Admin</option><option value="CLIENT">Client</option>
          </select>
        </label>
        <button className={primary} disabled={busy}><UserPlus size={16} aria-hidden="true" /> Invite</button>
      </form>

      <div className="overflow-x-auto border border-ops-border bg-ops-surface">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-ops-border text-xs uppercase tracking-wider text-ops-subtle"><tr><th className="p-3">Person</th><th className="p-3">Role</th><th className="p-3">Status</th><th className="p-3">Security</th><th className="p-3">Last sign-in</th><th className="p-3"><span className="sr-only">Actions</span></th></tr></thead>
          <tbody className="divide-y divide-ops-border">
            {members.map(member => (
              <tr key={member.id}>
                <td className="p-3"><b className="block font-medium">{member.name}</b><span className="text-xs text-ops-muted">{member.email}</span></td>
                <td className="p-3">
                  {member.role === 'OWNER' ? <span title={roleHelp.OWNER}>Owner</span> : (
                    <select aria-label={`Role for ${member.name}`} className="min-h-9 border border-ops-border-strong bg-ops-bg px-2 text-ops-text" value={member.role} disabled={busy} onChange={e => void send(`/api/admin/team/${member.id}`, { action: 'set-role', role: e.target.value }, 'Role updated.')}>
                      <option value="MEMBER">Team member</option><option value="ADMIN">Admin</option><option value="CLIENT">Client</option>
                    </select>
                  )}
                </td>
                <td className="p-3">{member.disabled ? <span className="text-ops-red">Disabled</span> : member.passwordSet ? <span className="text-ops-green">Active</span> : <span className="text-ops-amber">Invited</span>}</td>
                <td className="p-3 text-xs text-ops-muted">{member.totpEnabled ? 'Two-factor on' : 'Password only'}</td>
                <td className="p-3 text-xs text-ops-muted">{member.lastLoginAt ? new Date(member.lastLoginAt).toLocaleString() : 'Never'}</td>
                <td className="p-3">
                  {member.role !== 'OWNER' && (
                    <div className="flex flex-wrap justify-end gap-2">
                      <button type="button" className={small} disabled={busy} onClick={() => void send(`/api/admin/team/${member.id}`, { action: 'reset-link' }, 'Reset link created.')}>Reset link</button>
                      <button type="button" className={small} disabled={busy} onClick={() => void send(`/api/admin/team/${member.id}`, { action: member.disabled ? 'enable' : 'disable' }, member.disabled ? 'Access restored.' : 'Access removed and sessions ended.')}>{member.disabled ? 'Enable' : 'Disable'}</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
