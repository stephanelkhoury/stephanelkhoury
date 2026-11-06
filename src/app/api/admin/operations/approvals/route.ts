import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authorizeOperationsRequest, operationsAccessError } from '@/lib/operations/auth';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const access = await authorizeOperationsRequest(request);
  if (!access.ok) return operationsAccessError(access);
  const projectId = request.nextUrl.searchParams.get('projectId');

  try {
    const [workflow, artifacts] = await Promise.all([
      prisma.workflowApproval.findMany({
        where: { workspaceId: access.workspaceId, status: 'PENDING', ...(projectId ? { workflowRun: { projectId } } : {}) },
        orderBy: { createdAt: 'asc' },
        take: 100,
        select: {
          id: true,
          actionKey: true,
          actionPayload: true,
          actionHash: true,
          createdAt: true,
          task: { select: { id: true, title: true, planKey: true } },
          workflowRun: { select: { id: true, status: true, project: { select: { id: true, name: true } } } },
        },
      }),
      prisma.approval.findMany({
        where: { workspaceId: access.workspaceId, status: 'PENDING', ...(projectId ? { artifactVersion: { artifact: { projectId } } } : {}) },
        orderBy: { createdAt: 'asc' },
        take: 100,
        select: {
          id: true,
          createdAt: true,
          comment: true,
          artifactVersion: {
            select: {
              id: true,
              version: true,
              contentType: true,
              textContent: true,
              storageKey: true,
              metadata: true,
              artifact: { select: { id: true, title: true, kind: true, project: { select: { id: true, name: true } } } },
            },
          },
        },
      }),
    ]);
    return NextResponse.json({ workflow, artifacts });
  } catch {
    return NextResponse.json({ error: 'Approvals could not be loaded.' }, { status: 503 });
  }
}