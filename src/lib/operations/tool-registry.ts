import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { authorizeOperationsTool, isToolScopeAllowed, type SideEffectPolicy } from '@/lib/operations/tool-policy';
import { sha256Json } from '@/lib/operations/json-hash';

type ToolContext = { workspaceId: string; projectId: string };
const readBriefTool = {
  inputSchema: z.object({}).strict(),
  sideEffectPolicy: 'READ_ONLY' as const,
  requiresApproval: false,
  timeoutMs: 5000,
  execute: async ({ workspaceId, projectId }: ToolContext) => {
    const project = await prisma.operationsProject.findUnique({
      where: { workspaceId_id: { workspaceId, id: projectId } },
      select: { id: true, name: true, summary: true, brief: { select: { content: true } } },
    });
    if (!project) throw new Error('Project is not available in the authorized workspace.');
    return { projectId: project.id, name: project.name, summary: project.summary, brief: project.brief?.content ?? '' };
  },
};

export const operationsToolRegistry = {
  'operations.project.read_brief': readBriefTool,
} as const;

export type OperationsToolName = keyof typeof operationsToolRegistry;

function jsonValue(value: unknown): Prisma.InputJsonValue {
  return value as Prisma.InputJsonValue;
}

export async function executeOperationsTool(input: {
  toolName: string;
  input: unknown;
  workspaceId: string;
  projectId: string;
  agentRunId: string;
  requestId: string;
}) {
  const tool = operationsToolRegistry[input.toolName as OperationsToolName];
  const policy: SideEffectPolicy = tool?.sideEffectPolicy ?? 'EXTERNAL';
  const parsed = tool?.inputSchema.safeParse(input.input);
  const actionHash = sha256Json({ toolName: input.toolName, input: input.input });
  const idempotencyKey = `${input.agentRunId}:${input.toolName}:${input.requestId}`;

  const agentRun = await prisma.agentRun.findUnique({
    where: { workspaceId_id: { workspaceId: input.workspaceId, id: input.agentRunId } },
    select: {
      projectId: true,
      workflowRunId: true,
      taskId: true,
      agentVersion: { select: { allowedTools: true, maxToolCalls: true } },
    },
  });
  if (!agentRun || !isToolScopeAllowed({
    requestedWorkspaceId: input.workspaceId,
    requestedProjectId: input.projectId,
    agentRunWorkspaceId: input.workspaceId,
    agentRunProjectId: agentRun.projectId,
  })) {
    throw new Error('Tool context is outside the agent run project scope.');
  }

  const existing = await prisma.toolCall.findUnique({
    where: { workspaceId_agentRunId_idempotencyKey: { workspaceId: input.workspaceId, agentRunId: input.agentRunId, idempotencyKey } },
  });
  if (existing?.status === 'SUCCEEDED') return existing.output;
  if (existing) throw new Error(existing.error || 'This tool call is already in progress.');

  const call = await prisma.toolCall.create({
    data: {
      workspaceId: input.workspaceId,
      agentRunId: input.agentRunId,
      name: input.toolName,
      status: 'RUNNING',
      input: jsonValue(input.input),
      policy,
      approvalHash: null,
      idempotencyKey,
      timeoutMs: tool?.timeoutMs ?? 5000,
    },
    select: { id: true },
  });

  const fail = async (message: string): Promise<never> => {
    await prisma.toolCall.update({
      where: { id: call.id },
      data: { status: 'FAILED', error: message, finishedAt: new Date() },
    });
    throw new Error(message);
  };

  if (!tool || !parsed?.success) return fail('Tool name or input schema is invalid.');
  let approvedActionHash: string | undefined;
  if (agentRun.workflowRunId && agentRun.taskId) {
    const approval = await prisma.workflowApproval.findFirst({
      where: { workspaceId: input.workspaceId, workflowRunId: agentRun.workflowRunId, taskId: agentRun.taskId, actionHash, status: 'APPROVED' },
      select: { actionHash: true },
    });
    approvedActionHash = approval?.actionHash;
  }
  const authorization = authorizeOperationsTool({
    toolName: input.toolName,
    allowedTools: agentRun.agentVersion?.allowedTools ?? [],
    sideEffectPolicy: tool.sideEffectPolicy,
    requiresApproval: tool.requiresApproval,
    expectedActionHash: actionHash,
    approvedActionHash,
  });
  if (!authorization.allowed) return fail(authorization.reason);

  const maxCalls = Math.max(0, Math.min(100, agentRun.agentVersion?.maxToolCalls ?? 0));
  const priorCalls = await prisma.toolCall.count({ where: { workspaceId: input.workspaceId, agentRunId: input.agentRunId } });
  if (priorCalls > maxCalls) return fail('Agent tool-call budget is exhausted.');

  let timeoutHandle: ReturnType<typeof setTimeout> | undefined;
  try {
    const result = await Promise.race([
      tool.execute({ workspaceId: input.workspaceId, projectId: input.projectId }),
      new Promise<never>((_, reject) => {
        timeoutHandle = setTimeout(() => reject(new Error('Tool execution timed out.')), tool.timeoutMs);
      }),
    ]);
    await prisma.toolCall.update({
      where: { id: call.id },
      data: { status: 'SUCCEEDED', output: jsonValue(result), finishedAt: new Date() },
    });
    return result;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Tool execution failed.';
    return fail(message);
  } finally {
    if (timeoutHandle) clearTimeout(timeoutHandle);
  }
}