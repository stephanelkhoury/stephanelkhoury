import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSessionEdge } from '@/lib/admin-session-edge';

const ADMIN_SESSION_COOKIE = 'admin_session';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith('/admin')) {
    return NextResponse.next();
  }

  if (pathname === '/admin/sign-in') {
    return NextResponse.next();
  }

  const token = process.env.ADMIN_DASHBOARD_TOKEN;
  const session = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;

  if (!token || !await verifyAdminSessionEdge(session, token)) {
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
