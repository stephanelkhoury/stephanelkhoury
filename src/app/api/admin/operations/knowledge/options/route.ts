import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authorizeOperationsRequest, operationsAccessError } from '@/lib/operations/auth';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const access = await authorizeOperationsRequest(request);
  if (!access.ok) return operationsAccessError(access);

  try {
    const [clients, projects, agents] = await Promise.all([
      prisma.client.findMany({
        where: { workspaceId: access.workspaceId },
        orderBy: { name: 'asc' },
        select: { id: true, name: true },
      }),
      prisma.operationsProject.findMany({
        where: { workspaceId: access.workspaceId },
        orderBy: { name: 'asc' },
        select: { id: true, name: true, clientId: true },
      }),
      prisma.agentDefinition.findMany({
        where: { workspaceId: access.workspaceId },
        orderBy: { name: 'asc' },
        select: { id: true, name: true, key: true },
      }),
    ]);

    return NextResponse.json({ clients, projects, agents });
  } catch {
    return NextResponse.json({ error: 'Knowledge scope options could not be loaded.' }, { status: 503 });
  }
}