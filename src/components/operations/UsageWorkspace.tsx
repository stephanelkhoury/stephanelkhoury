'use client';

import { useEffect, useState } from 'react';
import { RefreshCw, WalletCards } from 'lucide-react';

type UsageRecord = {
  id: string;
  provider: string;
  model: string | null;
  inputTokens: number;
  outputTokens: number;
  costUsd: string | null;
  estimatedCostUsd: string | null;
  durationMs: number | null;
  activeCpuDurationMs: number | null;
  dependencySetupDurationMs: number | null;
  buildDurationMs: number | null;
  browserDurationMs: number | null;
  costBasis: string;
  createdAt: string;
  workflowRun: { id: string; project: { id: string; name: string } | null } | null;
  agentRun: { id: string; agent: { name: string }; task: { title: string } | null } | null;
};

type UsageData = { count: number; truncated: boolean; totals: { inputTokens: number; outputTokens: number; reportedCostUsd: string | null; estimatedCostUsd: string | null }; records: UsageRecord[] };

function usd(value: string | null) {
  return value === null ? 'Not reported' : new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 4 }).format(Number(value));
}

export default function UsageWorkspace() {
  const [data, setData] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/admin/operations/usage', { cache: 'no-store' });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Usage could not be loaded.');
      setData(result as UsageData);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Usage could not be loaded.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    const projectId = new URLSearchParams(window.location.search).get('projectId');
    const query = projectId ? `?projectId=${encodeURIComponent(projectId)}` : '';
    fetch('/api/admin/operations/usage' + query, { cache: 'no-store', signal: controller.signal }).then(async response => {
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Workspace data could not be loaded.');
      setData(result as UsageData);
    }).catch(error => { if (!controller.signal.aborted) setError(error instanceof Error ? error.message : 'Workspace data could not be loaded.'); }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, []);

  return <div className="space-y-7">
    <header className="flex flex-wrap items-end justify-between gap-4 border-b border-ops-border pb-6"><div><p className="text-xs font-medium uppercase text-ops-violet">Provider records</p><h1 className="mt-2 text-3xl font-semibold">Usage</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-ops-muted">Recorded token use and cost fields. Estimates and provider-reported amounts are kept separate; no savings or ROI is inferred.</p></div><button type="button" onClick={() => void load()} disabled={loading} aria-label="Refresh usage" title="Refresh" className="inline-flex size-10 items-center justify-center border border-ops-border text-ops-muted hover:text-ops-text disabled:opacity-50"><RefreshCw size={16} /></button></header>
    {error && <div role="alert" className="flex flex-wrap items-center justify-between gap-3 border border-ops-red/30 bg-ops-red/[0.06] px-4 py-3 text-sm text-ops-red"><p>{error}</p><button type="button" onClick={() => void load()} className="min-h-9 underline underline-offset-4">Try again</button></div>}
    {loading && !data ? <div role="status" aria-label="Loading usage" className="h-48 animate-pulse border-y border-ops-border bg-ops-text/[0.05]" /> : data && <>
      <section aria-label="Usage totals" className="grid grid-cols-2 border-y border-ops-border sm:grid-cols-4">
        {[
          ['Records', data.count.toLocaleString()],
          ['Input tokens', data.totals.inputTokens.toLocaleString()],
          ['Output tokens', data.totals.outputTokens.toLocaleString()],
          ['Provider-reported cost', usd(data.totals.reportedCostUsd)],
        ].map(([label, value], index) => <div key={label} className={`min-w-0 border-b border-ops-border py-5 sm:border-b-0 sm:pr-5 ${index < 3 ? 'sm:border-r sm:pl-5' : 'sm:pl-5'} ${index === 0 ? 'pl-0' : 'pl-4'}`}><p className="text-xs text-ops-muted">{label}</p><p className="mt-3 break-words text-xl font-semibold tabular-nums">{value}</p></div>)}
      </section>
      <section aria-labelledby="usage-estimates-title" className="grid gap-5 border-b border-ops-border py-5 sm:grid-cols-2">
        <div><h2 id="usage-estimates-title" className="text-xs text-ops-muted">Estimated cost total</h2><p className="mt-2 text-lg font-semibold tabular-nums">{usd(data.totals.estimatedCostUsd)}</p><p className="mt-1 text-xs leading-5 text-ops-subtle">Application list-price estimate. Not an invoice or provider-reported charge.</p></div>
        <div className="sm:border-l sm:border-ops-border sm:pl-5"><h2 className="text-xs text-ops-muted">Provider-reported total</h2><p className="mt-2 text-lg font-semibold tabular-nums">{usd(data.totals.reportedCostUsd)}</p><p className="mt-1 text-xs leading-5 text-ops-subtle">The provider has not supplied a cost amount when this field is empty.</p></div>
      </section>
      <section aria-labelledby="usage-records-title">
        <div className="flex items-center justify-between border-b border-ops-border pb-3"><h2 id="usage-records-title" className="flex items-center gap-2 text-base font-semibold"><WalletCards size={16} className="text-ops-accent" /> Recent records</h2><span className="text-xs text-ops-muted">{data.records.length} shown</span></div>
        {data.records.length === 0 ? <div className="py-8"><p className="text-sm font-medium">No usage recorded</p><p className="mt-1 text-sm text-ops-muted">Usage appears after a real provider call is persisted.</p></div> : <div className="overflow-x-auto"><table className="w-full min-w-[920px] border-collapse text-left text-sm"><thead><tr className="border-b border-ops-border text-xs text-ops-muted"><th scope="col" className="py-3 pr-4 font-medium">Request</th><th scope="col" className="py-3 pr-4 font-medium">Provider / model</th><th scope="col" className="py-3 pr-4 font-medium">Tokens</th><th scope="col" className="py-3 pr-4 font-medium">Measured duration</th><th scope="col" className="py-3 pr-4 font-medium">Estimated</th><th scope="col" className="py-3 pr-4 font-medium">Reported</th><th scope="col" className="py-3 font-medium">Recorded</th></tr></thead><tbody className="divide-y divide-ops-border">{data.records.map((record) => <tr key={record.id} className="align-top"><td className="py-3 pr-4"><span className="block text-sm">{record.agentRun?.task?.title ?? 'Planning request'}</span><span className="mt-1 block text-xs text-ops-muted">{record.workflowRun?.project?.name ?? 'Project not linked'}</span></td><td className="py-3 pr-4"><span className="block">{record.provider}</span><span className="mt-1 block text-xs text-ops-muted">{record.model ?? 'Model not recorded'}</span></td><td className="whitespace-nowrap py-3 pr-4 text-xs tabular-nums text-ops-muted">{record.inputTokens.toLocaleString()} in · {record.outputTokens.toLocaleString()} out</td><td className="whitespace-nowrap py-3 pr-4 text-xs tabular-nums">{record.durationMs === null ? 'Not measured' : `${(record.durationMs / 1000).toFixed(1)}s`}<span className="mt-1 block text-[10px] text-ops-muted">{record.buildDurationMs === null ? '' : `build ${(record.buildDurationMs / 1000).toFixed(1)}s`}{record.browserDurationMs === null ? '' : ` · browser ${(record.browserDurationMs / 1000).toFixed(1)}s`}</span></td><td className="whitespace-nowrap py-3 pr-4 text-xs tabular-nums">{usd(record.estimatedCostUsd)}</td><td className="whitespace-nowrap py-3 pr-4 text-xs tabular-nums">{usd(record.costUsd)}</td><td className="whitespace-nowrap py-3 text-xs text-ops-muted">{new Date(record.createdAt).toLocaleString()}</td></tr>)}</tbody></table></div>}
        {data.truncated && <p className="mt-3 text-xs text-ops-amber">Showing the 200 most recent records; totals include all records.</p>}
      </section>
    </>}
  </div>;
}