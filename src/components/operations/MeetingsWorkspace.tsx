'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { CircleAlert, LoaderCircle, RefreshCw, UsersRound, XCircle } from 'lucide-react';

type Project = { id: string; name: string };
type Agent = { id: string; key: string; name: string; enabled: boolean; available: boolean; latestVersion: { status: string; department: string } | null };
type Contribution = { agentKey: string; agentName: string; perspective: string; proposals: string[]; risks: string[]; questions: string[]; informationNeeded: string[] };
type Outcome = { summary: string; decisions: string[]; openQuestions: string[]; actionItems: Array<{ agentKey: string; title: string; description: string }>; drafts: Array<{ agentKey: string; title: string; runId?: string; error?: string }> };
type Meeting = { id: string; topic: string; roomKey: string; facilitatorKey: string; participantKeys: string[]; status: string; contributions: Contribution[]; outcome: Outcome | null; error: string | null; createdAt: string; startedAt: string | null; finishedAt: string | null; project: Project };

const ACTIVE = ['GATHERING', 'IN_SESSION'];
const statusTone: Record<string, string> = { GATHERING: 'text-ops-amber', IN_SESSION: 'text-ops-accent', CONCLUDED: 'text-ops-green', FAILED: 'text-ops-red', CANCELED: 'text-ops-muted' };

function List({ items }: { items: string[] }) {
  return items.length ? <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-ops-muted">{items.map((item, index) => <li key={index}>{item}</li>)}</ul> : <p className="text-sm text-ops-subtle">None</p>;
}

export default function MeetingsWorkspace() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [reloadKey, setReloadKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [projectId, setProjectId] = useState('');
  const [topic, setTopic] = useState('');
  const [participants, setParticipants] = useState<string[]>([]);
  const [facilitator, setFacilitator] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    const get = (url: string) => fetch(url, { cache: 'no-store', signal: controller.signal }).then(async response => { const body = await response.json(); if (!response.ok) throw new Error(body.error || 'Request failed.'); return body; });
    Promise.all([get('/api/admin/operations/projects'), get('/api/admin/operations/agents'), get('/api/admin/operations/meetings')])
      .then(([projectData, agentData, meetingData]) => { setProjects(projectData.projects); setAgents(agentData.agents); setMeetings(meetingData.meetings); setError(''); })
      .catch(loadError => { if (!controller.signal.aborted) setError(loadError instanceof Error ? loadError.message : 'Meetings could not be loaded.'); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [reloadKey]);

  const anyActive = meetings.some(meeting => ACTIVE.includes(meeting.status));
  useEffect(() => {
    if (!anyActive) return;
    const timer = window.setInterval(() => { if (document.visibilityState === 'visible') setReloadKey(value => value + 1); }, 4000);
    return () => window.clearInterval(timer);
  }, [anyActive]);

  const eligible = useMemo(() => agents.filter(agent => agent.enabled && agent.latestVersion?.status === 'APPROVED'), [agents]);
  const names = useMemo(() => new Map(agents.map(agent => [agent.key, agent.name])), [agents]);
  const effectiveFacilitator = participants.includes(facilitator) ? facilitator : participants[0] ?? '';

  function toggle(key: string) {
    setParticipants(current => current.includes(key) ? current.filter(item => item !== key) : current.length >= 6 ? current : [...current, key]);
  }

  async function start() {
    setSubmitting(true);
    setMessage('');
    try {
      const response = await fetch('/api/admin/operations/meetings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ projectId, topic, participantKeys: participants, facilitatorKey: effectiveFacilitator }) });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || body.meeting?.error || 'The meeting could not be started.');
      setMessage('Meeting called. Attendees are walking to the meeting room.');
      setTopic('');
      setReloadKey(value => value + 1);
    } catch (startError) {
      setMessage(startError instanceof Error ? startError.message : 'The meeting could not be started.');
    } finally {
      setSubmitting(false);
    }
  }

  async function cancel(id: string) {
    await fetch(`/api/admin/operations/meetings/${id}/cancel`, { method: 'POST' });
    setReloadKey(value => value + 1);
  }

  const canStart = Boolean(projectId) && topic.trim().length >= 10 && participants.length >= 2 && !submitting;

  return <div className="space-y-8">
    <header className="flex flex-wrap items-end justify-between gap-4 border-b border-ops-border pb-6">
      <div><p className="text-xs font-medium uppercase text-ops-violet">Collaboration</p><h1 className="mt-2 text-3xl font-semibold">Meetings</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-ops-muted">Call several agents into a meeting room. Each attendee contributes from their role, the facilitator closes with decisions and action items, and each action item becomes a draft task back at that agent&apos;s desk for your acceptance.</p></div>
      <button type="button" onClick={() => setReloadKey(value => value + 1)} aria-label="Refresh meetings" title="Refresh" className="inline-flex size-10 items-center justify-center border border-ops-border text-ops-muted hover:text-ops-text"><RefreshCw size={16} /></button>
    </header>

    {error && <p role="alert" className="flex items-center gap-2 border border-ops-red/30 px-4 py-3 text-sm text-ops-red"><CircleAlert size={15} />{error}</p>}

    <section aria-labelledby="call-meeting" className="space-y-4 border border-ops-border p-5">
      <h2 id="call-meeting" className="flex items-center gap-2 text-base font-semibold"><UsersRound size={17} /> Call a meeting</h2>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2 text-sm"><span>Project</span><select value={projectId} onChange={event => setProjectId(event.target.value)} className="min-h-11 w-full border border-ops-border bg-transparent px-3"><option value="">Choose a project with a saved brief</option>{projects.map(project => <option key={project.id} value={project.id}>{project.name}</option>)}</select></label>
        <label className="space-y-2 text-sm"><span>Facilitator</span><select value={effectiveFacilitator} onChange={event => setFacilitator(event.target.value)} disabled={!participants.length} className="min-h-11 w-full border border-ops-border bg-transparent px-3 disabled:opacity-50">{participants.map(key => <option key={key} value={key}>{names.get(key) ?? key}</option>)}</select></label>
      </div>
      <label className="block space-y-2 text-sm"><span>Topic and agenda</span><textarea value={topic} onChange={event => setTopic(event.target.value)} rows={3} dir="auto" maxLength={2000} placeholder="What should the team decide or plan together?" className="w-full border border-ops-border bg-transparent px-3 py-2" /></label>
      <fieldset className="space-y-2"><legend className="text-sm">Attendees ({participants.length}/6)</legend>
        <div className="flex flex-wrap gap-2">{eligible.map(agent => <button key={agent.key} type="button" onClick={() => toggle(agent.key)} aria-pressed={participants.includes(agent.key)} className={`min-h-9 border px-3 text-xs ${participants.includes(agent.key) ? 'border-ops-accent text-ops-text' : 'border-ops-border text-ops-muted'}`}>{agent.name}{!agent.available && ' · not available'}</button>)}</div>
        {!loading && !eligible.length && <p className="text-sm text-ops-subtle">No agents are activated with an approved version yet.</p>}
      </fieldset>
      <div className="flex flex-wrap items-center gap-3"><button type="button" onClick={() => void start()} disabled={!canStart} className="inline-flex min-h-11 items-center gap-2 bg-ops-accent-strong px-4 text-sm font-semibold text-ops-on-accent disabled:cursor-not-allowed disabled:opacity-50">{submitting && <LoaderCircle size={15} className="animate-spin" />}Start meeting</button>{message && <p role="status" className="text-sm text-ops-muted">{message}</p>}</div>
    </section>

    <section aria-labelledby="meeting-history" className="space-y-4">
      <h2 id="meeting-history" className="text-base font-semibold">Meeting history</h2>
      {loading && !meetings.length ? <div role="status" className="h-32 animate-pulse bg-ops-text/[0.05]" /> : !meetings.length ? <p className="text-sm text-ops-muted">No meetings have been held.</p> : meetings.map(meeting => <article key={meeting.id} className="space-y-4 border border-ops-border p-5">
        <header className="flex flex-wrap items-start justify-between gap-3">
          <div><p className={`text-xs font-medium uppercase ${statusTone[meeting.status] ?? ''}`}>{meeting.status.replace('_', ' ')}{ACTIVE.includes(meeting.status) && <LoaderCircle size={12} className="ml-2 inline animate-spin" />}</p><h3 className="mt-1 text-sm font-semibold">{meeting.topic}</h3><p className="mt-1 text-xs text-ops-muted">{meeting.project.name} · {meeting.roomKey} · facilitator {names.get(meeting.facilitatorKey) ?? meeting.facilitatorKey} · {new Date(meeting.createdAt).toLocaleString()}</p></div>
          {ACTIVE.includes(meeting.status) && <button type="button" onClick={() => void cancel(meeting.id)} className="inline-flex min-h-9 items-center gap-1.5 border border-ops-border px-3 text-xs text-ops-muted hover:text-ops-text"><XCircle size={14} /> Cancel</button>}
        </header>
        <p className="text-xs text-ops-muted">Attendees: {meeting.participantKeys.map(key => names.get(key) ?? key).join(', ')} · {meeting.contributions.length}/{meeting.participantKeys.length} contributed</p>
        {meeting.error && <p className="text-sm text-ops-red">{meeting.error}</p>}
        {meeting.contributions.length > 0 && <details className="space-y-3"><summary className="cursor-pointer text-sm">Contributions</summary>{meeting.contributions.map(item => <div key={item.agentKey} className="mt-3 border-l-2 border-ops-border pl-4"><p className="text-sm font-semibold">{item.agentName}</p><p className="mt-1 text-sm text-ops-muted">{item.perspective}</p><p className="mt-2 text-xs uppercase text-ops-subtle">Proposals</p><List items={item.proposals} /><p className="mt-2 text-xs uppercase text-ops-subtle">Risks</p><List items={item.risks} /><p className="mt-2 text-xs uppercase text-ops-subtle">Needs</p><List items={item.informationNeeded} /></div>)}</details>}
        {meeting.outcome && <div className="space-y-3 border-t border-ops-border pt-4">
          <p className="text-sm">{meeting.outcome.summary}</p>
          <div><p className="text-xs uppercase text-ops-subtle">Decisions</p><List items={meeting.outcome.decisions} /></div>
          <div><p className="text-xs uppercase text-ops-subtle">Back to desks · action items</p><ul className="mt-1 space-y-1 text-sm">{meeting.outcome.drafts.map((draft, index) => <li key={index}><b>{names.get(draft.agentKey) ?? draft.agentKey}</b>: {draft.title} {draft.runId ? <Link className="text-ops-accent underline" href={`/admin/multigraphic-ai/projects/${meeting.project.id}`}>draft task awaiting acceptance</Link> : <span className="text-ops-amber">({draft.error})</span>}</li>)}</ul></div>
          <div><p className="text-xs uppercase text-ops-subtle">Open questions</p><List items={meeting.outcome.openQuestions} /></div>
          <Link href="/admin/multigraphic-ai/documentation?kind=MEETING" className="inline-block text-xs text-ops-accent underline">Meeting minutes in Documentation</Link>
        </div>}
      </article>)}
    </section>
  </div>;
}
