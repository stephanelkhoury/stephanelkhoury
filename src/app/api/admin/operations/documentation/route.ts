import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authorizeOperationsRequest, operationsAccessError } from '@/lib/operations/auth';

export const runtime = 'nodejs';

const KINDS = ['TASK', 'MEETING', 'REVIEW'] as const;

export async function GET(request: NextRequest) {
  const access = await authorizeOperationsRequest(request);
  if (!access.ok) return operationsAccessError(access);
  const params = request.nextUrl.searchParams;
  const kind = params.get('kind');
  const agentId = params.get('agentId');
  const projectId = params.get('projectId');
  const query = params.get('q')?.trim().slice(0, 120);
  try {
    const [records, agents] = await Promise.all([
      prisma.workRecord.findMany({
        where: {
          workspaceId: access.workspaceId,
          ...(kind && (KINDS as readonly string[]).includes(kind) ? { kind } : {}),
          ...(agentId ? { agentDefinitionId: agentId } : {}),
          ...(projectId ? { projectId } : {}),
          ...(query ? { OR: [{ title: { contains: query, mode: 'insensitive' as const } }, { markdown: { contains: query, mode: 'insensitive' as const } }] } : {}),
        },
        orderBy: { createdAt: 'desc' },
        take: 100,
        select: { id: true, kind: true, title: true, createdAt: true, agentDefinitionId: true, project: { select: { id: true, name: true } } },
      }),
      prisma.agentDefinition.findMany({ where: { workspaceId: access.workspaceId }, select: { id: true, name: true }, orderBy: { name: 'asc' } }),
    ]);
    const names = new Map(agents.map(agent => [agent.id, agent.name]));
    return NextResponse.json({ records: records.map(record => ({ ...record, agentName: record.agentDefinitionId ? names.get(record.agentDefinitionId) ?? null : null })), agents });
  } catch {
    return NextResponse.json({ error: 'Work records could not be loaded.' }, { status: 503 });
  }
}
