import assert from 'node:assert/strict';
import { test } from 'node:test';
import { starterCharacters, starterAgents } from '../../prisma/operations-seed-data.mjs';
import { DESK_POSITIONS, findWalkPath, FIRST_FLOOR_ROOMS, FLOOR_WALLS, PLANNED_HEADQUARTERS_LEVELS, resolveCharacterStatus } from '../../src/lib/operations/headquarters-model.ts';

test('starter character profiles cover the owner and every agent role with unique desks', () => {
  assert.equal(starterCharacters.length, starterAgents.length + 1);
  assert.deepEqual(starterCharacters.filter(character => character.agentKey).map(character => character.agentKey).sort(), starterAgents.map(agent => agent.key).sort());
  assert.equal(new Set(starterCharacters.map(({ deskKey }) => deskKey)).size, starterCharacters.length);
  assert.ok(starterCharacters.every(({ roomKey, deskKey }) => [...FIRST_FLOOR_ROOMS, ...PLANNED_HEADQUARTERS_LEVELS.flatMap(level => level.rooms)].some(({ key }) => key === roomKey) && deskKey in DESK_POSITIONS));
  assert.equal(starterCharacters.find(({ key }) => key === 'stephan')?.agentKey, null);
  assert.equal(starterCharacters.find(({ key }) => key === 'receptionist')?.agentKey, 'receptionist');
  assert.equal(starterCharacters.find(({ key }) => key === 'receptionist')?.roomKey, 'reception-lobby');
  assert.equal(starterCharacters.find(({ key }) => key === 'receptionist')?.deskKey, 'lobby-reception-desk');
});

test('every company department, including Reception, maps to its own agent contract', async () => {
  const { companyDepartments, departmentForRoom } = await import('../../src/lib/operations/company-catalog.ts');
  const reception = companyDepartments.find(department => department.key === 'reception');
  assert.ok(reception);
  assert.equal(companyDepartments.length, 17);
  assert.deepEqual(reception.agentKeys, ['receptionist']);
  assert.equal(reception.roomKey, 'reception-lobby');
  assert.equal(departmentForRoom('reception-lobby')?.key, 'reception');
  assert.ok(companyDepartments.every(department => department.agentKeys.length > 0 && department.agentKeys.every(key => starterAgents.some(agent => agent.key === key))));
});

test('company room program includes delivery support and planned shared facilities', () => {
  const activeRooms = new Set(FIRST_FLOOR_ROOMS.map(({ key }) => key));
  assert.ok(activeRooms.has('team-kitchenette'));
  assert.ok(activeRooms.has('team-restroom'));
  assert.ok(activeRooms.has('delivery-meeting'));
  assert.equal(PLANNED_HEADQUARTERS_LEVELS.length, 2);
  assert.ok(PLANNED_HEADQUARTERS_LEVELS.every(({ status }) => status === 'PLANNED'));
  assert.ok(PLANNED_HEADQUARTERS_LEVELS.every(({ rooms }) => rooms.some(({ key }) => key.endsWith('-kitchenette')) && rooms.some(({ key }) => key.endsWith('-restroom'))));
  assert.ok(PLANNED_HEADQUARTERS_LEVELS.some(({ rooms }) => rooms.some(({ key }) => key === 'reception-lobby')));
  assert.ok(PLANNED_HEADQUARTERS_LEVELS.some(({ rooms }) => rooms.some(({ key }) => key === 'knowledge-library')));
});

test('character state reflects persisted task status before connection readiness', () => {
  assert.equal(resolveCharacterStatus({ latestTaskStatus: 'RUNNING', enabled: false, approvedVersion: false, executionConnected: false }), 'WORKING');
  assert.equal(resolveCharacterStatus({ enabled: true, approvedVersion: true, executionConnected: false }), 'NOT_CONNECTED');
  assert.equal(resolveCharacterStatus({ enabled: false, approvedVersion: true, executionConnected: true }), 'DISABLED');
});

test('presence: meetings, sleeping models, review and finished work resolve from real signals', () => {
  const ready = { enabled: true, approvedVersion: true, executionConnected: true };
  assert.equal(resolveCharacterStatus({ ...ready }), 'IDLE');
  assert.equal(resolveCharacterStatus({ ...ready, modelAwake: false }), 'SLEEPING');
  assert.equal(resolveCharacterStatus({ ...ready, modelAwake: null }), 'IDLE');
  assert.equal(resolveCharacterStatus({ ...ready, inMeeting: true }), 'IN_MEETING');
  assert.equal(resolveCharacterStatus({ ...ready, inMeeting: true, latestTaskStatus: 'RUNNING' }), 'WORKING');
  assert.equal(resolveCharacterStatus({ ...ready, latestTaskStatus: 'SUCCEEDED', latestRunStatus: 'AWAITING_APPROVAL' }), 'REVIEW_REQUIRED');
  assert.equal(resolveCharacterStatus({ ...ready, latestTaskStatus: 'SUCCEEDED', latestRunStatus: 'SUCCEEDED' }), 'IDLE');
  assert.equal(resolveCharacterStatus({ ...ready, latestTaskStatus: 'CANCELED', executionConnected: false }), 'NOT_CONNECTED');
});

test('click-to-move path routes around wall and desk blockers', () => {
  const wall = FLOOR_WALLS[12];
  const path = findWalkPath({ x: -9, z: 0 }, { x: -3, z: -6 }, [wall, { x: -6.5, z: -1.5, width: 1.5, depth: 1.5 }]);
  assert.ok(path.length > 0);
  assert.deepEqual(path.at(-1), { x: -3, z: -6 });
  assert.ok(path.every(({ x, z }) => !(Math.abs(x - wall.x) < wall.width / 2 + 0.28 && Math.abs(z - wall.z) < wall.depth / 2 + 0.28)));
});

test('pathfinding rejects destinations outside the headquarters boundary', () => {
  assert.deepEqual(findWalkPath({ x: -10, z: 0 }, { x: 80, z: 80 }), []);
});