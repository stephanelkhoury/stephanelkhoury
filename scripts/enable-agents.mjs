// Approves the latest draft version, runs its contract check, then enables every disabled agent that passes.
// Usage: BASE_URL=http://localhost:3333 ADMIN_TOKEN=... node scripts/enable-agents.mjs [--apply]
const base = process.env.BASE_URL;
const token = process.env.ADMIN_TOKEN;
const apply = process.argv.includes('--apply');
if (!base || !token) { console.error('Set BASE_URL and ADMIN_TOKEN.'); process.exit(1); }

const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
async function call(path, method = 'GET', body) {
  const res = await fetch(`${base}/api/admin/operations${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined });
  const json = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, json };
}

const { json: list } = await call('/agents');
for (const agent of list.agents.filter(a => !a.enabled)) {
  const detail = (await call(`/agents/${agent.id}`)).json;
  const versions = detail.agent?.versions ?? detail.versions ?? [];
  const target = versions.find(v => v.status === 'APPROVED') ?? versions.find(v => v.status === 'DRAFT');
  if (!target) { console.log(`SKIP  ${agent.name}: no draft or approved version`); continue; }
  if (!apply) { console.log(`PLAN  ${agent.name}: v${target.version} (${target.status})`); continue; }
  if (target.status === 'DRAFT') {
    const approved = await call(`/agents/${agent.id}/versions/${target.id}`, 'POST');
    if (!approved.ok) { console.log(`FAIL  ${agent.name}: approve -> ${approved.json.error}`); continue; }
  }
  const check = await call(`/agents/${agent.id}/evaluations`, 'POST', { versionId: target.id });
  if (!check.ok || !check.json.evaluation?.passed) { console.log(`FAIL  ${agent.name}: contract check did not pass`); continue; }
  const enabled = await call(`/agents/${agent.id}/activation`, 'POST', { enabled: true });
  console.log(enabled.ok ? `OK    ${agent.name}: enabled` : `FAIL  ${agent.name}: ${enabled.json.error}`);
}
