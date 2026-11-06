'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, FilePlus2, RefreshCw, Search, Upload } from 'lucide-react';

type KnowledgeScope = 'COMPANY' | 'OWNER_PREFERENCES' | 'CLIENT' | 'PROJECT' | 'AGENT_INSTRUCTIONS' | 'LESSONS_LEARNED';
type KnowledgeStatus = 'DRAFT' | 'APPROVED' | 'SUPERSEDED' | 'ARCHIVED';
type EvidenceStatus = 'OWNER_CONFIRMED' | 'SOURCE_SUPPORTED' | 'ASSUMPTION' | 'UNVERIFIED';

type KnowledgeDocument = {
  id: string;
  knowledgeKey: string;
  version: number;
  title: string;
  scope: KnowledgeScope;
  sourceType: 'OWNER_PROVIDED' | 'MANUAL_ENTRY' | 'UPLOADED_FILE';
  source: string;
  status: KnowledgeStatus;
  evidenceStatus: EvidenceStatus;
  extractionStatus: 'SUCCEEDED' | 'FAILED' | 'NOT_APPLICABLE';
  extractionError?: string | null;
  content: string;
  snippet?: string;
  clientId?: string | null;
  projectId?: string | null;
  agentDefinitionId?: string | null;
  client?: { id: string; name: string } | null;
  project?: { id: string; name: string } | null;
  agent?: { id: string; name: string } | null;
  attachments?: Array<{ id: string; fileName: string; contentType: string; fileSize: number; checksum: string; createdAt: string }>;
  updatedAt: string;
  _count?: { attachments: number };
};

type ScopeOptions = {
  clients: Array<{ id: string; name: string }>;
  projects: Array<{ id: string; name: string; clientId: string | null }>;
  agents: Array<{ id: string; name: string; key: string }>;
};

const scopeOptions: Array<{ value: KnowledgeScope; label: string }> = [
  { value: 'COMPANY', label: 'Company knowledge' },
  { value: 'OWNER_PREFERENCES', label: 'Owner preferences' },
  { value: 'CLIENT', label: 'Client knowledge' },
  { value: 'PROJECT', label: 'Project knowledge' },
  { value: 'AGENT_INSTRUCTIONS', label: 'Agent instructions' },
  { value: 'LESSONS_LEARNED', label: 'Lessons learned' },
];

const statusClass: Record<KnowledgeStatus, string> = {
  DRAFT: 'border-ops-amber/40 text-ops-amber',
  APPROVED: 'border-ops-green/40 text-ops-green',
  SUPERSEDED: 'border-ops-border-strong text-ops-muted',
  ARCHIVED: 'border-ops-border text-ops-subtle',
};

function scopeLabel(scope: KnowledgeScope) {
  return scopeOptions.find((option) => option.value === scope)?.label ?? scope;
}

function ErrorNotice({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return <div role="alert" className="flex flex-wrap items-center justify-between gap-3 border border-ops-red/40 bg-ops-red/10 px-4 py-3 text-sm text-ops-red"><p>{message}</p>{onRetry && <button type="button" onClick={onRetry} className="inline-flex min-h-9 items-center gap-2 underline underline-offset-4"><RefreshCw size={14} /> Try again</button>}</div>;
}

function ScopeSelect({ value, onChange }: { value: KnowledgeScope; onChange: (scope: KnowledgeScope) => void }) {
  return <label className="space-y-2 text-sm text-ops-text"><span>Scope</span><select value={value} onChange={(event) => onChange(event.target.value as KnowledgeScope)} className="min-h-11 w-full border border-ops-border-strong bg-ops-bg px-3 text-ops-text outline-none focus:border-ops-accent">{scopeOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>;
}

function KnowledgeForm({ options }: { options: ScopeOptions }) {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [scope, setScope] = useState<KnowledgeScope>('COMPANY');
  const [source, setSource] = useState('');
  const [evidenceStatus, setEvidenceStatus] = useState<EvidenceStatus>('UNVERIFIED');
  const [clientId, setClientId] = useState('');
  const [projectId, setProjectId] = useState('');
  const [agentDefinitionId, setAgentDefinitionId] = useState('');
  const [content, setContent] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const relevantProjects = options.projects.filter((project) => !clientId || !project.clientId || project.clientId === clientId);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError('');

    const form = new FormData();
    form.set('title', title);
    form.set('scope', scope);
    form.set('source', source);
    form.set('evidenceStatus', evidenceStatus);
    if (clientId) form.set('clientId', clientId);
    if (projectId) form.set('projectId', projectId);
    if (agentDefinitionId) form.set('agentDefinitionId', agentDefinitionId);
    if (file) form.set('file', file);
    else form.set('content', content);

    try {
      const response = await fetch('/api/admin/operations/knowledge', { method: 'POST', body: form });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || 'Knowledge record could not be saved.');
        return;
      }
      router.replace(`/admin/multigraphic-ai/knowledge/${data.document.id}`);
      router.refresh();
    } catch {
      setError('Could not connect to the operations service. The record was not confirmed.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="space-y-6">
      <Link href="/admin/multigraphic-ai/knowledge" className="inline-flex min-h-9 items-center gap-2 text-sm text-ops-muted hover:text-ops-text"><ArrowLeft size={16} /> Knowledge</Link>
      <header className="border-b border-ops-border pb-5"><p className="text-xs font-medium uppercase text-ops-accent">Multigraphic AI / Knowledge</p><h1 className="mt-2 text-2xl font-semibold text-ops-text">Add knowledge</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-ops-muted">Uploaded content is extracted as plain text and stored as a draft. It is not treated as an instruction or fact until reviewed.</p></header>
      {error && <ErrorNotice message={error} />}
      <form onSubmit={submit} className="space-y-6">
        <fieldset disabled={saving} className="grid gap-5 md:grid-cols-2">
          <label className="space-y-2 text-sm text-ops-text"><span>Title *</span><input required minLength={2} maxLength={180} value={title} onChange={(event) => setTitle(event.target.value)} className="min-h-11 w-full border border-ops-border-strong bg-ops-bg px-3 text-ops-text outline-none focus:border-ops-accent" /></label>
          <ScopeSelect value={scope} onChange={(value) => { setScope(value); setClientId(''); setProjectId(''); setAgentDefinitionId(''); }} />
          <label className="space-y-2 text-sm text-ops-text"><span>Source *</span><input required maxLength={500} value={source} onChange={(event) => setSource(event.target.value)} placeholder="Owner-provided brief, policy URL, uploaded filename..." className="min-h-11 w-full border border-ops-border-strong bg-ops-bg px-3 text-ops-text outline-none placeholder:text-ops-subtle focus:border-ops-accent" /></label>
          <label className="space-y-2 text-sm text-ops-text"><span>Evidence status</span><select value={evidenceStatus} onChange={(event) => setEvidenceStatus(event.target.value as EvidenceStatus)} className="min-h-11 w-full border border-ops-border-strong bg-ops-bg px-3 text-ops-text outline-none focus:border-ops-accent"><option value="UNVERIFIED">Unverified</option><option value="ASSUMPTION">Assumption</option><option value="SOURCE_SUPPORTED">Source supported</option><option value="OWNER_CONFIRMED">Owner confirmed</option></select></label>
          {(scope === 'CLIENT' || scope === 'LESSONS_LEARNED') && <label className="space-y-2 text-sm text-ops-text"><span>Client {scope === 'CLIENT' ? '*' : ''}</span><select required={scope === 'CLIENT'} value={clientId} onChange={(event) => { setClientId(event.target.value); setProjectId(''); }} className="min-h-11 w-full border border-ops-border-strong bg-ops-bg px-3 text-ops-text outline-none focus:border-ops-accent"><option value="">{options.clients.length ? 'Select client' : 'No clients available'}</option>{options.clients.map((client) => <option key={client.id} value={client.id}>{client.name}</option>)}</select></label>}
          {(scope === 'PROJECT' || scope === 'LESSONS_LEARNED') && <label className="space-y-2 text-sm text-ops-text"><span>Project {scope === 'PROJECT' ? '*' : ''}</span><select required={scope === 'PROJECT'} value={projectId} onChange={(event) => setProjectId(event.target.value)} className="min-h-11 w-full border border-ops-border-strong bg-ops-bg px-3 text-ops-text outline-none focus:border-ops-accent"><option value="">{options.projects.length ? 'Select project' : 'No projects available'}</option>{relevantProjects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}</select></label>}
          {scope === 'AGENT_INSTRUCTIONS' && <label className="space-y-2 text-sm text-ops-text"><span>Agent *</span><select required value={agentDefinitionId} onChange={(event) => setAgentDefinitionId(event.target.value)} className="min-h-11 w-full border border-ops-border-strong bg-ops-bg px-3 text-ops-text outline-none focus:border-ops-accent"><option value="">Select agent</option>{options.agents.map((agent) => <option key={agent.id} value={agent.id}>{agent.name}</option>)}</select></label>}
          <label className="space-y-2 text-sm text-ops-text md:col-span-2"><span>Document</span><input type="file" accept=".txt,.md,.csv,.pdf,.docx,text/plain,text/markdown,text/csv,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={(event) => setFile(event.target.files?.[0] ?? null)} className="min-h-11 w-full border border-ops-border-strong bg-ops-bg px-3 py-2 text-sm text-ops-text file:mr-3 file:border-0 file:bg-ops-surface-raised file:px-3 file:py-1 file:text-ops-text" /><span className="block text-xs text-ops-subtle">TXT, Markdown, CSV, PDF, or DOCX · 4 MiB maximum · private attachment storage</span></label>
          {!file && <label className="space-y-2 text-sm text-ops-text md:col-span-2"><span>Or enter text</span><textarea rows={9} maxLength={250000} value={content} dir="auto" onChange={(event) => setContent(event.target.value)} placeholder="Knowledge text" className="w-full resize-y border border-ops-border-strong bg-ops-bg px-3 py-3 text-ops-text outline-none placeholder:text-ops-subtle focus:border-ops-accent" /></label>}
        </fieldset>
        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-ops-border pt-5"><p className="text-xs text-ops-subtle">New records start as draft. Search returns approved records only.</p><button type="submit" disabled={saving || !title.trim() || !source.trim() || (!file && !content.trim())} className="inline-flex min-h-11 items-center gap-2 bg-ops-accent-strong px-4 font-semibold text-ops-on-accent hover:bg-ops-accent-strong/90 disabled:cursor-not-allowed disabled:opacity-50"><Upload size={15} />{saving ? 'Processing…' : 'Save draft'}</button></footer>
      </form>
    </section>
  );
}

function KnowledgeList() {
  const [options, setOptions] = useState<ScopeOptions>({ clients: [], projects: [], agents: [] });
  const [documents, setDocuments] = useState<KnowledgeDocument[]>([]);
  const [scope, setScope] = useState<KnowledgeScope>('COMPANY');
  const [clientId, setClientId] = useState('');
  const [projectId, setProjectId] = useState('');
  const [agentDefinitionId, setAgentDefinitionId] = useState('');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchMode, setSearchMode] = useState<'keyword' | 'list'>('list');

  const loadDocuments = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ scope });
      if (query.trim()) params.set('q', query.trim());
      if (clientId) params.set('clientId', clientId);
      if (projectId) params.set('projectId', projectId);
      if (agentDefinitionId) params.set('agentDefinitionId', agentDefinitionId);
      const response = await fetch(`/api/admin/operations/knowledge?${params}`, { cache: 'no-store' });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || 'Knowledge records could not be loaded.');
        return;
      }
      setDocuments(data.documents as KnowledgeDocument[]);
      setSearchMode(query.trim() ? 'keyword' : 'list');
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Knowledge records could not be loaded.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const searchParams = new URLSearchParams(window.location.search);
        const requestedScope = scopeOptions.some((option) => option.value === searchParams.get('scope'))
          ? searchParams.get('scope') as KnowledgeScope
          : 'COMPANY';
        const requestedClientId = searchParams.get('clientId') ?? '';
        const requestedProjectId = searchParams.get('projectId') ?? '';
        const requestedAgentId = searchParams.get('agentDefinitionId') ?? '';
        const response = await fetch('/api/admin/operations/knowledge/options', { cache: 'no-store' });
        const data = await response.json();
        if (!active) return;
        if (!response.ok) throw new Error(data.error || 'Knowledge scopes could not be loaded.');
        setOptions(data as ScopeOptions);
        setScope(requestedScope);
        setClientId(requestedClientId);
        setProjectId(requestedProjectId);
        setAgentDefinitionId(requestedAgentId);
        const params = new URLSearchParams({ scope: requestedScope });
        if (requestedClientId) params.set('clientId', requestedClientId);
        if (requestedProjectId) params.set('projectId', requestedProjectId);
        if (requestedAgentId) params.set('agentDefinitionId', requestedAgentId);
        const listResponse = await fetch(`/api/admin/operations/knowledge?${params}`, { cache: 'no-store' });
        const listData = await listResponse.json();
        if (!active) return;
        if (!listResponse.ok) throw new Error(listData.error || 'Knowledge records could not be loaded.');
        setDocuments(listData.documents as KnowledgeDocument[]);
      } catch (loadError) {
        if (active) setError(loadError instanceof Error ? loadError.message : 'Knowledge records could not be loaded.');
      } finally {
        if (active) setLoading(false);
      }
    };
    void load();
    return () => { active = false; };
  }, []);

  const search = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void loadDocuments();
  };

  const setScopeValue = (value: KnowledgeScope) => {
    setScope(value);
    setClientId('');
    setProjectId('');
    setAgentDefinitionId('');
  };

  return (
    <section className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-ops-border pb-5"><div><p className="text-xs font-medium uppercase text-ops-accent">Multigraphic AI / Knowledge</p><h1 className="mt-2 text-2xl font-semibold text-ops-text">Knowledge library</h1><p className="mt-2 text-sm text-ops-muted">Search is keyword-based and limited to approved records in one exact scope.</p></div><Link href="/admin/multigraphic-ai/knowledge/new" className="inline-flex min-h-11 items-center gap-2 bg-ops-accent-strong px-4 text-sm font-semibold text-ops-on-accent hover:bg-ops-accent-strong/90"><FilePlus2 size={16} /> Add knowledge</Link></header>

      <form onSubmit={search} className="space-y-3 border-b border-ops-border pb-5">
        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
          <label className="relative"><span className="sr-only">Search approved knowledge</span><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ops-subtle" /><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search approved knowledge" className="min-h-11 w-full border border-ops-border-strong bg-ops-bg pl-9 pr-3 text-sm text-ops-text outline-none placeholder:text-ops-subtle focus:border-ops-accent" /></label>
          <button type="submit" disabled={loading} className="min-h-11 border border-ops-border-strong px-4 text-sm text-ops-text hover:border-ops-accent disabled:opacity-50">Search</button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <ScopeSelect value={scope} onChange={setScopeValue} />
          {(scope === 'CLIENT' || scope === 'LESSONS_LEARNED') && <label className="space-y-2 text-sm text-ops-text"><span>Client</span><select value={clientId} onChange={(event) => setClientId(event.target.value)} className="min-h-11 w-full border border-ops-border-strong bg-ops-bg px-3 text-ops-text"><option value="">{scope === 'CLIENT' ? 'Select exact client' : 'Any client'}</option>{options.clients.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>}
          {(scope === 'PROJECT' || scope === 'LESSONS_LEARNED') && <label className="space-y-2 text-sm text-ops-text"><span>Project</span><select value={projectId} onChange={(event) => setProjectId(event.target.value)} className="min-h-11 w-full border border-ops-border-strong bg-ops-bg px-3 text-ops-text"><option value="">{scope === 'PROJECT' ? 'Select exact project' : 'Any project'}</option>{options.projects.filter((item) => !clientId || !item.clientId || item.clientId === clientId).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>}
          {scope === 'AGENT_INSTRUCTIONS' && <label className="space-y-2 text-sm text-ops-text"><span>Agent</span><select value={agentDefinitionId} onChange={(event) => setAgentDefinitionId(event.target.value)} className="min-h-11 w-full border border-ops-border-strong bg-ops-bg px-3 text-ops-text"><option value="">Select exact agent</option>{options.agents.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>}
        </div>
      </form>

      {!query.trim() && <p className="text-xs text-ops-subtle">Drafts are visible in the list. Search results include approved records only.</p>}
      {error && <ErrorNotice message={error} onRetry={() => void loadDocuments()} />}
      {loading && <div role="status" aria-label="Loading knowledge" className="space-y-2">{[1, 2, 3].map((item) => <div key={item} className="h-20 animate-pulse border border-ops-border bg-ops-surface/70" />)}</div>}
      {!loading && !error && documents.length === 0 && <div className="border border-dashed border-ops-border-strong px-5 py-12 text-center"><h2 className="text-lg font-medium text-ops-text">No records in this scope</h2><p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-ops-muted">Company and owner knowledge stays separate from client and project records. No source material is copied automatically.</p><Link href="/admin/multigraphic-ai/knowledge/new" className="mt-5 inline-flex min-h-10 items-center gap-2 border border-ops-border-strong px-3 text-sm text-ops-text hover:border-ops-accent"><FilePlus2 size={15} /> Add knowledge</Link></div>}
      {!loading && documents.length > 0 && <ul className="divide-y divide-ops-border border-y border-ops-border">{documents.map((document) => <li key={document.id} className="flex flex-wrap items-center justify-between gap-4 py-4"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h2 dir="auto" className="truncate font-medium text-ops-text">{document.title}</h2><span className={`border px-2 py-0.5 text-[10px] ${statusClass[document.status]}`}>{document.status}</span><span className="text-xs text-ops-subtle">v{document.version}</span></div><p className="mt-1 text-sm text-ops-muted">{scopeLabel(document.scope)}{document.client ? ` · ${document.client.name}` : ''}{document.project ? ` · ${document.project.name}` : ''}{document.agent ? ` · ${document.agent.name}` : ''}</p><p className="mt-1 truncate text-xs text-ops-subtle" dir="auto">{document.source} · {document.evidenceStatus.replaceAll('_', ' ').toLowerCase()}{document._count?.attachments ? ` · ${document._count.attachments} attachment(s)` : ''}</p>{searchMode === 'keyword' && <p dir="auto" className="mt-3 max-w-3xl text-sm leading-6 text-ops-text">{document.snippet ?? ''}</p>}</div><Link href={`/admin/multigraphic-ai/knowledge/${document.id}`} aria-label={`Open ${document.title}`} className="inline-flex size-9 items-center justify-center text-ops-muted hover:text-ops-text"><ArrowRight size={16} /></Link></li>)}</ul>}
      {!loading && !error && documents.length === 100 && <p className="text-xs text-ops-subtle">Showing the latest 100 matching records. Refine the scope or search.</p>}
    </section>
  );
}

function KnowledgeDetail({ documentId }: { documentId: string }) {
  const router = useRouter();
  const [document, setDocument] = useState<KnowledgeDocument | null>(null);
  const [history, setHistory] = useState<Array<{ id: string; version: number; title: string; status: KnowledgeStatus; evidenceStatus: EvidenceStatus; updatedAt: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [title, setTitle] = useState('');
  const [source, setSource] = useState('');
  const [evidenceStatus, setEvidenceStatus] = useState<EvidenceStatus>('UNVERIFIED');
  const [content, setContent] = useState('');

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await fetch(`/api/admin/operations/knowledge/${encodeURIComponent(documentId)}`, { cache: 'no-store' });
        const data = await response.json();
        if (!active) return;
        if (!response.ok) {
          setError(data.error || 'Knowledge record could not be loaded.');
          return;
        }
        const record = data.document as KnowledgeDocument;
        setDocument(record);
        setHistory(data.history);
        setTitle(record.title);
        setSource(record.source);
        setEvidenceStatus(record.evidenceStatus);
        setContent(record.content);
      } catch {
        if (active) setError('Could not connect to the operations service. Check the database setup and try again.');
      } finally {
        if (active) setLoading(false);
      }
    };
    void load();
    return () => { active = false; };
  }, [documentId]);

  const createVersion = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');
    try {
      const response = await fetch(`/api/admin/operations/knowledge/${encodeURIComponent(documentId)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, source, evidenceStatus, content }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || 'New knowledge version could not be created.');
        return;
      }
      setMessage(`Draft version ${data.document.version} created. Previous versions remain unchanged.`);
      router.push(`/admin/multigraphic-ai/knowledge/${data.document.id}`);
    } catch {
      setError('Could not connect to the operations service. The new version was not confirmed.');
    } finally {
      setSaving(false);
    }
  };

  const changeStatus = async (status: 'APPROVED' | 'ARCHIVED') => {
    setSaving(true);
    setError('');
    setMessage('');
    try {
      const response = await fetch(`/api/admin/operations/knowledge/${encodeURIComponent(documentId)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || 'Knowledge status could not be changed.');
        return;
      }
      setDocument(data.document as KnowledgeDocument);
      setMessage(status === 'APPROVED' ? 'Knowledge version approved and searchable.' : 'Knowledge version archived.');
      window.location.reload();
    } catch {
      setError('Could not connect to the operations service. The status change was not confirmed.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div role="status" aria-label="Loading knowledge record" className="space-y-4"><div className="h-8 w-64 animate-pulse bg-ops-surface-raised" /><div className="h-48 animate-pulse bg-ops-surface" /></div>;
  if (!document) return <section className="space-y-5"><ErrorNotice message={error || 'Knowledge record not found.'} onRetry={() => window.location.reload()} /><Link href="/admin/multigraphic-ai/knowledge" className="inline-flex items-center gap-2 text-sm text-ops-text hover:text-ops-text"><ArrowLeft size={16} /> Knowledge</Link></section>;

  return (
    <section className="space-y-7">
      <Link href="/admin/multigraphic-ai/knowledge" className="inline-flex min-h-9 items-center gap-2 text-sm text-ops-muted hover:text-ops-text"><ArrowLeft size={16} /> Knowledge</Link>
      <header className="flex flex-wrap items-start justify-between gap-4 border-b border-ops-border pb-5"><div><p className="text-xs font-medium uppercase text-ops-accent">{scopeLabel(document.scope)} · version {document.version}</p><h1 dir="auto" className="mt-2 text-2xl font-semibold text-ops-text">{document.title}</h1><p dir="auto" className="mt-2 text-sm text-ops-muted">{document.source}{document.client ? ` · ${document.client.name}` : ''}{document.project ? ` · ${document.project.name}` : ''}{document.agent ? ` · ${document.agent.name}` : ''}</p></div><div className="flex items-center gap-2"><span className={`border px-2 py-1 text-xs ${statusClass[document.status]}`}>{document.status}</span><span className="border border-ops-border-strong px-2 py-1 text-xs text-ops-text">{document.evidenceStatus.replaceAll('_', ' ')}</span></div></header>
      {error && <ErrorNotice message={error} />}
      {message && <p role="status" className="border border-ops-green/40 bg-ops-green/10 px-4 py-3 text-sm text-ops-accent">{message}</p>}
      {document.extractionStatus === 'FAILED' && <ErrorNotice message={document.extractionError || 'Text extraction failed.'} />}

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="space-y-7">
          <section><h2 className="mb-3 text-sm font-semibold text-ops-text">Extracted text</h2><pre dir="auto" className="max-h-[560px] overflow-auto whitespace-pre-wrap border border-ops-border bg-ops-bg/70 p-4 text-sm leading-6 text-ops-text">{document.content}</pre></section>
          {document.attachments?.length ? <section><h2 className="mb-3 text-sm font-semibold text-ops-text">Attachments</h2><ul className="divide-y divide-ops-border border-y border-ops-border">{document.attachments.map((attachment) => <li key={attachment.id} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm"><div><p className="text-ops-text">{attachment.fileName}</p><p className="mt-1 text-xs text-ops-subtle">{attachment.contentType} · {(attachment.fileSize / 1024).toFixed(1)} KiB · SHA-256 {attachment.checksum.slice(0, 12)}…</p></div><a href={`/api/admin/operations/knowledge/attachments/${attachment.id}`} className="min-h-9 border border-ops-border-strong px-3 py-2 text-xs text-ops-text hover:border-ops-accent hover:text-ops-text">Download</a></li>)}</ul></section> : null}
          {document.status === 'DRAFT' && <form onSubmit={createVersion} className="space-y-4 border-t border-ops-border pt-6"><div><h2 className="text-lg font-semibold text-ops-text">Create a new draft version</h2><p className="mt-1 text-sm text-ops-muted">Edits create a new record in this version group. The current version remains unchanged.</p></div><label className="block space-y-2 text-sm text-ops-text"><span>Title</span><input required value={title} dir="auto" onChange={(event) => setTitle(event.target.value)} className="min-h-11 w-full border border-ops-border-strong bg-ops-bg px-3 text-ops-text" /></label><label className="block space-y-2 text-sm text-ops-text"><span>Source</span><input required value={source} dir="auto" onChange={(event) => setSource(event.target.value)} className="min-h-11 w-full border border-ops-border-strong bg-ops-bg px-3 text-ops-text" /></label><label className="block space-y-2 text-sm text-ops-text"><span>Evidence status</span><select value={evidenceStatus} onChange={(event) => setEvidenceStatus(event.target.value as EvidenceStatus)} className="min-h-11 w-full border border-ops-border-strong bg-ops-bg px-3 text-ops-text"><option value="UNVERIFIED">Unverified</option><option value="ASSUMPTION">Assumption</option><option value="SOURCE_SUPPORTED">Source supported</option><option value="OWNER_CONFIRMED">Owner confirmed</option></select></label><label className="block space-y-2 text-sm text-ops-text"><span>Content</span><textarea required rows={8} maxLength={250000} value={content} dir="auto" onChange={(event) => setContent(event.target.value)} className="w-full resize-y border border-ops-border-strong bg-ops-bg px-3 py-3 text-ops-text" /></label><button type="submit" disabled={saving} className="min-h-10 border border-ops-border-strong px-4 text-sm text-ops-text hover:border-ops-accent disabled:opacity-50">{saving ? 'Saving…' : 'Save new draft version'}</button></form>}
        </div>

        <aside className="space-y-6 border-t border-ops-border pt-5 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
          <section><h2 className="mb-3 text-xs font-semibold uppercase text-ops-muted">Review</h2><p className="text-sm leading-6 text-ops-muted">Approved text may be retrieved by agents that declare this scope. Retrieved content remains untrusted data and cannot change agent instructions.</p>{document.status === 'DRAFT' && <button type="button" disabled={saving} onClick={() => void changeStatus('APPROVED')} className="mt-4 min-h-10 w-full bg-ops-accent-strong px-3 text-sm font-semibold text-ops-on-accent hover:bg-ops-accent-strong/90 disabled:opacity-50">Approve version</button>}{document.status !== 'ARCHIVED' && <button type="button" disabled={saving} onClick={() => void changeStatus('ARCHIVED')} className="mt-3 min-h-10 w-full border border-ops-border-strong px-3 text-sm text-ops-text hover:border-ops-red/40 disabled:opacity-50">Archive version</button>}</section>
          <section><h2 className="mb-3 text-xs font-semibold uppercase text-ops-muted">Version history</h2><ol className="divide-y divide-ops-border border-y border-ops-border">{history.map((item) => <li key={item.id} className="py-3"><Link href={`/admin/multigraphic-ai/knowledge/${item.id}`} className={`block text-sm ${item.id === document.id ? 'text-ops-accent' : 'text-ops-text hover:text-ops-text'}`}>{item.title} · v{item.version}</Link><p className="mt-1 text-xs text-ops-subtle">{item.status} · {item.evidenceStatus.replaceAll('_', ' ').toLowerCase()}</p></li>)}</ol></section>
        </aside>
      </div>
    </section>
  );
}

export default function KnowledgeWorkspace({ mode = 'list', documentId }: { mode?: 'list' | 'new' | 'detail'; documentId?: string }) {
  const [options, setOptions] = useState<ScopeOptions>({ clients: [], projects: [], agents: [] });
  const [optionsError, setOptionsError] = useState('');

  useEffect(() => {
    if (mode === 'detail') return;
    let active = true;
    const load = async () => {
      try {
        const response = await fetch('/api/admin/operations/knowledge/options', { cache: 'no-store' });
        const data = await response.json();
        if (!active) return;
        if (!response.ok) throw new Error(data.error || 'Knowledge options could not be loaded.');
        setOptions(data as ScopeOptions);
      } catch (error) {
        if (active) setOptionsError(error instanceof Error ? error.message : 'Knowledge options could not be loaded.');
      }
    };
    void load();
    return () => { active = false; };
  }, [mode]);

  if (mode === 'new') return <>{optionsError ? <ErrorNotice message={optionsError} /> : null}<KnowledgeForm options={options} /></>;
  if (mode === 'detail' && documentId) return <KnowledgeDetail documentId={documentId} />;
  return <KnowledgeList />;
}
