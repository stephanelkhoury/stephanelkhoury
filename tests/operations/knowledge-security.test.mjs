import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createKnowledgeScopeFilter, createKnowledgeRecordSchema, knowledgeScopeSchema } from '../../src/lib/operations/knowledge-validation.ts';

test('client and project knowledge filters require one exact tenant scope', () => {
  assert.equal(knowledgeScopeSchema.safeParse('UNKNOWN_SCOPE').success, false);
  assert.deepEqual(createKnowledgeScopeFilter({ scope: 'CLIENT', clientId: 'client-a' }), { scope: 'CLIENT', clientId: 'client-a' });
  assert.deepEqual(createKnowledgeScopeFilter({ scope: 'PROJECT', projectId: 'project-a' }), { scope: 'PROJECT', projectId: 'project-a' });
  assert.throws(() => createKnowledgeScopeFilter({ scope: 'CLIENT' }), /exact client ID/);
  assert.throws(() => createKnowledgeScopeFilter({ scope: 'PROJECT' }), /exact project ID/);
  assert.throws(() => createKnowledgeScopeFilter({ scope: 'COMPANY', clientId: 'client-a' }), /cannot include/);
});

test('requires scope ownership for client, project, and agent instruction records', () => {
  const base = { title: 'Brand voice', source: 'Owner-provided brief', evidenceStatus: 'OWNER_CONFIRMED', content: 'Use plain language.' };
  assert.equal(createKnowledgeRecordSchema.safeParse({ ...base, scope: 'CLIENT' }).success, false);
  assert.equal(createKnowledgeRecordSchema.safeParse({ ...base, scope: 'PROJECT' }).success, false);
  assert.equal(createKnowledgeRecordSchema.safeParse({ ...base, scope: 'AGENT_INSTRUCTIONS' }).success, false);
  assert.equal(createKnowledgeRecordSchema.safeParse({ ...base, scope: 'CLIENT', clientId: 'client-a' }).success, true);
});
