import { NextRequest } from 'next/server';
import { isAdminRequestAllowed } from '@/lib/admin-session';

export const ADMIN_SESSION_COOKIE = 'admin_session';

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

export function isAdminRequest(request: NextRequest) {
  const token = normalizeAdminToken(process.env.ADMIN_DASHBOARD_TOKEN);
  const host = request.headers.get('x-forwarded-host')?.split(',')[0]?.trim() || request.headers.get('host');
  const protocolHeader = request.headers.get('x-forwarded-proto')?.split(',')[0]?.trim();
  const protocol = protocolHeader ? (protocolHeader.endsWith(':') ? protocolHeader : `${protocolHeader}:`) : request.nextUrl.protocol;
  return isAdminRequestAllowed({
    token,
    authorization: request.headers.get('authorization'),
    cookieSession: normalizeAdminToken(request.cookies.get(ADMIN_SESSION_COOKIE)?.value),
    method: request.method,
    origin: request.headers.get('origin'),
    requestHost: host,
    requestProtocol: protocol,
    fetchSite: request.headers.get('sec-fetch-site'),
  });
}
