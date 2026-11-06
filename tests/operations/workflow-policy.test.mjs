import assert from 'node:assert/strict';
import { test } from 'node:test';
import { decideTaskExecution, workflowDispatchIdempotencyKey, workflowLeaseClaimConditions } from '../../src/lib/operations/workflow-policy.ts';

const validInput = {
  planAccepted: true,
  cancelRequested: false,
  taskStatus: 'QUEUED',
  dependencies: ['SUCCEEDED'],
  hasAssignedAgent: true,
  agentApproved: true,
  requiresIsolatedCodeExecution: false,
  isolatedCodeExecutionConfigured: false,
  requiredApprovalKeys: [],
  approvals: [],
  estimatedSpentUsd: 0.1,
  nextTaskEstimatedUsd: 0.2,
  budgetCapUsd: 1,
};

test('only accepted tasks with satisfied dependencies are eligible to run', () => {
  assert.deepEqual(decideTaskExecution(validInput), { kind: 'RUN' });
  assert.equal(decideTaskExecution({ ...validInput, planAccepted: false }).kind, 'BLOCKED');
  assert.equal(decideTaskExecution({ ...validInput, dependencies: ['RUNNING'] }).kind, 'BLOCKED');
});

test('duplicate completed work is skipped and cancellation wins before execution', () => {
  assert.equal(decideTaskExecution({ ...validInput, taskStatus: 'SUCCEEDED' }).kind, 'SKIP');
  assert.equal(decideTaskExecution({ ...validInput, cancelRequested: true }).kind, 'CANCELED');
  assert.equal(workflowDispatchIdempotencyKey('workspace', 'run', 2), 'workflow-run:workspace:run:dispatch:2');
});

test('lease recovery permits the same Trigger run to resume and other runs only after expiry', () => {
  const now = new Date('2026-11-06T12:00:00.000Z');
  const conditions = workflowLeaseClaimConditions('trigger-run-1', now);
  assert.deepEqual(conditions[0], { status: 'QUEUED' });
  assert.deepEqual(conditions[1], { status: 'RUNNING', leaseOwner: 'trigger-run-1' });
  assert.deepEqual(conditions[2], { status: 'RUNNING', leaseExpiresAt: { lt: now } });
});

test('missing assignment or isolation never falls back to unsafe execution', () => {
  assert.equal(decideTaskExecution({ ...validInput, hasAssignedAgent: false }).kind, 'AWAITING_INPUT');
  assert.equal(decideTaskExecution({ ...validInput, requiresIsolatedCodeExecution: true }).kind, 'AWAITING_INPUT');
});

test('budget exhaustion and missing exact approval block the task', () => {
  assert.equal(decideTaskExecution({ ...validInput, estimatedSpentUsd: 0.9, nextTaskEstimatedUsd: 0.2 }).kind, 'BLOCKED');
  assert.equal(decideTaskExecution({ ...validInput, requiredApprovalKeys: ['publish'], approvals: [] }).kind, 'AWAITING_APPROVAL');
  assert.equal(decideTaskExecution({
    ...validInput,
    requiredApprovalKeys: ['publish'],
    approvals: [{ actionKey: 'publish', actionHash: 'invalid', status: 'APPROVED' }],
  }).kind, 'AWAITING_APPROVAL');
  assert.equal(decideTaskExecution({
    ...validInput,
    requiredApprovalKeys: ['publish'],
    approvals: [{ actionKey: 'publish', actionHash: 'a'.repeat(64), status: 'APPROVED' }],
  }).kind, 'RUN');
  assert.equal(decideTaskExecution({
    ...validInput,
    requiredApprovalKeys: ['publish'],
    approvals: [{ actionKey: 'publish', actionHash: 'a'.repeat(64), status: 'REJECTED' }],
  }).kind, 'BLOCKED');
});