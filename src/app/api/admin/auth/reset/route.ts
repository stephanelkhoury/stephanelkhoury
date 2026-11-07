import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { fail, readAuthBody } from '@/lib/auth/http';
import { hashPassword, passwordProblem } from '@/lib/auth/password';
import { sha256 } from '@/lib/auth/crypto';
import { revokeSessions } from '@/lib/auth/session';

export const runtime = 'nodejs';

const schema = z.object({ token: z.string().min(20).max(200), password: z.string().min(1).max(200) }).strict();

// Serves both password resets and first-time account setup from an invite link.
export async function POST(request: NextRequest) {
  const input = await readAuthBody(request, schema, { scope: 'auth-reset', max: 10 });
  if ('error' in input) return input.error;
  try {
    const record = await prisma.passwordResetToken.findUnique({ where: { tokenHash: sha256(input.data.token) }, include: { user: true } });
    if (!record || record.usedAt || record.expiresAt <= new Date() || record.user.disabledAt) return fail('This link is invalid or has expired. Ask for a new one.', 400);
    const problem = passwordProblem(input.data.password, record.user.email);
    if (problem) return fail(problem, 400);
    const passwordHash = await hashPassword(input.data.password);
    await prisma.$transaction([
      prisma.user.update({ where: { id: record.userId }, data: { passwordHash, failedLoginCount: 0, lockedUntil: null } }),
      prisma.passwordResetToken.updateMany({ where: { userId: record.userId, usedAt: null }, data: { usedAt: new Date() } }),
    ]);
    await revokeSessions(record.userId);
    return NextResponse.json({ ok: true });
  } catch {
    return fail('The password could not be saved.', 503);
  }
}
