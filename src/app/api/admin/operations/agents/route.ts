import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { authorizeOperationsRequest, operationsAccessError } from '@/lib/operations/auth';
import { createAgentSchema } from '@/lib/operations/agent-validation';
import { executionReadiness } from '@/lib/operations/workflow-dispatch';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const access = await authorizeOperationsRequest(request);
  if (!access.ok) return operationsAccessError(access);

  try {
    const agents = await prisma.agentDefinition.findMany({
      where: { workspaceId: access.workspaceId },
      orderBy: { name: 'asc' },
      include: {
        versions: {
          orderBy: { version: 'desc' },
          take: 1,
          select: { id: true, version: true, status: true, department: true, modelProvider: true, modelId: true, allowedTools: true },
        },
      },
    });

    return NextResponse.json({
      agents: agents.map(({ versions, ...agent }) => ({
        ...agent,
        latestVersion: versions[0] ?? null,
        available: agent.enabled && versions[0]?.status === 'APPROVED' && executionReadiness(versions[0]?.modelProvider).connected,
      })),
      execution: executionReadiness(),
    });
  } catch {
    return NextResponse.json({ error: 'Agent definitions could not be loaded.' }, { status: 503 });
  }
}

export async function POST(request: NextRequest) {
  const access = await authorizeOperationsRequest(request);
  if (!access.ok) return operationsAccessError(access);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Request body must be valid JSON.' }, { status: 400 });
  }

  const parsed = createAgentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid agent definition.' }, { status: 400 });
  }

  const { key, ...contract } = parsed.data;
  try {
    const result = await prisma.$transaction(async (transaction) => {
      const definition = await transaction.agentDefinition.create({
        data: {
          workspaceId: access.workspaceId,
          key,
          name: contract.name,
          description: contract.description,
          capabilities: contract.responsibilities,
          isStarter: false,
          enabled: false,
        },
      });

      const version = await transaction.agentVersion.create({
        data: {
          workspaceId: access.workspaceId,
          agentDefinitionId: definition.id,
          version: 1,
          status: 'DRAFT',
          ...contract,
          requiredInputs: contract.requiredInputs as Prisma.InputJsonValue,
          outputSchema: contract.outputSchema as Prisma.InputJsonValue,
        },
      });

      await transaction.auditEvent.create({
        data: {
          workspaceId: access.workspaceId,
          actorId: access.userId,
          action: 'agent.created',
          resource: 'AgentDefinition',
          resourceId: definition.id,
          metadata: { key, version: version.version },
        },
      });

      return { definition, version };
    });

    return NextResponse.json({ ...result, available: false }, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json({ error: 'An agent with this stable identifier already exists.' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Agent definition could not be created.' }, { status: 503 });
  }
}