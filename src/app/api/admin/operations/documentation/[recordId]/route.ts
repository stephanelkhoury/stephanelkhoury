import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authorizeOperationsRequest, operationsAccessError } from '@/lib/operations/auth';

export const runtime = 'nodejs';

export async function GET(request: NextRequest, { params }: { params: Promise<{ recordId: string }> }) {
  const access = await authorizeOperationsRequest(request);
  if (!access.ok) return operationsAccessError(access);
  const { recordId } = await params;
  try {
    const record = await prisma.workRecord.findFirst({ where: { workspaceId: access.workspaceId, id: recordId }, include: { project: { select: { id: true, name: true } } } });
    if (!record) return NextResponse.json({ error: 'Work record not found.' }, { status: 404 });
    return NextResponse.json({ record });
  } catch {
    return NextResponse.json({ error: 'Work record could not be loaded.' }, { status: 503 });
  }
}
