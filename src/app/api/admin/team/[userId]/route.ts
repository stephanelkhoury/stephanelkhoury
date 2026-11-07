import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { authorizeOperationsRequest, operationsAccessError } from '@/lib/operations/auth';
import { readBoundedJsonBody } from '@/lib/bounded-json-body';
import { appBaseUrl, sendMail } from '@/lib/auth/mailer';
import { randomToken, sha256 } from '@/lib/auth/crypto';
import { revokeSessions } from '@/lib/auth/session';

export const runtime = 'nodejs';

const schema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('set-role'), role: z.enum(['ADMIN', 'MEMBER', 'CLIENT']) }).strict(),
  z.object({ action: z.literal('disable') }).strict(),
  z.object({ action: z.literal('enable') }).strict(),
  z.object({ action: z.literal('reset-link') }).strict(),
]);

export async function POST(request: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  const access = await authorizeOperationsRequest(request);
  if (!access.ok) return operationsAccessError(access);
  if (access.role !== 'OWNER' && access.role !== 'ADMIN') return NextResponse.json({ error: 'Only owners and admins manage the team.' }, { status: 403 });
  const { userId } = await params;
  const body = await readBoundedJsonBody(request.body, 2048);
  const parsed = body.ok ? schema.safeParse(body.value) : null;
  if (!parsed?.success) return NextResponse.json({ error: 'Choose a valid action.' }, { status: 400 });

  const target = await prisma.membership.findUnique({ where: { workspaceId_userId: { workspaceId: access.workspaceId, userId } }, include: { user: true } });
  if (!target) return NextResponse.json({ error: 'Person not found.' }, { status: 404 });
  if (target.role === 'OWNER') return NextResponse.json({ error: 'The owner account cannot be changed here.' }, { status: 403 });
  if (userId === access.userId) return NextResponse.json({ error: 'Use your account page to change your own settings.' }, { status: 403 });
  if (target.role === 'ADMIN' && access.role !== 'OWNER') return NextResponse.json({ error: 'Only the owner can change admins.' }, { status: 403 });
  const action = parsed.data;
  if (action.action === 'set-role' && action.role === 'ADMIN' && access.role !== 'OWNER') return NextResponse.json({ error: 'Only the owner can add admins.' }, { status: 403 });

  if (action.action === 'set-role') {
    await prisma.membership.update({ where: { id: target.id }, data: { role: action.role } });
  } else if (action.action === 'disable') {
    await prisma.user.update({ where: { id: userId }, data: { disabledAt: new Date() } });
    await revokeSessions(userId);
  } else if (action.action === 'enable') {
    await prisma.user.update({ where: { id: userId }, data: { disabledAt: null, failedLoginCount: 0, lockedUntil: null } });
  } else {
    const token = randomToken(32);
    await prisma.passwordResetToken.create({ data: { userId, tokenHash: sha256(token), purpose: 'RESET', expiresAt: new Date(Date.now() + 24 * 3_600_000) } });
    const setupUrl = `${appBaseUrl(request)}/admin/reset-password?token=${token}`;
    const mail = await sendMail({ to: target.user.email, subject: 'Reset your Multigraphic AI password', text: `Open this link within 24 hours to choose a new password:\n\n${setupUrl}\n` });
    await prisma.auditEvent.create({ data: { workspaceId: access.workspaceId, actorId: access.userId, action: 'team.reset_link', resource: 'User', resourceId: userId } });
    return NextResponse.json({ setupUrl, emailSent: mail.sent });
  }
  await prisma.auditEvent.create({ data: { workspaceId: access.workspaceId, actorId: access.userId, action: `team.${action.action}`, resource: 'User', resourceId: userId } });
  return NextResponse.json({ ok: true });
}
