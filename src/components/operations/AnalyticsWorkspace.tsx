'use client';

import { useEffect, useState } from 'react';
import { CircleAlert, RefreshCw } from 'lucide-react';

type Metrics = { runs: number; succeeded: number; failed: number; canceled: number; meetingTurns: number; inputTokens: number; outputTokens: number; costUsd: number; approved: number; changesRequested: number; rejected: number; pendingReview: number; successRate: number | null; approvalRate: number | null; averageDurationSeconds: number | null };
type Skill = { name: string; xp: number; level: number; levelName: string; nextLevelXp: number | null; successCount: number; approvedCount: number; revisionCount: number; lastPracticedAt: string | null };
type AgentRow = { id: string; key: string; name: string; displayName: string; enabled: boolean; department: string | null; metrics: Metrics; skills: Skill[]; averageSkillLevel: number | null };
type Analytics = { days: number; totals: Metrics & { workRecords: number; meetings: Record<string, number> }; departments: Array<{ department: string; metrics: Metrics }>; agents: AgentRow[]; daily: Array<{ date: string; succeeded: number; failed: number; tokens: number }> };

const pct = (value: number | null) => value === null ? '—' : `${value}%`;

function Stat({ label, value, detail }: { label: string; value: string; detail?: string }) {
  return <div className="border border-ops-border p-4"><p className="text-xs uppercase text-ops-subtle">{label}</p><p className="mt-2 text-2xl font-semibold">{value}</p>{detail && <p className="mt-1 text-xs text-ops-muted">{detail}</p>}</div>;
}

export default function AnalyticsWorkspace() {
  const [days, setDays] = useState(30);
  const [data, setData] = useState<Analytics | null>(null);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/admin/operations/analytics?days=${days}`, { cache: 'no-store', signal: controller.signal })
      .then(async response => { const body = await response.json(); if (!response.ok) throw new Error(body.error || 'Analytics could not be loaded.'); return body as Analytics; })
      .then(body => { setData(body); setError(''); })
      .catch(loadError => { if (!controller.signal.aborted) setError(loadError instanceof Error ? loadError.message : 'Analytics could not be loaded.'); });
    return () => controller.abort();
  }, [days, reloadKey]);

  const maxDaily = Math.max(1, ...(data?.daily.map(day => day.succeeded + day.failed) ?? [1]));

  return <div className="space-y-8">
    <header className="flex flex-wrap items-end justify-between gap-4 border-b border-ops-border pb-6">
      <div><p className="text-xs font-medium uppercase text-ops-violet">Performance</p><h1 className="mt-2 text-3xl font-semibold">Analytics</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-ops-muted">Measured from saved agent runs, usage records, owner reviews and skill progress. Nothing here is estimated or simulated beyond the recorded token cost basis.</p></div>
      <div className="flex items-center gap-2"><div role="group" aria-label="Time range" className="flex">{[7, 30, 90].map(value => <button key={value} type="button" onClick={() => setDays(value)} aria-pressed={days === value} className={`min-h-10 border border-ops-border px-3 text-xs ${days === value ? 'bg-ops-text/10 text-ops-text' : 'text-ops-muted'}`}>{value}d</button>)}</div><button type="button" onClick={() => setReloadKey(value => value + 1)} aria-label="Refresh analytics" className="inline-flex size-10 items-center justify-center border border-ops-border text-ops-muted hover:text-ops-text"><RefreshCw size={16} /></button></div>
    </header>
    {error && <p role="alert" className="flex items-center gap-2 border border-ops-red/30 px-4 py-3 text-sm text-ops-red"><CircleAlert size={15} />{error}</p>}
    {!data ? <div role="status" aria-label="Loading analytics" className="h-48 animate-pulse bg-ops-text/[0.05]" /> : <>
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4" aria-label="Totals">
        <Stat label="Agent runs" value={String(data.totals.runs)} detail={`${data.totals.succeeded} succeeded · ${data.totals.failed} failed · ${data.totals.meetingTurns} meeting turns`} />
        <Stat label="Success rate" value={pct(data.totals.successRate)} detail={data.totals.averageDurationSeconds !== null ? `Avg ${data.totals.averageDurationSeconds}s per run` : 'No timed runs'} />
        <Stat label="Owner approval rate" value={pct(data.totals.approvalRate)} detail={`${data.totals.approved} approved · ${data.totals.changesRequested + data.totals.rejected} sent back · ${data.totals.pendingReview} pending`} />
        <Stat label="Tokens · cost" value={(data.totals.inputTokens + data.totals.outputTokens).toLocaleString()} detail={`USD ${data.totals.costUsd.toFixed(4)} · ${data.totals.workRecords} work records · ${data.totals.meetings.CONCLUDED ?? 0} meetings concluded`} />
      </section>

      <section aria-labelledby="daily" className="space-y-3">
        <h2 id="daily" className="text-base font-semibold">Daily throughput</h2>
        <div className="flex h-32 items-end gap-1 border-b border-ops-border" role="img" aria-label="Runs per day">{data.daily.map(day => <div key={day.date} className="flex flex-1 flex-col justify-end" title={`${day.date}: ${day.succeeded} succeeded, ${day.failed} failed, ${day.tokens} tokens`}><div style={{ height: `${day.failed / maxDaily * 100}%` }} className="bg-ops-red/70" /><div style={{ height: `${day.succeeded / maxDaily * 100}%` }} className="bg-ops-accent-strong/80" /></div>)}</div>
        <p className="text-xs text-ops-muted">Last {data.daily.length} days · green succeeded · red failed</p>
      </section>

      <section aria-labelledby="departments" className="space-y-3">
        <h2 id="departments" className="text-base font-semibold">Departments</h2>
        <div className="overflow-x-auto"><table className="w-full min-w-[640px] text-left text-sm"><thead className="text-xs uppercase text-ops-subtle"><tr><th className="py-2">Department</th><th>Runs</th><th>Success</th><th>Approval</th><th>Avg time</th><th>Tokens</th></tr></thead><tbody className="divide-y divide-ops-border">{data.departments.map(row => <tr key={row.department}><td className="py-2">{row.department.replaceAll('_', ' ').toLowerCase()}</td><td>{row.metrics.runs}</td><td>{pct(row.metrics.successRate)}</td><td>{pct(row.metrics.approvalRate)}</td><td>{row.metrics.averageDurationSeconds ?? '—'}{row.metrics.averageDurationSeconds !== null && 's'}</td><td>{(row.metrics.inputTokens + row.metrics.outputTokens).toLocaleString()}</td></tr>)}</tbody></table></div>
      </section>

      <section aria-labelledby="agents" className="space-y-3">
        <h2 id="agents" className="text-base font-semibold">Agents and skills</h2>
        <div className="divide-y divide-ops-border border-y border-ops-border">{data.agents.map(agent => <article key={agent.id} className="py-4">
          <button type="button" onClick={() => setExpanded(current => current === agent.id ? null : agent.id)} aria-expanded={expanded === agent.id} className="grid w-full grid-cols-2 gap-3 text-left text-sm sm:grid-cols-[minmax(0,2fr)_repeat(5,minmax(0,1fr))]">
            <span><b>{agent.displayName}</b><span className="block text-xs text-ops-muted">{agent.name}{agent.enabled ? '' : ' · not activated'}</span></span>
            <span><span className="block text-xs text-ops-subtle">Runs</span>{agent.metrics.runs}</span>
            <span><span className="block text-xs text-ops-subtle">Success</span>{pct(agent.metrics.successRate)}</span>
            <span><span className="block text-xs text-ops-subtle">Approval</span>{pct(agent.metrics.approvalRate)}</span>
            <span><span className="block text-xs text-ops-subtle">Avg time</span>{agent.metrics.averageDurationSeconds ?? '—'}{agent.metrics.averageDurationSeconds !== null && 's'}</span>
            <span><span className="block text-xs text-ops-subtle">Skill level</span>{agent.averageSkillLevel ?? '—'}</span>
          </button>
          {expanded === agent.id && <div className="mt-4 space-y-3">{agent.skills.length ? <ul className="grid gap-3 sm:grid-cols-2">{agent.skills.map(skill => <li key={skill.name} className="border border-ops-border p-3"><p className="text-sm">{skill.name}</p><p className="mt-1 text-xs text-ops-muted">Level {skill.level} · {skill.levelName} · {skill.xp} XP{skill.nextLevelXp ? ` / ${skill.nextLevelXp}` : ' (max)'}</p><div className="mt-2 h-1 bg-ops-text/10"><div className="h-full bg-ops-accent-strong" style={{ width: `${skill.nextLevelXp ? Math.min(100, Math.round(skill.xp / skill.nextLevelXp * 100)) : 100}%` }} /></div><p className="mt-2 text-xs text-ops-subtle">{skill.successCount} completed · {skill.approvedCount} approved · {skill.revisionCount} revisions{skill.lastPracticedAt ? ` · last used ${new Date(skill.lastPracticedAt).toLocaleDateString()}` : ''}</p></li>)}</ul> : <p className="text-sm text-ops-muted">No skills yet. Skills are created from the approved contract after the first completed task or meeting.</p>}<p className="text-xs text-ops-subtle">XP: +5 completed task · +3 meeting contribution · +15 owner approval. Change requests with a comment become lessons this agent reads on future tasks.</p></div>}
        </article>)}</div>
      </section>
    </>}
  </div>;
}
