import assert from 'node:assert/strict';
import { test } from 'node:test';
import { agentVersionContractSchema, createAgentSchema, isValidAgentOutputSchema } from '../../src/lib/operations/agent-validation.ts';
import { starterAgents, starterAgentKnowledge } from '../../prisma/operations-seed-data.mjs';

test('all seeded agents satisfy the complete version contract', () => {
  for (const agent of starterAgents) {
    const { key } = agent;
    const contract = Object.fromEntries(Object.entries(agent).filter(([field]) => !['key', 'status', 'capabilities'].includes(field)));
    const parsed = agentVersionContractSchema.safeParse(contract);
    assert.equal(parsed.success, true, `${key}: ${JSON.stringify(parsed.error?.issues)}`);
    assert.equal(createAgentSchema.safeParse({ key, ...contract }).success, true, `${key} should be creatable from its version contract`);
  }
});

test('every AI role has an exact-agent draft handbook with evidence and reasoning-summary boundaries', () => {
  assert.equal(starterAgentKnowledge.length, starterAgents.length);
  assert.equal(new Set(starterAgentKnowledge.map(({ knowledgeKey }) => knowledgeKey)).size, starterAgents.length);
  for (const pack of starterAgentKnowledge) {
    assert.equal(pack.scope, 'AGENT_INSTRUCTIONS', `${pack.agentKey} must use the agent-instruction scope`);
    assert.equal(pack.status, 'DRAFT', `${pack.agentKey} must require owner review`);
    assert.equal(pack.evidenceStatus, 'UNVERIFIED', `${pack.agentKey} must not present generated guidance as owner-confirmed`);
    assert.match(pack.content, /## Output contract/);
    assert.match(pack.content, /## Evaluation checklist/);
    assert.match(pack.content, /concise high-level rationale summary/i);
    assert.match(pack.content, /Do not reveal private chain-of-thought/);
  }
});

test('rejects invalid agent identifiers, incomplete contracts, and malformed output schemas', () => {
  assert.equal(createAgentSchema.safeParse({ key: 'Bad Key' }).success, false);
  assert.equal(agentVersionContractSchema.safeParse({ name: 'Missing contract' }).success, false);
  assert.equal(isValidAgentOutputSchema({ type: 'object', additionalProperties: false, properties: { result: { type: 'unknown' } }, required: ['result'] }), false);
});
