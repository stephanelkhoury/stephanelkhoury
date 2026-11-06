import assert from 'node:assert/strict';
import { test } from 'node:test';
import { evaluateAgentContract } from '../../src/lib/operations/agent-evaluation.ts';
import { characterProfileSchema } from '../../src/lib/operations/character-validation.ts';
import { deliveryReviewState } from '../../src/lib/operations/delivery-review.ts';
import { taskReadiness } from '../../src/lib/operations/task-readiness.ts';
import { starterAgents, starterCharacters } from '../../prisma/operations-seed-data.mjs';

test('contract evaluation rejects unregistered tools and a zero tool-call budget', () => {
  const contract = Object.fromEntries(Object.entries(starterAgents[0]).filter(([key]) => !['key', 'capabilities', 'status'].includes(key)));
  assert.equal(evaluateAgentContract(contract, []).passed, true);
  assert.equal(evaluateAgentContract({ ...contract, modelProvider: 'anthropic' }, []).passed, true);
  assert.equal(evaluateAgentContract({ ...contract, modelProvider: 'openai' }, []).passed, true);
  assert.equal(evaluateAgentContract({ ...contract, modelProvider: 'unknown' }, []).passed, false);
  assert.equal(evaluateAgentContract({ ...contract, allowedTools: ['publish.anywhere'], maxToolCalls: 1 }, []).passed, false);
  assert.equal(evaluateAgentContract({ ...contract, allowedTools: ['read.brief'], maxToolCalls: 0 }, ['read.brief']).passed, false);
});
test('profile edits accept valid room/desk pairs and reject arbitrary appearance or mismatched rooms', () => {
  for (const { displayName, jobTitle, department, communicationStyle, roomKey, deskKey, appearance } of starterCharacters) {
    assert.equal(characterProfileSchema.safeParse({ displayName, jobTitle, department, communicationStyle, roomKey, deskKey, appearance }).success, true, displayName);
  }
  const { displayName, jobTitle, department, communicationStyle, roomKey, deskKey, appearance } = starterCharacters[0];
  const profile = { displayName, jobTitle, department, communicationStyle, roomKey, deskKey, appearance };
  assert.equal(characterProfileSchema.safeParse({ ...profile, roomKey: 'engineering' }).success, false);
  assert.equal(characterProfileSchema.safeParse({ ...profile, appearance: { ...appearance, skinTone: 'url(https://example.test)' } }).success, false);
});
test('delivery completion requires approval of every current version, including a previously rejected version', () => {
  const version = status => ({ approvals: [{ status }] });
  assert.equal(deliveryReviewState([]), 'PENDING');
  assert.equal(deliveryReviewState([version('APPROVED'), version('PENDING')]), 'PENDING');
  assert.equal(deliveryReviewState([version('APPROVED'), version('REJECTED')]), 'REJECTED');
  assert.equal(deliveryReviewState([version('APPROVED'), version('CHANGES_REQUESTED')]), 'CHANGES_REQUESTED');
  assert.equal(deliveryReviewState([version('APPROVED'), version('APPROVED')]), 'APPROVED');
});
test('task board reports upstream and owner gates before dispatch eligibility', () => {
  const input = { status: 'QUEUED', accepted: true, cancelRequested: false, enabled: true, approved: true, dependencies: [], approvals: [] };
  assert.equal(taskReadiness(input).state, 'READY');
  assert.equal(taskReadiness({ ...input, dependencies: [{ title: 'Approve design', status: 'AWAITING_APPROVAL' }] }).state, 'DEPENDENCIES');
  assert.equal(taskReadiness({ ...input, approvals: [{ status: 'PENDING' }] }).state, 'OWNER');
  assert.equal(taskReadiness({ ...input, approvals: [{ status: 'REJECTED' }] }).state, 'BLOCKED');
  assert.equal(taskReadiness({ ...input, cancelRequested: true }).state, 'CANCELED');
});

test('architectural navigation routes to room entrances without crossing the rendered walls', async () => {
  const { architecturalBlockers, roomArrivalPoint } = await import('../../src/lib/operations/company-navigation.ts');
  const { companyFloors } = await import('../../src/lib/operations/company-catalog.ts');
  const { canOccupyWorldPoint, findWalkPath, OWNER_SPAWN } = await import('../../src/lib/operations/headquarters-model.ts');
  for (const floor of companyFloors) {
    const blockers = architecturalBlockers(floor.rooms);
    for (const room of floor.rooms) {
      const target = roomArrivalPoint(room);
      assert.equal(canOccupyWorldPoint(target, blockers), true, `${floor.key}/${room.name} entrance should be reachable`);
      const path = findWalkPath(OWNER_SPAWN, target, blockers);
      assert.ok(path.length > 0, `${floor.key}/${room.name} should have a path`);
      assert.ok(path.every(point => canOccupyWorldPoint(point, blockers)), `${room.name} path must remain clear of partitions and desks`);
    }
  }
  assert.equal(canOccupyWorldPoint({ x: -3, z: -9.5 }, architecturalBlockers(companyFloors[1].rooms)), false);
});
