import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { authorizeOperationsRequest, operationsAccessError } from '@/lib/operations/auth';
import { agentVersionContractSchema } from '@/lib/operations/agent-validation';
import { defaultModelForProvider, hasModelPricing, isModelProviderConfigured, resolveModelProvider } from '@/lib/operations/model-provider';
import { workflowWorkerConfigured } from '@/lib/operations/workflow-dispatch';

export const runtime = 'nodejs';

type RouteContext = { params: Promise<{ agentId: string }> };

export async function GET(request: NextRequest, { params }: RouteContext) {
  const access = await authorizeOperationsRequest(request);
  if (!access.ok) return operationsAccessError(access);

  const { agentId } = await params;
  try {
    const agent = await prisma.agentDefinition.findUnique({
      where: { workspaceId_id: { workspaceId: access.workspaceId, id: agentId } },
      include: { versions: { orderBy: { version: 'desc' } } },
    });

    if (!agent) return NextResponse.json({ error: 'Agent definition not found.' }, { status: 404 });
    const roleKnowledge = await prisma.knowledgeDocument.findMany({
      where: { workspaceId: access.workspaceId, agentDefinitionId: agent.id, scope: 'AGENT_INSTRUCTIONS' },
      orderBy: [{ updatedAt: 'desc' }, { version: 'desc' }],
      take: 30,
      select: { id: true, knowledgeKey: true, title: true, version: true, source: true, status: true, evidenceStatus: true, updatedAt: true },
    });
    const approved = agent.versions.find(version => version.status === 'APPROVED');
    const blockers: string[] = [];
    if (!approved) blockers.push('No approved version');
    if (!agent.enabled) blockers.push('Not activated');
    try {
      const provider = resolveModelProvider(approved?.modelProvider);
      if (!isModelProviderConfigured(provider)) blockers.push(`${provider} key not configured`);
      else if (!hasModelPricing(provider, approved?.modelId || defaultModelForProvider(provider))) blockers.push('Model has no pricing entry');
    } catch { blockers.push('Unsupported model provider'); }
    if (!workflowWorkerConfigured()) blockers.push('Workflow worker not configured');
    return NextResponse.json({ agent: { ...agent, roleKnowledge, available: blockers.length === 0, blockers } });
  } catch {
    return NextResponse.json({ error: 'Agent definition could not be loaded.' }, { status: 503 });
  }
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const access = await authorizeOperationsRequest(request);
  if (!access.ok) return operationsAccessError(access);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Request body must be valid JSON.' }, { status: 400 });
  }

  const parsed = agentVersionContractSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid agent definition.' }, { status: 400 });
  }

  const { agentId } = await params;
  try {
    const result = await prisma.$transaction(async (transaction) => {
      const definition = await transaction.agentDefinition.findUnique({
        where: { workspaceId_id: { workspaceId: access.workspaceId, id: agentId } },
        select: { id: true },
      });
      if (!definition) return null;

      const latest = await transaction.agentVersion.findFirst({
        where: { workspaceId: access.workspaceId, agentDefinitionId: definition.id },
        orderBy: { version: 'desc' },
        select: { version: true },
      });

      const version = await transaction.agentVersion.create({
        data: {
          workspaceId: access.workspaceId,
          agentDefinitionId: definition.id,
          version: (latest?.version ?? 0) + 1,
          status: 'DRAFT',
          ...parsed.data,
          requiredInputs: parsed.data.requiredInputs as Prisma.InputJsonValue,
          outputSchema: parsed.data.outputSchema as Prisma.InputJsonValue,
        },
      });

      await transaction.agentDefinition.update({
        where: { workspaceId_id: { workspaceId: access.workspaceId, id: definition.id } },
        data: { name: version.name, description: version.description, capabilities: version.responsibilities },
      });

      await transaction.auditEvent.create({
        data: {
          workspaceId: access.workspaceId,
          actorId: access.userId,
          action: 'agent.version.created',
          resource: 'AgentDefinition',
          resourceId: definition.id,
          metadata: { version: version.version, status: version.status },
        },
      });

      return version;
    });

    if (!result) return NextResponse.json({ error: 'Agent definition not found.' }, { status: 404 });
    return NextResponse.json({ version: result }, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json({ error: 'Another version was created at the same time. Reload history and retry.' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Agent version could not be saved.' }, { status: 503 });
  }
}