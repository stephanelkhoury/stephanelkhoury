import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requestOriginAllowed } from '@/lib/auth/context';
import { parseSessionCookie, SESSION_COOKIE } from '@/lib/auth/session';
import { sha256 } from '@/lib/auth/crypto';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  if (!requestOriginAllowed(request)) return NextResponse.json({ error: 'Cross-origin sign-out is not allowed.' }, { status: 403 });
  const parsed = parseSessionCookie(request.cookies.get(SESSION_COOKIE)?.value);
  if (parsed) await prisma.authSession.updateMany({ where: { tokenHash: sha256(parsed.token), revokedAt: null }, data: { revokedAt: new Date() } }).catch(() => undefined);
  const response = NextResponse.json({ success: true });
  response.cookies.set({ name: SESSION_COOKIE, value: '', httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 0 });
  return response;
}
