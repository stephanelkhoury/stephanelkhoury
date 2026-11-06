import assert from 'node:assert/strict';
import { test } from 'node:test';
import { validateWorkflowPlan } from '../../src/lib/operations/workflow-plan.ts';

const availableAgents = new Set(['project-manager', 'brand-designer']);

function makeTask(key, dependencies = [], assigneeKey = 'brand-designer') {
  return {
    key,
    title: `Task ${key}`,
    description: `Complete the ${key} deliverable for review.`,
    assigneeKey,
    dependencies,
    inputs: ['Approved project brief'],
    acceptanceCriteria: ['The output matches the approved project brief.'],
    estimatedMinutes: 30,
    estimatedCostUsd: 0.1,
    estimatedResources: { modelCalls: 1, toolCalls: 0, computeMinutes: 0 },
    requiredApprovals: [],
  };
}

function makePlan(tasks) {
  return {
    title: 'Website delivery',
    objectives: ['Deliver the approved website scope.'],
    deliverables: ['Reviewed website content'],
    assumptions: [],
    missingInformation: [],
    requiredApprovals: [],
    tasks,
  };
}

test('validates required plan fields and returns a stable dependency order', () => {
  const result = validateWorkflowPlan(makePlan([
    makeTask('launch', ['review']),
    makeTask('review', ['draft']),
    makeTask('draft'),
  ]), availableAgents);

  assert.equal(result.ok, true);
  if (result.ok) assert.deepEqual(result.orderedTasks.map((task) => task.key), ['draft', 'review', 'launch']);
});

test('rejects duplicate, missing, self-referential, and cyclic dependencies', () => {
  assert.equal(validateWorkflowPlan(makePlan([makeTask('a'), makeTask('a')]), availableAgents).ok, false);
  assert.equal(validateWorkflowPlan(makePlan([makeTask('a', ['missing'])]), availableAgents).ok, false);
  assert.equal(validateWorkflowPlan(makePlan([makeTask('a', ['a'])]), availableAgents).ok, false);
  assert.equal(validateWorkflowPlan(makePlan([makeTask('a', ['b']), makeTask('b', ['a'])]), availableAgents).ok, false);
});

test('rejects malformed schemas and assignments to unavailable agents', () => {
  assert.equal(validateWorkflowPlan({ ...makePlan([makeTask('a')]), extra: true }, availableAgents).ok, false);
  assert.equal(validateWorkflowPlan(makePlan([makeTask('a', [], 'software-engineer')]), availableAgents).ok, false);
});