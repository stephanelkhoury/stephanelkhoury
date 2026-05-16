import { NextRequest, NextResponse } from 'next/server';

const ADMIN_SESSION_COOKIE = 'admin_session';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith('/admin')) {
    return NextResponse.next();
  }

  if (pathname === '/admin/sign-in') {
    return NextResponse.next();
  }

  const token = process.env.ADMIN_DASHBOARD_TOKEN;
  const session = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;

  if (!token || session !== token) {
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
