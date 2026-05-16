import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_SESSION_COOKIE } from '@/lib/admin-auth';

export const runtime = 'nodejs';

function normalizeAdminToken(value: string | undefined) {
  if (!value) return '';
  let normalized = value.trim();
  if (
    (normalized.startsWith('"') && normalized.endsWith('"')) ||
    (normalized.startsWith("'") && normalized.endsWith("'"))
  ) {
    normalized = normalized.slice(1, -1).trim();
  }
  return normalized;
}

export async function POST(request: NextRequest) {
  const token = normalizeAdminToken(process.env.ADMIN_DASHBOARD_TOKEN);
  if (!token) {
    return NextResponse.json({ error: 'ADMIN_DASHBOARD_TOKEN is not configured.' }, { status: 500 });
  }

  const body = await request.json();
  const password = normalizeAdminToken(String(body?.password || ''));

  if (!password || password !== token) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set({
    name: ADMIN_SESSION_COOKIE,
    value: token,
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}
