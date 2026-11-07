import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { fail, readAuthBody } from '@/lib/auth/http';
import { getAuthContext } from '@/lib/auth/context';
import { revokeSessions } from '@/lib/auth/session';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const context = await getAuthContext(request).catch(() => null);
  if (!context?.userId) return fail('Sign in with your account to see sessions.', 401);
  const sessions = await prisma.authSession.findMany({
    where: { userId: context.userId, revokedAt: null, expiresAt: { gt: new Date() } },
    orderBy: { lastSeenAt: 'desc' },
    select: { id: true, userAgent: true, ipAddress: true, createdAt: true, lastSeenAt: true },
  });
  return NextResponse.json({ sessions: sessions.map(session => ({ ...session, current: session.id === context.sessionId })) });
}

const schema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('revoke'), id: z.string().min(1).max(60) }).strict(),
  z.object({ action: z.literal('revoke-others') }).strict(),
]);

export async function POST(request: NextRequest) {
  const input = await readAuthBody(request, schema, { scope: 'auth-sessions', max: 60 });
  if ('error' in input) return input.error;
  const context = await getAuthContext(request).catch(() => null);
  if (!context?.userId) return fail('Sign in with your account to manage sessions.', 401);
  if (input.data.action === 'revoke-others') return NextResponse.json({ revoked: await revokeSessions(context.userId, context.sessionId ?? undefined) });
  const result = await prisma.authSession.updateMany({ where: { id: input.data.id, userId: context.userId, revokedAt: null }, data: { revokedAt: new Date() } });
  return NextResponse.json({ revoked: result.count });
}
