import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authorizeOperationsRequest, operationsAccessError } from '@/lib/operations/auth';
import { cancelDispatchedRun } from '@/lib/operations/workflow-dispatch';

export const runtime = 'nodejs';

type RouteContext = { params: Promise<{ runId: string }> };

export async function POST(request: NextRequest, { params }: RouteContext) {
  const access = await authorizeOperationsRequest(request);
  if (!access.ok) return operationsAccessError(access);
  const { runId } = await params;

  try {
    const run = await prisma.workflowRun.findUnique({
      where: { workspaceId_id: { workspaceId: access.workspaceId, id: runId } },
      select: { id: true, status: true, externalRunId: true, cancelRequestedAt: true },
    });
    if (!run) return NextResponse.json({ error: 'Workflow run not found.' }, { status: 404 });
    if (['SUCCEEDED', 'FAILED', 'CANCELED'].includes(run.status)) {
      return NextResponse.json({ run, duplicate: true });
    }
    if (run.cancelRequestedAt) return NextResponse.json({ run, duplicate: true }, { status: 202 });

    const running = run.status === 'RUNNING';
    await prisma.$transaction([
      prisma.workflowRun.update({
        where: { workspaceId_id: { workspaceId: access.workspaceId, id: runId } },
        data: {
          cancelRequestedAt: new Date(),
          ...(!running && { status: 'CANCELED', finishedAt: new Date(), leaseOwner: null, leaseExpiresAt: null }),
        },
      }),
      prisma.operationsTask.updateMany({
        where: { workspaceId: access.workspaceId, workflowRunId: runId, status: { in: ['QUEUED', 'DRAFT', 'AWAITING_INPUT', 'AWAITING_APPROVAL', 'BLOCKED'] } },
        data: { status: 'CANCELED' },
      }),
      prisma.workflowEvent.create({
        data: { workspaceId: access.workspaceId, workflowRunId: runId, type: 'run.cancel_requested', message: running ? 'Owner requested cancellation of the running worker.' : 'Owner canceled the queued workflow.' },
      }),
      prisma.auditEvent.create({
        data: { workspaceId: access.workspaceId, actorId: access.userId, action: 'workflow.canceled', resource: 'WorkflowRun', resourceId: runId },
      }),
    ]);

    if (run.externalRunId) {
      try {
        await cancelDispatchedRun(run.externalRunId);
      } catch {
        return NextResponse.json({ error: 'Cancellation was recorded, but Trigger.dev did not confirm the stop request.', cancelRequested: true }, { status: 202 });
      }
    }

    if (running) {
      return NextResponse.json({ cancelRequested: true, status: 'RUNNING' }, { status: 202 });
    }
    await prisma.workflowEvent.create({
      data: { workspaceId: access.workspaceId, workflowRunId: runId, type: 'run.canceled', message: 'Queued workflow canceled before execution.' },
    });
    return NextResponse.json({ status: 'CANCELED' });
  } catch {
    return NextResponse.json({ error: 'Workflow cancellation could not be recorded.' }, { status: 503 });
  }
}