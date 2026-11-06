import assert from 'node:assert/strict';
import { test } from 'node:test';
import { renderMarkdown, skillKey, skillLevel, SKILL_XP, taskRecordMarkdown } from '../../src/lib/operations/skill-model.ts';
import { meetingSeat, presenceLabel } from '../../src/lib/operations/headquarters-model.ts';

test('skill levels progress from Trainee to Expert at fixed XP thresholds', () => {
  assert.deepEqual(skillLevel(0), { level: 1, name: 'Trainee', xp: 0, nextLevelXp: 50 });
  assert.equal(skillLevel(49).level, 1);
  assert.equal(skillLevel(50).name, 'Junior');
  assert.equal(skillLevel(150).name, 'Professional');
  assert.equal(skillLevel(300).name, 'Senior');
  assert.deepEqual(skillLevel(800), { level: 5, name: 'Expert', xp: 800, nextLevelXp: null });
  assert.ok(SKILL_XP.OUTPUT_APPROVED > SKILL_XP.TASK_SUCCEEDED && SKILL_XP.TASK_SUCCEEDED > SKILL_XP.MEETING_CONTRIBUTION);
});

test('skill keys are stable slugs of the contract responsibility', () => {
  assert.equal(skillKey('Specify responsive reflow & keyboard/a11y!'), 'specify-responsive-reflow-keyboard-a11y');
  assert.equal(skillKey('***'), 'general');
});

test('work records render structured output as readable markdown without raw HTML', () => {
  const markdown = renderMarkdown({ summary: 'Plan ready', requirements: ['RTL layout', 'Mobile menu'], tasks: [{ title: 'Wireframe' }], empty: [] });
  assert.match(markdown, /\*\*Summary:\*\* Plan ready/);
  assert.match(markdown, /### Requirements\n\n- RTL layout\n- Mobile menu/);
  assert.match(markdown, /1\. \*\*Title:\*\* Wireframe/);
  assert.match(markdown, /### Empty\n\n_None_/);
  const record = taskRecordMarkdown({ agentName: 'UX', projectName: 'Bakery', taskTitle: 'Wireframes', brief: '', provider: 'ollama', model: 'llama3.1:8b', durationMs: 2500, inputTokens: 10, outputTokens: 5, knowledgeTitles: [], output: { ok: true }, completedAt: new Date('2026-11-06T00:00:00Z') });
  assert.match(record, /^# Wireframes/);
  assert.match(record, /\*\*Model time:\*\* 2\.5s/);
  assert.match(record, /_No brief saved\._/);
  assert.match(record, /No external action was performed/);
});

test('meeting seats alternate table sides and stay inside the meeting room', () => {
  const center = [10, 0];
  const seats = Array.from({ length: 6 }, (_, index) => meetingSeat(center, index));
  assert.equal(new Set(seats.map(seat => `${seat.x},${seat.z}`)).size, 6);
  assert.ok(seats.every(seat => Math.abs(seat.z) <= 1.9 && Math.abs(seat.x - 10) <= 3));
  assert.ok(seats[0].z < 0 && seats[1].z > 0);
});

test('presence labels use owner-facing availability wording', () => {
  assert.equal(presenceLabel('IDLE'), 'Available');
  assert.equal(presenceLabel('SLEEPING'), 'Sleeping');
  assert.equal(presenceLabel('IN_MEETING'), 'In meeting');
  assert.equal(presenceLabel('NOT_CONNECTED'), 'Not available');
  assert.equal(presenceLabel('DISABLED'), 'Not available');
  assert.equal(presenceLabel('BLOCKED'), 'Blocked');
});
