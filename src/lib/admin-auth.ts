import { NextRequest } from 'next/server';
import { canManageWorkspace, getAuthContext } from '@/lib/auth/context';
import { SESSION_COOKIE } from '@/lib/auth/session';

export const ADMIN_SESSION_COOKIE = SESSION_COOKIE;

// Allows the API token or a signed-in owner/admin; team members and clients use the operations APIs only.
export async function isAdminRequest(request: NextRequest) {
  const context = await getAuthContext(request);
  return Boolean(context && canManageWorkspace(context.role));
}
