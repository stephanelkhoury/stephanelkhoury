'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { Download, FileText, RefreshCw, RotateCcw } from 'lucide-react';

type DeliverableVersion = {
  id: string;
  version: number;
  storageKey: string | null;
  contentType: string | null;
  textContent: string | null;
  metadata: unknown;
  createdAt: string;
  workflowRunId: string | null;
  projectId: string;
  taskId: string | null;
  agentDefinitionId: string | null;
  agentVersionId: string | null;
  inputReferences: unknown;
  task: { title: string; planKey: string | null } | null;
  workflowRun: { status: string; acceptedPlanHash: string | null } | null;
  agentVersion: { version: number; name: string; agent: { key: string } } | null;
  approvals: Array<{ id: string; status: string; comment: string | null; createdAt: string; reviewer: { user: { name: string } } }>;
};

type Artifact = {
  id: string;
  title: string;
  kind: string;
  status: string;
  updatedAt: string;
  project: { id: string; name: string };
  versions: DeliverableVersion[];
};

function date(value: string) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}

function stateColor(value: string) {
  if (value === 'APPROVED') return 'text-ops-green';
  if (value === 'IN_REVIEW' || value === 'CHANGES_REQUESTED') return 'text-ops-amber';
  if (value === 'SUPERSEDED' || value === 'REJECTED') return 'text-ops-subtle';
  return 'text-ops-muted';
}

export default function DeliverablesWorkspace() {
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [comments, setComments] = useState<Record<string, string>>({});
  const [savingId, setSavingId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const projectId = new URLSearchParams(window.location.search).get('projectId');
      const query = projectId ? `?projectId=${encodeURIComponent(projectId)}` : '';
      const response = await fetch(`/api/admin/operations/deliverables${query}`, { cache: 'no-store' });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Deliverables could not be loaded.');
      setArtifacts(result.artifacts as Artifact[]);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Deliverables could not be loaded.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    const projectId = new URLSearchParams(window.location.search).get('projectId');
    const query = projectId ? `?projectId=${encodeURIComponent(projectId)}` : '';
    fetch('/api/admin/operations/deliverables' + query, { cache: 'no-store', signal: controller.signal }).then(async response => {
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Workspace data could not be loaded.');
      setArtifacts(result.artifacts as Artifact[]);
    }).catch(error => { if (!controller.signal.aborted) setError(error instanceof Error ? error.message : 'Workspace data could not be loaded.'); }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, []);

  const visible = useMemo(() => artifacts.filter((artifact) => {
    const textMatch = `${artifact.title} ${artifact.kind} ${artifact.project.name}`.toLowerCase().includes(query.trim().toLowerCase());
    return textMatch && (statusFilter === 'ALL' || artifact.status === statusFilter);
  }), [artifacts, query, statusFilter]);

  const requestRevision = async (artifact: Artifact, version: DeliverableVersion) => {
    const comment = comments[version.id]?.trim() ?? '';
    if (comment.length < 3) {
      setError('Add a revision note with at least three characters.');
      return;
    }
    setSavingId(version.id);
    setError('');
    setNotice('');
    try {
      const response = await fetch(`/api/admin/operations/deliverables/${encodeURIComponent(artifact.id)}/revisions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ artifactVersionId: version.id, comment }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Revision request could not be saved.');
      setNotice(result.runStatus === 'BLOCKED'
        ? `Revision ${result.revisionCount ?? ''} was recorded, but execution is blocked: ${result.error || 'Trigger.dev is unavailable.'}`
        : result.revisionCount
          ? `Revision ${result.revisionCount} of 2 was recorded for ${artifact.title} v${version.version} and queued for execution.`
          : `Revision request saved for ${artifact.title} v${version.version}.`);
      setComments((current) => ({ ...current, [version.id]: '' }));
      await load();
    } catch (revisionError) {
      setError(revisionError instanceof Error ? revisionError.message : 'Revision request could not be saved.');
    } finally {
      setSavingId('');
    }
  };

  return <div className="space-y-7">
    <header className="flex flex-wrap items-end justify-between gap-4 border-b border-ops-border pb-6">
      <div><p className="text-xs font-medium uppercase text-ops-violet">Project outputs</p><h1 className="mt-2 text-3xl font-semibold">Deliverables</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-ops-muted">Review persisted artifact versions, inspect available evidence, download private files, or request a revision.</p></div>
      <button type="button" onClick={() => void load()} disabled={loading} title="Refresh deliverables" aria-label="Refresh deliverables" className="inline-flex size-10 items-center justify-center border border-ops-border text-ops-muted hover:text-ops-text disabled:opacity-50"><RefreshCw size={16} /></button>
    </header>

    {error && <div role="alert" className="flex flex-wrap items-center justify-between gap-3 border border-ops-red/30 bg-ops-red/[0.06] px-4 py-3 text-sm text-ops-red"><p>{error}</p><button type="button" onClick={() => void load()} className="min-h-9 underline underline-offset-4">Try again</button></div>}
    {notice && <p role="status" className="border border-ops-green/30 bg-ops-green/[0.06] px-4 py-3 text-sm text-ops-green">{notice}</p>}

    <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_190px]">
      <label className="sr-only" htmlFor="deliverable-search">Search deliverables</label>
      <input id="deliverable-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search deliverables or projects" className="min-h-11 border border-ops-border bg-ops-surface px-3 text-sm outline-none placeholder:text-ops-subtle focus:border-ops-accent" />
      <label className="sr-only" htmlFor="deliverable-status">Filter by review state</label>
      <select id="deliverable-status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="min-h-11 border border-ops-border bg-ops-surface px-3 text-sm outline-none focus:border-ops-accent"><option value="ALL">All review states</option>{['DRAFT', 'IN_REVIEW', 'APPROVED', 'SUPERSEDED'].map((status) => <option value={status} key={status}>{status.replaceAll('_', ' ')}</option>)}</select>
    </div>

    {loading && artifacts.length === 0 ? <div role="status" aria-label="Loading deliverables" className="h-48 animate-pulse border-y border-ops-border bg-ops-text/[0.05]" /> : visible.length === 0 ? <div className="border-y border-ops-border py-10"><FileText size={22} className="text-ops-accent" /><h2 className="mt-3 text-base font-semibold">{artifacts.length ? 'No matching deliverables' : 'No deliverables yet'}</h2><p className="mt-1 max-w-xl text-sm leading-6 text-ops-muted">{artifacts.length ? 'Try another search or review state.' : 'No artifact versions are persisted yet. Task outputs are not automatically treated as approved deliverables.'}</p>{!artifacts.length && <Link href="/admin/multigraphic-ai/projects" className="mt-4 inline-flex min-h-9 items-center gap-2 text-sm text-ops-accent hover:text-ops-text">Open projects <span aria-hidden="true">→</span></Link>}</div> : <div className="divide-y divide-ops-border border-y border-ops-border">
      {visible.map((artifact) => <details key={artifact.id} className="group py-4">
        <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-3">
          <span className="min-w-0 flex-1"><span className="block truncate text-base font-semibold">{artifact.title}</span><span className="mt-1 block text-xs text-ops-muted">{artifact.project.name} · {artifact.kind} · {artifact.versions.length} version{artifact.versions.length === 1 ? '' : 's'} · Updated {date(artifact.updatedAt)}</span></span>
          <span className={`text-xs font-medium ${stateColor(artifact.status)}`}>{artifact.status.replaceAll('_', ' ')}</span>
        </summary>
        <div className="mt-4 border-l border-ops-border pl-4">
          {artifact.versions.length === 0 ? <p className="py-3 text-sm text-ops-muted">No versions have been saved.</p> : <ol className="space-y-5">
            {artifact.versions.map((version) => <li key={version.id} className="min-w-0">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div><h3 className="text-sm font-semibold">Version {version.version}</h3><p className="mt-1 text-xs text-ops-muted">{version.contentType ?? 'Content type not recorded'} · Saved {date(version.createdAt)}</p></div>
                {(version.storageKey || version.textContent !== null) && <a href={`/api/admin/operations/deliverables/${encodeURIComponent(artifact.id)}/versions/${encodeURIComponent(version.id)}/download`} className="inline-flex min-h-9 items-center gap-2 border border-ops-border px-3 text-xs hover:border-ops-accent hover:text-ops-accent"><Download size={14} /> Private download</a>}
              </div>
              <details className="mt-3 border border-ops-border"><summary className="cursor-pointer px-3 py-2 text-xs text-ops-muted">Provenance and input references</summary><dl className="grid gap-x-4 gap-y-2 border-t border-ops-border bg-ops-surface-raised p-3 text-xs sm:grid-cols-2"><dt className="text-ops-muted">Project</dt><dd className="break-all text-ops-text">{artifact.project.name} · {version.projectId}</dd><dt className="text-ops-muted">Workflow run</dt><dd className="break-all text-ops-text">{version.workflowRunId ?? 'Not linked'}{version.workflowRun && ` · ${version.workflowRun.status}`}</dd><dt className="text-ops-muted">Task</dt><dd className="break-all text-ops-text">{version.task ? `${version.task.title} · ${version.task.planKey ?? version.taskId}` : version.taskId ?? 'Not linked'}</dd><dt className="text-ops-muted">Agent version</dt><dd className="break-all text-ops-text">{version.agentVersion ? `${version.agentVersion.agent.key} · ${version.agentVersion.name} v${version.agentVersion.version}` : version.agentVersionId ?? 'Not linked'}</dd><dt className="text-ops-muted">Accepted plan hash</dt><dd className="break-all font-mono text-ops-text">{version.workflowRun?.acceptedPlanHash ?? 'Not recorded'}</dd><dt className="text-ops-muted">Input references</dt><dd className="text-ops-text"><pre className="whitespace-pre-wrap break-words">{version.inputReferences == null ? 'Not recorded' : JSON.stringify(version.inputReferences, null, 2)}</pre></dd></dl></details>
              {version.textContent !== null ? <details className="mt-3 border border-ops-border"><summary className="cursor-pointer px-3 py-2 text-xs text-ops-accent">Preview saved text</summary><pre dir="auto" className="max-h-96 overflow-auto border-t border-ops-border bg-ops-surface-raised p-3 text-xs leading-5 text-ops-muted">{version.textContent}</pre></details> : <p className="mt-3 text-xs text-ops-amber">Inline preview unavailable for this version. Use the private download route if storage is connected.</p>}
              {version.storageKey && ['image/png', 'image/jpeg'].includes(version.contentType ?? '') && <figure className="mt-3 border border-ops-border"><div className="max-h-[70vh] overflow-auto"><Image src={`/api/admin/operations/deliverables/${encodeURIComponent(artifact.id)}/versions/${encodeURIComponent(version.id)}/download?inline=1`} alt={`${artifact.title}, version ${version.version}, automated browser rendering`} width={artifact.title.toLowerCase().includes('mobile') ? 390 : 1280} height={900} unoptimized className="h-auto max-w-full" /></div><figcaption className="border-t border-ops-border px-3 py-2 text-xs text-ops-muted">Automated browser rendering evidence. This is not a human design review.</figcaption></figure>}
              {version.metadata !== null && version.metadata !== undefined ? <details className="mt-2 border border-ops-border"><summary className="cursor-pointer px-3 py-2 text-xs text-ops-muted">Supporting evidence and metadata</summary><pre className="max-h-64 overflow-auto border-t border-ops-border bg-ops-surface-raised p-3 text-[11px] leading-5 text-ops-muted">{JSON.stringify(version.metadata, null, 2)}</pre></details> : null}
              {version.approvals.length > 0 && <div className="mt-3 space-y-2">
                <h4 className="text-xs font-medium text-ops-muted">Review history</h4>
                {version.approvals.map((approval) => <div key={approval.id} className="border-l-2 border-ops-border pl-3 text-xs"><p className={stateColor(approval.status)}>{approval.status.replaceAll('_', ' ')} <span className="text-ops-subtle">by {approval.reviewer.user.name} · {date(approval.createdAt)}</span></p>{approval.comment && <p className="mt-1 whitespace-pre-wrap text-ops-muted">{approval.comment}</p>}</div>)}
              </div>}
              {version === artifact.versions[0] && artifact.status !== 'SUPERSEDED' && <div className="mt-4 max-w-2xl space-y-2 border-t border-ops-border pt-3">
                <label htmlFor={`revision-${version.id}`} className="block text-xs text-ops-muted">Request a revision for this version</label>
                <div className="flex flex-col gap-2 sm:flex-row"><textarea id={`revision-${version.id}`} rows={2} maxLength={2000} value={comments[version.id] ?? ''} dir="auto" onChange={(event) => setComments((current) => ({ ...current, [version.id]: event.target.value }))} placeholder="Describe the requested changes" className="min-h-11 min-w-0 flex-1 resize-y border border-ops-border bg-ops-surface px-3 py-2 text-sm outline-none placeholder:text-ops-subtle focus:border-ops-accent" /><button type="button" disabled={savingId === version.id || (comments[version.id] ?? '').trim().length < 3} onClick={() => void requestRevision(artifact, version)} className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 border border-ops-border px-3 text-xs hover:border-ops-amber hover:text-ops-amber disabled:cursor-not-allowed disabled:opacity-50"><RotateCcw size={14} /> Request revision</button></div>
              </div>}
            </li>)}
          </ol>}
        </div>
      </details>)}
    </div>}
  </div>;
}