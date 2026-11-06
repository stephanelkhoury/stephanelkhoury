'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, CircleAlert, PlugZap, RefreshCw } from 'lucide-react';

type RequiredIntegration = { key: string; name: string; configured: boolean; capabilities: string[]; setup: string };
type ConnectedIntegration = { id: string; provider: string; status: string; connectedAt: string | null; updatedAt: string; grantedCapabilities: string[] };
type ProviderTestResult = { ok: boolean; message: string };

function State({ configured }: { configured: boolean }) {
  return configured ? <span className="inline-flex items-center gap-1.5 text-xs text-ops-green"><CheckCircle2 size={14} /> Configured</span> : <span className="inline-flex items-center gap-1.5 text-xs text-ops-amber"><CircleAlert size={14} /> Not configured</span>;
}

export default function IntegrationsWorkspace() {
  const [required, setRequired] = useState<RequiredIntegration[]>([]);
  const [connected, setConnected] = useState<ConnectedIntegration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [testing, setTesting] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, ProviderTestResult>>({});

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/admin/operations/integrations', { cache: 'no-store' });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Integration status could not be loaded.');
      setRequired(result.required as RequiredIntegration[]);
      setConnected(result.connected as ConnectedIntegration[]);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Integration status could not be loaded.');
    } finally {
      setLoading(false);
    }
  };

  const testProvider = async (provider: string) => {
    setTesting(provider);
    setTestResults((current) => ({ ...current, [provider]: { ok: false, message: 'Testing connection…' } }));
    try {
      const response = await fetch('/api/admin/operations/integrations', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ provider }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Provider test failed.');
      setTestResults((current) => ({ ...current, [provider]: { ok: true, message: `${result.model} responded successfully.` } }));
      await load();
    } catch (testError) {
      setTestResults((current) => ({ ...current, [provider]: { ok: false, message: testError instanceof Error ? testError.message : 'Provider test failed.' } }));
    } finally {
      setTesting(null);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    const projectId = new URLSearchParams(window.location.search).get('projectId');
    const query = projectId ? `?projectId=${encodeURIComponent(projectId)}` : '';
    fetch('/api/admin/operations/integrations' + query, { cache: 'no-store', signal: controller.signal }).then(async response => {
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Workspace data could not be loaded.');
      setRequired(result.required as RequiredIntegration[]); setConnected(result.connected as ConnectedIntegration[]);
    }).catch(error => { if (!controller.signal.aborted) setError(error instanceof Error ? error.message : 'Workspace data could not be loaded.'); }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, []);

  return <div className="space-y-7">
    <header className="flex flex-wrap items-end justify-between gap-4 border-b border-ops-border pb-6"><div><p className="text-xs font-medium uppercase text-ops-violet">Connections</p><h1 className="mt-2 text-3xl font-semibold">Integrations</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-ops-muted">Server-side readiness and granted capabilities. Credentials are never shown or edited here.</p></div><button type="button" onClick={() => void load()} disabled={loading} aria-label="Refresh integration status" title="Refresh" className="inline-flex size-10 items-center justify-center border border-ops-border text-ops-muted hover:text-ops-text disabled:opacity-50"><RefreshCw size={16} /></button></header>
    {error && <div role="alert" className="flex flex-wrap items-center justify-between gap-3 border border-ops-red/30 bg-ops-red/[0.06] px-4 py-3 text-sm text-ops-red"><p>{error}</p><button type="button" onClick={() => void load()} className="min-h-9 underline underline-offset-4">Try again</button></div>}
    {loading && required.length === 0 ? <div role="status" aria-label="Loading integrations" className="h-48 animate-pulse border-y border-ops-border bg-ops-text/[0.05]" /> : <>
      <section aria-labelledby="platform-connections" className="space-y-1">
        <div className="flex items-center gap-2 border-b border-ops-border pb-3"><PlugZap size={17} className="text-ops-accent" /><h2 id="platform-connections" className="text-base font-semibold">Required platform connections</h2></div>
        <div className="divide-y divide-ops-border">{required.map((item) => <article key={item.key} className="grid gap-3 py-5 sm:grid-cols-[minmax(0,1fr)_170px]">
          <div className="min-w-0"><div className="flex flex-wrap items-center gap-3"><h3 className="text-sm font-semibold">{item.name}</h3><State configured={item.configured} /></div><p className="mt-2 max-w-3xl text-sm leading-6 text-ops-muted">{item.setup}</p><div className="mt-3 flex flex-wrap gap-2">{item.capabilities.length ? item.capabilities.map((capability) => <span key={capability} className="border border-ops-border px-2 py-1 text-[11px] text-ops-muted">{capability}</span>) : <span className="text-xs text-ops-subtle">No execution capability enabled</span>}</div></div>
          <div className="space-y-2 text-xs text-ops-subtle">
            {['gemini', 'anthropic', 'openai', 'ollama'].includes(item.key) && <>
              <button type="button" onClick={() => void testProvider(item.key)} disabled={!item.configured || testing !== null} className="min-h-9 border border-ops-border px-3 text-xs font-medium text-ops-text hover:border-ops-accent disabled:cursor-not-allowed disabled:opacity-50" title="Sends one small structured request and may incur a small provider charge">{testing === item.key ? 'Testing…' : 'Test connection'}</button>
              {testResults[item.key] && <p role={testResults[item.key].ok ? 'status' : 'alert'} className={testResults[item.key].ok ? 'max-w-56 text-ops-green' : 'max-w-56 text-ops-red'}>{testResults[item.key].message}</p>}
            </>}
            <p>Credentials stay on the server.</p>
          </div>
        </article>)}</div>
      </section>

      <section aria-labelledby="workspace-connections" className="space-y-1">
        <div className="flex items-center justify-between border-b border-ops-border pb-3"><h2 id="workspace-connections" className="text-base font-semibold">Workspace connections</h2><span className="text-xs text-ops-muted">{connected.length} recorded</span></div>
        {connected.length === 0 ? <div className="py-7"><p className="text-sm font-medium">No workspace integrations recorded</p><p className="mt-1 text-sm text-ops-muted">No provider connection record exists in this workspace.</p></div> : <div className="divide-y divide-ops-border">{connected.map((item) => <article key={item.id} className="flex flex-wrap items-start justify-between gap-4 py-4"><div><h3 className="text-sm font-semibold">{item.provider}</h3><p className="mt-1 text-xs text-ops-muted">Connection state: {item.status.toLowerCase()} · Updated {new Date(item.updatedAt).toLocaleString()}</p></div><div className="flex flex-wrap gap-2">{item.grantedCapabilities.length ? item.grantedCapabilities.map((capability) => <span key={capability} className="border border-ops-border px-2 py-1 text-[11px] text-ops-muted">{capability}</span>) : <span className="text-xs text-ops-subtle">No capabilities recorded</span>}</div></article>)}</div>}
      </section>
    </>}
  </div>;
}