import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthContext } from '@/lib/auth/context';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const context = await getAuthContext(request).catch(() => null);
  if (!context) return NextResponse.json({ authenticated: false }, { status: 401 });
  const profile = context.userId ? await prisma.user.findUnique({ where: { id: context.userId }, select: { email: true, name: true, totpEnabledAt: true, lastLoginAt: true } }) : null;
  return NextResponse.json({
    authenticated: true,
    kind: context.kind,
    role: context.role,
    user: profile ? { email: profile.email, name: profile.name, totpEnabled: Boolean(profile.totpEnabledAt), lastLoginAt: profile.lastLoginAt } : null,
  });
}
