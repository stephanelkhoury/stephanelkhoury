import { prisma } from '@/lib/prisma';
import { hmac, randomToken, safeEqual, sha256 } from '@/lib/auth/crypto';

export const SESSION_COOKIE = 'admin_session';
export const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;
const TOUCH_INTERVAL_MS = 5 * 60 * 1000;

export function parseSessionCookie(value: string | undefined, nowSeconds = Math.floor(Date.now() / 1000)) {
  if (!value) return null;
  const [version, token, expiryText, signature, extra] = value.split('.');
  if (version !== 'v2' || !token || !expiryText || !signature || extra !== undefined) return null;
  const expiresAt = Number(expiryText);
  if (!Number.isSafeInteger(expiresAt) || expiresAt <= nowSeconds || expiresAt > nowSeconds + SESSION_TTL_SECONDS) return null;
  try {
    return safeEqual(signature, hmac(`v2.${token}.${expiryText}`)) ? { token, expiresAt } : null;
  } catch {
    return null;
  }
}

export function clientIp(headers: Headers) {
  return headers.get('x-real-ip') || headers.get('x-forwarded-for')?.split(',')[0]?.trim() || null;
}

export async function createSession(userId: string, headers: Headers) {
  const token = randomToken(32);
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
  await prisma.authSession.create({
    data: {
      userId,
      tokenHash: sha256(token),
      userAgent: headers.get('user-agent')?.slice(0, 300) ?? null,
      ipAddress: clientIp(headers)?.slice(0, 64) ?? null,
      expiresAt: new Date(expiresAt * 1000),
    },
  });
  const payload = `v2.${token}.${expiresAt}`;
  return { cookieValue: `${payload}.${hmac(payload)}`, expiresAt };
}

export async function resolveSession(cookieValue: string | undefined) {
  const parsed = parseSessionCookie(cookieValue);
  if (!parsed) return null;
  const session = await prisma.authSession.findUnique({ where: { tokenHash: sha256(parsed.token) }, include: { user: true } });
  if (!session || session.revokedAt || session.expiresAt <= new Date() || session.user.disabledAt) return null;
  if (Date.now() - session.lastSeenAt.getTime() > TOUCH_INTERVAL_MS) {
    await prisma.authSession.update({ where: { id: session.id }, data: { lastSeenAt: new Date() } }).catch(() => undefined);
  }
  return session;
}

export async function revokeSessions(userId: string, exceptSessionId?: string) {
  const result = await prisma.authSession.updateMany({
    where: { userId, revokedAt: null, ...(exceptSessionId ? { id: { not: exceptSessionId } } : {}) },
    data: { revokedAt: new Date() },
  });
  return result.count;
}
