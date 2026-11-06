import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authorizeOperationsRequest, operationsAccessError } from '@/lib/operations/auth';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const access = await authorizeOperationsRequest(request);
  if (!access.ok) return operationsAccessError(access);
  const projectId = request.nextUrl.searchParams.get('projectId');

  try {
    const artifacts = await prisma.artifact.findMany({
      where: { workspaceId: access.workspaceId, ...(projectId ? { projectId } : {}) },
      orderBy: [{ updatedAt: 'desc' }, { title: 'asc' }],
      take: 100,
      select: {
        id: true,
        title: true,
        kind: true,
        status: true,
        updatedAt: true,
        project: { select: { id: true, name: true } },
        versions: {
          orderBy: { version: 'desc' },
          select: {
            id: true,
            version: true,
            storageKey: true,
            contentType: true,
            textContent: true,
            metadata: true,
            createdAt: true,
            workflowRunId: true,
            projectId: true,
            taskId: true,
            agentDefinitionId: true,
            agentVersionId: true,
            inputReferences: true,
            task: { select: { title: true, planKey: true } },
            workflowRun: { select: { status: true, acceptedPlanHash: true } },
            agentVersion: { select: { version: true, name: true, agent: { select: { key: true } } } },
            approvals: { orderBy: { createdAt: 'desc' }, take: 10, select: { id: true, status: true, comment: true, createdAt: true, reviewer: { select: { user: { select: { name: true } } } } } },
          },
        },
      },
    });
    return NextResponse.json({ artifacts });
  } catch {
    return NextResponse.json({ error: 'Deliverables could not be loaded.' }, { status: 503 });
  }
}