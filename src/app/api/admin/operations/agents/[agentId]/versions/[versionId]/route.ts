import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authorizeOperationsRequest, operationsAccessError } from '@/lib/operations/auth';

export const runtime = 'nodejs';

type RouteContext = { params: Promise<{ agentId: string; versionId: string }> };

export async function POST(request: NextRequest, { params }: RouteContext) {
  const access = await authorizeOperationsRequest(request);
  if (!access.ok) return operationsAccessError(access);

  const { agentId, versionId } = await params;
  try {
    const result = await prisma.$transaction(async (transaction) => {
      const target = await transaction.agentVersion.findFirst({
        where: { workspaceId: access.workspaceId, agentDefinitionId: agentId, id: versionId },
        select: { id: true, version: true, status: true },
      });
      if (!target) return { error: 'Agent version not found.', status: 404 as const };
      if (target.status === 'APPROVED') return { version: target };
      if (target.status !== 'DRAFT') return { error: 'Only a draft version can be approved.', status: 409 as const };

      await transaction.agentVersion.updateMany({
        where: {
          workspaceId: access.workspaceId,
          agentDefinitionId: agentId,
          status: 'APPROVED',
          id: { not: target.id },
        },
        data: { status: 'SUPERSEDED' },
      });

      const version = await transaction.agentVersion.update({
        where: { workspaceId_agentDefinitionId_id: { workspaceId: access.workspaceId, agentDefinitionId: agentId, id: target.id } },
        data: { status: 'APPROVED' },
      });

      await transaction.auditEvent.create({
        data: {
          workspaceId: access.workspaceId,
          actorId: access.userId,
          action: 'agent.version.approved',
          resource: 'AgentVersion',
          resourceId: version.id,
          metadata: { agentId, version: version.version },
        },
      });

      return { version };
    });

    if ('error' in result) return NextResponse.json({ error: result.error }, { status: result.status });
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: 'Agent version could not be approved.' }, { status: 503 });
  }
}