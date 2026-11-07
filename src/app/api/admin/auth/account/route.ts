import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import QRCode from 'qrcode';
import { prisma } from '@/lib/prisma';
import { fail, readAuthBody } from '@/lib/auth/http';
import { getAuthContext } from '@/lib/auth/context';
import { hashPassword, passwordProblem, verifyPassword } from '@/lib/auth/password';
import { seal, unseal } from '@/lib/auth/crypto';
import { generateTotpSecret, otpauthUri, verifyTotp } from '@/lib/auth/totp';
import { revokeSessions } from '@/lib/auth/session';

export const runtime = 'nodejs';

const schema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('change-password'), currentPassword: z.string().min(1).max(200), newPassword: z.string().min(1).max(200) }).strict(),
  z.object({ action: z.literal('totp-setup') }).strict(),
  z.object({ action: z.literal('totp-enable'), code: z.string().max(12) }).strict(),
  z.object({ action: z.literal('totp-disable'), password: z.string().min(1).max(200), code: z.string().max(12) }).strict(),
]);

export async function POST(request: NextRequest) {
  const input = await readAuthBody(request, schema, { scope: 'auth-account', max: 30 });
  if ('error' in input) return input.error;
  const context = await getAuthContext(request).catch(() => null);
  if (!context || context.kind !== 'session' || !context.userId) return fail('Sign in with your account to change security settings.', 401);
  const user = await prisma.user.findUnique({ where: { id: context.userId } });
  if (!user) return fail('Account not found.', 404);
  const body = input.data;

  if (body.action === 'change-password') {
    if (!(await verifyPassword(body.currentPassword, user.passwordHash))) return fail('Your current password is not correct.', 400);
    const problem = passwordProblem(body.newPassword, user.email);
    if (problem) return fail(problem, 400);
    await prisma.user.update({ where: { id: user.id }, data: { passwordHash: await hashPassword(body.newPassword) } });
    const revoked = await revokeSessions(user.id, context.sessionId ?? undefined);
    return NextResponse.json({ ok: true, signedOutElsewhere: revoked });
  }

  if (body.action === 'totp-setup') {
    if (user.totpEnabledAt) return fail('Two-factor authentication is already on.', 409);
    const secret = generateTotpSecret();
    await prisma.user.update({ where: { id: user.id }, data: { totpSecret: seal(secret), totpEnabledAt: null } });
    const uri = otpauthUri(secret, user.email);
    return NextResponse.json({ secret, uri, qr: await QRCode.toDataURL(uri, { margin: 1, width: 220 }) });
  }

  if (body.action === 'totp-enable') {
    if (!user.totpSecret || user.totpEnabledAt) return fail('Start the setup first.', 409);
    if (!verifyTotp(unseal(user.totpSecret), body.code)) return fail('That code is not valid. Try the next one from your app.', 400);
    await prisma.user.update({ where: { id: user.id }, data: { totpEnabledAt: new Date() } });
    return NextResponse.json({ ok: true });
  }

  if (!user.totpEnabledAt || !user.totpSecret) return fail('Two-factor authentication is not on.', 409);
  if (!(await verifyPassword(body.password, user.passwordHash)) || !verifyTotp(unseal(user.totpSecret), body.code)) return fail('Password or code is not correct.', 400);
  await prisma.user.update({ where: { id: user.id }, data: { totpSecret: null, totpEnabledAt: null } });
  return NextResponse.json({ ok: true });
}
