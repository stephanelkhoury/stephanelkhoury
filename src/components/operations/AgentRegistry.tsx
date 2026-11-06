'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, Bot, Plus, RefreshCw } from 'lucide-react';

type AgentDefinition = {
  id: string;
  key: string;
  name: string;
  description: string;
  capabilities: string[];
  isStarter: boolean;
  enabled: boolean;
  available: boolean;
  latestVersion: { id: string; version: number; status: 'DRAFT' | 'APPROVED' | 'SUPERSEDED' | 'ARCHIVED'; department: string; modelProvider: string | null; modelId: string | null; allowedTools: string[] } | null;
};

export default function AgentRegistry() {
  const [agents, setAgents] = useState<AgentDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await fetch('/api/admin/operations/agents', { cache: 'no-store' });
        const data = await response.json();
        if (!active) return;
        if (!response.ok) {
          setError(data.error || 'Agent definitions could not be loaded.');
          return;
        }
        setAgents(data.agents as AgentDefinition[]);
      } catch {
        if (active) setError('Could not connect to the operations service. Check the database setup and try again.');
      } finally {
        if (active) setLoading(false);
      }
    };
    void load();
    return () => { active = false; };
  }, []);

  return (
    <section className="space-y-6">
      <Link href="/admin/multigraphic-ai" className="inline-flex min-h-9 items-center gap-2 text-sm text-ops-muted hover:text-ops-text"><ArrowLeft size={16} /> Dashboard</Link>
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-ops-border pb-5">
        <div>
          <p className="text-xs font-medium uppercase text-ops-accent">Multigraphic AI / Capabilities</p>
          <h1 className="mt-2 text-3xl font-semibold text-ops-text">Agents</h1>
          <p className="mt-2 text-sm text-ops-muted">Capabilities, approved versions, tools, and execution readiness.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin/multigraphic-ai/agents/new" className="inline-flex min-h-10 items-center gap-2 bg-ops-accent-strong px-3 text-sm font-semibold text-ops-on-accent hover:bg-ops-accent-strong/90"><Plus size={15} /> New agent</Link>
          <span className="inline-flex min-h-9 items-center gap-2 border border-ops-amber/40 bg-ops-amber/10 px-3 text-xs text-ops-amber"><span className="size-2 rounded-full bg-ops-amber" /> Durable worker unavailable</span>
        </div>
      </header>

      {loading && <div role="status" aria-label="Loading agent registry" className="space-y-2">{[1, 2, 3].map((item) => <div key={item} className="h-24 animate-pulse border border-ops-border bg-ops-surface/70" />)}</div>}
      {error && <div role="alert" className="flex flex-wrap items-center justify-between gap-3 border border-ops-red/40 bg-ops-red/10 px-4 py-3 text-sm text-ops-red"><p>{error}</p><button type="button" onClick={() => window.location.reload()} className="inline-flex min-h-9 items-center gap-2 underline underline-offset-4"><RefreshCw size={14} /> Try again</button></div>}
      {!loading && !error && agents.length === 0 && <p className="border border-dashed border-ops-border-strong px-5 py-10 text-center text-sm text-ops-muted">No agent definitions yet. Run the operations seed to add disabled starter definitions.</p>}

      {!loading && !error && agents.length > 0 && (
        <ul className="divide-y divide-ops-border border-y border-ops-border">
          {agents.map((agent) => (
            <li key={agent.id} className="grid gap-4 py-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
              <div className="flex gap-3">
                <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center border border-ops-border-strong bg-ops-surface text-ops-accent"><Bot size={17} /></span>
                <div>
                  <div className="flex flex-wrap items-center gap-2"><h2 className="font-medium text-ops-text">{agent.name}</h2><span className={`border px-2 py-0.5 text-[10px] ${agent.available ? 'border-ops-green/40 text-ops-green' : 'border-ops-amber/40 text-ops-amber'}`}>{agent.available ? 'Available' : 'Unavailable'}</span>{agent.isStarter && <span className="border border-ops-border-strong px-2 py-0.5 text-[10px] uppercase text-ops-muted">Starter</span>}{agent.latestVersion && <span className="text-xs text-ops-subtle">v{agent.latestVersion.version} · {agent.latestVersion.status.toLowerCase()}</span>}</div>
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-ops-muted">{agent.description}</p>
                  <ul aria-label={`${agent.name} capabilities`} className="mt-3 flex flex-wrap gap-2">{agent.capabilities.map((capability) => <li key={capability} className="border border-ops-border bg-ops-surface/70 px-2 py-1 text-xs text-ops-text">{capability.replaceAll('-', ' ')}</li>)}</ul>
                  <p className={`mt-3 text-xs ${agent.available ? 'text-ops-green' : 'text-ops-amber'}`}>{agent.available ? 'Ready to receive eligible tasks.' : !agent.enabled ? 'Disabled by the owner; unavailable for assignment.' : agent.latestVersion?.status !== 'APPROVED' ? 'Unavailable: approve a version before assigning work.' : 'Approved, but unavailable until the durable worker is configured.'}</p>
                  <p className="mt-1 text-xs text-ops-subtle">Provider: {agent.latestVersion?.modelProvider ?? 'Not configured'}{agent.latestVersion?.modelId ? ` · ${agent.latestVersion.modelId}` : ''}</p>
                  <p className="mt-1 text-xs text-ops-subtle">Tools: {agent.latestVersion?.allowedTools.length ? agent.latestVersion.allowedTools.join(', ') : 'None configured'}</p>
                  <p className="mt-1 text-xs text-ops-subtle">Evaluation results: none recorded</p>
                </div>
              </div>
              <Link href={`/admin/multigraphic-ai/agents/${agent.id}`} aria-label={`Open ${agent.name} versions`} className="inline-flex size-9 items-center justify-center text-ops-muted hover:text-ops-text"><ArrowRight size={16} /></Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}