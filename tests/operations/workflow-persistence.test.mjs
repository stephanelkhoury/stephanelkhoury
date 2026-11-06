import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { test } from 'node:test';
import { sha256Json } from '../../src/lib/operations/json-hash.ts';

const testDatabaseUrl = process.env.OPERATIONS_TEST_DATABASE_URL;
if (testDatabaseUrl) {
  const parsedUrl = new URL(testDatabaseUrl);
  const databaseName = parsedUrl.pathname.replace(/^\//, '').split('?')[0];
  if (!['localhost', '127.0.0.1', '::1'].includes(parsedUrl.hostname) || !databaseName.startsWith('multigraphic_ai_validation_')) {
    throw new Error('OPERATIONS_TEST_DATABASE_URL must target a local multigraphic_ai_validation_* database.');
  }
  process.env.DATABASE_URL = testDatabaseUrl;
}

test('execution idempotency, exact approval hashes, tool-call audit, and usage basis persist', { skip: !testDatabaseUrl }, async () => {
  const { PrismaClient } = await import('@prisma/client');
  const prisma = new PrismaClient();
  const suffix = randomUUID();
  let projectId;
  let workflowDefinitionId;
  let runId;

  try {
    const workspace = await prisma.workspace.findUniqueOrThrow({ where: { slug: 'multigraphic-ai' } });
    const owner = await prisma.user.findUniqueOrThrow({ where: { email: 'validation-owner@example.test' } });
    const agent = await prisma.agentDefinition.findUniqueOrThrow({ where: { workspaceId_key: { workspaceId: workspace.id, key: 'project-manager' } } });
    const agentVersion = await prisma.agentVersion.findFirstOrThrow({ where: { workspaceId: workspace.id, agentDefinitionId: agent.id, status: 'APPROVED' } });
    const project = await prisma.operationsProject.create({
      data: { workspaceId: workspace.id, name: `Execution test ${suffix}`, slug: `execution-test-${suffix}` },
    });
    projectId = project.id;

    const definition = await prisma.workflowDefinition.create({
      data: { workspaceId: workspace.id, key: `execution-test-${suffix}`, name: 'Execution persistence test', definition: { version: 1 } },
    });
    workflowDefinitionId = definition.id;
    const run = await prisma.workflowRun.create({
      data: {
        workspaceId: workspace.id,
        workflowDefinitionId: definition.id,
        projectId: project.id,
        idempotencyKey: `execution-test:${suffix}`,
        status: 'DRAFT',
        budgetCapUsd: 2,
      },
    });
    runId = run.id;
    await assert.rejects(prisma.workflowRun.create({
      data: { workspaceId: workspace.id, workflowDefinitionId: definition.id, projectId: project.id, idempotencyKey: `execution-test:${suffix}`, status: 'DRAFT' },
    }));

    const operationTask = await prisma.operationsTask.create({
      data: {
        workspaceId: workspace.id,
        projectId: project.id,
        workflowRunId: run.id,
        planKey: 'review-copy',
        agentDefinitionId: agent.id,
        title: 'Review copy',
        description: 'Review the approved project copy.',
        status: 'AWAITING_APPROVAL',
        requiredApprovals: ['publish-copy'],
        acceptanceCriteria: ['Every approved claim has evidence.'],
        estimatedCostUsd: 0.25,
      },
    });

    const actionPayload = { actionKey: 'publish-copy', task: { title: 'Review copy', planKey: 'review-copy' } };
    const actionHash = sha256Json(actionPayload);
    const approval = await prisma.workflowApproval.create({
      data: {
        workspaceId: workspace.id,
        workflowRunId: run.id,
        projectId: project.id,
        taskId: operationTask.id,
        actionKey: 'publish-copy',
        actionPayload,
        actionHash,
        reviewerId: owner.id,
      },
    });
    const persistedApproval = await prisma.workflowApproval.findUniqueOrThrow({ where: { workspaceId_id: { workspaceId: workspace.id, id: approval.id } } });
    assert.equal(sha256Json(persistedApproval.actionPayload), actionHash);

    const agentRun = await prisma.agentRun.create({
      data: {
        workspaceId: workspace.id,
        projectId: project.id,
        taskId: operationTask.id,
        workflowRunId: run.id,
        agentDefinitionId: agent.id,
        agentVersionId: agentVersion.id,
        status: 'RUNNING',
      },
    });
    const toolCall = await prisma.toolCall.create({
      data: {
        workspaceId: workspace.id,
        agentRunId: agentRun.id,
        name: 'operations.project.read_brief',
        status: 'RUNNING',
        policy: 'READ_ONLY',
        idempotencyKey: `${agentRun.id}:read-brief`,
        timeoutMs: 5000,
      },
    });
    await prisma.toolCall.update({ where: { id: toolCall.id }, data: { status: 'SUCCEEDED', output: { projectId: project.id } } });
    assert.equal((await prisma.toolCall.findUniqueOrThrow({ where: { id: toolCall.id } })).status, 'SUCCEEDED');
    await assert.rejects(prisma.toolCall.create({
      data: { workspaceId: workspace.id, agentRunId: agentRun.id, name: 'operations.project.read_brief', status: 'RUNNING', idempotencyKey: `${agentRun.id}:read-brief` },
    }));

    const usage = await prisma.usageRecord.create({
      data: { workspaceId: workspace.id, workflowRunId: run.id, agentRunId: agentRun.id, provider: 'gemini', model: 'gemini-3.8-flash', inputTokens: 10, outputTokens: 5, estimatedCostUsd: 0.0001, costBasis: 'ESTIMATED' },
    });
    assert.equal(Number(usage.estimatedCostUsd), 0.0001);
    assert.equal(usage.costUsd, null);
    assert.equal(usage.costBasis, 'ESTIMATED');
  } finally {
    if (runId) await prisma.workflowRun.deleteMany({ where: { id: runId } });
    if (workflowDefinitionId) await prisma.workflowDefinition.deleteMany({ where: { id: workflowDefinitionId } });
    if (projectId) await prisma.operationsProject.deleteMany({ where: { id: projectId } });
    await prisma.$disconnect();
  }
});