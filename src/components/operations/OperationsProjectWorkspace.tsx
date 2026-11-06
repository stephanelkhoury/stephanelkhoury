'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, Plus, RefreshCw, Save } from 'lucide-react';
import OperationsRunsPanel from '@/components/operations/OperationsRunsPanel';

type ProjectStatus = 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'ARCHIVED';
type ProjectListItem = { id: string; name: string; slug: string; summary: string; status: ProjectStatus; updatedAt: string; client: { name: string } | null; _count: { tasks: number } };
type ProjectTask = { id: string; title: string; status: string; error: string | null; updatedAt: string; workflowRunId: string | null; planKey: string | null };
type ProjectArtifact = { id: string; title: string; kind: string; status: string; updatedAt: string; versions: Array<{ id: string; version: number; contentType: string | null; storageKey: string | null; createdAt: string; approvals: Array<{ id: string }> }> };
type ProjectKnowledge = { id: string; title: string; scope: string; status: string; evidenceStatus: string; updatedAt: string; attachments: Array<{ id: string; fileName: string; contentType: string; fileSize: number }> };
type ProjectRun = { id: string; status: string; createdAt: string; finishedAt: string | null; error: string | null; events: Array<{ id: string; type: string; message: string | null; taskKey: string | null; createdAt: string }>; approvals: Array<{ id: string; actionKey: string; actionHash: string; status: string; task: { title: string } }> };
type ProjectRecord = {
  id: string;
  name: string;
  slug: string;
  summary: string;
  status: ProjectStatus;
  brief: { content: string; updatedAt: string } | null;
  client: { name: string } | null;
  createdAt: string;
  updatedAt: string;
  tasks: ProjectTask[];
  workflowRuns: ProjectRun[];
  artifacts: ProjectArtifact[];
  knowledgeDocuments: ProjectKnowledge[];
};
type ProjectAudit = { id: string; action: string; metadata: unknown; createdAt: string; actorMembership: { user: { name: string } } | null };

const projectStatuses: ProjectStatus[] = ['DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED', 'ARCHIVED'];

function statusTone(value: string) {
  if (['ACTIVE', 'APPROVED', 'SUCCEEDED', 'DONE', 'COMPLETED'].includes(value)) return 'border-ops-green/40 text-ops-green';
  if (['BLOCKED', 'AWAITING_INPUT', 'AWAITING_APPROVAL', 'IN_REVIEW', 'DRAFT', 'PAUSED'].includes(value)) return 'border-ops-amber/40 text-ops-amber';
  if (['FAILED', 'REJECTED', 'CANCELED'].includes(value)) return 'border-ops-red/40 text-ops-red';
  return 'border-ops-border-strong text-ops-muted';
}

function RecordStatus({ status }: { status: string }) {
  return <span className={`inline-flex border px-2 py-1 text-[11px] font-medium ${statusTone(status)}`}>{status.replaceAll('_', ' ')}</span>;
}

function ErrorNotice({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return <div role="alert" className="flex flex-wrap items-center justify-between gap-3 border border-ops-red/40 bg-ops-red/10 px-4 py-3 text-sm text-ops-red"><p>{message}</p>{onRetry && <button type="button" onClick={onRetry} className="inline-flex min-h-9 items-center gap-2 underline underline-offset-4"><RefreshCw size={14} /> Try again</button>}</div>;
}

function ProjectForm({ projectId }: { projectId?: string }) {
  const router = useRouter();
  const [project, setProject] = useState<ProjectRecord | null>(null);
  const [projectAudit, setProjectAudit] = useState<ProjectAudit[]>([]);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [summary, setSummary] = useState('');
  const [status, setStatus] = useState<ProjectStatus>('DRAFT');
  const [brief, setBrief] = useState('');
  const [loading, setLoading] = useState(Boolean(projectId));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!projectId) return;
    let active = true;
    const loadProject = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await fetch(`/api/admin/operations/projects/${encodeURIComponent(projectId)}`, { cache: 'no-store' });
        const data = await response.json();
        if (!active) return;
        if (!response.ok) throw new Error(data.error || 'Project could not be loaded.');
        const record = data.project as ProjectRecord;
        setProject(record);
        setProjectAudit((data.audit ?? []) as ProjectAudit[]);
        setName(record.name);
        setSlug(record.slug);
        setSummary(record.summary);
        setStatus(record.status);
        setBrief(record.brief?.content ?? '');
      } catch (loadError) {
        if (active) setError(loadError instanceof Error ? loadError.message : 'Project could not be loaded.');
      } finally {
        if (active) setLoading(false);
      }
    };
    void loadProject();
    return () => { active = false; };
  }, [projectId]);

  const save = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setSaved(false);
    try {
      const response = await fetch(projectId ? `/api/admin/operations/projects/${encodeURIComponent(projectId)}` : '/api/admin/operations/projects', {
        method: projectId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, ...(slug.trim() && { slug: slug.trim() }), summary, status, brief }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Project could not be saved.');
      setSaved(true);
      if (projectId) setProject((current) => current ? { ...current, ...data.project } : current);
      else router.replace(`/admin/multigraphic-ai/projects/${data.project.id}`);
      router.refresh();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Project changes were not confirmed.');
    } finally {
      setSaving(false);
    }
  };

  const importBrief = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setError('');
    const input = event.currentTarget;
    const file = input.files?.[0];
    if (!file) return;
    if (!/\.(txt|md)$/i.test(file.name)) {
      setError('Choose a .txt or .md file. Other formats are not enabled for project briefs.');
      input.value = '';
      return;
    }
    if (file.size > 1024 * 1024) {
      setError('Brief files are limited to 1 MiB.');
      input.value = '';
      return;
    }
    try {
      const content = await file.text();
      if (!content.trim() || content.length > 20000) throw new Error('Brief content must be non-empty and no longer than 20,000 characters.');
      setBrief(content);
      setSaved(false);
    } catch (fileError) {
      setError(fileError instanceof Error ? fileError.message : 'Brief file could not be read.');
    }
    input.value = '';
  };

  if (loading) return <div role="status" className="space-y-4" aria-label="Loading project"><div className="h-8 w-64 animate-pulse bg-ops-surface-raised" /><div className="h-48 animate-pulse bg-ops-surface" /></div>;
  if (projectId && !project) return <section className="space-y-5"><ErrorNotice message={error || 'Project could not be loaded.'} onRetry={() => window.location.reload()} /><Link href="/admin/multigraphic-ai/projects" className="inline-flex items-center gap-2 text-sm text-ops-muted hover:text-ops-text"><ArrowLeft size={16} /> Projects</Link></section>;

  const activityItems = project ? [
    ...project.workflowRuns.flatMap((run) => run.events.map((event) => ({ id: `workflow-${event.id}`, type: event.type, message: event.message, taskKey: event.taskKey, createdAt: event.createdAt, actor: 'Workflow' }))),
    ...projectAudit.map((event) => ({ id: `audit-${event.id}`, type: event.action, message: typeof event.metadata === 'object' && event.metadata !== null && 'comment' in event.metadata && typeof event.metadata.comment === 'string' ? event.metadata.comment : '', taskKey: null, createdAt: event.createdAt, actor: event.actorMembership?.user.name ?? 'Owner' })),
  ].sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()).slice(0, 30) : [];
  const pendingWorkflowApprovals = project?.workflowRuns.reduce((total, run) => total + run.approvals.length, 0) ?? 0;
  const pendingArtifactApprovals = project?.artifacts.reduce((total, artifact) => total + (artifact.versions[0]?.approvals.length ?? 0), 0) ?? 0;

  return <section className="space-y-6">
    <Link href="/admin/multigraphic-ai/projects" className="inline-flex min-h-9 items-center gap-2 text-sm text-ops-muted hover:text-ops-text"><ArrowLeft size={16} /> Projects</Link>
    <header id="project-overview" className="flex flex-wrap items-start justify-between gap-4 border-b border-ops-border pb-5"><div><p className="text-xs font-medium uppercase text-ops-accent">Operations / Projects</p><h1 className="mt-2 text-2xl font-semibold text-ops-text" dir="auto">{projectId ? project?.name ?? 'Edit project' : 'New project'}</h1><p className="mt-2 text-sm text-ops-muted">Project details, saved brief, reviewed work, and private deliverables.</p></div>{project && <RecordStatus status={project.status} />}</header>

    {project && <nav aria-label="Project workspace sections" className="flex gap-1 overflow-x-auto border-b border-ops-border py-2 text-xs">{[['Overview', '#project-overview'], ['Brief', '#project-brief'], ['Tasks', '#project-tasks'], ['Runs', '#project-runs'], ['Files', '#project-files'], ['Knowledge', '#project-knowledge'], ['Deliverables', '#project-deliverables'], ['Approvals', '#project-approvals'], ['Activity', '#project-activity']].map(([label, href]) => <a key={label} href={href} className="inline-flex min-h-9 shrink-0 items-center border-b-2 border-transparent px-3 text-ops-muted hover:border-ops-accent hover:text-ops-text">{label}</a>)}</nav>}

    {error && <ErrorNotice message={error} />}
    {saved && <p role="status" className="border border-ops-green/30 bg-ops-green/[0.06] px-4 py-3 text-sm text-ops-green">Project saved.</p>}

    <form onSubmit={save} className="space-y-7">
      <fieldset disabled={saving} className="grid gap-5 md:grid-cols-2">
        <label className="space-y-2 text-sm text-ops-muted"><span>Project name <span className="text-ops-red">*</span></span><input required minLength={2} maxLength={120} value={name} dir="auto" onChange={(event) => setName(event.target.value)} className="min-h-11 w-full border border-ops-border bg-ops-surface px-3 text-ops-text outline-none focus:border-ops-accent" /></label>
        <label className="space-y-2 text-sm text-ops-muted"><span>URL slug</span><input maxLength={80} pattern="[a-z0-9]+(?:-[a-z0-9]+)*" value={slug} onChange={(event) => setSlug(event.target.value)} placeholder="Generated from project name" className="min-h-11 w-full border border-ops-border bg-ops-surface px-3 text-ops-text outline-none placeholder:text-ops-subtle focus:border-ops-accent" /></label>
        <label className="space-y-2 text-sm text-ops-muted"><span>Status</span><select value={status} onChange={(event) => setStatus(event.target.value as ProjectStatus)} className="min-h-11 w-full border border-ops-border bg-ops-surface px-3 text-ops-text outline-none focus:border-ops-accent">{projectStatuses.map((value) => <option key={value} value={value}>{value.replace('_', ' ')}</option>)}</select></label>
        {project?.client && <p className="self-end pb-3 text-sm text-ops-muted">Client: {project.client.name}</p>}
        <label className="space-y-2 text-sm text-ops-muted md:col-span-2"><span>Summary</span><textarea maxLength={500} rows={2} value={summary} dir="auto" onChange={(event) => setSummary(event.target.value)} className="w-full resize-y border border-ops-border bg-ops-surface px-3 py-2 text-ops-text outline-none focus:border-ops-accent" /></label>
        <label id="project-brief" className="space-y-2 text-sm text-ops-muted md:col-span-2"><span>Project brief</span><textarea maxLength={20000} rows={10} value={brief} dir="auto" onChange={(event) => setBrief(event.target.value)} placeholder="Goals, audience, constraints, deliverables, references, and acceptance criteria" className="w-full resize-y border border-ops-border bg-ops-surface px-3 py-3 text-ops-text outline-none placeholder:text-ops-subtle focus:border-ops-accent" /></label>
        <label className="space-y-2 text-sm text-ops-muted md:col-span-2"><span>Import brief text</span><input type="file" accept=".txt,.md,text/plain,text/markdown" onChange={(event) => void importBrief(event)} className="min-h-11 w-full border border-ops-border bg-ops-surface px-3 py-2 text-xs text-ops-muted file:mr-3 file:border-0 file:bg-ops-surface-raised file:px-3 file:py-1 file:text-xs file:text-ops-text" /><span className="block text-xs text-ops-subtle">TXT or Markdown, up to 1 MiB. Imported text replaces the editor content and is saved with the project.</span></label>
      </fieldset>
      <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-ops-border pt-5"><p className="text-xs text-ops-subtle">Saving the project does not start agent work.</p><button type="submit" disabled={saving || name.trim().length < 2} className="inline-flex min-h-11 items-center gap-2 bg-ops-accent-strong px-4 font-semibold text-ops-on-accent hover:bg-ops-accent-strong/90 disabled:cursor-not-allowed disabled:opacity-50"><Save size={16} />{saving ? 'Saving…' : projectId ? 'Save changes' : 'Create project'}</button></footer>
    </form>

    {project && <>
      <section id="project-tasks" className="space-y-3 border-t border-ops-border pt-6"><div className="flex flex-wrap items-baseline justify-between gap-3"><h2 className="text-lg font-semibold">Tasks</h2><span className="text-xs text-ops-muted">{project.tasks.length} persisted</span></div>{project.tasks.length === 0 ? <p className="py-4 text-sm text-ops-muted">Tasks appear here after an owner accepts a validated plan.</p> : <ul className="divide-y divide-ops-border border-y border-ops-border">{project.tasks.map((task) => <li key={task.id} className="flex flex-wrap items-center justify-between gap-3 py-3"><span dir="auto"><span className="block text-sm">{task.title}</span><span className="mt-1 block text-xs text-ops-muted">{task.planKey ?? 'Manual task'}{task.error ? ` · ${task.error}` : ''}</span></span><RecordStatus status={task.status} /></li>)}</ul>}</section>
      <div id="project-runs"><OperationsRunsPanel projectId={project.id} brief={brief} /></div>
      <section id="project-files" className="space-y-3 border-t border-ops-border pt-6"><div className="flex flex-wrap items-baseline justify-between gap-3"><h2 className="text-lg font-semibold">Files</h2><Link href={`/admin/multigraphic-ai/deliverables?projectId=${encodeURIComponent(project.id)}`} className="text-xs text-ops-accent hover:text-ops-text">Open versioned files <ArrowRight size={13} className="ml-1 inline" /></Link></div><p className="text-sm leading-6 text-ops-muted">Project files are private, versioned deliverables or scoped knowledge attachments. There is no separate unversioned file area.</p>{project.artifacts.length === 0 && project.knowledgeDocuments.every((document) => document.attachments.length === 0) ? <p className="text-xs text-ops-subtle">No files are attached to this project.</p> : <ul className="divide-y divide-ops-border border-y border-ops-border">{project.artifacts.map((artifact) => <li key={artifact.id} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm"><span dir="auto">{artifact.title} <span className="text-xs text-ops-muted">· {artifact.versions[0] ? `v${artifact.versions[0].version}` : 'No version'}</span></span><span className="text-xs text-ops-muted">{artifact.versions[0]?.storageKey ? 'Private binary stored' : 'No private binary'}</span></li>)}{project.knowledgeDocuments.flatMap((document) => document.attachments.map((file) => <li key={file.id} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm"><span dir="auto">{file.fileName} <span className="text-xs text-ops-muted">· {document.title}</span></span><a href={`/api/admin/operations/knowledge/attachments/${encodeURIComponent(file.id)}`} className="text-xs text-ops-accent hover:text-ops-text">Private download</a></li>))}</ul>}</section>
      <section id="project-knowledge" className="space-y-3 border-t border-ops-border pt-6"><div className="flex flex-wrap items-baseline justify-between gap-3"><h2 className="text-lg font-semibold">Knowledge</h2><Link href={`/admin/multigraphic-ai/knowledge?scope=PROJECT&projectId=${encodeURIComponent(project.id)}`} className="text-xs text-ops-accent hover:text-ops-text">Knowledge library <ArrowRight size={13} className="ml-1 inline" /></Link></div>{project.knowledgeDocuments.length === 0 ? <p className="py-3 text-sm text-ops-muted">No project-scoped knowledge records are attached.</p> : <ul className="divide-y divide-ops-border border-y border-ops-border">{project.knowledgeDocuments.map((document) => <li key={document.id} className="flex flex-wrap items-center justify-between gap-3 py-3"><span dir="auto"><span className="block text-sm">{document.title}</span><span className="mt-1 block text-xs text-ops-muted">{document.scope.replaceAll('_', ' ')} · {document.evidenceStatus.replaceAll('_', ' ')}</span></span><RecordStatus status={document.status} /></li>)}</ul>}</section>
      <section id="project-deliverables" className="space-y-3 border-t border-ops-border pt-6"><div className="flex flex-wrap items-baseline justify-between gap-3"><h2 className="text-lg font-semibold">Deliverables</h2><Link href={`/admin/multigraphic-ai/deliverables?projectId=${encodeURIComponent(project.id)}`} className="text-xs text-ops-accent hover:text-ops-text">Review versions <ArrowRight size={13} className="ml-1 inline" /></Link></div>{project.artifacts.length === 0 ? <p className="py-3 text-sm text-ops-muted">No deliverable artifacts are recorded yet.</p> : <ul className="divide-y divide-ops-border border-y border-ops-border">{project.artifacts.map((artifact) => <li key={artifact.id} className="flex flex-wrap items-center justify-between gap-3 py-3"><span dir="auto"><span className="block text-sm">{artifact.title}</span><span className="mt-1 block text-xs text-ops-muted">{artifact.kind} · {artifact.versions[0] ? `Version ${artifact.versions[0].version}` : 'No version yet'}</span></span><RecordStatus status={artifact.status} /></li>)}</ul>}</section>
      <section id="project-approvals" className="space-y-3 border-t border-ops-border pt-6"><div className="flex flex-wrap items-baseline justify-between gap-3"><h2 className="text-lg font-semibold">Approvals</h2><Link href={`/admin/multigraphic-ai/approvals?projectId=${encodeURIComponent(project.id)}`} className="text-xs text-ops-accent hover:text-ops-text">Open review queue <ArrowRight size={13} className="ml-1 inline" /></Link></div><p className="text-sm text-ops-muted">{pendingWorkflowApprovals + pendingArtifactApprovals} pending approvals for this project</p></section>
      <section id="project-activity" className="space-y-3 border-t border-ops-border pt-6"><div className="flex flex-wrap items-baseline justify-between gap-3"><h2 className="text-lg font-semibold">Activity</h2><Link href={`/admin/multigraphic-ai/activity?projectId=${encodeURIComponent(project.id)}`} className="text-xs text-ops-accent hover:text-ops-text">Workspace activity <ArrowRight size={13} className="ml-1 inline" /></Link></div>{activityItems.length === 0 ? <p className="py-3 text-sm text-ops-muted">No project workflow or owner audit events have been recorded.</p> : <ol className="divide-y divide-ops-border border-y border-ops-border">{activityItems.slice(0, 8).map((item) => <li key={item.id} className="py-3"><p className="text-sm font-medium">{item.type.replaceAll('.', ' ')}</p><p className="mt-1 text-xs text-ops-muted">{item.message || item.actor} {item.taskKey ? `· ${item.taskKey}` : ''}</p><time className="mt-1 block text-xs text-ops-subtle">{new Date(item.createdAt).toLocaleString()}</time></li>)}</ol>}</section>
    </>}
  </section>;
}

export default function OperationsProjectWorkspace({ projectId, mode = 'list' }: { projectId?: string; mode?: 'list' | 'new' | 'detail' }) {
  const [projects, setProjects] = useState<ProjectListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'ALL' | ProjectStatus>('ALL');
  const [confirmStatus, setConfirmStatus] = useState<{ projectId: string; status: 'ARCHIVED' | 'DRAFT' } | null>(null);
  const [savingStatusId, setSavingStatusId] = useState('');

  const loadProjects = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/admin/operations/projects', { cache: 'no-store' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Projects could not be loaded.');
      setProjects(data.projects as ProjectListItem[]);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Projects could not be loaded.');
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    if (mode !== 'list') return;
    const controller = new AbortController();
    fetch('/api/admin/operations/projects', { cache: 'no-store', signal: controller.signal }).then(async response => { const data = await response.json(); if (!response.ok) throw new Error(data.error || 'Projects could not be loaded.'); setProjects(data.projects); }).catch(error => { if (!controller.signal.aborted) setError(error.message); }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [mode]);

  const updateProjectStatus = async (project: ProjectListItem, nextStatus: 'ARCHIVED' | 'DRAFT') => {
    setSavingStatusId(project.id);
    setError('');
    try {
      const response = await fetch(`/api/admin/operations/projects/${encodeURIComponent(project.id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Project status could not be updated.');
      setProjects((current) => current.map((item) => item.id === project.id ? { ...item, status: nextStatus, updatedAt: result.project.updatedAt } : item));
      setConfirmStatus(null);
    } catch (statusError) {
      setError(statusError instanceof Error ? statusError.message : 'Project status could not be updated.');
    } finally {
      setSavingStatusId('');
    }
  };

  if (mode === 'new') return <ProjectForm />;
  if (mode === 'detail') return <ProjectForm projectId={projectId} />;

  const visibleProjects = projects.filter((project) => {
    const matchesText = `${project.name} ${project.summary} ${project.slug}`.toLowerCase().includes(query.toLowerCase());
    return matchesText && (filter === 'ALL' || project.status === filter);
  });

  return <section className="space-y-6">
    <header className="flex flex-wrap items-end justify-between gap-4 border-b border-ops-border pb-5"><div><p className="text-xs font-medium uppercase text-ops-accent">Owner workspace</p><h1 className="mt-2 text-3xl font-semibold">Projects</h1><p className="mt-2 text-sm text-ops-muted">Briefs, reviewed plans, tasks, and private deliverables.</p></div><Link href="/admin/multigraphic-ai/projects/new" className="inline-flex min-h-11 items-center gap-2 bg-ops-accent-strong px-4 text-sm font-semibold text-ops-on-accent hover:bg-ops-accent-strong/90"><Plus size={16} /> New project</Link></header>
    {error && <ErrorNotice message={error} onRetry={() => void loadProjects()} />}
    <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_190px]"><label className="sr-only" htmlFor="operations-project-search">Search projects</label><input id="operations-project-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search projects" className="min-h-11 border border-ops-border bg-ops-surface px-3 text-sm text-ops-text outline-none placeholder:text-ops-subtle focus:border-ops-accent" /><label className="sr-only" htmlFor="operations-project-status">Filter by status</label><select id="operations-project-status" value={filter} onChange={(event) => setFilter(event.target.value as 'ALL' | ProjectStatus)} className="min-h-11 border border-ops-border bg-ops-surface px-3 text-sm text-ops-text outline-none focus:border-ops-accent"><option value="ALL">All statuses</option>{projectStatuses.map((value) => <option key={value} value={value}>{value.replace('_', ' ')}</option>)}</select></div>
    {loading && <div role="status" aria-label="Loading projects" className="space-y-2">{[1, 2, 3].map((item) => <div key={item} className="h-16 animate-pulse border border-ops-border bg-ops-surface" />)}</div>}
    {!loading && !error && projects.length === 0 && <div className="border-y border-ops-border py-10"><h2 className="text-base font-semibold">No projects yet</h2><p className="mt-2 text-sm text-ops-muted">Create a project to save its brief and begin owner-reviewed planning. No sample activity is preloaded.</p><Link href="/admin/multigraphic-ai/projects/new" className="mt-4 inline-flex min-h-10 items-center gap-2 border border-ops-border px-3 text-sm hover:border-ops-accent"><Plus size={15} /> Create a project</Link></div>}
    {!loading && !error && projects.length > 0 && visibleProjects.length === 0 && <p className="border-y border-ops-border px-4 py-8 text-center text-sm text-ops-muted">No projects match these filters.</p>}
    {!loading && !error && visibleProjects.length > 0 && <div className="overflow-x-auto border-y border-ops-border"><table className="w-full min-w-[760px] border-collapse text-left text-sm"><thead className="border-b border-ops-border text-xs uppercase text-ops-muted"><tr><th scope="col" className="px-3 py-3 font-medium">Project</th><th scope="col" className="px-3 py-3 font-medium">Client</th><th scope="col" className="px-3 py-3 font-medium">Status</th><th scope="col" className="px-3 py-3 font-medium">Tasks</th><th scope="col" className="px-3 py-3 font-medium">Updated</th><th scope="col" aria-label="Project actions" className="px-3 py-3 font-medium" /></tr></thead><tbody className="divide-y divide-ops-border">{visibleProjects.map((project) => <tr key={project.id}>
      <th scope="row" className="max-w-[360px] px-3 py-4 font-medium"><Link href={`/admin/multigraphic-ai/projects/${project.id}`} className="inline-flex min-h-8 flex-col justify-center text-left hover:text-ops-accent"><span dir="auto" className="truncate">{project.name}</span><span className="mt-1 truncate text-xs font-normal text-ops-muted">{project.summary || project.slug}</span></Link></th><td className="px-3 py-4 text-ops-muted">{project.client?.name ?? 'Internal'}</td><td className="px-3 py-4"><RecordStatus status={project.status} /></td><td className="px-3 py-4 tabular-nums text-ops-muted">{project._count.tasks}</td><td className="whitespace-nowrap px-3 py-4 text-xs text-ops-muted">{new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(project.updatedAt))}</td><td className="px-3 py-4"><div className="flex items-center justify-end gap-2"><Link href={`/admin/multigraphic-ai/projects/${project.id}`} aria-label={`Open ${project.name}`} className="inline-flex size-9 items-center justify-center text-ops-muted hover:text-ops-accent"><ArrowRight size={16} /></Link>{confirmStatus?.projectId === project.id ? <><button type="button" disabled={savingStatusId === project.id} onClick={() => void updateProjectStatus(project, confirmStatus.status)} className="min-h-9 border border-ops-amber/50 px-2 text-xs text-ops-amber disabled:opacity-50">{savingStatusId === project.id ? 'Saving…' : confirmStatus.status === 'ARCHIVED' ? 'Confirm archive' : 'Confirm restore'}</button><button type="button" onClick={() => setConfirmStatus(null)} className="min-h-9 px-2 text-xs text-ops-muted">Cancel</button></> : project.status === 'ARCHIVED' ? <button type="button" onClick={() => setConfirmStatus({ projectId: project.id, status: 'DRAFT' })} className="min-h-9 px-2 text-xs text-ops-muted hover:text-ops-text">Restore</button> : <button type="button" onClick={() => setConfirmStatus({ projectId: project.id, status: 'ARCHIVED' })} aria-label={`Archive ${project.name}`} className="min-h-9 px-2 text-xs text-ops-muted hover:text-ops-amber">Archive</button>}</div></td>
    </tr>)}</tbody></table></div>}
  </section>;
}