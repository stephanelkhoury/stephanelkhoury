import { NextRequest, NextResponse } from 'next/server';
import { MembershipStatus, WorkspaceRole } from '@prisma/client';
import { getAuthContext, WORKSPACE_SLUG } from '@/lib/auth/context';
import { prisma } from '@/lib/prisma';

type OperationsAccessFailure = {
  ok: false;
  status: 401 | 403 | 503;
  message: string;
};

type OperationsAccessSuccess = {
  ok: true;
  workspaceId: string;
  userId: string;
  role: WorkspaceRole;
};

export type OperationsAccess = OperationsAccessFailure | OperationsAccessSuccess;

export async function authorizeOperationsRequest(request: NextRequest): Promise<OperationsAccess> {
  let context;
  try {
    context = await getAuthContext(request);
  } catch {
    return { ok: false, status: 503, message: 'The operations database is unavailable.' };
  }
  if (!context) return { ok: false, status: 401, message: 'Authentication required.' };

  if (context.kind === 'session') {
    if (context.role === WorkspaceRole.CLIENT) return { ok: false, status: 403, message: 'Client accounts use the client portal.' };
    return { ok: true, workspaceId: context.workspaceId!, userId: context.userId!, role: context.role };
  }

  const ownerEmail = process.env.MULTIGRAPHIC_OWNER_EMAIL?.trim().toLowerCase();
  if (!process.env.DATABASE_URL || !ownerEmail) {
    return {
      ok: false,
      status: 503,
      message: 'Operations setup is incomplete. Configure the database and owner email, then run the operations seed.',
    };
  }

  try {
    const membership = await prisma.membership.findFirst({
      where: {
        role: WorkspaceRole.OWNER,
        status: MembershipStatus.ACTIVE,
        user: { email: ownerEmail },
        workspace: { slug: WORKSPACE_SLUG },
      },
      select: { workspaceId: true, userId: true },
    });

    if (!membership) {
      return {
        ok: false,
        status: 403,
        message: 'The owner workspace is not provisioned. Run the operations seed after applying the database migration.',
      };
    }

    return { ok: true, ...membership, role: WorkspaceRole.OWNER };
  } catch {
    return { ok: false, status: 503, message: 'The operations database is unavailable.' };
  }
}

export function operationsAccessError(access: OperationsAccessFailure) {
  return NextResponse.json({ error: access.message }, { status: access.status });
}
