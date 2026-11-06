import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authorizeOperationsRequest, operationsAccessError } from '@/lib/operations/auth';
import { cancelDispatchedRun } from '@/lib/operations/workflow-dispatch';

export const runtime = 'nodejs';

export async function POST(request: NextRequest, { params }: { params: Promise<{ meetingId: string }> }) {
  const access = await authorizeOperationsRequest(request);
  if (!access.ok) return operationsAccessError(access);
  const { meetingId } = await params;
  try {
    const meeting = await prisma.meeting.findUnique({ where: { workspaceId_id: { workspaceId: access.workspaceId, id: meetingId } }, select: { status: true, externalRunId: true } });
    if (!meeting) return NextResponse.json({ error: 'Meeting not found.' }, { status: 404 });
    if (!['GATHERING', 'IN_SESSION'].includes(meeting.status)) return NextResponse.json({ status: meeting.status, duplicate: true });
    await prisma.meeting.updateMany({ where: { workspaceId: access.workspaceId, id: meetingId, status: { in: ['GATHERING', 'IN_SESSION'] } }, data: { status: 'CANCELED', finishedAt: new Date() } });
    if (meeting.externalRunId) await cancelDispatchedRun(meeting.externalRunId).catch(() => false);
    await prisma.auditEvent.create({ data: { workspaceId: access.workspaceId, actorId: access.userId, action: 'meeting.canceled', resource: 'Meeting', resourceId: meetingId } });
    return NextResponse.json({ status: 'CANCELED' });
  } catch {
    return NextResponse.json({ error: 'The meeting could not be canceled.' }, { status: 503 });
  }
}
