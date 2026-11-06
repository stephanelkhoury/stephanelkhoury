'use client';

import { useEffect, useState } from 'react';
import { Ban, Check, Play, RefreshCw, Sparkles } from 'lucide-react';

type WorkflowTask = {
  id: string;
  planKey: string | null;
  title: string;
  status: string;
  error: string | null;
  output: unknown;
  estimatedCostUsd: number | string | null;
};

type WorkflowRun = {
  id: string;
  status: string;
  planVersion: number;
  acceptedPlanHash: string | null;
  acceptedAt: string | null;
  budgetCapUsd: number | string | null;
  estimatedCostUsd: number | string | null;
  output: { plan?: unknown; provider?: string; model?: string } | null;
  error: string | null;
  createdAt: string;
  tasks: WorkflowTask[];
  events: Array<{ id: string; type: string; message: string | null; createdAt: string; taskKey: string | null }>;
  usageRecords: Array<{ provider: string; model: string | null; inputTokens: number; outputTokens: number; costUsd: number | string | null; estimatedCostUsd: number | string | null; costBasis: string; durationMs: number | null; activeCpuDurationMs: number | null; buildDurationMs: number | null; browserDurationMs: number | null }>;
  approvals: Array<{ id: string; actionKey: string; actionHash: string; actionPayload: unknown; status: string; comment: string | null; task: { title: string; planKey: string | null } }>;
  agentRuns: Array<{ id: string; taskId: string | null; status: string; toolCalls: Array<{ id: string; name: string; status: string; policy: string; approvalHash: string | null; timeoutMs: number; error: string | null; startedAt: string; finishedAt: string | null }> }>;
};

type PlanReview = {
  title?: string;
  objectives?: string[];
  deliverables?: string[];
  assumptions?: string[];
  missingInformation?: string[];
  requiredApprovals?: string[];
  tasks?: Array<{ key: string; stage: string; title: string; dependencies: string[]; estimatedMinutes: number; estimatedCostUsd: number; requiredApprovals: string[] }>;
  website?: {
    businessGoals: string[];
    audiences: string[];
    languages: string[];
    functionality: string[];
    constraints: string[];
    designDirection: string;
    visualTokens: { background: string; surface: string; text: string; muted: string; accent: string; border: string; headingTypeface: string; bodyTypeface: string };
    responsiveBehavior: string[];
    accessibilityRequirements: string[];
    structuredDataRecommendations: string[];
    pages: Array<{ path: string; language: string; title: string; purpose: string; sections: Array<{ key: string; heading: string; contentRequirements: string[]; draftCopy: string; claimsToVerify: string[]; image: { name: string; altText: string } | null; primaryAction: { label: string; targetPath: string } | null }>; metaTitle: string; metaDescription: string; internalLinks: string[] }>;
    brandAssets: Array<{ name: string; source: string; provenance: string; licenseStatus: string }>;
    scopeFlags: Array<{ category: string; matchedRequirement: string; reason: string }>;
  };
};

const activeStatuses = new Set(['QUEUED', 'RUNNING']);

function amount(value: number | string | null | undefined) {
  return value == null ? 'Not reported' : `$${Number(value).toFixed(4)}`;
}

function pretty(value: unknown) {
  return JSON.stringify(value, null, 2);
}

async function fetchWorkflowRuns(projectId: string) {
  const response = await fetch(`/api/admin/operations/projects/${encodeURIComponent(projectId)}/runs`, { cache: 'no-store' });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Workflow runs could not be loaded.');
  return data.runs as WorkflowRun[];
}

function statusStyle(status: string) {
  if (['SUCCEEDED', 'DONE'].includes(status)) return 'text-ops-green';
  if (['FAILED', 'CANCELED'].includes(status)) return 'text-ops-red';
  if (['BLOCKED', 'AWAITING_INPUT', 'AWAITING_APPROVAL'].includes(status)) return 'text-ops-amber';
  if (['RUNNING', 'QUEUED'].includes(status)) return 'text-ops-accent';
  return 'text-ops-muted';
}

export default function OperationsRunsPanel({ projectId, brief }: { projectId: string; brief: string }) {
  const [runs, setRuns] = useState<WorkflowRun[]>([]);
  const [selectedRunId, setSelectedRunId] = useState('');
  const [planEdit, setPlanEdit] = useState<{ runId: string; text: string } | null>(null);
  const [budgetCapUsd, setBudgetCapUsd] = useState('5');
  const [workflowKey, setWorkflowKey] = useState('website-delivery-v1');
  const [departmentAgentKey, setDepartmentAgentKey] = useState('');
  const [departmentAgents, setDepartmentAgents] = useState<Array<{ key: string; name: string; enabled: boolean; latestVersion: { department: string } | null }>>([]);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const loadRuns = async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      const response = await fetch(`/api/admin/operations/projects/${encodeURIComponent(projectId)}/runs`, { cache: 'no-store' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Workflow runs could not be loaded.');
      const nextRuns = data.runs as WorkflowRun[];
      setRuns(nextRuns);
      setSelectedRunId((current) => current && nextRuns.some((run) => run.id === current) ? current : nextRuns[0]?.id ?? '');
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Workflow runs could not be loaded.');
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    void fetchWorkflowRuns(projectId).then((nextRuns) => {
      if (!active) return;
      setRuns(nextRuns);
      setSelectedRunId((current) => current && nextRuns.some((run) => run.id === current) ? current : nextRuns[0]?.id ?? '');
    }).catch((loadError: unknown) => {
      if (active) setError(loadError instanceof Error ? loadError.message : 'Workflow runs could not be loaded.');
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [projectId]);

  useEffect(() => { const controller = new AbortController(); fetch('/api/admin/operations/agents', { cache: 'no-store', signal: controller.signal }).then(async response => { if (response.ok) { const result = await response.json(); setDepartmentAgents(result.agents); } }).catch(() => undefined); return () => controller.abort(); }, []);

  const selectedRun = runs.find((run) => run.id === selectedRunId) ?? null;
  const draftPlan = selectedRun?.output?.plan as PlanReview | undefined;
  const providerModel = selectedRun?.output?.provider && selectedRun.output.model
    ? `${selectedRun.output.provider} / ${selectedRun.output.model}`
    : selectedRun?.events.find((event) => event.type === 'plan.started')?.message?.replace(/^Planning started with /, '').replace(/\.$/, '') ?? 'Not recorded';
  const selectedPlanText = selectedRun?.output?.plan ? pretty(selectedRun.output.plan) : '';
  const hasActiveRuns = runs.some((run) => activeStatuses.has(run.status));

  useEffect(() => {
    if (!hasActiveRuns) return;
    let active = true;
    const timer = window.setInterval(() => {
      void fetchWorkflowRuns(projectId).then((nextRuns) => {
        if (!active) return;
        setRuns(nextRuns);
        setSelectedRunId((current) => current && nextRuns.some((run) => run.id === current) ? current : nextRuns[0]?.id ?? '');
      }).catch((loadError: unknown) => {
        if (active) setError(loadError instanceof Error ? loadError.message : 'Workflow runs could not be loaded.');
      });
    }, 4000);
    return () => { active = false; window.clearInterval(timer); };
  }, [hasActiveRuns, projectId]);

  const planText = planEdit?.runId === selectedRunId ? planEdit.text : selectedPlanText;

  const generatePlan = async () => {
    setWorking(true);
    setError('');
    setNotice('');
    try {
      const departmentPlanning = workflowKey === 'department-planning-v1';
      const response = await fetch(`/api/admin/operations/projects/${encodeURIComponent(projectId)}/${departmentPlanning ? 'department-runs' : 'runs'}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Idempotency-Key': crypto.randomUUID() },
        body: JSON.stringify(departmentPlanning ? { agentKey: departmentAgentKey, budgetCapUsd: Number(budgetCapUsd) } : { workflowKey, budgetCapUsd: Number(budgetCapUsd) }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Plan generation failed.');
      if (data.run) {
        setRuns((current) => [data.run as WorkflowRun, ...current.filter((run) => run.id !== data.run.id)]);
        setSelectedRunId(data.run.id);
      }
      setNotice(data.duplicate ? 'An existing run with this request key was returned.' : 'Plan generated and saved as a draft for review.');
      await loadRuns();
    } catch (generateError) {
      setError(generateError instanceof Error ? generateError.message : 'Plan generation failed.');
      await loadRuns();
    } finally {
      setWorking(false);
    }
  };

  const combineFinalSolution = async () => {
    setWorking(true);
    setError('');
    setNotice('');
    try {
      const response = await fetch(`/api/admin/operations/projects/${encodeURIComponent(projectId)}/final-solution`, { method: 'POST' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Final solution could not be drafted.');
      if (data.run) {
        setRuns((current) => [data.run as WorkflowRun, ...current.filter((run) => run.id !== data.run.id)]);
        setSelectedRunId(data.run.id);
      }
      setNotice(`Final solution draft prepared from ${data.combined} finished task(s). Review and accept it to run.`);
      await loadRuns();
    } catch (combineError) {
      setError(combineError instanceof Error ? combineError.message : 'Final solution could not be drafted.');
    } finally {
      setWorking(false);
    }
  };

  const acceptPlan = async () => {
    if (!selectedRun) return;
    setWorking(true);
    setError('');
    setNotice('');
    try {
      const plan: unknown = JSON.parse(planText);
      const response = await fetch(`/api/admin/operations/runs/${encodeURIComponent(selectedRun.id)}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'The plan could not be accepted.');
      if (data.error) setNotice(data.error);
      else if (data.status === 'BLOCKED') setNotice('Plan accepted and saved. Dispatch is blocked until Trigger.dev is configured.');
      else setNotice('Plan accepted. The durable run has been dispatched.');
      await loadRuns();
    } catch (acceptError) {
      setError(acceptError instanceof SyntaxError ? 'Plan editor must contain valid JSON.' : acceptError instanceof Error ? acceptError.message : 'The plan could not be accepted.');
      await loadRuns();
    } finally {
      setWorking(false);
    }
  };

  const cancelRun = async () => {
    if (!selectedRun) return;
    setWorking(true);
    setError('');
    setNotice('');
    try {
      const response = await fetch(`/api/admin/operations/runs/${encodeURIComponent(selectedRun.id)}/cancel`, { method: 'POST' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Cancellation could not be recorded.');
      setNotice(data.cancelRequested ? 'Cancellation requested. The worker will stop at its next safe checkpoint.' : 'Run canceled.');
      await loadRuns();
    } catch (cancelError) {
      setError(cancelError instanceof Error ? cancelError.message : 'Cancellation could not be recorded.');
    } finally {
      setWorking(false);
    }
  };

  const decideApproval = async (approvalId: string, decision: 'APPROVED' | 'REJECTED') => {
    if (!selectedRun) return;
    setWorking(true);
    setError('');
    setNotice('');
    try {
      const response = await fetch(`/api/admin/operations/runs/${encodeURIComponent(selectedRun.id)}/approvals/${encodeURIComponent(approvalId)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Approval decision failed.');
      setNotice(decision === 'APPROVED' ? 'Exact action approved.' : 'Action rejected; the task is blocked.');
      await loadRuns();
    } catch (approvalError) {
      setError(approvalError instanceof Error ? approvalError.message : 'Approval decision failed.');
    } finally {
      setWorking(false);
    }
  };

  return (
    <section className="space-y-5 border-t border-ops-border pt-7" aria-labelledby="workflow-runs-title">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase text-ops-accent">Planning / Execution</p>
          <h2 id="workflow-runs-title" className="mt-1 text-xl font-semibold text-ops-text">Workflow runs</h2>
        </div>
        <button type="button" onClick={() => void loadRuns(true)} title="Refresh workflow runs" aria-label="Refresh workflow runs" className="inline-flex size-10 items-center justify-center border border-ops-border-strong text-ops-text hover:border-ops-accent hover:text-ops-text"><RefreshCw size={16} /></button>
      </header>

      {error && <p role="alert" className="border border-ops-red/40 bg-ops-red/10 px-4 py-3 text-sm text-ops-red">{error}</p>}
      {notice && <p role="status" className="border border-ops-border-strong bg-ops-surface px-4 py-3 text-sm text-ops-text">{notice}</p>}

      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(180px,0.65fr)_auto]">
        <label className="space-y-2 text-sm text-ops-text">
          <span>Service / workflow</span>
          <select value={workflowKey} onChange={(event) => setWorkflowKey(event.target.value)} className="min-h-11 w-full border border-ops-border bg-ops-surface px-3 text-ops-text outline-none focus:border-ops-accent">
            <option value="website-delivery-v1">Website delivery</option>
            <option value="department-planning-v1">Department planning &amp; drafting</option>
          </select>
          <span className="block text-xs text-ops-subtle">{workflowKey === 'department-planning-v1' ? 'Structured text from supplied references. No external actions or media rendering.' : 'Static website, isolated verification, and private deliverables.'}</span>
        </label>
        <label className="space-y-2 text-sm text-ops-text">
          <span>Maximum estimated run spend (USD)</span>
          <input type="number" min="0.01" max="1000" step="0.01" value={budgetCapUsd} onChange={(event) => setBudgetCapUsd(event.target.value)} className="min-h-11 w-full border border-ops-border-strong bg-ops-bg px-3 text-ops-text outline-none focus:border-ops-accent" />
        </label>
        <button type="button" onClick={() => void generatePlan()} disabled={working || loading || brief.trim().length < 30 || Number(budgetCapUsd) <= 0 || (workflowKey === 'department-planning-v1' && !departmentAgentKey)} className="inline-flex min-h-11 items-center justify-center gap-2 self-end bg-ops-accent-strong px-4 text-sm font-semibold text-ops-on-accent hover:bg-ops-accent-strong/90 disabled:cursor-not-allowed disabled:opacity-50">
          <Sparkles size={16} /> {working ? 'Working…' : workflowKey === 'department-planning-v1' ? 'Prepare draft task' : 'Generate plan'}
        </button>
      </div>
      {workflowKey === 'department-planning-v1' && <label className="block space-y-2 text-sm text-ops-text"><span>Department specialist</span><select value={departmentAgentKey} onChange={event => setDepartmentAgentKey(event.target.value)} className="min-h-11 w-full border border-ops-border-strong bg-ops-bg px-3"><option value="">Choose an enabled specialist</option>{departmentAgents.filter(agent => agent.enabled && agent.latestVersion?.department !== 'SOFTWARE_ENGINEERING').map(agent => <option key={agent.key} value={agent.key}>{agent.name}</option>)}</select><span className="block text-xs text-ops-subtle">Approve and check a contract, then enable assignment. Preparing a draft makes no model call; execution begins after acceptance.</span></label>}
      {brief.trim().length < 30 && <p className="text-xs text-ops-amber">Save a project brief with at least 30 characters before planning.</p>}
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" onClick={() => void combineFinalSolution()} disabled={working || loading || brief.trim().length < 30} className="inline-flex min-h-11 items-center gap-2 border border-ops-border-strong px-4 text-sm font-semibold text-ops-text hover:bg-ops-accent/10 disabled:cursor-not-allowed disabled:opacity-50"><Sparkles size={16} /> Combine into final solution</button>
        <span className="text-xs text-ops-subtle">The Project Manager merges every finished task into one answer for your review.</span>
      </div>

      {loading ? <p role="status" className="py-4 text-sm text-ops-muted">Loading workflow runs…</p> : runs.length > 0 ? (
        <div className="grid gap-5 lg:grid-cols-[230px_minmax(0,1fr)]">
          <nav aria-label="Workflow run history" className="divide-y divide-ops-border border-y border-ops-border">
            {runs.map((run) => (
              <button key={run.id} type="button" onClick={() => setSelectedRunId(run.id)} aria-current={selectedRunId === run.id ? 'true' : undefined} className={`flex min-h-14 w-full items-center justify-between gap-3 px-3 text-left text-sm hover:bg-ops-surface ${selectedRunId === run.id ? 'bg-ops-surface' : ''}`}>
                <span className="truncate text-ops-text">{new Date(run.createdAt).toLocaleString()}</span>
                <span className={`shrink-0 text-[11px] font-medium ${statusStyle(run.status)}`}>{run.status.replaceAll('_', ' ')}</span>
              </button>
            ))}
          </nav>

          {selectedRun && <div className="min-w-0 space-y-5">
            <header className="flex flex-wrap items-center justify-between gap-3 border-b border-ops-border pb-4">
              <div>
                <p className="text-xs text-ops-subtle">Run {selectedRun.id}</p>
                <p className={`mt-1 text-sm font-semibold ${statusStyle(selectedRun.status)}`}>{selectedRun.status.replaceAll('_', ' ')}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedRun.status === 'DRAFT' && <button type="button" onClick={() => void acceptPlan()} disabled={working} className="inline-flex min-h-10 items-center gap-2 bg-ops-green px-3 text-sm font-semibold text-ops-on-accent hover:bg-ops-green disabled:opacity-50"><Check size={15} /> Accept plan</button>}
                {selectedRun.status === 'BLOCKED' && selectedRun.acceptedAt && <button type="button" onClick={() => void acceptPlan()} disabled={working} className="inline-flex min-h-10 items-center gap-2 border border-ops-amber/40 px-3 text-sm text-ops-amber hover:bg-ops-amber/10 disabled:opacity-50"><Play size={15} /> Retry dispatch</button>}
                {activeStatuses.has(selectedRun.status) && <button type="button" onClick={() => void cancelRun()} disabled={working} className="inline-flex min-h-10 items-center gap-2 border border-ops-red/40 px-3 text-sm text-ops-red hover:bg-ops-red/10 disabled:opacity-50"><Ban size={15} /> Cancel run</button>}
              </div>
            </header>

            {selectedRun.error && <p role="status" className="border border-ops-amber/40 bg-ops-amber/10 px-3 py-2 text-sm text-ops-amber">{selectedRun.error}</p>}
            <div className="grid gap-3 text-sm sm:grid-cols-3">
              <div className="border-l-2 border-ops-accent pl-3"><p className="text-xs text-ops-subtle">Provider / model</p><p className="mt-1 break-words text-ops-text">{providerModel}</p></div>
              <div className="border-l-2 border-ops-amber/40 pl-3"><p className="text-xs text-ops-subtle">Estimated run cost</p><p className="mt-1 text-ops-text">{amount(selectedRun.estimatedCostUsd)}</p></div>
              <div className="border-l-2 border-ops-border-strong pl-3"><p className="text-xs text-ops-subtle">Budget cap</p><p className="mt-1 text-ops-text">{amount(selectedRun.budgetCapUsd)}</p></div>
            </div>

            {selectedRun.status === 'DRAFT' && <label className="block space-y-2 text-sm text-ops-text">
              {draftPlan && <div className="mb-5 grid gap-5 border-y border-ops-border py-4 sm:grid-cols-2">
                <div className="space-y-4">
                  <div><h3 className="text-xs font-semibold uppercase text-ops-muted">Objectives</h3><ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-ops-text">{(draftPlan.objectives ?? []).map((item, index) => <li key={`${index}-${item}`} dir="auto">{item}</li>)}</ul></div>
                  <div><h3 className="text-xs font-semibold uppercase text-ops-muted">Deliverables</h3><ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-ops-text">{(draftPlan.deliverables ?? []).map((item, index) => <li key={`${index}-${item}`} dir="auto">{item}</li>)}</ul></div>
                </div>
                <div className="space-y-4">
                  <div><h3 className="text-xs font-semibold uppercase text-ops-muted">Assumptions</h3>{draftPlan.assumptions?.length ? <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-ops-text">{draftPlan.assumptions.map((item, index) => <li key={`${index}-${item}`} dir="auto">{item}</li>)}</ul> : <p className="mt-2 text-sm text-ops-subtle">No assumptions recorded.</p>}</div>
                  <div><h3 className="text-xs font-semibold uppercase text-ops-muted">Missing information</h3>{draftPlan.missingInformation?.length ? <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-ops-amber">{draftPlan.missingInformation.map((item, index) => <li key={`${index}-${item}`} dir="auto">{item}</li>)}</ul> : <p className="mt-2 text-sm text-ops-green">No missing inputs recorded.</p>}</div>
                </div>
                {draftPlan.website && <section className="sm:col-span-2 space-y-5 border-t border-ops-border pt-4" aria-label="Website specification">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div><h3 className="text-xs font-semibold uppercase text-ops-muted">Business and audience</h3><p className="mt-2 text-sm text-ops-text">{draftPlan.website.businessGoals.join(' · ')}</p><p className="mt-2 text-xs text-ops-muted">Audience: {draftPlan.website.audiences.join(' · ')} · Languages: {draftPlan.website.languages.join(', ')}</p></div>
                    <div><h3 className="text-xs font-semibold uppercase text-ops-muted">Design direction and visual tokens</h3><p dir="auto" className="mt-2 text-sm text-ops-text">{draftPlan.website.designDirection}</p><div className="mt-2 flex flex-wrap gap-2">{Object.entries(draftPlan.website.visualTokens).filter(([key]) => !key.toLowerCase().includes('typeface')).map(([name, value]) => <span key={name} className="inline-flex items-center gap-1.5 border border-ops-border px-2 py-1 text-[10px] text-ops-muted"><span className="size-3 border border-ops-text/20" style={{ backgroundColor: value }} />{name}</span>)}</div><p className="mt-1 text-[10px] text-ops-muted">Heading: {draftPlan.website.visualTokens.headingTypeface} · Body: {draftPlan.website.visualTokens.bodyTypeface}</p></div>
                  </div>
                  {draftPlan.website.scopeFlags.length > 0 && <div role="note" className="border-l-2 border-ops-amber pl-3"><h3 className="text-xs font-semibold uppercase text-ops-amber">Separate scope flagged</h3><ul className="mt-2 space-y-2">{draftPlan.website.scopeFlags.map((flag, index) => <li key={`${flag.category}-${index}`}><p className="text-sm font-medium text-ops-text">{flag.category.replaceAll('_', ' ')}</p><p dir="auto" className="mt-1 text-xs text-ops-muted">{flag.matchedRequirement}</p><p className="mt-1 text-xs text-ops-amber">{flag.reason}</p></li>)}</ul><p className="mt-3 text-xs text-ops-amber">These requirements are not part of this marketing website plan.</p></div>}
                  <div><h3 className="text-xs font-semibold uppercase text-ops-muted">Sitemap and page requirements</h3><ol className="mt-2 divide-y divide-ops-border border-y border-ops-border">{draftPlan.website.pages.map((page) => <li key={page.path} className="py-3"><details><summary className="flex cursor-pointer flex-wrap items-baseline gap-x-3 gap-y-1 text-sm"><span className="font-medium text-ops-text">{page.title}</span><code className="text-xs text-ops-accent">{page.path}</code><span className="text-xs text-ops-muted">{page.language} · {page.purpose}</span></summary><div className="mt-3 grid gap-3 pl-2 sm:grid-cols-2"><div><p className="text-xs font-medium text-ops-muted">Sections and proposed copy</p><ul className="mt-1 list-disc space-y-2 pl-4 text-xs text-ops-text">{page.sections.map((section) => <li key={section.key}><span className="font-medium">{section.heading}:</span> {section.contentRequirements.join('; ')}<p dir="auto" className="mt-1 text-ops-muted">{section.draftCopy}</p>{section.claimsToVerify.length > 0 && <p className="mt-1 text-ops-amber">Verify: {section.claimsToVerify.join('; ')}</p>}{section.primaryAction && <p className="mt-1">Action: {section.primaryAction.label} → {section.primaryAction.targetPath}</p>}</li>)}</ul></div><div><p className="text-xs font-medium text-ops-muted">Search and internal links</p><p className="mt-1 text-xs text-ops-text">{page.metaTitle}<br />{page.metaDescription}</p><p className="mt-1 text-xs text-ops-muted">Links: {page.internalLinks.length ? page.internalLinks.join(', ') : 'None specified'}</p>{(draftPlan.website?.structuredDataRecommendations.length ?? 0) > 0 && <p className="mt-2 text-xs text-ops-muted">Structured-data recommendations: {draftPlan.website?.structuredDataRecommendations.join('; ')}</p>}</div></div></details></li>)}</ol></div>
                  <div className="grid gap-4 sm:grid-cols-2"><div><h3 className="text-xs font-semibold uppercase text-ops-muted">Responsive behavior</h3><ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-ops-text">{draftPlan.website.responsiveBehavior.map((item, index) => <li key={`${index}-${item}`} dir="auto">{item}</li>)}</ul></div><div><h3 className="text-xs font-semibold uppercase text-ops-muted">Accessibility requirements</h3><ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-ops-text">{draftPlan.website.accessibilityRequirements.map((item, index) => <li key={`${index}-${item}`} dir="auto">{item}</li>)}</ul></div></div>
                  <div className="grid gap-4 sm:grid-cols-2"><div><h3 className="text-xs font-semibold uppercase text-ops-muted">Functionality and constraints</h3><p className="mt-2 text-xs text-ops-text">{draftPlan.website.functionality.join(' · ')}</p><p className="mt-2 text-xs text-ops-muted">{draftPlan.website.constraints.join(' · ')}</p></div><div><h3 className="text-xs font-semibold uppercase text-ops-muted">Asset provenance and licensing</h3>{draftPlan.website.brandAssets.length ? <ul className="mt-2 space-y-1 text-xs text-ops-text">{draftPlan.website.brandAssets.map((asset, index) => <li key={`${asset.name}-${index}`}>{asset.name} · {asset.provenance.replaceAll('_', ' ')} · license {asset.licenseStatus.replaceAll('_', ' ').toLowerCase()} · {asset.source}</li>)}</ul> : <p className="mt-2 text-xs text-ops-muted">No assets listed.</p>}</div></div>
                </section>}
                <div className="sm:col-span-2"><h3 className="text-xs font-semibold uppercase text-ops-muted">Proposed task sequence</h3>{draftPlan.tasks?.length ? <ol className="mt-2 grid gap-2 sm:grid-cols-2">{draftPlan.tasks.map((task, index) => <li key={task.key} className="border-l-2 border-ops-accent pl-3 py-1"><p className="text-[10px] font-medium uppercase text-ops-muted">{task.stage?.replaceAll('_', ' ') ?? 'Planning & drafting'}</p><p className="text-sm font-medium text-ops-text">{index + 1}. {task.title}</p><p className="mt-1 text-xs text-ops-muted">{task.estimatedMinutes} min · {amount(task.estimatedCostUsd)}{task.dependencies.length ? ` · depends on ${task.dependencies.join(', ')}` : ''}{task.requiredApprovals.length ? ` · ${task.requiredApprovals.length} approval(s)` : ''}</p></li>)}</ol> : <p className="mt-2 text-sm text-ops-subtle">No tasks proposed.</p>}</div>
              </div>}
              <span>Plan for owner review and edits</span>
              <textarea value={planText} onChange={(event) => setPlanEdit({ runId: selectedRunId, text: event.target.value })} rows={18} spellCheck={false} className="w-full resize-y border border-ops-border-strong bg-ops-bg px-3 py-3 font-mono text-xs leading-5 text-ops-text outline-none focus:border-ops-accent" />
              <span className="block text-xs text-ops-subtle">Acceptance binds to the SHA-256 hash of this exact plan. The saved project brief must remain unchanged.</span>
            </label>}

            {selectedRun.tasks.length > 0 && <section className="space-y-2" aria-labelledby="workflow-task-title">
              <h3 id="workflow-task-title" className="text-sm font-semibold text-ops-text">Tasks</h3>
              <div className="divide-y divide-ops-border border-y border-ops-border">
                {selectedRun.tasks.map((task) => <details key={task.id} className="group px-3 py-3">
                  <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-2 text-sm">
                    <span className="text-ops-text">{task.title}</span>
                    <span className={`text-xs ${statusStyle(task.status)}`}>{task.status.replaceAll('_', ' ')}</span>
                  </summary>
                  {task.error && <p className="mt-2 text-xs text-ops-amber">{task.error}</p>}
                  <p className="mt-2 text-xs text-ops-subtle">Estimated task cost: {amount(task.estimatedCostUsd)}</p>
                  {task.output != null && <pre className="mt-3 max-h-80 overflow-auto border border-ops-border bg-ops-bg p-3 text-xs leading-5 text-ops-text">{pretty(task.output)}</pre>}
                </details>)}
              </div>
            </section>}

            {selectedRun.approvals.length > 0 && <section className="space-y-2" aria-labelledby="workflow-approvals-title">
              <h3 id="workflow-approvals-title" className="text-sm font-semibold text-ops-text">Exact-action approvals</h3>
              <div className="divide-y divide-ops-border border-y border-ops-border">
                {selectedRun.approvals.map((approval) => <div key={approval.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-ops-text">{approval.task.title}: {approval.actionKey}</p>
                    <p className="mt-1 break-all font-mono text-[10px] text-ops-subtle">SHA-256 {approval.actionHash}</p>
                    <p className={`mt-1 text-xs ${statusStyle(approval.status)}`}>{approval.status.replaceAll('_', ' ')}</p>
                    <details className="mt-2 text-xs text-ops-muted"><summary className="cursor-pointer">Review exact action payload</summary><pre className="mt-2 max-h-56 overflow-auto border border-ops-border bg-ops-bg p-3">{pretty(approval.actionPayload)}</pre></details>
                  </div>
                  {approval.status === 'PENDING' && <div className="flex gap-2">
                    <button type="button" onClick={() => void decideApproval(approval.id, 'APPROVED')} disabled={working} title="Approve this exact action payload" className="inline-flex min-h-9 items-center gap-1 border border-ops-green/40 px-2 text-xs text-ops-green hover:bg-ops-green/10 disabled:opacity-50"><Check size={14} /> Approve</button>
                    <button type="button" onClick={() => void decideApproval(approval.id, 'REJECTED')} disabled={working} title="Reject this exact action payload" className="inline-flex min-h-9 items-center gap-1 border border-ops-red/40 px-2 text-xs text-ops-red hover:bg-ops-red/10 disabled:opacity-50"><Ban size={14} /> Reject</button>
                  </div>}
                </div>)}
              </div>
            </section>}

            {selectedRun.agentRuns.some((agentRun) => agentRun.toolCalls.length > 0) && <section className="space-y-2" aria-labelledby="workflow-tools-title">
              <h3 id="workflow-tools-title" className="text-sm font-semibold text-ops-text">Tool calls</h3>
              <div className="divide-y divide-ops-border border-y border-ops-border">{selectedRun.agentRuns.flatMap((agentRun) => agentRun.toolCalls.map((toolCall) => <div key={toolCall.id} className="flex flex-wrap items-start justify-between gap-3 py-3 text-xs">
                <div><p className="font-medium text-ops-text">{toolCall.name}</p><p className="mt-1 text-ops-subtle">{toolCall.policy} / {toolCall.timeoutMs} ms timeout / run {agentRun.id}</p>{toolCall.error && <p className="mt-1 text-ops-red">{toolCall.error}</p>}</div>
                <span className={statusStyle(toolCall.status)}>{toolCall.status}</span>
              </div>))}</div>
            </section>}

            {selectedRun.usageRecords.length > 0 && <section className="space-y-2" aria-labelledby="workflow-usage-title">
              <h3 id="workflow-usage-title" className="text-sm font-semibold text-ops-text">Usage</h3>
              <div className="overflow-x-auto border-y border-ops-border">
                <table className="w-full min-w-[680px] text-left text-xs">
                  <thead className="text-ops-subtle"><tr><th className="py-2 pr-3 font-medium">Provider / model</th><th className="py-2 pr-3 font-medium">Input</th><th className="py-2 pr-3 font-medium">Output</th><th className="py-2 pr-3 font-medium">Measured duration</th><th className="py-2 pr-3 font-medium">Estimated</th><th className="py-2 font-medium">Reported</th></tr></thead>
                  <tbody className="divide-y divide-ops-border text-ops-text">{selectedRun.usageRecords.map((usage, index) => <tr key={`${usage.provider}-${usage.model}-${index}`}><td className="py-2 pr-3">{usage.provider} / {usage.model ?? 'unknown'}</td><td className="py-2 pr-3 tabular-nums">{usage.inputTokens}</td><td className="py-2 pr-3 tabular-nums">{usage.outputTokens}</td><td className="py-2 pr-3 tabular-nums">{usage.durationMs === null ? 'Not measured' : `${(usage.durationMs / 1000).toFixed(1)}s`}{usage.buildDurationMs !== null && <span className="mt-1 block text-[10px] text-ops-subtle">Build {(usage.buildDurationMs / 1000).toFixed(1)}s · Browser {((usage.browserDurationMs ?? 0) / 1000).toFixed(1)}s</span>}</td><td className="py-2 pr-3">{amount(usage.estimatedCostUsd)}</td><td className="py-2">{amount(usage.costUsd)}</td></tr>)}</tbody>
                </table>
              </div>
            </section>}

            {selectedRun.events.length > 0 && <section className="space-y-2" aria-labelledby="workflow-events-title">
              <h3 id="workflow-events-title" className="text-sm font-semibold text-ops-text">Activity</h3>
              <ol className="space-y-2 border-l border-ops-border pl-4">
                {selectedRun.events.map((event) => <li key={event.id} className="relative text-xs text-ops-muted"><span className="absolute -left-[21px] top-1 size-2 rounded-full bg-ops-green" /><span className="font-medium text-ops-text">{event.type.replaceAll('.', ' ')}</span>{event.taskKey && <span> / {event.taskKey}</span>}<p className="mt-1">{event.message}</p><time className="mt-1 block text-ops-subtle">{new Date(event.createdAt).toLocaleString()}</time></li>)}
              </ol>
            </section>}
          </div>}
        </div>
      ) : <p className="border border-dashed border-ops-border-strong px-4 py-8 text-center text-sm text-ops-muted">No workflow runs yet.</p>}
    </section>
  );
}