'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Activity, ArrowRight, ArrowUpRight, BadgeCheck, CircleAlert, FolderKanban, Plus, RefreshCw, WalletCards } from 'lucide-react';

type DashboardData = {
  projects: { total: number; active: number; byStatus: Record<string, number> };
  tasks: { byStatus: Record<string, number>; blockedCount: number; blocked: Array<{ id: string; title: string; status: string; error: string | null; updatedAt: string; workflowRunId: string | null; planKey: string | null; project: { id: string; name: string } }> };
  approvals: {
    pending: number;
    workflowPending: number;
    artifactPending: number;
    workflowItems: Array<{ id: string; actionKey: string; actionHash: string; createdAt: string; task: { title: string; planKey: string | null }; workflowRun: { id: string; project: { id: string; name: string } | null } }>;
    artifactItems: Array<{ id: string; createdAt: string; comment: string | null; artifactVersion: { id: string; version: number; contentType: string | null; artifact: { id: string; title: string; kind: string; project: { id: string; name: string } } } }>;
  };
  deliverables: Array<{ id: string; title: string; kind: string; status: string; updatedAt: string; project: { id: string; name: string }; versions: Array<{ id: string; version: number; contentType: string | null; storageKey: string | null; createdAt: string }> }>;
  recentProjects: Array<{ id: string; name: string; summary: string; status: string; updatedAt: string; _count: { tasks: number } }>;
  activity: Array<{ id: string; type: string; message: string | null; taskKey: string | null; createdAt: string; workflowRun: { id: string; project: { id: string; name: string } | null } }>;
  usage: { records: number; inputTokens: number; outputTokens: number; reportedCostUsd: string | null; estimatedCostUsd: string | null };
  agents: { enabled: number; approved: number; executionConfigured: boolean };
  integrations: Array<{ id: string; provider: string; status: string; connectedAt: string | null; updatedAt: string }>;
};

function money(value: string | null) {
  return value === null ? 'Not reported' : new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 4 }).format(Number(value));
}

function date(value: string) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}

function StateLabel({ value }: { value: string }) {
  const tone = ['ACTIVE', 'APPROVED', 'SUCCEEDED', 'DONE'].includes(value)
    ? 'text-ops-green'
    : ['BLOCKED', 'AWAITING_APPROVAL', 'AWAITING_INPUT', 'IN_REVIEW'].includes(value)
      ? 'text-ops-amber'
      : ['FAILED', 'REJECTED', 'CANCELED'].includes(value)
        ? 'text-ops-red'
        : 'text-ops-muted';
  return <span className={`text-xs font-medium ${tone}`}>{value.replaceAll('_', ' ').toLowerCase().replace(/^./, (letter) => letter.toUpperCase())}</span>;
}

function EmptyState({ title, detail, action }: { title: string; detail: string; action?: React.ReactNode }) {
  return <div className="py-8">
    <p className="text-sm font-medium text-ops-text">{title}</p>
    <p className="mt-1 max-w-xl text-sm leading-6 text-ops-muted">{detail}</p>
    {action && <div className="mt-4">{action}</div>}
  </div>;
}

export default function OperationsDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/admin/operations/dashboard', { cache: 'no-store' });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Workspace data could not be loaded.');
      setData(result as DashboardData);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Workspace data could not be loaded.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    const projectId = new URLSearchParams(window.location.search).get('projectId');
    const query = projectId ? `?projectId=${encodeURIComponent(projectId)}` : '';
    fetch('/api/admin/operations/dashboard' + query, { cache: 'no-store', signal: controller.signal }).then(async response => {
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Workspace data could not be loaded.');
      setData(result as DashboardData);
    }).catch(error => { if (!controller.signal.aborted) setError(error instanceof Error ? error.message : 'Workspace data could not be loaded.'); }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, []);

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-5 border-b border-ops-border pb-6">
        <div>
          <p className="text-xs font-medium uppercase text-ops-accent">Owner workspace</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-normal text-ops-text">Command center</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-ops-muted">A live view of project work, owner decisions, deliverables, and recorded usage.</p>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => void load()} disabled={loading} aria-label="Refresh command center" title="Refresh" className="inline-flex size-10 items-center justify-center border border-ops-border text-ops-muted hover:bg-ops-text/[0.05] hover:text-ops-text disabled:opacity-50"><RefreshCw size={16} /></button>
          <Link href="/admin/multigraphic-ai/projects/new" className="inline-flex min-h-10 items-center gap-2 bg-ops-accent-strong px-4 text-sm font-semibold text-ops-on-accent hover:bg-ops-accent-strong/90"><Plus size={16} /> New project</Link>
        </div>
      </header>

      {error && <div role="alert" className="flex flex-wrap items-center justify-between gap-4 border border-ops-red/30 bg-ops-red/[0.06] px-4 py-3 text-sm text-ops-red"><p>{error}</p><button type="button" onClick={() => void load()} className="min-h-9 underline underline-offset-4">Try again</button></div>}

      {loading && !data ? <div role="status" aria-label="Loading command center" className="space-y-4"><div className="h-24 animate-pulse border-y border-ops-border bg-ops-text/[0.05]" /><div className="h-72 animate-pulse border-y border-ops-border bg-ops-text/[0.05]" /></div> : data && <>
        <section aria-label="Workspace totals" className="grid grid-cols-2 border-y border-ops-border sm:grid-cols-4">
          {[
            { label: 'Open projects', value: data.projects.total, note: `${data.projects.active} active`, icon: FolderKanban, tint: 'var(--ops-blue)' },
            { label: 'Pending approvals', value: data.approvals.pending, note: `${data.approvals.workflowPending} actions · ${data.approvals.artifactPending} deliverables`, icon: BadgeCheck, tint: 'var(--ops-violet)' },
            { label: 'Blocked or waiting', value: data.tasks.blockedCount, note: 'Needs owner or project input', icon: CircleAlert, tint: 'var(--ops-amber)' },
            { label: 'Recorded usage', value: data.usage.records, note: `${data.usage.inputTokens + data.usage.outputTokens} tokens`, icon: WalletCards, tint: 'var(--ops-green)' },
          ].map(({ label, value, note, icon: Icon, tint }) => <div key={label} className="min-w-0 border-b border-ops-border px-4 py-5 first:pl-0 sm:border-b-0 sm:border-r sm:px-5 sm:first:pl-0 sm:last:border-r-0">
            <div className="flex items-center gap-2 text-xs text-ops-muted"><Icon size={15} style={{ color: tint }} /> {label}</div>
            <p className="mt-3 text-3xl font-semibold tabular-nums text-ops-text">{value}</p>
            <p className="mt-1 text-xs leading-5 text-ops-subtle">{note}</p>
          </div>)}
        </section>

        <div className="grid gap-x-10 gap-y-8 xl:grid-cols-[minmax(0,1.3fr)_minmax(300px,0.7fr)]">
          <section aria-labelledby="projects-title" className="min-w-0">
            <div className="flex items-center justify-between border-b border-ops-border pb-3">
              <h2 id="projects-title" className="text-base font-semibold">Recent projects</h2>
              <Link href="/admin/multigraphic-ai/projects" className="inline-flex min-h-8 items-center gap-1 text-xs text-ops-accent hover:text-ops-text">All projects <ArrowRight size={14} /></Link>
            </div>
            {data.recentProjects.length === 0 ? <EmptyState title="No projects yet" detail="Create a project to save its brief, review a proposed plan, and track real work." action={<Link href="/admin/multigraphic-ai/projects/new" className="inline-flex min-h-9 items-center gap-2 border border-ops-border px-3 text-xs hover:border-ops-accent"><Plus size={14} /> Create a project</Link>} /> : <div className="divide-y divide-ops-border">
              {data.recentProjects.map((project) => <Link key={project.id} href={`/admin/multigraphic-ai/projects/${project.id}`} className="group flex min-h-[76px] flex-wrap items-center justify-between gap-3 py-3">
                <span className="min-w-0 flex-1"><span className="block truncate text-sm font-medium text-ops-text group-hover:text-ops-accent">{project.name}</span><span className="mt-1 block truncate text-xs text-ops-muted">{project.summary || 'No summary'} · {project._count.tasks} tasks</span></span>
                <span className="flex items-center gap-3"><StateLabel value={project.status} /><ArrowUpRight size={15} className="text-ops-subtle group-hover:text-ops-accent" /></span>
              </Link>)}
            </div>}
          </section>

          <section aria-labelledby="approvals-title" className="min-w-0">
            <div className="flex items-center justify-between border-b border-ops-border pb-3">
              <h2 id="approvals-title" className="text-base font-semibold">Needs your review</h2>
              <Link href="/admin/multigraphic-ai/approvals" className="inline-flex min-h-8 items-center gap-1 text-xs text-ops-accent hover:text-ops-text">Review queue <ArrowRight size={14} /></Link>
            </div>
            {data.approvals.workflowItems.length + data.approvals.artifactItems.length === 0 ? <EmptyState title="Nothing awaiting approval" detail="Plans and deliverable versions appear here only after a real review request is created." /> : <div className="divide-y divide-ops-border">
              {data.approvals.workflowItems.slice(0, 4).map((item) => <Link key={item.id} href="/admin/multigraphic-ai/approvals" className="block py-3 hover:bg-ops-text/[0.05]">
                <p className="text-sm font-medium text-ops-text">{item.actionKey.replaceAll('_', ' ')}</p><p className="mt-1 text-xs text-ops-muted">{item.task.title} · {item.workflowRun.project?.name ?? 'Project'} · Exact action</p>
              </Link>)}
              {data.approvals.artifactItems.slice(0, 4).map((item) => <Link key={item.id} href="/admin/multigraphic-ai/approvals" className="block py-3 hover:bg-ops-text/[0.05]">
                <p className="text-sm font-medium text-ops-text">{item.artifactVersion.artifact.title} · v{item.artifactVersion.version}</p><p className="mt-1 text-xs text-ops-muted">{item.artifactVersion.artifact.project.name} · Deliverable version</p>
              </Link>)}
            </div>}
          </section>

          <section aria-labelledby="blocked-title" className="min-w-0">
            <div className="flex items-center justify-between border-b border-ops-border pb-3">
              <h2 id="blocked-title" className="text-base font-semibold">Blocked or waiting</h2>
              <Link href="/admin/multigraphic-ai/projects" className="inline-flex min-h-8 items-center gap-1 text-xs text-ops-accent hover:text-ops-text">Open projects <ArrowRight size={14} /></Link>
            </div>
            {data.tasks.blocked.length === 0 ? <EmptyState title="No blocked tasks" detail="Only persisted blocked, approval-waiting, or input-waiting tasks are shown here." /> : <div className="divide-y divide-ops-border">
              {data.tasks.blocked.map((task) => <Link key={task.id} href={`/admin/multigraphic-ai/projects/${task.project.id}`} className="block py-3 hover:bg-ops-text/[0.05]">
                <div className="flex flex-wrap items-center justify-between gap-2"><p className="text-sm font-medium text-ops-text">{task.title}</p><StateLabel value={task.status} /></div>
                <p className="mt-1 text-xs text-ops-muted">{task.project.name}{task.error ? ` · ${task.error}` : ''}</p>
              </Link>)}
            </div>}
          </section>

          <section aria-labelledby="usage-title" className="min-w-0">
            <div className="flex items-center justify-between border-b border-ops-border pb-3">
              <h2 id="usage-title" className="text-base font-semibold">Recorded usage</h2>
              <Link href="/admin/multigraphic-ai/usage" className="inline-flex min-h-8 items-center gap-1 text-xs text-ops-accent hover:text-ops-text">Usage details <ArrowRight size={14} /></Link>
            </div>
            <div className="grid gap-4 py-4 sm:grid-cols-2">
              <div><p className="text-xs text-ops-muted">Provider-reported cost</p><p className="mt-2 text-lg font-semibold tabular-nums">{money(data.usage.reportedCostUsd)}</p><p className="mt-1 text-xs text-ops-subtle">Reported by provider only</p></div>
              <div><p className="text-xs text-ops-muted">Estimated cost</p><p className="mt-2 text-lg font-semibold tabular-nums">{money(data.usage.estimatedCostUsd)}</p><p className="mt-1 text-xs text-ops-subtle">Not a provider invoice</p></div>
            </div>
            <div className="border-t border-ops-border py-3 text-xs text-ops-muted">{data.usage.inputTokens.toLocaleString()} input tokens <span className="px-2 text-ops-subtle">·</span> {data.usage.outputTokens.toLocaleString()} output tokens</div>
          </section>

          <section aria-labelledby="deliverables-title" className="min-w-0">
            <div className="flex items-center justify-between border-b border-ops-border pb-3">
              <h2 id="deliverables-title" className="text-base font-semibold">Recent deliverables</h2>
              <Link href="/admin/multigraphic-ai/deliverables" className="inline-flex min-h-8 items-center gap-1 text-xs text-ops-accent hover:text-ops-text">All deliverables <ArrowRight size={14} /></Link>
            </div>
            {data.deliverables.length === 0 ? <EmptyState title="No deliverables yet" detail="Deliverables will appear after a real artifact version is saved. Generated task output is not treated as an approved deliverable." /> : <div className="divide-y divide-ops-border">
              {data.deliverables.map((artifact) => <Link key={artifact.id} href="/admin/multigraphic-ai/deliverables" className="flex min-h-[64px] items-center justify-between gap-3 py-3">
                <span className="min-w-0"><span className="block truncate text-sm font-medium">{artifact.title}</span><span className="mt-1 block truncate text-xs text-ops-muted">{artifact.project.name} · {artifact.kind}{artifact.versions[0] ? ` · v${artifact.versions[0].version}` : ''}</span></span>
                <StateLabel value={artifact.status} />
              </Link>)}
            </div>}
          </section>

          <section aria-labelledby="activity-title" className="min-w-0">
            <div className="flex items-center justify-between border-b border-ops-border pb-3"><h2 id="activity-title" className="flex items-center gap-2 text-base font-semibold"><Activity size={16} className="text-ops-violet" /> Recent activity</h2><Link href="/admin/multigraphic-ai/activity" className="inline-flex min-h-8 items-center gap-1 text-xs text-ops-accent hover:text-ops-text">Activity log <ArrowRight size={14} /></Link></div>
            {data.activity.length === 0 ? <EmptyState title="No recorded activity" detail="Workflow events appear here when an owner reviews a plan or a durable run records progress." /> : <ol className="divide-y divide-ops-border">
              {data.activity.slice(0, 5).map((event) => <li key={event.id} className="py-3"><div className="flex flex-wrap items-center justify-between gap-2"><p className="text-sm font-medium">{event.type.replaceAll('.', ' ')}</p><time className="text-[11px] text-ops-subtle">{date(event.createdAt)}</time></div><p className="mt-1 text-xs leading-5 text-ops-muted">{event.message ?? event.workflowRun.project?.name ?? 'Workflow event'}{event.taskKey ? ` · ${event.taskKey}` : ''}</p></li>)}
            </ol>}
          </section>
        </div>

        <footer className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-ops-border pt-4 text-xs text-ops-subtle">
          <span>{data.agents.approved} of {data.agents.enabled} enabled agents have an approved version</span>
          <span>Execution {data.agents.executionConfigured ? 'configured' : 'not configured'}</span>
          <Link href="/admin/multigraphic-ai/integrations" className="inline-flex min-h-8 items-center gap-1 text-ops-accent hover:text-ops-text">Setup status <ArrowRight size={13} /></Link>
        </footer>
      </>}
    </div>
  );
}