import { NextRequest } from 'next/server';
import type { WorkspaceRole } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { constantTimeStringEqual, isAllowedAdminMutationOrigin } from '@/lib/admin-session';
import { resolveSession, SESSION_COOKIE } from '@/lib/auth/session';

export const WORKSPACE_SLUG = 'multigraphic-ai';

export type AuthContext = {
  kind: 'token' | 'session';
  userId: string | null;
  email: string | null;
  name: string | null;
  role: WorkspaceRole;
  workspaceId: string | null;
  sessionId: string | null;
  totpEnabled: boolean;
};

function normalizeToken(value: string | undefined) {
  return (value ?? '').trim().replace(/^["']|["']$/g, '').trim();
}

export function requestOriginAllowed(request: NextRequest) {
  const host = request.headers.get('x-forwarded-host')?.split(',')[0]?.trim() || request.headers.get('host');
  const protocolHeader = request.headers.get('x-forwarded-proto')?.split(',')[0]?.trim();
  const requestProtocol = protocolHeader ? (protocolHeader.endsWith(':') ? protocolHeader : `${protocolHeader}:`) : request.nextUrl.protocol;
  return isAllowedAdminMutationOrigin({ origin: request.headers.get('origin'), requestHost: host, requestProtocol, fetchSite: request.headers.get('sec-fetch-site') });
}

// The static API token stays for automation and tests; people sign in with email and password.
export async function getAuthContext(request: NextRequest): Promise<AuthContext | null> {
  const apiToken = normalizeToken(process.env.ADMIN_DASHBOARD_TOKEN);
  const authorization = request.headers.get('authorization');
  if (apiToken && authorization?.startsWith('Bearer ') && constantTimeStringEqual(authorization.slice(7), apiToken)) {
    return { kind: 'token', userId: null, email: null, name: 'API token', role: 'OWNER', workspaceId: null, sessionId: null, totpEnabled: false };
  }
  const cookie = request.cookies.get(SESSION_COOKIE)?.value;
  if (!cookie) return null;
  const mutating = !['GET', 'HEAD', 'OPTIONS'].includes(request.method.toUpperCase());
  if (mutating && !requestOriginAllowed(request)) return null;
  const session = await resolveSession(cookie).catch(() => null);
  if (!session) return null;
  const membership = await prisma.membership.findFirst({
    where: { userId: session.userId, status: 'ACTIVE', workspace: { slug: WORKSPACE_SLUG } },
    select: { role: true, workspaceId: true },
  });
  if (!membership) return null;
  return {
    kind: 'session',
    userId: session.userId,
    email: session.user.email,
    name: session.user.name,
    role: membership.role,
    workspaceId: membership.workspaceId,
    sessionId: session.id,
    totpEnabled: Boolean(session.user.totpEnabledAt),
  };
}

export const canManageWorkspace = (role: WorkspaceRole) => role === 'OWNER' || role === 'ADMIN';
