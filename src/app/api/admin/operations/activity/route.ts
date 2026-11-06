import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authorizeOperationsRequest, operationsAccessError } from '@/lib/operations/auth';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const access = await authorizeOperationsRequest(request);
  if (!access.ok) return operationsAccessError(access);
  const projectId = request.nextUrl.searchParams.get('projectId');

  try {
    const [workflow, audit] = await Promise.all([
      prisma.workflowEvent.findMany({
        where: { workspaceId: access.workspaceId, ...(projectId ? { workflowRun: { projectId } } : {}) },
        orderBy: { createdAt: 'desc' },
        take: 100,
        select: { id: true, type: true, message: true, taskKey: true, metadata: true, createdAt: true, workflowRun: { select: { id: true, project: { select: { id: true, name: true } } } } },
      }),
      prisma.auditEvent.findMany({
        where: {
          workspaceId: access.workspaceId,
          ...(projectId ? { OR: [
            { resource: 'OperationsProject', resourceId: projectId },
            { metadata: { path: ['projectId'], equals: projectId } },
          ] } : {}),
        },
        orderBy: { createdAt: 'desc' },
        take: 100,
        select: { id: true, action: true, resource: true, resourceId: true, metadata: true, createdAt: true, actorMembership: { select: { user: { select: { name: true } } } } },
      }),
    ]);
    return NextResponse.json({ workflow, audit });
  } catch {
    return NextResponse.json({ error: 'Activity could not be loaded.' }, { status: 503 });
  }
}