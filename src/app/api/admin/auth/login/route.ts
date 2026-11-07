import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { fail, readAuthBody } from '@/lib/auth/http';
import { verifyPassword } from '@/lib/auth/password';
import { createSession, SESSION_COOKIE, SESSION_TTL_SECONDS } from '@/lib/auth/session';
import { unseal } from '@/lib/auth/crypto';
import { verifyTotp } from '@/lib/auth/totp';
import { WORKSPACE_SLUG } from '@/lib/auth/context';

export const runtime = 'nodejs';

const schema = z.object({ email: z.string().trim().toLowerCase().email().max(200), password: z.string().min(1).max(200), code: z.string().max(12).optional() }).strict();
const MAX_FAILURES = 5;
const LOCK_MINUTES = 15;
const INVALID = 'Invalid email or password.';

export async function POST(request: NextRequest) {
  const input = await readAuthBody(request, schema, { scope: 'auth-login', max: 20 });
  if ('error' in input) return input.error;
  const { email, password, code } = input.data;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    const passwordOk = await verifyPassword(password, user?.passwordHash);
    if (!user || !user.passwordHash || user.disabledAt) return fail(INVALID, 401);
    if (user.lockedUntil && user.lockedUntil > new Date()) return fail('This account is temporarily locked after too many attempts. Try again in a few minutes or reset your password.', 423);

    const recordFailure = async () => {
      const failures = user.failedLoginCount + 1;
      await prisma.user.update({ where: { id: user.id }, data: { failedLoginCount: failures, lockedUntil: failures >= MAX_FAILURES ? new Date(Date.now() + LOCK_MINUTES * 60_000) : null } });
    };
    if (!passwordOk) { await recordFailure(); return fail(INVALID, 401); }

    if (user.totpEnabledAt && user.totpSecret) {
      if (!code) return NextResponse.json({ needsCode: true });
      if (!verifyTotp(unseal(user.totpSecret), code)) { await recordFailure(); return fail('That code is not valid. Check your authenticator app.', 401); }
    }

    const membership = await prisma.membership.findFirst({ where: { userId: user.id, status: 'ACTIVE', workspace: { slug: WORKSPACE_SLUG } }, select: { role: true } });
    if (!membership) return fail('This account has no access to the workspace.', 403);

    await prisma.user.update({ where: { id: user.id }, data: { failedLoginCount: 0, lockedUntil: null, lastLoginAt: new Date() } });
    const session = await createSession(user.id, request.headers);
    const response = NextResponse.json({ success: true, user: { email: user.email, name: user.name, role: membership.role } });
    response.cookies.set({ name: SESSION_COOKIE, value: session.cookieValue, httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: SESSION_TTL_SECONDS });
    return response;
  } catch {
    return fail('Sign-in is temporarily unavailable.', 503);
  }
}
