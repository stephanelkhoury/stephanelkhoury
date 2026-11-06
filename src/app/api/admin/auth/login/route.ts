import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_SESSION_COOKIE } from '@/lib/admin-auth';
import { ADMIN_SESSION_TTL_SECONDS, constantTimeStringEqual, createAdminSession, isAllowedAdminMutationOrigin } from '@/lib/admin-session';
import { readBoundedJsonBody } from '@/lib/bounded-json-body';
import { consumeRateLimit } from '@/lib/rate-limit';
import { rateLimitClientKey } from '@/lib/operations/rate-limit-memory';

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
  const contentLength = Number(request.headers.get('content-length') ?? 0);
  if (contentLength > 4096) return NextResponse.json({ error: 'Login request is too large.' }, { status: 413 });
  const host = request.headers.get('x-forwarded-host')?.split(',')[0]?.trim() || request.headers.get('host');
  const protocolHeader = request.headers.get('x-forwarded-proto')?.split(',')[0]?.trim();
  const protocol = protocolHeader ? (protocolHeader.endsWith(':') ? protocolHeader : `${protocolHeader}:`) : request.nextUrl.protocol;
  if (!isAllowedAdminMutationOrigin({
    origin: request.headers.get('origin'),
    requestHost: host,
    requestProtocol: protocol,
    fetchSite: request.headers.get('sec-fetch-site'),
  })) {
    return NextResponse.json({ error: 'Cross-origin sign-in is not allowed.' }, { status: 403 });
  }

  const token = normalizeAdminToken(process.env.ADMIN_DASHBOARD_TOKEN);
  if (!token) {
    return NextResponse.json({ error: 'ADMIN_DASHBOARD_TOKEN is not configured.' }, { status: 500 });
  }

  const limit = await consumeRateLimit(rateLimitClientKey(request, 'admin-login'), 10, 15 * 60 * 1000);
  if (limit.storage === 'unavailable') return NextResponse.json({ error: 'Sign-in protection is unavailable.' }, { status: 503 });
  if (!limit.allowed) return NextResponse.json({ error: 'Too many sign-in attempts. Try again later.' }, { status: 429, headers: { 'Retry-After': String(limit.retryAfterSeconds) } });

  const parsedBody = await readBoundedJsonBody(request.body, 4096);
  if (!parsedBody.ok && parsedBody.reason === 'too-large') {
    return NextResponse.json({ error: 'Login request is too large.' }, { status: 413 });
  }
  if (!parsedBody.ok) {
    return NextResponse.json({ error: 'Request body must be valid JSON.' }, { status: 400 });
  }
  const body = parsedBody.value;
  const password = normalizeAdminToken(String(typeof body === 'object' && body !== null && 'password' in body ? body.password || '' : ''));

  if (!password || !constantTimeStringEqual(password, token)) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  const session = createAdminSession(token);
  const response = NextResponse.json({ success: true });
  response.cookies.set({
    name: ADMIN_SESSION_COOKIE,
    value: session.value,
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: ADMIN_SESSION_TTL_SECONDS,
  });

  return response;
}
