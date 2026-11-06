import assert from 'node:assert/strict';
import { test } from 'node:test';
import { authorizeOperationsTool, isToolScopeAllowed } from '../../src/lib/operations/tool-policy.ts';

test('agent contracts must explicitly allow a tool', () => {
  assert.equal(authorizeOperationsTool({
    toolName: 'operations.project.read_brief',
    allowedTools: [],
    sideEffectPolicy: 'READ_ONLY',
    requiresApproval: false,
  }).allowed, false);
  assert.equal(authorizeOperationsTool({
    toolName: 'operations.project.read_brief',
    allowedTools: ['operations.project.read_brief'],
    sideEffectPolicy: 'READ_ONLY',
    requiresApproval: false,
  }).allowed, true);
});

test('consequential tools require a hash-matched approval for the exact payload', () => {
  const base = { toolName: 'publish', allowedTools: ['publish'], sideEffectPolicy: 'EXTERNAL', requiresApproval: true, expectedActionHash: 'a'.repeat(64) };
  assert.equal(authorizeOperationsTool(base).allowed, false);
  assert.equal(authorizeOperationsTool({ ...base, approvedActionHash: 'b'.repeat(64) }).allowed, false);
  assert.equal(authorizeOperationsTool({ ...base, approvedActionHash: 'a'.repeat(64) }).allowed, true);
});

test('tool context cannot cross workspace or project boundaries', () => {
  const scope = { requestedWorkspaceId: 'ws-1', requestedProjectId: 'project-a', agentRunWorkspaceId: 'ws-1', agentRunProjectId: 'project-a' };
  assert.equal(isToolScopeAllowed(scope), true);
  assert.equal(isToolScopeAllowed({ ...scope, requestedProjectId: 'project-b' }), false);
  assert.equal(isToolScopeAllowed({ ...scope, requestedWorkspaceId: 'ws-2' }), false);
});