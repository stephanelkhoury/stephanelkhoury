import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authorizeOperationsRequest, operationsAccessError } from '@/lib/operations/auth';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const access = await authorizeOperationsRequest(request);
  if (!access.ok) return operationsAccessError(access);

  try {
    const workspaceId = access.workspaceId;
    const [
      projectCount,
      activeProjectCount,
      projectStatuses,
      taskStatuses,
      blockedTaskCount,
      pendingWorkflowApprovalCount,
      pendingArtifactApprovalCount,
      blockedTasks,
      recentArtifacts,
      recentEvents,
      usage,
      enabledAgentCount,
      approvedAgentCount,
      integrations,
      recentProjects,
      workflowApprovals,
      artifactApprovals,
      usageCount,
    ] = await Promise.all([
      prisma.operationsProject.count({ where: { workspaceId, status: { not: 'ARCHIVED' } } }),
      prisma.operationsProject.count({ where: { workspaceId, status: 'ACTIVE' } }),
      prisma.operationsProject.groupBy({ by: ['status'], where: { workspaceId }, _count: { _all: true } }),
      prisma.operationsTask.groupBy({ by: ['status'], where: { workspaceId }, _count: { _all: true } }),
      prisma.operationsTask.count({ where: { workspaceId, status: { in: ['BLOCKED', 'AWAITING_INPUT', 'AWAITING_APPROVAL'] } } }),
      prisma.workflowApproval.count({ where: { workspaceId, status: 'PENDING' } }),
      prisma.approval.count({ where: { workspaceId, status: 'PENDING' } }),
      prisma.operationsTask.findMany({
        where: { workspaceId, status: { in: ['BLOCKED', 'AWAITING_INPUT', 'AWAITING_APPROVAL'] } },
        orderBy: { updatedAt: 'desc' },
        take: 6,
        select: { id: true, title: true, status: true, error: true, updatedAt: true, project: { select: { id: true, name: true } }, workflowRunId: true, planKey: true },
      }),
      prisma.artifact.findMany({
        where: { workspaceId },
        orderBy: { updatedAt: 'desc' },
        take: 6,
        select: {
          id: true,
          title: true,
          kind: true,
          status: true,
          updatedAt: true,
          project: { select: { id: true, name: true } },
          versions: { orderBy: { version: 'desc' }, take: 1, select: { id: true, version: true, contentType: true, storageKey: true, createdAt: true } },
        },
      }),
      prisma.workflowEvent.findMany({
        where: { workspaceId },
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: { id: true, type: true, message: true, taskKey: true, createdAt: true, workflowRun: { select: { id: true, project: { select: { id: true, name: true } } } } },
      }),
      prisma.usageRecord.aggregate({
        where: { workspaceId },
        _sum: { inputTokens: true, outputTokens: true, costUsd: true, estimatedCostUsd: true },
      }),
      prisma.agentDefinition.count({ where: { workspaceId, enabled: true } }),
      prisma.agentDefinition.count({ where: { workspaceId, enabled: true, versions: { some: { status: 'APPROVED' } } } }),
      prisma.integration.findMany({ where: { workspaceId }, orderBy: { provider: 'asc' }, select: { id: true, provider: true, status: true, connectedAt: true, updatedAt: true } }),
      prisma.operationsProject.findMany({
        where: { workspaceId, status: { not: 'ARCHIVED' } },
        orderBy: [{ updatedAt: 'desc' }, { name: 'asc' }],
        take: 6,
        select: { id: true, name: true, summary: true, status: true, updatedAt: true, _count: { select: { tasks: true } } },
      }),
      prisma.workflowApproval.findMany({
        where: { workspaceId, status: 'PENDING' },
        orderBy: { createdAt: 'asc' },
        take: 8,
        select: { id: true, actionKey: true, actionHash: true, createdAt: true, task: { select: { title: true, planKey: true } }, workflowRun: { select: { id: true, project: { select: { id: true, name: true } } } } },
      }),
      prisma.approval.findMany({
        where: { workspaceId, status: 'PENDING' },
        orderBy: { createdAt: 'asc' },
        take: 8,
        select: { id: true, createdAt: true, comment: true, artifactVersion: { select: { id: true, version: true, contentType: true, metadata: true, artifact: { select: { id: true, title: true, kind: true, project: { select: { id: true, name: true } } } } } } },
      }),
      prisma.usageRecord.count({ where: { workspaceId } }),
    ]);

    return NextResponse.json({
      projects: {
        total: projectCount,
        active: activeProjectCount,
        byStatus: Object.fromEntries(projectStatuses.map(({ status, _count }) => [status, _count._all])),
      },
      tasks: {
        byStatus: Object.fromEntries(taskStatuses.map(({ status, _count }) => [status, _count._all])),
        blockedCount: blockedTaskCount,
        blocked: blockedTasks,
      },
      approvals: { pending: pendingWorkflowApprovalCount + pendingArtifactApprovalCount, workflowPending: pendingWorkflowApprovalCount, artifactPending: pendingArtifactApprovalCount, workflowItems: workflowApprovals, artifactItems: artifactApprovals },
      deliverables: recentArtifacts,
      recentProjects,
      activity: recentEvents,
      usage: {
        records: usageCount,
        inputTokens: usage._sum.inputTokens ?? 0,
        outputTokens: usage._sum.outputTokens ?? 0,
        reportedCostUsd: usage._sum.costUsd?.toString() ?? null,
        estimatedCostUsd: usage._sum.estimatedCostUsd?.toString() ?? null,
      },
      agents: { enabled: enabledAgentCount, approved: approvedAgentCount, executionConfigured: false },
      integrations,
    });
  } catch {
    return NextResponse.json({ error: 'Command center data could not be loaded.' }, { status: 503 });
  }
}