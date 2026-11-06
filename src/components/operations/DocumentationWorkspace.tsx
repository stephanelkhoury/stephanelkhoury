'use client';

import { useSearchParams } from 'next/navigation';
import { Fragment, useEffect, useState, type ReactNode } from 'react';
import { CircleAlert, Download, FileText, RefreshCw } from 'lucide-react';

type RecordSummary = { id: string; kind: string; title: string; createdAt: string; agentName: string | null; project: { id: string; name: string } | null };
type RecordDetail = RecordSummary & { markdown: string };

function inline(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, index) => part.startsWith('**') && part.endsWith('**') ? <strong key={index}>{part.slice(2, -2)}</strong> : <Fragment key={index}>{part.replace(/ {2}$/, '')}</Fragment>);
}

// Renders the small markdown subset produced by work records as React elements (no raw HTML).
function Markdown({ source }: { source: string }) {
  const blocks: ReactNode[] = [];
  let list: { ordered: boolean; items: string[] } | null = null;
  const flush = () => { if (list) { const items = list.items.map((item, index) => <li key={index}>{inline(item)}</li>); blocks.push(list.ordered ? <ol key={blocks.length} className="list-decimal space-y-1 pl-6">{items}</ol> : <ul key={blocks.length} className="list-disc space-y-1 pl-6">{items}</ul>); list = null; } };
  for (const line of source.split('\n')) {
    const heading = /^(#{1,6}) (.*)$/.exec(line);
    const bullet = /^\s*- (.*)$/.exec(line);
    const numbered = /^\s*\d+\. (.*)$/.exec(line);
    if (heading) { flush(); const level = heading[1].length; blocks.push(level === 1 ? <h2 key={blocks.length} className="mt-2 text-xl font-semibold">{inline(heading[2])}</h2> : level === 2 ? <h3 key={blocks.length} className="mt-4 text-base font-semibold">{inline(heading[2])}</h3> : <h4 key={blocks.length} className="mt-3 text-sm font-semibold">{inline(heading[2])}</h4>); }
    else if (bullet || numbered) { const ordered = Boolean(numbered); if (!list || list.ordered !== ordered) { flush(); list = { ordered, items: [] }; } list.items.push((bullet ?? numbered)![1]); }
    else if (!line.trim()) flush();
    else { flush(); blocks.push(<p key={blocks.length} className="text-sm leading-6 text-ops-muted">{inline(line)}</p>); }
  }
  flush();
  return <div className="space-y-2">{blocks}</div>;
}

export default function DocumentationWorkspace() {
  const searchParams = useSearchParams();
  const [kind, setKind] = useState(searchParams?.get('kind') ?? '');
  const [agentId, setAgentId] = useState(searchParams?.get('agentId') ?? '');
  const [query, setQuery] = useState('');
  const [search, setSearch] = useState('');
  const [records, setRecords] = useState<RecordSummary[]>([]);
  const [agents, setAgents] = useState<Array<{ id: string; name: string }>>([]);
  const [selected, setSelected] = useState<RecordDetail | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams({ ...(kind ? { kind } : {}), ...(agentId ? { agentId } : {}), ...(search ? { q: search } : {}) });
    fetch(`/api/admin/operations/documentation?${params}`, { cache: 'no-store', signal: controller.signal })
      .then(async response => { const body = await response.json(); if (!response.ok) throw new Error(body.error || 'Work records could not be loaded.'); return body; })
      .then(body => { setRecords(body.records); setAgents(body.agents); setError(''); })
      .catch(loadError => { if (!controller.signal.aborted) setError(loadError instanceof Error ? loadError.message : 'Work records could not be loaded.'); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [kind, agentId, search, reloadKey]);

  async function open(id: string) {
    const response = await fetch(`/api/admin/operations/documentation/${id}`, { cache: 'no-store' });
    const body = await response.json();
    if (response.ok) setSelected({ ...body.record, agentName: records.find(record => record.id === id)?.agentName ?? null });
    else setError(body.error || 'The record could not be opened.');
  }

  function download() {
    if (!selected) return;
    const url = URL.createObjectURL(new Blob([selected.markdown], { type: 'text/markdown;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `${selected.title.replace(/[^a-z0-9]+/gi, '-').toLowerCase().slice(0, 80) || 'work-record'}.md`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return <div className="space-y-6">
    <header className="flex flex-wrap items-end justify-between gap-4 border-b border-ops-border pb-6">
      <div><p className="text-xs font-medium uppercase text-ops-violet">Records</p><h1 className="mt-2 text-3xl font-semibold">Documentation</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-ops-muted">An automatic written record of every completed task, meeting and owner review: the request, knowledge used, model, time, tokens and the full output.</p></div>
      <button type="button" onClick={() => setReloadKey(value => value + 1)} aria-label="Refresh records" className="inline-flex size-10 items-center justify-center border border-ops-border text-ops-muted hover:text-ops-text"><RefreshCw size={16} /></button>
    </header>
    {error && <p role="alert" className="flex items-center gap-2 border border-ops-red/30 px-4 py-3 text-sm text-ops-red"><CircleAlert size={15} />{error}</p>}
    <form className="flex flex-wrap gap-3" onSubmit={event => { event.preventDefault(); setSearch(query.trim()); }}>
      <select aria-label="Record type" value={kind} onChange={event => setKind(event.target.value)} className="min-h-10 border border-ops-border bg-transparent px-3 text-sm"><option value="">All records</option><option value="TASK">Tasks</option><option value="MEETING">Meetings</option><option value="REVIEW">Reviews</option></select>
      <select aria-label="Agent" value={agentId} onChange={event => setAgentId(event.target.value)} className="min-h-10 border border-ops-border bg-transparent px-3 text-sm"><option value="">All agents</option>{agents.map(agent => <option key={agent.id} value={agent.id}>{agent.name}</option>)}</select>
      <input aria-label="Search records" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search titles and content" dir="auto" className="min-h-10 flex-1 border border-ops-border bg-transparent px-3 text-sm" />
      <button type="submit" className="min-h-10 border border-ops-border px-4 text-sm">Search</button>
    </form>
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)]">
      <ul className="divide-y divide-ops-border border-y border-ops-border" aria-label="Work records">
        {loading && !records.length ? <li className="h-24 animate-pulse bg-ops-text/[0.05]" /> : !records.length ? <li className="py-6 text-sm text-ops-muted">No work records yet. They are written automatically when tasks complete, meetings conclude and you review deliverables.</li> : records.map(record => <li key={record.id}><button type="button" onClick={() => void open(record.id)} aria-current={selected?.id === record.id} className={`w-full py-3 text-left ${selected?.id === record.id ? 'text-ops-text' : ''}`}><span className="flex items-center gap-2 text-sm"><FileText size={14} className="shrink-0" />{record.title}</span><span className="mt-1 block text-xs text-ops-muted">{record.kind.toLowerCase()} · {record.project?.name ?? 'No project'}{record.agentName ? ` · ${record.agentName}` : ''} · {new Date(record.createdAt).toLocaleString()}</span></button></li>)}
      </ul>
      <article className="min-h-64 border border-ops-border p-5" aria-live="polite">
        {selected ? <><div className="mb-4 flex items-center justify-end"><button type="button" onClick={download} className="inline-flex min-h-9 items-center gap-2 border border-ops-border px-3 text-xs"><Download size={14} /> Download .md</button></div><Markdown source={selected.markdown} /></> : <p className="text-sm text-ops-muted">Select a record to read it.</p>}
      </article>
    </div>
  </div>;
}
