import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { authorizeOperationsRequest, operationsAccessError } from '@/lib/operations/auth';
import { defaultModelForProvider, hasModelPricing, resolveModelProvider } from '@/lib/operations/model-provider';
import { dispatchWorkflowRun } from '@/lib/operations/workflow-dispatch';
import { validateWebsiteDeliveryPlan, websiteDeliveryPlanSchema, validateWorkflowPlan, workflowPlanSchema } from '@/lib/operations/workflow-plan';
import { sha256Json } from '@/lib/operations/json-hash';

export const runtime = 'nodejs';

type RouteContext = { params: Promise<{ runId: string }> };

function jsonValue(value: unknown): Prisma.InputJsonValue {
  return value as Prisma.InputJsonValue;
}

async function dispatchAcceptedRun(workspaceId: string, runId: string) {
  try {
    const dispatchVersion = await prisma.workflowRun.findUnique({
      where: { workspaceId_id: { workspaceId, id: runId } },
      select: { dispatchVersion: true },
    });
    const result = await dispatchWorkflowRun(workspaceId, runId, dispatchVersion?.dispatchVersion ?? 0);
    if (!result.dispatched) {
      await prisma.$transaction([
        prisma.workflowRun.update({ where: { workspaceId_id: { workspaceId, id: runId } }, data: { status: 'BLOCKED', error: result.reason } }),
        prisma.workflowEvent.create({ data: { workspaceId, workflowRunId: runId, type: 'run.dispatch_blocked', message: result.reason } }),
      ]);
      return { status: 'BLOCKED' as const, error: result.reason };
    }

    const run = await prisma.workflowRun.update({
      where: { workspaceId_id: { workspaceId, id: runId } },
      data: { externalRunId: result.externalRunId, error: null },
      select: { id: true, status: true, externalRunId: true, acceptedPlanHash: true, acceptedAt: true },
    });
    await prisma.workflowEvent.create({ data: { workspaceId, workflowRunId: runId, type: 'run.dispatched', message: result.externalRunId.startsWith('local:') ? 'Accepted workflow started on the local worker.' : 'Accepted workflow submitted to Trigger.dev.' } });
    return { status: run.status, run };
  } catch {
    const message = 'Trigger.dev dispatch failed. The accepted run remains persisted and can be dispatched again safely.';
    await prisma.$transaction([
      prisma.workflowRun.update({ where: { workspaceId_id: { workspaceId, id: runId } }, data: { status: 'BLOCKED', error: message } }),
      prisma.workflowEvent.create({ data: { workspaceId, workflowRunId: runId, type: 'run.dispatch_failed', message } }),
    ]);
    return { status: 'BLOCKED' as const, error: message };
  }
}

export async function POST(request: NextRequest, { params }: RouteContext) {
  const access = await authorizeOperationsRequest(request);
  if (!access.ok) return operationsAccessError(access);
  const { runId } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Request body must be valid JSON.' }, { status: 400 });
  }
  const bodySchema = (await import('zod')).z.object({ plan: websiteDeliveryPlanSchema.or(workflowPlanSchema) }).strict();
  const parsedBody = bodySchema.safeParse(body);
  if (!parsedBody.success) {
    return NextResponse.json({ error: parsedBody.error.issues[0]?.message ?? 'Invalid workflow plan.' }, { status: 400 });
  }

  try {
    const current = await prisma.workflowRun.findUnique({
      where: { workspaceId_id: { workspaceId: access.workspaceId, id: runId } },
      include: { project: { include: { brief: true } }, workflow: { select: { key: true } } },
    });
    if (!current) return NextResponse.json({ error: 'Workflow run not found.' }, { status: 404 });
    if (current.acceptedAt && current.status === 'RUNNING') {
      return NextResponse.json({ run: { id: current.id, status: current.status, externalRunId: current.externalRunId, acceptedPlanHash: current.acceptedPlanHash }, duplicate: true }, { status: 202 });
    }
    if (current.acceptedAt && ['QUEUED', 'BLOCKED'].includes(current.status)) {
      if (current.status === 'BLOCKED') {
        await prisma.workflowRun.update({ where: { workspaceId_id: { workspaceId: access.workspaceId, id: runId } }, data: { status: 'QUEUED', error: null } });
      }
      const dispatched = await dispatchAcceptedRun(access.workspaceId, runId);
      return NextResponse.json({ ...dispatched, duplicate: true }, { status: dispatched.status === 'BLOCKED' ? 202 : 200 });
    }
    if (current.status !== 'DRAFT' || current.acceptedAt) {
      return NextResponse.json({ error: 'Only an unaccepted draft plan can be accepted.' }, { status: 409 });
    }

    const savedInput = current.input as { briefUpdatedAt?: string | null } | null;
    const currentBriefUpdatedAt = current.project?.brief?.updatedAt.toISOString() ?? null;
    if (!current.project || savedInput?.briefUpdatedAt !== currentBriefUpdatedAt) {
      return NextResponse.json({ error: 'The project brief changed after planning. Generate a new plan before accepting it.' }, { status: 409 });
    }

    const agentDefinitions = await prisma.agentDefinition.findMany({
      where: { workspaceId: access.workspaceId, enabled: true, versions: { some: { status: 'APPROVED' } } },
      include: { versions: { where: { status: 'APPROVED' }, orderBy: { version: 'desc' }, take: 1 } },
    });
    const agentByKey = new Map(agentDefinitions.map((agent) => [agent.key, agent]));
    const acceptedBrief = current.project.brief?.content ?? '';
    const isDepartmentPlan = current.workflow.key === 'department-planning-v1';
    const validation = isDepartmentPlan
      ? validateWorkflowPlan(parsedBody.data.plan, new Set(agentByKey.keys()))
      : validateWebsiteDeliveryPlan(parsedBody.data.plan, new Set(agentByKey.keys()), acceptedBrief);
    if (!validation.ok) {
      return NextResponse.json({ error: 'The edited plan is invalid.', errors: validation.errors }, { status: 422 });
    }
    for (const task of validation.plan.tasks) {
      const assigned = task.assigneeKey ? agentByKey.get(task.assigneeKey) : undefined;
      const agentVersion = assigned?.versions[0];
      if (isDepartmentPlan && agentVersion?.department === 'SOFTWARE_ENGINEERING') return NextResponse.json({ error: 'Engineering requires the isolated website workflow.' }, { status: 422 });
      if (task.assigneeKey && !agentVersion) {
        return NextResponse.json({ error: `Task ${task.key} is assigned to an agent without an approved version.` }, { status: 422 });
      }
      if (agentVersion) {
        try {
          const provider = resolveModelProvider(agentVersion.modelProvider);
          const model = agentVersion.modelId?.trim() || defaultModelForProvider(provider);
          if (!hasModelPricing(provider, model)) return NextResponse.json({ error: `Task ${task.key} selects an unpriced ${provider} model. Choose a model with a registered cost estimate.` }, { status: 422 });
        } catch { return NextResponse.json({ error: `Task ${task.key} selects an unsupported model provider.` }, { status: 422 }); }
      }
    }

    const taskEstimate = validation.plan.tasks.reduce((total, task) => total + task.estimatedCostUsd, 0);
    const planningUsage = await prisma.usageRecord.aggregate({
      where: { workspaceId: access.workspaceId, workflowRunId: runId },
      _sum: { estimatedCostUsd: true },
    });
    const totalEstimate = taskEstimate + Number(planningUsage._sum.estimatedCostUsd ?? 0);
    if (current.budgetCapUsd && totalEstimate > Number(current.budgetCapUsd)) {
      return NextResponse.json({ error: 'The task estimates plus planning usage exceed the accepted run budget.', estimatedCostUsd: Number(totalEstimate.toFixed(6)), budgetCapUsd: Number(current.budgetCapUsd) }, { status: 422 });
    }

    const generatedPlan = (current.output as { plan?: unknown } | null)?.plan;
    const planVersion = JSON.stringify(generatedPlan) === JSON.stringify(validation.plan) ? current.planVersion : current.planVersion + 1;
    const orderedPlan = { ...validation.plan, tasks: validation.orderedTasks };
    const acceptedPlanHash = sha256Json(orderedPlan);

    await prisma.$transaction(async (transaction) => {
      const accepted = await transaction.workflowRun.updateMany({
        where: { workspaceId: access.workspaceId, id: runId, status: 'DRAFT', acceptedAt: null },
        data: {
          status: 'QUEUED',
          acceptedAt: new Date(),
          acceptedPlanHash,
          planVersion,
          estimatedCostUsd: new Prisma.Decimal(totalEstimate),
          output: jsonValue({ ...(current.output as object), plan: orderedPlan, acceptedPlanHash, planVersion, agentVersionIds: Object.fromEntries(validation.plan.tasks.flatMap(task => { const version = task.assigneeKey ? agentByKey.get(task.assigneeKey)?.versions[0] : null; return version ? [[task.key, version.id]] : []; })) }),
          error: null,
        },
      });
      if (accepted.count !== 1) throw new Error('Workflow was accepted concurrently.');

      const taskIds = new Map<string, string>();
      for (const [sortOrder, planTask] of validation.orderedTasks.entries()) {
        const definition = planTask.assigneeKey ? agentByKey.get(planTask.assigneeKey) : undefined;
        const created = await transaction.operationsTask.create({
          data: {
            workspaceId: access.workspaceId,
            projectId: current.projectId!,
            workflowRunId: runId,
            planKey: planTask.key,
            agentDefinitionId: definition?.id ?? null,
            title: planTask.title,
            description: planTask.description,
            status: 'QUEUED',
            sortOrder,
            inputs: jsonValue(planTask.inputs),
            acceptanceCriteria: planTask.acceptanceCriteria,
            estimatedMinutes: planTask.estimatedMinutes,
            estimatedCostUsd: new Prisma.Decimal(planTask.estimatedCostUsd),
            estimatedResources: jsonValue(planTask.estimatedResources),
            requiredApprovals: planTask.requiredApprovals,
            maxAttempts: 3,
          },
          select: { id: true },
        });
        taskIds.set(planTask.key, created.id);
        for (const actionKey of planTask.requiredApprovals) {
          const actionPayload = { actionKey, planVersion, task: planTask, ...('website' in validation.plan ? { website: validation.plan.website } : {}) };
          const actionHash = sha256Json(actionPayload);
          await transaction.workflowApproval.create({
            data: {
              workspaceId: access.workspaceId,
              workflowRunId: runId,
              projectId: current.projectId!,
              taskId: created.id,
              actionKey,
              actionPayload: jsonValue(actionPayload),
              actionHash,
            },
          });
        }
      }

      for (const planTask of validation.orderedTasks) {
        const taskId = taskIds.get(planTask.key)!;
        for (const dependencyKey of planTask.dependencies) {
          await transaction.taskDependency.create({
            data: { workspaceId: access.workspaceId, projectId: current.projectId!, taskId, dependsOnTaskId: taskIds.get(dependencyKey)! },
          });
        }
      }

      await transaction.workflowEvent.create({
        data: { workspaceId: access.workspaceId, workflowRunId: runId, type: 'plan.accepted', message: 'Owner accepted the exact validated plan hash.', metadata: jsonValue({ acceptedPlanHash, planVersion, taskCount: validation.plan.tasks.length, estimatedCostUsd: Number(totalEstimate.toFixed(6)) }) },
      });
      await transaction.auditEvent.create({
        data: { workspaceId: access.workspaceId, actorId: access.userId, action: 'workflow.plan.accepted', resource: 'WorkflowRun', resourceId: runId, metadata: jsonValue({ acceptedPlanHash, planVersion, taskCount: validation.plan.tasks.length }) },
      });
    });

    const dispatched = await dispatchAcceptedRun(access.workspaceId, runId);
    return NextResponse.json({ ...dispatched, acceptedPlanHash, planVersion }, { status: dispatched.status === 'BLOCKED' ? 202 : 200 });
  } catch {
    return NextResponse.json({ error: 'The workflow plan could not be accepted.' }, { status: 503 });
  }
}
