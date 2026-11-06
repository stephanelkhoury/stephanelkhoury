import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { authorizeOperationsRequest, operationsAccessError } from '@/lib/operations/auth';
import { deliveryReviewState } from '@/lib/operations/delivery-review';
import { recordReviewOutcome } from '@/lib/operations/agent-growth';

export const runtime = 'nodejs';

type RouteContext = { params: Promise<{ approvalId: string }> };

const decisionSchema = z.object({
  decision: z.enum(['APPROVED', 'REJECTED', 'CHANGES_REQUESTED']),
  comment: z.string().trim().max(2000).optional(),
}).strict();

export async function POST(request: NextRequest, { params }: RouteContext) {
  const access = await authorizeOperationsRequest(request);
  if (!access.ok) return operationsAccessError(access);
  const { approvalId } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Request body must be valid JSON.' }, { status: 400 });
  }
  const parsed = decisionSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid approval decision.' }, { status: 400 });

  try {
    const pending = await prisma.approval.findFirst({
      where: { workspaceId: access.workspaceId, id: approvalId, status: 'PENDING' },
      select: { id: true, artifactId: true, artifactVersionId: true, artifactVersion: { select: { workflowRunId: true } } },
    });
    if (!pending) return NextResponse.json({ error: 'Pending artifact-version approval not found.' }, { status: 404 });

    const workflowRunStatus = await prisma.$transaction(async (transaction) => {
      const changed = await transaction.approval.updateMany({
        where: { workspaceId: access.workspaceId, id: pending.id, status: 'PENDING' },
        data: { status: parsed.data.decision, reviewerId: access.userId, comment: parsed.data.comment ?? null },
      });
      if (changed.count !== 1) throw new Error('Approval was decided concurrently.');

      await transaction.artifact.update({
        where: { workspaceId_id: { workspaceId: access.workspaceId, id: pending.artifactId } },
        data: { status: parsed.data.decision === 'APPROVED' ? 'APPROVED' : 'DRAFT' },
      });
      await transaction.auditEvent.create({
        data: {
          workspaceId: access.workspaceId,
          actorId: access.userId,
          action: `artifact.${parsed.data.decision.toLowerCase()}`,
          resource: 'ArtifactVersion',
          resourceId: pending.artifactVersionId,
          metadata: { approvalId: pending.id, artifactId: pending.artifactId, decision: parsed.data.decision, comment: parsed.data.comment ?? null },
        },
      });

      const workflowRunId = pending.artifactVersion.workflowRunId;
      if (!workflowRunId) return null;
      const currentRun = await transaction.workflowRun.findUniqueOrThrow({ where: { workspaceId_id: { workspaceId: access.workspaceId, id: workflowRunId } }, select: { revisionCount: true } });
      const [versions, incompleteTasks] = await Promise.all([
        transaction.artifactVersion.findMany({ where: { workspaceId: access.workspaceId, workflowRunId, revisionNumber: currentRun.revisionCount }, select: { approvals: { select: { status: true } } } }),
        transaction.operationsTask.count({ where: { workspaceId: access.workspaceId, workflowRunId, status: { not: 'SUCCEEDED' } } }),
      ]);
      const reviewState = deliveryReviewState(versions);
      const complete = reviewState === 'APPROVED' && incompleteTasks === 0;
      const rejected = reviewState === 'REJECTED';
      const runStatus = complete ? 'SUCCEEDED' : rejected ? 'BLOCKED' : 'AWAITING_APPROVAL';
      if (complete || rejected) {
        await transaction.workflowRun.updateMany({
          where: { workspaceId: access.workspaceId, id: workflowRunId, status: 'AWAITING_APPROVAL' },
          data: {
            status: runStatus,
            ...(complete ? { finishedAt: new Date(), error: null } : { error: 'Owner rejected a website deliverable; delivery is blocked.' }),
          },
        });
      }
      await transaction.workflowEvent.create({
        data: {
          workspaceId: access.workspaceId,
          workflowRunId,
          type: `website.artifact.${parsed.data.decision.toLowerCase()}`,
          message: `${parsed.data.decision.replaceAll('_', ' ')} artifact version ${pending.artifactVersionId}.`,
          metadata: { approvalId: pending.id, artifactId: pending.artifactId, artifactVersionId: pending.artifactVersionId, workflowRunStatus: runStatus },
        },
      });
      return runStatus;
    });

    try {
      await recordReviewOutcome({ workspaceId: access.workspaceId, approvalId: pending.id, ownerUserId: access.userId, decision: parsed.data.decision, comment: parsed.data.comment ?? null, artifactVersionId: pending.artifactVersionId });
    } catch {
      // The decision is already committed; skill/lesson bookkeeping must not undo it.
    }

    return NextResponse.json({ approvalId: pending.id, artifactId: pending.artifactId, artifactVersionId: pending.artifactVersionId, status: parsed.data.decision, workflowRunStatus });
  } catch {
    return NextResponse.json({ error: 'Artifact-version decision could not be recorded.' }, { status: 503 });
  }
}
