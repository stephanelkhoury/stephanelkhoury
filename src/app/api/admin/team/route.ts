import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { authorizeOperationsRequest, operationsAccessError } from '@/lib/operations/auth';
import { readBoundedJsonBody } from '@/lib/bounded-json-body';
import { appBaseUrl, mailConfigured, sendMail } from '@/lib/auth/mailer';
import { randomToken, sha256 } from '@/lib/auth/crypto';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const access = await authorizeOperationsRequest(request);
  if (!access.ok) return operationsAccessError(access);
  if (access.role !== 'OWNER' && access.role !== 'ADMIN') return NextResponse.json({ error: 'Only owners and admins manage the team.' }, { status: 403 });
  const members = await prisma.membership.findMany({
    where: { workspaceId: access.workspaceId },
    orderBy: { createdAt: 'asc' },
    select: { role: true, status: true, user: { select: { id: true, email: true, name: true, passwordHash: true, totpEnabledAt: true, lastLoginAt: true, disabledAt: true } } },
  });
  return NextResponse.json({
    emailEnabled: mailConfigured(),
    members: members.map(({ role, status, user }) => ({ id: user.id, email: user.email, name: user.name, role, status, passwordSet: Boolean(user.passwordHash), totpEnabled: Boolean(user.totpEnabledAt), lastLoginAt: user.lastLoginAt, disabled: Boolean(user.disabledAt) })),
  });
}

const createSchema = z.object({ name: z.string().trim().min(2).max(80), email: z.string().trim().toLowerCase().email().max(200), role: z.enum(['ADMIN', 'MEMBER', 'CLIENT']) }).strict();

export async function POST(request: NextRequest) {
  const access = await authorizeOperationsRequest(request);
  if (!access.ok) return operationsAccessError(access);
  if (access.role !== 'OWNER' && access.role !== 'ADMIN') return NextResponse.json({ error: 'Only owners and admins can invite people.' }, { status: 403 });
  const body = await readBoundedJsonBody(request.body, 4096);
  const parsed = body.ok ? createSchema.safeParse(body.value) : null;
  if (!parsed?.success) return NextResponse.json({ error: 'Enter a name, a valid email and a role.' }, { status: 400 });
  const { name, email, role } = parsed.data;
  if (role === 'ADMIN' && access.role !== 'OWNER') return NextResponse.json({ error: 'Only the owner can add admins.' }, { status: 403 });

  const existing = await prisma.user.findUnique({ where: { email }, include: { memberships: { where: { workspaceId: access.workspaceId } } } });
  if (existing?.memberships.length) return NextResponse.json({ error: 'This person is already on the team.' }, { status: 409 });

  const token = randomToken(32);
  const user = await prisma.$transaction(async tx => {
    const person = existing ?? await tx.user.create({ data: { email, name } });
    await tx.membership.create({ data: { workspaceId: access.workspaceId, userId: person.id, role, status: 'ACTIVE' } });
    await tx.passwordResetToken.create({ data: { userId: person.id, tokenHash: sha256(token), purpose: 'INVITE', expiresAt: new Date(Date.now() + 72 * 3_600_000) } });
    await tx.auditEvent.create({ data: { workspaceId: access.workspaceId, actorId: access.userId, action: 'team.invited', resource: 'User', resourceId: person.id, metadata: { role } } });
    return person;
  });
  const setupUrl = `${appBaseUrl(request)}/admin/reset-password?token=${token}`;
  const mail = await sendMail({ to: email, subject: 'You have been invited to Multigraphic AI', text: `Hi ${name},\n\nYou have been invited to Multigraphic AI as ${role.toLowerCase()}. Open this link within 72 hours to choose your password:\n\n${setupUrl}\n` });
  return NextResponse.json({ user: { id: user.id, email, name, role }, setupUrl, emailSent: mail.sent }, { status: 201 });
}
