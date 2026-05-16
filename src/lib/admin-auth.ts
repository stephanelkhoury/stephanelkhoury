import { NextRequest } from 'next/server';

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
  if (!token) {
    return false;
  }

  const auth = request.headers.get('authorization') || '';
  if (auth === `Bearer ${token}`) {
    return true;
  }

  const cookieToken = normalizeAdminToken(request.cookies.get(ADMIN_SESSION_COOKIE)?.value);
  return cookieToken === token;
}
