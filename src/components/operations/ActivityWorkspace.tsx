'use client';

import { useEffect, useMemo, useState } from 'react';
import { Activity, RefreshCw } from 'lucide-react';

type WorkflowRecord = { id: string; type: string; message: string | null; taskKey: string | null; metadata: unknown; createdAt: string; workflowRun: { id: string; project: { id: string; name: string } | null } };
type AuditRecord = { id: string; action: string; resource: string; resourceId: string | null; metadata: unknown; createdAt: string; actorMembership: { user: { name: string } } | null };
type ActivityItem = { id: string; type: string; message: string; createdAt: string; category: 'Workflow' | 'Owner action'; projectName?: string; resource?: string; resourceId?: string | null; actor?: string; taskKey?: string | null; metadata?: unknown };

function formattedDate(value: string) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}

export default function ActivityWorkspace() {
  const [workflow, setWorkflow] = useState<WorkflowRecord[]>([]);
  const [audit, setAudit] = useState<AuditRecord[]>([]);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<'ALL' | 'Workflow' | 'Owner action'>('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const projectId = new URLSearchParams(window.location.search).get('projectId');
      const query = projectId ? `?projectId=${encodeURIComponent(projectId)}` : '';
      const response = await fetch(`/api/admin/operations/activity${query}`, { cache: 'no-store' });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Activity could not be loaded.');
      setWorkflow(result.workflow as WorkflowRecord[]);
      setAudit(result.audit as AuditRecord[]);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Activity could not be loaded.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    const projectId = new URLSearchParams(window.location.search).get('projectId');
    const query = projectId ? `?projectId=${encodeURIComponent(projectId)}` : '';
    fetch('/api/admin/operations/activity' + query, { cache: 'no-store', signal: controller.signal }).then(async response => {
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Workspace data could not be loaded.');
      setWorkflow(result.workflow as WorkflowRecord[]); setAudit(result.audit as AuditRecord[]);
    }).catch(error => { if (!controller.signal.aborted) setError(error instanceof Error ? error.message : 'Workspace data could not be loaded.'); }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, []);

  const items = useMemo(() => {
    const combined: ActivityItem[] = [
      ...workflow.map((item) => ({
        id: `workflow-${item.id}`,
        type: item.type,
        message: item.message ?? 'Workflow state recorded.',
        createdAt: item.createdAt,
        category: 'Workflow' as const,
        projectName: item.workflowRun.project?.name,
        resource: 'Workflow run',
        resourceId: item.workflowRun.id,
        taskKey: item.taskKey,
        metadata: item.metadata,
      })),
      ...audit.map((item) => ({
        id: `audit-${item.id}`,
        type: item.action,
        message: typeof item.metadata === 'object' && item.metadata !== null && 'comment' in item.metadata && typeof item.metadata.comment === 'string'
          ? item.metadata.comment
          : `${item.resource}${item.resourceId ? ` ${item.resourceId}` : ''}`,
        createdAt: item.createdAt,
        category: 'Owner action' as const,
        resource: item.resource,
        resourceId: item.resourceId,
        actor: item.actorMembership?.user.name ?? 'System',
        metadata: item.metadata,
      })),
    ].sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime());

    const normalizedQuery = query.trim().toLowerCase();
    return combined.filter((item) => (category === 'ALL' || item.category === category) &&
      (!normalizedQuery || `${item.type} ${item.message} ${item.projectName ?? ''} ${item.resource ?? ''} ${item.actor ?? ''} ${item.taskKey ?? ''}`.toLowerCase().includes(normalizedQuery)));
  }, [workflow, audit, category, query]);

  return <div className="space-y-7">
    <header className="flex flex-wrap items-end justify-between gap-4 border-b border-ops-border pb-6"><div><p className="text-xs font-medium uppercase text-ops-violet">Workspace history</p><h1 className="mt-2 text-3xl font-semibold">Activity</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-ops-muted">A timeline of persisted workflow transitions and owner decisions. It does not include private model reasoning.</p></div><button type="button" onClick={() => void load()} disabled={loading} title="Refresh activity" aria-label="Refresh activity" className="inline-flex size-10 items-center justify-center border border-ops-border text-ops-muted hover:text-ops-text disabled:opacity-50"><RefreshCw size={16} /></button></header>
    {error && <div role="alert" className="flex flex-wrap items-center justify-between gap-3 border border-ops-red/30 bg-ops-red/[0.06] px-4 py-3 text-sm text-ops-red"><p>{error}</p><button type="button" onClick={() => void load()} className="min-h-9 underline underline-offset-4">Try again</button></div>}
    <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_180px]">
      <label className="sr-only" htmlFor="activity-search">Search activity</label><input id="activity-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search actions, projects, resources" className="min-h-11 border border-ops-border bg-ops-surface px-3 text-sm outline-none placeholder:text-ops-subtle focus:border-ops-accent" />
      <label className="sr-only" htmlFor="activity-category">Filter activity type</label><select id="activity-category" value={category} onChange={(event) => setCategory(event.target.value as typeof category)} className="min-h-11 border border-ops-border bg-ops-surface px-3 text-sm outline-none focus:border-ops-accent"><option value="ALL">All activity</option><option value="Workflow">Workflow</option><option value="Owner action">Owner actions</option></select>
    </div>
    {loading && workflow.length + audit.length === 0 ? <div role="status" aria-label="Loading activity" className="h-48 animate-pulse border-y border-ops-border bg-ops-text/[0.05]" /> : items.length === 0 ? <div className="border-y border-ops-border py-10"><Activity size={21} className="text-ops-accent" /><h2 className="mt-3 text-base font-semibold">No matching activity</h2><p className="mt-1 text-sm text-ops-muted">Only persisted actions appear here. No sample events are created.</p></div> : <ol className="divide-y divide-ops-border border-y border-ops-border">{items.map((item) => <li key={item.id} className="grid gap-2 py-4 sm:grid-cols-[minmax(0,1fr)_190px]"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h2 className="text-sm font-semibold">{item.type.replaceAll('.', ' ').replaceAll('_', ' ')}</h2><span className="border border-ops-border px-2 py-0.5 text-[10px] text-ops-muted">{item.category}</span></div><p className="mt-1 break-words text-sm text-ops-muted">{item.message}</p><p className="mt-1 text-xs text-ops-subtle">{[item.projectName, item.taskKey, item.resource, item.actor].filter(Boolean).join(' · ') || 'Workspace event'}</p>{item.metadata !== null && item.metadata !== undefined && <details className="mt-2 text-xs"><summary className="cursor-pointer text-ops-accent">Recorded details</summary><pre className="mt-2 max-h-52 overflow-auto border border-ops-border bg-ops-surface-raised p-3 text-[11px] leading-5 text-ops-muted">{JSON.stringify(item.metadata, null, 2)}</pre></details>}</div><time className="text-xs text-ops-subtle sm:text-right">{formattedDate(item.createdAt)}</time></li>)}</ol>}
    <p className="text-xs text-ops-subtle">Showing up to 100 workflow events and 100 owner actions.</p>
  </div>;
}