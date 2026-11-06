import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
export async function persistDepartmentOutput(input: { workspaceId: string; projectId: string; workflowRunId: string; taskId: string; agentDefinitionId: string; agentVersionId: string; title: string; output: unknown; inputReferences: { briefSha256: string; acceptedPlanHash: string; knowledgeDocumentIds: string[] } }) {
  return prisma.$transaction(async tx => {
    const existing = await tx.artifactVersion.findFirst({ where: { workspaceId: input.workspaceId, workflowRunId: input.workflowRunId, taskId: input.taskId }, select: { id: true } });
    if (existing) return existing;
    const owner = await tx.membership.findFirstOrThrow({ where: { workspaceId: input.workspaceId, role: 'OWNER', status: 'ACTIVE' } });
    const artifact = await tx.artifact.create({ data: { workspaceId: input.workspaceId, projectId: input.projectId, title: input.title, kind: 'DEPARTMENT_PLANNING_OUTPUT', status: 'IN_REVIEW' } });
    const version = await tx.artifactVersion.create({ data: { workspaceId: input.workspaceId, projectId: input.projectId, artifactId: artifact.id, workflowRunId: input.workflowRunId, taskId: input.taskId, agentDefinitionId: input.agentDefinitionId, agentVersionId: input.agentVersionId, inputReferences: input.inputReferences, version: 1, textContent: JSON.stringify(input.output, null, 2), contentType: 'application/json; charset=utf-8', metadata: { service: 'department-planning-v1', execution: 'structured-text-only', humanReview: 'required', externalActionsPerformed: false } as Prisma.InputJsonValue } });
    await tx.approval.create({ data: { workspaceId: input.workspaceId, artifactId: artifact.id, artifactVersionId: version.id, reviewerId: owner.userId } });
    await tx.workflowEvent.create({ data: { workspaceId: input.workspaceId, workflowRunId: input.workflowRunId, type: 'department.output_ready', message: 'Structured planning output saved as an exact artifact version for owner review. No external action was performed.' } });
    return version;
  });
}
