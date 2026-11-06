import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authorizeOperationsRequest, operationsAccessError } from '@/lib/operations/auth';
import { readBoundedJsonBody } from '@/lib/bounded-json-body';
import { z } from 'zod';
export const runtime = 'nodejs';
export async function POST(request: NextRequest, { params }: { params: Promise<{ agentId: string }> }) {
  const access = await authorizeOperationsRequest(request);
  if (!access.ok) return operationsAccessError(access);
  const { agentId } = await params;
  const body = await readBoundedJsonBody(request.body, 4096);
  const parsed = body.ok ? z.object({ enabled: z.boolean() }).strict().safeParse(body.value) : null;
  if (!parsed?.success) return NextResponse.json({ error: 'Choose enabled or disabled.' }, { status: 400 });
  try {
    const result = await prisma.$transaction(async tx => {
      const agent = await tx.agentDefinition.findUnique({ where: { workspaceId_id: { workspaceId: access.workspaceId, id: agentId } }, include: { versions: { where: { status: 'APPROVED' }, take: 1, include: { evaluations: { where: { passed: true }, take: 1 } } } } });
      if (!agent) return { error: 'Agent not found.', status: 404 };
      if (parsed.data.enabled) {
        if (!agent.versions[0]?.evaluations.length) return { error: 'Approve a version and pass its contract checks before enabling assignment.', status: 409 };
      }
      await tx.agentDefinition.update({ where: { workspaceId_id: { workspaceId: access.workspaceId, id: agentId } }, data: { enabled: parsed.data.enabled } });
      await tx.auditEvent.create({ data: { workspaceId: access.workspaceId, actorId: access.userId, action: parsed.data.enabled ? 'agent.enabled' : 'agent.disabled', resource: 'AgentDefinition', resourceId: agentId } });
      return { enabled: parsed.data.enabled };
    });
    return NextResponse.json(result, { status: 'status' in result ? result.status : 200 });
  } catch { return NextResponse.json({ error: 'Agent assignment setting could not be changed.' }, { status: 503 }); }
}
