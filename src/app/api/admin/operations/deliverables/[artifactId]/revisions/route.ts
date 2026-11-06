import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { authorizeOperationsRequest, operationsAccessError } from '@/lib/operations/auth';
import { dispatchWorkflowRun } from '@/lib/operations/workflow-dispatch';
import { nextWebsiteRevision } from '@/lib/operations/workflow-plan';

export const runtime = 'nodejs';

type RouteContext = { params: Promise<{ artifactId: string }> };

const revisionSchema = z.object({
  artifactVersionId: z.string().min(1).max(100),
  comment: z.string().trim().min(3).max(2000),
}).strict();

export async function POST(request: NextRequest, { params }: RouteContext) {
  const access = await authorizeOperationsRequest(request);
  if (!access.ok) return operationsAccessError(access);
  const { artifactId } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Request body must be valid JSON.' }, { status: 400 });
  }
  const parsed = revisionSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Add a revision note.' }, { status: 400 });

  try {
    const artifactVersion = await prisma.artifactVersion.findFirst({
      where: { workspaceId: access.workspaceId, artifactId, id: parsed.data.artifactVersionId },
      select: { id: true, workflowRunId: true, artifact: { select: { id: true, status: true, title: true, projectId: true } } },
    });
    if (!artifactVersion || artifactVersion.artifact.status === 'SUPERSEDED') {
      return NextResponse.json({ error: 'Current deliverable version not found.' }, { status: 404 });
    }

    const existingRequest = await prisma.approval.findFirst({ where: { workspaceId: access.workspaceId, artifactVersionId: artifactVersion.id, status: 'CHANGES_REQUESTED' }, select: { id: true } });
    if (existingRequest) return NextResponse.json({ error: 'A revision was already requested for this version.' }, { status: 409 });

    const workflowRun = artifactVersion.workflowRunId
      ? await prisma.workflowRun.findUnique({
        where: { workspaceId_id: { workspaceId: access.workspaceId, id: artifactVersion.workflowRunId } },
        select: { id: true, status: true, acceptedAt: true, dispatchVersion: true, revisionCount: true, output: true },
      })
      : null;
    const output = workflowRun?.output as { revisionCount?: number; plan?: { website?: unknown; tasks?: Array<{ key: string; stage?: string }> } } | null;
    const storedRevisionCount = output?.revisionCount;
    const revisionCount = workflowRun?.revisionCount ?? (Number.isInteger(storedRevisionCount) ? Number(storedRevisionCount) : 0);
    const revisionDecision = nextWebsiteRevision(revisionCount);
    if (workflowRun && !revisionDecision.allowed) {
      return NextResponse.json({ error: revisionDecision.reason }, { status: 409 });
    }
    const revisionTaskKeys = output?.plan?.tasks?.filter((task) => ['IMPLEMENTATION', 'VERIFICATION', 'DELIVERY'].includes(task.stage ?? '')).map((task) => task.key) ?? [];
    const canDispatch = Boolean(workflowRun?.acceptedAt && output?.plan?.website && revisionTaskKeys.length > 0);

    const result = await prisma.$transaction(async (transaction) => {
      const approval = await transaction.approval.create({
        data: {
          workspaceId: access.workspaceId,
          artifactId: artifactVersion.artifact.id,
          artifactVersionId: artifactVersion.id,
          reviewerId: access.userId,
          status: 'CHANGES_REQUESTED',
          comment: parsed.data.comment,
        },
        select: { id: true, status: true, comment: true, createdAt: true },
      });
      await transaction.artifact.update({
        where: { workspaceId_id: { workspaceId: access.workspaceId, id: artifactVersion.artifact.id } },
        data: { status: 'DRAFT' },
      });
      await transaction.auditEvent.create({
        data: {
          workspaceId: access.workspaceId,
          actorId: access.userId,
          action: 'artifact.revision_requested',
          resource: 'ArtifactVersion',
          resourceId: artifactVersion.id,
          metadata: { artifactId, approvalId: approval.id },
        },
      });
      let nextDispatchVersion: number | null = null;
      if (canDispatch && workflowRun) {
        const claimed = await transaction.workflowRun.updateMany({
          where: {
            workspaceId: access.workspaceId,
            id: workflowRun.id,
            acceptedAt: { not: null },
            status: { in: ['AWAITING_APPROVAL', 'SUCCEEDED', 'BLOCKED'] },
            revisionCount: { equals: workflowRun.revisionCount, lt: 2 },
          },
          data: { revisionCount: { increment: 1 }, dispatchVersion: { increment: 1 } },
        });
        if (claimed.count !== 1) throw new Error('Revision budget or run state changed concurrently.');
        await transaction.approval.updateMany({
          where: { workspaceId: access.workspaceId, status: 'PENDING', artifactVersion: { workflowRunId: workflowRun.id } },
          data: { status: 'CHANGES_REQUESTED', reviewerId: access.userId, comment: 'Superseded by the owner-requested website revision.', updatedAt: new Date() },
        });
        await transaction.operationsTask.updateMany({
          where: { workspaceId: access.workspaceId, workflowRunId: workflowRun.id, planKey: { in: revisionTaskKeys } },
          data: { status: 'QUEUED', error: null },
        });
        const updatedRun = await transaction.workflowRun.update({
          where: { workspaceId_id: { workspaceId: access.workspaceId, id: workflowRun.id } },
          data: {
            status: 'QUEUED',
            finishedAt: null,
            error: null,
            output: {
              ...(output as object),
              revisionCount: revisionCount + 1,
              revisionRequest: { artifactVersionId: artifactVersion.id, artifactTitle: artifactVersion.artifact.title, requestedAt: new Date().toISOString() },
            },
          },
          select: { dispatchVersion: true, revisionCount: true },
        });
        nextDispatchVersion = updatedRun.dispatchVersion;
        await transaction.workflowEvent.create({
          data: { workspaceId: access.workspaceId, workflowRunId: workflowRun.id, type: 'website.revision_requested', message: `Owner requested revision ${updatedRun.revisionCount} of 2 for ${artifactVersion.artifact.title}.`, metadata: { artifactVersionId: artifactVersion.id, revisionCount: updatedRun.revisionCount } },
        });
      }
      return { approval, dispatchVersion: nextDispatchVersion };
    });

    if (result.dispatchVersion !== null && workflowRun) {
      const dispatch = await dispatchWorkflowRun(access.workspaceId, workflowRun.id, result.dispatchVersion);
      if (!dispatch.dispatched) {
        await prisma.workflowRun.update({ where: { workspaceId_id: { workspaceId: access.workspaceId, id: workflowRun.id } }, data: { status: 'BLOCKED', error: dispatch.reason } });
        await prisma.workflowEvent.create({ data: { workspaceId: access.workspaceId, workflowRunId: workflowRun.id, type: 'website.revision_dispatch_blocked', message: dispatch.reason } });
        return NextResponse.json({ approval: result.approval, artifactTitle: artifactVersion.artifact.title, runStatus: 'BLOCKED', error: dispatch.reason }, { status: 202 });
      }
      await prisma.workflowRun.update({ where: { workspaceId_id: { workspaceId: access.workspaceId, id: workflowRun.id } }, data: { externalRunId: dispatch.externalRunId } });
      return NextResponse.json({ approval: result.approval, artifactTitle: artifactVersion.artifact.title, runStatus: 'QUEUED', revisionCount: revisionDecision.allowed ? revisionDecision.revisionNumber : revisionCount }, { status: 202 });
    }
    return NextResponse.json({ approval: result.approval, artifactTitle: artifactVersion.artifact.title }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === 'Revision budget or run state changed concurrently.') {
      return NextResponse.json({ error: 'The workflow changed while this revision was being saved. Refresh the deliverable and try again.' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Revision request could not be saved.' }, { status: 503 });
  }
}