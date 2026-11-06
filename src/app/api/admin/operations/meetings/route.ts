import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { authorizeOperationsRequest, operationsAccessError } from '@/lib/operations/auth';
import { readBoundedJsonBody } from '@/lib/bounded-json-body';
import { consumeRateLimit } from '@/lib/rate-limit';
import { meetingRoomFor } from '@/lib/operations/meetings';
import { dispatchMeeting, executionReadiness } from '@/lib/operations/workflow-dispatch';

export const runtime = 'nodejs';

const agentKey = z.string().regex(/^[a-z0-9-]{2,80}$/);
const schema = z.object({
  projectId: z.string().min(5).max(64),
  topic: z.string().trim().min(10).max(2000),
  participantKeys: z.array(agentKey).min(2).max(6),
  facilitatorKey: agentKey,
}).strict();

export async function GET(request: NextRequest) {
  const access = await authorizeOperationsRequest(request);
  if (!access.ok) return operationsAccessError(access);
  const projectId = request.nextUrl.searchParams.get('projectId');
  try {
    const meetings = await prisma.meeting.findMany({
      where: { workspaceId: access.workspaceId, ...(projectId ? { projectId } : {}) },
      orderBy: { createdAt: 'desc' },
      take: 30,
      include: { project: { select: { id: true, name: true } } },
    });
    return NextResponse.json({ meetings });
  } catch {
    return NextResponse.json({ error: 'Meetings could not be loaded.' }, { status: 503 });
  }
}

export async function POST(request: NextRequest) {
  const access = await authorizeOperationsRequest(request);
  if (!access.ok) return operationsAccessError(access);
  const body = await readBoundedJsonBody(request.body, 8192);
  const parsed = body.ok ? schema.safeParse(body.value) : null;
  if (!parsed?.success) return NextResponse.json({ error: 'Choose a project, a topic of at least 10 characters, 2–6 attendees and a facilitator.' }, { status: 400 });
  const participantKeys = Array.from(new Set(parsed.data.participantKeys));
  if (participantKeys.length < 2 || !participantKeys.includes(parsed.data.facilitatorKey)) return NextResponse.json({ error: 'The facilitator must be one of at least two distinct attendees.' }, { status: 400 });

  try {
    const limit = await consumeRateLimit(`meeting:${access.workspaceId}:${access.userId}`, 20, 60 * 60 * 1000);
    if (!limit.allowed) return NextResponse.json({ error: 'Meetings are temporarily rate limited.' }, { status: limit.storage === 'unavailable' ? 503 : 429 });
    const [project, agents] = await Promise.all([
      prisma.operationsProject.findUnique({ where: { workspaceId_id: { workspaceId: access.workspaceId, id: parsed.data.projectId } }, include: { brief: true } }),
      prisma.agentDefinition.findMany({ where: { workspaceId: access.workspaceId, key: { in: participantKeys } }, include: { versions: { where: { status: 'APPROVED' }, orderBy: { version: 'desc' }, take: 1, select: { modelProvider: true } }, characterProfile: { select: { roomKey: true } } } }),
    ]);
    if (!project) return NextResponse.json({ error: 'Project not found.' }, { status: 404 });
    if ((project.brief?.content.trim().length ?? 0) < 30) return NextResponse.json({ error: 'Save a project brief of at least 30 characters first.' }, { status: 422 });
    for (const key of participantKeys) {
      const agent = agents.find(item => item.key === key);
      if (!agent?.enabled || !agent.versions[0]) return NextResponse.json({ error: `${key} is not an enabled agent with an approved version.` }, { status: 409 });
      const readiness = executionReadiness(agent.versions[0].modelProvider);
      if (!readiness.connected) return NextResponse.json({ error: `${key} is not available: ${readiness.reason}` }, { status: 409 });
    }
    const facilitator = agents.find(item => item.key === parsed.data.facilitatorKey);
    const meeting = await prisma.meeting.create({
      data: { workspaceId: access.workspaceId, projectId: project.id, topic: parsed.data.topic, roomKey: meetingRoomFor(facilitator?.characterProfile?.roomKey), facilitatorKey: parsed.data.facilitatorKey, participantKeys },
    });
    await prisma.auditEvent.create({ data: { workspaceId: access.workspaceId, actorId: access.userId, action: 'meeting.called', resource: 'Meeting', resourceId: meeting.id, metadata: { projectId: project.id, participantKeys } } });
    const dispatch = await dispatchMeeting(access.workspaceId, meeting.id);
    const saved = dispatch.dispatched
      ? await prisma.meeting.update({ where: { workspaceId_id: { workspaceId: access.workspaceId, id: meeting.id } }, data: { externalRunId: dispatch.externalRunId } })
      : await prisma.meeting.update({ where: { workspaceId_id: { workspaceId: access.workspaceId, id: meeting.id } }, data: { status: 'FAILED', error: dispatch.reason, finishedAt: new Date() } });
    return NextResponse.json({ meeting: saved }, { status: dispatch.dispatched ? 201 : 503 });
  } catch {
    return NextResponse.json({ error: 'The meeting could not be started.' }, { status: 503 });
  }
}
