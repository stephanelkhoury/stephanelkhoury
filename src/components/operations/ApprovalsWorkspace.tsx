'use client';

import { useEffect, useState } from 'react';
import { BadgeCheck, Ban, Check, RefreshCw, RotateCcw } from 'lucide-react';

type WorkflowApproval = {
  id: string;
  actionKey: string;
  actionPayload: unknown;
  actionHash: string;
  createdAt: string;
  task: { id: string; title: string; planKey: string | null };
  workflowRun: { id: string; status: string; project: { id: string; name: string } | null };
};

type ArtifactApproval = {
  id: string;
  createdAt: string;
  comment: string | null;
  artifactVersion: {
    id: string;
    version: number;
    contentType: string | null;
    textContent: string | null;
    storageKey: string | null;
    metadata: unknown;
    artifact: { id: string; title: string; kind: string; project: { id: string; name: string } };
  };
};

type ApprovalData = { workflow: WorkflowApproval[]; artifacts: ArtifactApproval[] };

function formattedDate(value: string) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}

function json(value: unknown) {
  return JSON.stringify(value, null, 2);
}

function EmptyQueue() {
  return <div className="border-y border-ops-border py-10">
    <BadgeCheck size={22} className="text-ops-green" />
    <h2 className="mt-3 text-base font-semibold">No pending approvals</h2>
    <p className="mt-1 max-w-lg text-sm leading-6 text-ops-muted">New plan actions and deliverable versions will appear here when a review is explicitly requested.</p>
  </div>;
}

export default function ApprovalsWorkspace() {
  const [data, setData] = useState<ApprovalData | null>(null);
  const [comments, setComments] = useState<Record<string, string>>({});
  const [pendingId, setPendingId] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const projectId = new URLSearchParams(window.location.search).get('projectId');
      const query = projectId ? `?projectId=${encodeURIComponent(projectId)}` : '';
      const response = await fetch(`/api/admin/operations/approvals${query}`, { cache: 'no-store' });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Approvals could not be loaded.');
      setData(result as ApprovalData);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Approvals could not be loaded.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    const projectId = new URLSearchParams(window.location.search).get('projectId');
    const query = projectId ? `?projectId=${encodeURIComponent(projectId)}` : '';
    fetch('/api/admin/operations/approvals' + query, { cache: 'no-store', signal: controller.signal }).then(async response => {
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Workspace data could not be loaded.');
      setData(result as ApprovalData);
    }).catch(error => { if (!controller.signal.aborted) setError(error instanceof Error ? error.message : 'Workspace data could not be loaded.'); }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, []);

  const decide = async (input: { id: string; type: 'workflow' | 'artifact'; runId?: string; decision: 'APPROVED' | 'REJECTED' | 'CHANGES_REQUESTED' }) => {
    setPendingId(input.id);
    setError('');
    setNotice('');
    try {
      const endpoint = input.type === 'workflow'
        ? `/api/admin/operations/runs/${encodeURIComponent(input.runId ?? '')}/approvals/${encodeURIComponent(input.id)}`
        : `/api/admin/operations/approvals/artifacts/${encodeURIComponent(input.id)}`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision: input.decision, comment: comments[input.id] ?? '' }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'The decision could not be recorded.');
      setNotice(result.error || 'Decision saved. The recorded action applies only to the reviewed payload or version.');
      setComments((current) => ({ ...current, [input.id]: '' }));
      await load();
    } catch (decisionError) {
      setError(decisionError instanceof Error ? decisionError.message : 'The decision could not be recorded.');
    } finally {
      setPendingId('');
    }
  };

  const workflow = data?.workflow ?? [];
  const artifacts = data?.artifacts ?? [];

  return <div className="space-y-7">
    <header className="flex flex-wrap items-end justify-between gap-4 border-b border-ops-border pb-6">
      <div><p className="text-xs font-medium uppercase text-ops-violet">Review queue</p><h1 className="mt-2 text-3xl font-semibold">Approvals</h1><p className="mt-2 text-sm leading-6 text-ops-muted">Review the exact action or artifact version before recording a decision.</p></div>
      <button type="button" onClick={() => void load()} disabled={loading} aria-label="Refresh approvals" title="Refresh" className="inline-flex size-10 items-center justify-center border border-ops-border text-ops-muted hover:text-ops-text disabled:opacity-50"><RefreshCw size={16} /></button>
    </header>

    {error && <div role="alert" className="flex flex-wrap items-center justify-between gap-3 border border-ops-red/30 bg-ops-red/[0.06] px-4 py-3 text-sm text-ops-red"><p>{error}</p><button type="button" onClick={() => void load()} className="min-h-9 underline underline-offset-4">Try again</button></div>}
    {notice && <p role="status" className="border border-ops-green/30 bg-ops-green/[0.06] px-4 py-3 text-sm text-ops-green">{notice}</p>}
    {loading && !data ? <div role="status" aria-label="Loading approvals" className="h-48 animate-pulse border-y border-ops-border bg-ops-text/[0.05]" /> : data && workflow.length + artifacts.length === 0 ? <EmptyQueue /> : <div className="space-y-10">
      {workflow.length > 0 && <section aria-labelledby="action-approvals-title">
        <div className="mb-1 flex items-baseline justify-between gap-3 border-b border-ops-border pb-3"><h2 id="action-approvals-title" className="text-lg font-semibold">Proposed actions</h2><span className="text-xs text-ops-muted">{workflow.length} pending</span></div>
        <div className="divide-y divide-ops-border">
          {workflow.map((approval) => <article key={approval.id} className="grid gap-5 py-5 lg:grid-cols-[minmax(0,1fr)_300px]">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1"><h3 className="text-base font-semibold">{approval.actionKey.replaceAll(/[._-]/g, ' ')}</h3><span className="text-xs text-ops-amber">Exact action pending</span></div>
              <p className="mt-1 text-sm text-ops-muted">{approval.task.title} · {approval.workflowRun.project?.name ?? 'Project'} · {formattedDate(approval.createdAt)}</p>
              <p className="mt-3 text-xs text-ops-muted">Affected resources: workflow run {approval.workflowRun.id}, task {approval.task.planKey ?? approval.task.id}. Approval will authorize only this hashed payload; it does not publish or send content.</p>
              <details className="mt-4 border border-ops-border">
                <summary className="cursor-pointer px-3 py-2 text-xs text-ops-accent">Inspect exact action payload and hash</summary>
                <pre className="max-h-72 overflow-auto border-t border-ops-border bg-ops-surface-raised p-3 text-[11px] leading-5 text-ops-muted">{json(approval.actionPayload)}{'\n\nSHA-256: '}{approval.actionHash}</pre>
              </details>
            </div>
            <div className="space-y-3">
              <label className="block space-y-1.5 text-xs text-ops-muted"><span>Review note</span><textarea rows={2} maxLength={2000} value={comments[approval.id] ?? ''} dir="auto" onChange={(event) => setComments((current) => ({ ...current, [approval.id]: event.target.value }))} className="w-full resize-y border border-ops-border bg-ops-surface px-3 py-2 text-sm text-ops-text outline-none focus:border-ops-accent" /></label>
              <div className="flex flex-wrap gap-2">
                <button type="button" disabled={pendingId === approval.id} onClick={() => void decide({ id: approval.id, runId: approval.workflowRun.id, type: 'workflow', decision: 'APPROVED' })} className="inline-flex min-h-9 items-center gap-1.5 border border-ops-green/40 px-3 text-xs text-ops-green hover:bg-ops-green/10 disabled:opacity-50"><Check size={14} /> Approve exact action</button>
                <button type="button" disabled={pendingId === approval.id} onClick={() => void decide({ id: approval.id, runId: approval.workflowRun.id, type: 'workflow', decision: 'REJECTED' })} className="inline-flex min-h-9 items-center gap-1.5 border border-ops-red/40 px-3 text-xs text-ops-red hover:bg-ops-red/10 disabled:opacity-50"><Ban size={14} /> Reject</button>
                <button type="button" disabled={pendingId === approval.id} onClick={() => void decide({ id: approval.id, runId: approval.workflowRun.id, type: 'workflow', decision: 'CHANGES_REQUESTED' })} className="inline-flex min-h-9 items-center gap-1.5 border border-ops-border px-3 text-xs text-ops-muted hover:text-ops-text disabled:opacity-50"><RotateCcw size={14} /> Request changes</button>
              </div>
            </div>
          </article>)}
        </div>
      </section>}

      {artifacts.length > 0 && <section aria-labelledby="artifact-approvals-title">
        <div className="mb-1 flex items-baseline justify-between gap-3 border-b border-ops-border pb-3"><h2 id="artifact-approvals-title" className="text-lg font-semibold">Deliverable versions</h2><span className="text-xs text-ops-muted">{artifacts.length} pending</span></div>
        <div className="divide-y divide-ops-border">
          {artifacts.map((approval) => {
            const artifact = approval.artifactVersion.artifact;
            const version = approval.artifactVersion;
            return <article key={approval.id} className="grid gap-5 py-5 lg:grid-cols-[minmax(0,1fr)_300px]">
              <div className="min-w-0">
                <h3 className="text-base font-semibold">{artifact.title} <span className="text-ops-accent">v{version.version}</span></h3>
                <p className="mt-1 text-sm text-ops-muted">{artifact.project.name} · {artifact.kind} · {version.contentType ?? 'Type not recorded'} · {formattedDate(approval.createdAt)}</p>
                <p className="mt-3 text-xs text-ops-muted">Affected resource: artifact {artifact.id}, version {version.id}. Approval changes internal review status only; it does not publish or distribute this file.</p>
                {version.textContent ? <details className="mt-3 border border-ops-border"><summary className="cursor-pointer px-3 py-2 text-xs text-ops-accent">Preview this version</summary><pre className="max-h-72 overflow-auto border-t border-ops-border bg-ops-surface-raised p-3 text-xs leading-5 text-ops-muted">{version.textContent}</pre></details> : <p className="mt-3 text-xs text-ops-amber">Preview unavailable: this version has no stored text content.</p>}
              </div>
              <div className="space-y-3">
                <label className="block space-y-1.5 text-xs text-ops-muted"><span>Review note</span><textarea rows={2} maxLength={2000} value={comments[approval.id] ?? ''} dir="auto" onChange={(event) => setComments((current) => ({ ...current, [approval.id]: event.target.value }))} className="w-full resize-y border border-ops-border bg-ops-surface px-3 py-2 text-sm text-ops-text outline-none focus:border-ops-accent" /></label>
                <div className="flex flex-wrap gap-2">
                  <button type="button" disabled={pendingId === approval.id} onClick={() => void decide({ id: approval.id, type: 'artifact', decision: 'APPROVED' })} className="inline-flex min-h-9 items-center gap-1.5 border border-ops-green/40 px-3 text-xs text-ops-green hover:bg-ops-green/10 disabled:opacity-50"><Check size={14} /> Approve version</button>
                  <button type="button" disabled={pendingId === approval.id} onClick={() => void decide({ id: approval.id, type: 'artifact', decision: 'REJECTED' })} className="inline-flex min-h-9 items-center gap-1.5 border border-ops-red/40 px-3 text-xs text-ops-red hover:bg-ops-red/10 disabled:opacity-50"><Ban size={14} /> Reject</button>
                  <button type="button" disabled={pendingId === approval.id} onClick={() => void decide({ id: approval.id, type: 'artifact', decision: 'CHANGES_REQUESTED' })} className="inline-flex min-h-9 items-center gap-1.5 border border-ops-border px-3 text-xs text-ops-muted hover:text-ops-text disabled:opacity-50"><RotateCcw size={14} /> Request changes</button>
                </div>
              </div>
            </article>;
          })}
        </div>
      </section>}
    </div>}
  </div>;
}