import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { ADMIN_SESSION_COOKIE } from '@/lib/admin-auth';
import { isAllowedAdminMutationOrigin } from '@/lib/admin-session';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const host = request.headers.get('x-forwarded-host')?.split(',')[0]?.trim() || request.headers.get('host');
  const protocolHeader = request.headers.get('x-forwarded-proto')?.split(',')[0]?.trim();
  const protocol = protocolHeader ? (protocolHeader.endsWith(':') ? protocolHeader : `${protocolHeader}:`) : request.nextUrl.protocol;
  if (!isAllowedAdminMutationOrigin({
    origin: request.headers.get('origin'),
    requestHost: host,
    requestProtocol: protocol,
    fetchSite: request.headers.get('sec-fetch-site'),
  })) {
    return NextResponse.json({ error: 'Cross-origin sign-out is not allowed.' }, { status: 403 });
  }
  const response = NextResponse.json({ success: true });
  response.cookies.set({
    name: ADMIN_SESSION_COOKIE,
    value: '',
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
  });
  return response;
}
