import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { authorizeOperationsRequest, operationsAccessError } from '@/lib/operations/auth';
import { dispatchWorkflowRun } from '@/lib/operations/workflow-dispatch';
import { sha256Json } from '@/lib/operations/json-hash';

export const runtime = 'nodejs';

type RouteContext = { params: Promise<{ runId: string; approvalId: string }> };

const decisionSchema = z.object({
  decision: z.enum(['APPROVED', 'REJECTED', 'CHANGES_REQUESTED']),
  comment: z.string().trim().max(2000).optional(),
}).strict();

export async function POST(request: NextRequest, { params }: RouteContext) {
  const access = await authorizeOperationsRequest(request);
  if (!access.ok) return operationsAccessError(access);
  const { runId, approvalId } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Request body must be valid JSON.' }, { status: 400 });
  }
  const parsed = decisionSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid approval decision.' }, { status: 400 });

  try {
    const approval = await prisma.workflowApproval.findUnique({
      where: { workspaceId_id: { workspaceId: access.workspaceId, id: approvalId } },
      include: {
        workflowRun: { select: { id: true, status: true, acceptedAt: true, dispatchVersion: true } },
        task: { select: { id: true, projectId: true, planKey: true, status: true } },
      },
    });
    if (!approval || approval.workflowRunId !== runId) return NextResponse.json({ error: 'Approval request not found.' }, { status: 404 });
    if (!approval.workflowRun.acceptedAt) return NextResponse.json({ error: 'Only approvals for an accepted plan can be reviewed.' }, { status: 409 });
    if (['SUCCEEDED', 'FAILED', 'CANCELED'].includes(approval.workflowRun.status)) return NextResponse.json({ error: 'Approvals cannot be changed after a run is terminal.' }, { status: 409 });
    if (approval.status !== 'PENDING') return NextResponse.json({ error: 'This approval has already been decided.' }, { status: 409 });

    const actionPayload = approval.actionPayload as { actionKey?: string; planVersion?: number; task?: unknown };
    const computedHash = sha256Json(actionPayload);
    if (computedHash !== approval.actionHash || actionPayload.actionKey !== approval.actionKey) {
      return NextResponse.json({ error: 'The approval payload no longer matches its recorded action hash.' }, { status: 409 });
    }

    const decision = parsed.data.decision;
    const updated = await prisma.$transaction(async (transaction) => {
      const changed = await transaction.workflowApproval.updateMany({
        where: { workspaceId: access.workspaceId, id: approval.id, status: 'PENDING', actionHash: computedHash },
        data: { status: decision, reviewerId: access.userId, comment: parsed.data.comment ?? null, reviewedAt: new Date() },
      });
      if (changed.count !== 1) throw new Error('Approval was decided concurrently.');

      const pendingForTask = await transaction.workflowApproval.count({
        where: { workspaceId: access.workspaceId, workflowRunId: runId, taskId: approval.taskId, status: 'PENDING', id: { not: approval.id } },
      });
      const currentRun = await transaction.workflowRun.findUniqueOrThrow({
        where: { workspaceId_id: { workspaceId: access.workspaceId, id: runId } },
        select: { status: true },
      });
      let shouldDispatch = false;
      if (decision === 'APPROVED' && pendingForTask === 0) {
        if (currentRun.status !== 'RUNNING') {
          await transaction.operationsTask.update({
            where: { workspaceId_projectId_id: { workspaceId: access.workspaceId, projectId: approval.task.projectId, id: approval.taskId } },
            data: { status: 'QUEUED', error: null },
          });
          await transaction.workflowRun.update({
            where: { workspaceId_id: { workspaceId: access.workspaceId, id: runId } },
            data: { status: 'QUEUED', dispatchVersion: { increment: 1 }, error: null },
          });
          shouldDispatch = true;
        }
      } else if (decision !== 'APPROVED') {
        const message = decision === 'REJECTED' ? 'Owner rejected a required task action.' : 'Owner requested changes to a required task action.';
        if (currentRun.status !== 'RUNNING') {
          await transaction.operationsTask.update({
            where: { workspaceId_projectId_id: { workspaceId: access.workspaceId, projectId: approval.task.projectId, id: approval.taskId } },
            data: { status: 'BLOCKED', error: message },
          });
          await transaction.workflowRun.update({
            where: { workspaceId_id: { workspaceId: access.workspaceId, id: runId } },
            data: { status: 'BLOCKED', error: message },
          });
        }
      }

      await transaction.workflowEvent.create({
        data: {
          workspaceId: access.workspaceId,
          workflowRunId: runId,
          taskKey: approval.task.planKey,
          type: `approval.${decision.toLowerCase()}`,
          message: `${decision.replaceAll('_', ' ')}: ${approval.actionKey}`,
          metadata: { approvalId: approval.id, actionHash: approval.actionHash },
        },
      });
      await transaction.auditEvent.create({
        data: { workspaceId: access.workspaceId, actorId: access.userId, action: `workflow.approval.${decision.toLowerCase()}`, resource: 'WorkflowApproval', resourceId: approval.id, metadata: { runId, actionKey: approval.actionKey, actionHash: approval.actionHash } },
      });
      const updatedRun = await transaction.workflowRun.findUniqueOrThrow({
        where: { workspaceId_id: { workspaceId: access.workspaceId, id: runId } },
        select: { status: true, dispatchVersion: true },
      });
      return { run: updatedRun, shouldDispatch };
    });

    if (decision === 'APPROVED' && updated.shouldDispatch && updated.run.status === 'QUEUED') {
      try {
        const handle = await dispatchWorkflowRun(access.workspaceId, runId, updated.run.dispatchVersion);
        if (!handle.dispatched) throw new Error(handle.reason);
        await prisma.workflowRun.update({
          where: { workspaceId_id: { workspaceId: access.workspaceId, id: runId } },
          data: { externalRunId: handle.externalRunId },
        });
      } catch {
        const message = 'Approval was recorded, but workflow dispatch is blocked. The approved action remains saved.';
        await prisma.workflowRun.update({ where: { workspaceId_id: { workspaceId: access.workspaceId, id: runId } }, data: { status: 'BLOCKED', error: message } });
        await prisma.workflowEvent.create({ data: { workspaceId: access.workspaceId, workflowRunId: runId, type: 'run.dispatch_blocked', message } });
        return NextResponse.json({ approvalId, status: 'APPROVED', runStatus: 'BLOCKED', error: message }, { status: 202 });
      }
    }

    return NextResponse.json({ approvalId, status: decision, runStatus: updated.run.status });
  } catch {
    return NextResponse.json({ error: 'Approval decision could not be recorded.' }, { status: 503 });
  }
}