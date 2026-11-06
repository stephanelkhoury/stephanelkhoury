import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authorizeOperationsRequest, operationsAccessError } from '@/lib/operations/auth';
export const runtime = 'nodejs';
export async function GET(request: NextRequest) {
  const access = await authorizeOperationsRequest(request);
  if (!access.ok) return operationsAccessError(access);
  try {
    const profiles = await prisma.characterProfile.findMany({ where: { workspaceId: access.workspaceId }, orderBy: { displayName: 'asc' }, include: { agentDefinition: { select: { id: true, key: true, enabled: true } } } });
    return NextResponse.json({ profiles });
  } catch { return NextResponse.json({ error: 'People could not be loaded. Apply the operations migrations and seed.' }, { status: 503 }); }
}
