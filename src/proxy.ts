import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSessionV2Edge } from '@/lib/admin-session-edge';

const ADMIN_SESSION_COOKIE = 'admin_session';
const PUBLIC_PATHS = new Set(['/admin/sign-in', '/admin/forgot-password', '/admin/reset-password']);

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith('/admin') || PUBLIC_PATHS.has(pathname)) {
    return NextResponse.next();
  }

  const secret = (process.env.AUTH_SECRET || process.env.ADMIN_DASHBOARD_TOKEN || '').trim().replace(/^["']|["']$/g, '');
  const session = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;

  if (!secret || !await verifyAdminSessionV2Edge(session, secret)) {
    const signInUrl = request.nextUrl.clone();
    signInUrl.pathname = '/admin/sign-in';
    signInUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin', '/admin/:path*'],
};
