import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { test } from 'node:test';
import { sha256Json } from '../../src/lib/operations/json-hash.ts';
const base = process.env.OPERATIONS_TEST_BASE_URL;
const database = process.env.OPERATIONS_TEST_DATABASE_URL;
const token = process.env.OPERATIONS_TEST_ADMIN_TOKEN ?? 'local-operations-test-token';
if (base && !['127.0.0.1', 'localhost'].includes(new URL(base).hostname)) throw new Error('HTTP checks require a local server.');
if (database && (!['127.0.0.1', 'localhost'].includes(new URL(database).hostname) || !new URL(database).pathname.startsWith('/multigraphic_ai_validation_'))) throw new Error('Checks require a disposable local validation database.');
async function api(path, method = 'GET', body, extraHeaders = {}) {
  const response = await fetch(`${base}/api/admin/operations${path}`, { method, headers: { Authorization: `Bearer ${token}`, ...(body ? { 'Content-Type': 'application/json' } : {}), ...extraHeaders }, ...(body ? { body: JSON.stringify(body) } : {}) });
  return { status: response.status, data: await response.json() };
}
// With a local worker the run may already be RUNNING, so cancellation is requested and observed asynchronously.
async function cancelAndSettle(prisma, runId) {
  const canceled = await api(`/runs/${runId}/cancel`, 'POST');
  // A fast local model can finish the run before the cancel arrives; that is a valid outcome, not a failure.
  assert.ok(canceled.data.status === 'CANCELED' || canceled.data.cancelRequested === true || canceled.data.duplicate === true || canceled.status === 409);
  for (let attempt = 0; attempt < 60; attempt += 1) {
    const run = await prisma.workflowRun.findUniqueOrThrow({ where: { id: runId } });
    if (run.status !== 'RUNNING' && run.status !== 'QUEUED') return run;
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  throw new Error('Run did not stop after cancellation.');
}
test('meetings, analytics, documentation and presence APIs enforce auth, validation and report real data', { skip: !base || !database }, async () => {
  for (const path of ['/meetings', '/analytics', '/documentation']) assert.equal((await fetch(`${base}/api/admin/operations${path}`)).status, 401);
  assert.equal((await api('/meetings', 'POST', { projectId: 'missing-project', topic: 'Too few attendees here', participantKeys: ['project-manager'], facilitatorKey: 'project-manager' })).status, 400);
  assert.equal((await api('/meetings', 'POST', { projectId: 'missing-project', topic: 'Facilitator must attend', participantKeys: ['project-manager', 'seo-specialist'], facilitatorKey: 'qa-engineer' })).status, 400);
  assert.equal((await api('/meetings', 'POST', { projectId: 'missing-project', topic: 'Unknown project check', participantKeys: ['project-manager', 'seo-specialist'], facilitatorKey: 'project-manager' })).status, 404);
  const meetings = await api('/meetings'); assert.equal(meetings.status, 200); assert.ok(Array.isArray(meetings.data.meetings));
  const analytics = await api('/analytics?days=7'); assert.equal(analytics.status, 200);
  assert.equal(analytics.data.days, 7); assert.equal(analytics.data.daily.length, 7); assert.ok(analytics.data.agents.length >= 15);
  for (const agent of analytics.data.agents) for (const skill of agent.skills) assert.ok(skill.level >= 1 && skill.level <= 5);
  const docs = await api('/documentation?kind=TASK'); assert.equal(docs.status, 200); assert.ok(docs.data.records.every(record => record.kind === 'TASK'));
  assert.equal((await api('/documentation/missing-record')).status, 404);
  const hq = await api('/headquarters'); assert.equal(hq.status, 200); assert.ok(Array.isArray(hq.data.meetings));
  const allowed = new Set(['OWNER', 'NOT_CONNECTED', 'DISABLED', 'IDLE', 'SLEEPING', 'IN_MEETING', 'QUEUED', 'WORKING', 'WAITING_FOR_OWNER', 'REVIEW_REQUIRED', 'BLOCKED', 'FAILED']);
  assert.ok(hq.data.profiles.every(profile => allowed.has(profile.status)));
});

test('company HTTP flows persist profiles, exact-version checks, activation, draft/accept/idempotency and cancellation', { skip: !base || !database }, async () => {
  process.env.DATABASE_URL = database;
  const { PrismaClient } = await import('@prisma/client'); const prisma = new PrismaClient();
  let projectId; let originalProfile; let agentId; let originalEnabled; const evaluations = [];
  try {
    const unauthenticated = await fetch(`${base}/api/admin/operations/people`); assert.equal(unauthenticated.status, 401);
    const people = await api('/people'); assert.equal(people.status, 200); assert.equal(people.data.profiles.length, 26);
    originalProfile = people.data.profiles.find(person => person.key === 'maya');
    const { displayName, jobTitle, department, communicationStyle, roomKey, deskKey, appearance } = originalProfile;
    const profile = { displayName, jobTitle, department, communicationStyle, roomKey, deskKey, appearance };
    assert.equal((await api('/people/maya', 'PATCH', { ...profile, roomKey: 'engineering' })).status, 400);
    assert.equal((await api('/people/maya', 'PATCH', { ...profile, displayName: 'Maya · Local persistence check' })).status, 200);
    assert.equal((await api('/people')).data.profiles.find(person => person.key === 'maya').displayName, 'Maya · Local persistence check');
    const registry = await api('/agents'); const agent = registry.data.agents.find(agent => agent.key === 'business-analyst'); agentId = agent.id; originalEnabled = agent.enabled;
    const detail = await api(`/agents/${agent.id}`); const version = detail.data.agent.versions.find(version => version.status === 'APPROVED');
    const check = await api(`/agents/${agent.id}/evaluations`, 'POST', { versionId: version.id }); assert.equal(check.status, 201); assert.equal(check.data.evaluation.passed, true); evaluations.push(check.data.evaluation.id);
    assert.equal((await api(`/agents/${agent.id}/activation`, 'POST', { enabled: true })).status, 200);
    const created = await api('/projects', 'POST', { name: `Company HTTP ${randomUUID()}`, brief: 'Prepare a requirements outline for a fictional library website from the supplied brief. No external research or publishing.' }); assert.equal(created.status, 201); projectId = created.data.project.id;
    const requestKey = randomUUID();
    const draft = await api(`/projects/${projectId}/department-runs`, 'POST', { agentKey: 'business-analyst', budgetCapUsd: 1 }, { 'Idempotency-Key': requestKey }); assert.equal(draft.status, 201); assert.equal(draft.data.run.status, 'DRAFT');
    const duplicate = await api(`/projects/${projectId}/department-runs`, 'POST', { agentKey: 'business-analyst', budgetCapUsd: 1 }, { 'Idempotency-Key': requestKey }); assert.equal(duplicate.data.run.id, draft.data.run.id);
    const accepted = await api(`/runs/${draft.data.run.id}/accept`, 'POST', { plan: draft.data.run.output.plan }); assert.ok([200, 202].includes(accepted.status)); assert.ok(['BLOCKED', 'QUEUED'].includes(accepted.data.status));
    assert.equal(await prisma.operationsTask.count({ where: { workflowRunId: draft.data.run.id } }), 1);
    const stored = await prisma.workflowRun.findUniqueOrThrow({ where: { id: draft.data.run.id } }); assert.equal(stored.output.agentVersionIds['prepare-department-output'], version.id);
    assert.equal(stored.acceptedPlanHash, sha256Json(stored.output.plan));
    await api(`/runs/${draft.data.run.id}/accept`, 'POST', { plan: draft.data.run.output.plan }); assert.equal(await prisma.operationsTask.count({ where: { workflowRunId: draft.data.run.id } }), 1);
    const board = await api(`/tasks?projectId=${projectId}`); assert.equal(board.status, 200); assert.equal(board.data.tasks.length, 1);
    assert.equal((await cancelAndSettle(prisma, draft.data.run.id)).status, 'CANCELED');
  } finally {
    if (originalProfile) { const { displayName, jobTitle, department, communicationStyle, roomKey, deskKey, appearance } = originalProfile; await api('/people/maya', 'PATCH', { displayName, jobTitle, department, communicationStyle, roomKey, deskKey, appearance }); }
    if (agentId) await prisma.agentDefinition.update({ where: { id: agentId }, data: { enabled: originalEnabled } });
    if (projectId) await prisma.operationsProject.deleteMany({ where: { id: projectId } });
    if (evaluations.length) await prisma.agentEvaluation.deleteMany({ where: { id: { in: evaluations } } });
    await prisma.$disconnect();
  }
});

test('Reception intake creates an accepted handoff task assigned to the Reception agent', { skip: !base || !database }, async () => {
  process.env.DATABASE_URL = database;
  const { PrismaClient } = await import('@prisma/client');
  const prisma = new PrismaClient();
  let projectId;
  let agentId;
  let originalEnabled;
  let evaluationId;

  try {
    const people = await api('/people');
    const receptionist = people.data.profiles.find(profile => profile.key === 'receptionist');
    assert.equal(receptionist.roomKey, 'reception-lobby');
    assert.equal(receptionist.deskKey, 'lobby-reception-desk');
    assert.equal(receptionist.agentDefinition.key, 'receptionist');

    const registry = await api('/agents');
    const agent = registry.data.agents.find(item => item.key === 'receptionist');
    assert.ok(agent);
    agentId = agent.id;
    originalEnabled = agent.enabled;
    const detail = await api(`/agents/${agent.id}`);
    const version = detail.data.agent.versions.find(item => item.status === 'APPROVED');
    assert.ok(version);
    const evaluation = await api(`/agents/${agent.id}/evaluations`, 'POST', { versionId: version.id });
    assert.equal(evaluation.status, 201);
    assert.equal(evaluation.data.evaluation.passed, true);
    evaluationId = evaluation.data.evaluation.id;
    assert.equal((await api(`/agents/${agent.id}/activation`, 'POST', { enabled: true })).status, 200);

    const created = await api('/projects', 'POST', {
      name: `Reception intake ${randomUUID()}`,
      brief: 'A visitor asks for a meeting about an accessible library website. Prepare an internal intake classification and a reply draft only; do not contact or schedule anyone.',
    });
    assert.equal(created.status, 201);
    projectId = created.data.project.id;

    const idempotencyKey = randomUUID();
    const draft = await api(`/projects/${projectId}/department-runs`, 'POST', { agentKey: 'receptionist', budgetCapUsd: 1 }, { 'Idempotency-Key': idempotencyKey });
    assert.equal(draft.status, 201);
    assert.equal(draft.data.run.status, 'DRAFT');
    assert.equal(draft.data.run.output.plan.tasks[0].assigneeKey, 'receptionist');

    const accepted = await api(`/runs/${draft.data.run.id}/accept`, 'POST', { plan: draft.data.run.output.plan });
    assert.ok([200, 202].includes(accepted.status));
    assert.ok(['BLOCKED', 'QUEUED'].includes(accepted.data.status));
    const task = await prisma.operationsTask.findFirstOrThrow({ where: { workflowRunId: draft.data.run.id } });
    assert.equal(task.agentDefinitionId, agentId);
    assert.equal((await cancelAndSettle(prisma, draft.data.run.id)).status, 'CANCELED');
  } finally {
    if (agentId) await prisma.agentDefinition.update({ where: { id: agentId }, data: { enabled: originalEnabled } });
    if (projectId) await prisma.operationsProject.deleteMany({ where: { id: projectId } });
    if (evaluationId) await prisma.agentEvaluation.deleteMany({ where: { id: evaluationId } });
    await prisma.$disconnect();
  }
});
