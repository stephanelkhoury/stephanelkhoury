import { NextRequest, NextResponse } from 'next/server';
import { MembershipStatus, WorkspaceRole } from '@prisma/client';
import { isAdminRequest } from '@/lib/admin-auth';
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
};

export type OperationsAccess = OperationsAccessFailure | OperationsAccessSuccess;

export async function authorizeOperationsRequest(request: NextRequest): Promise<OperationsAccess> {
  if (!isAdminRequest(request)) {
    return { ok: false, status: 401, message: 'Authentication required.' };
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
        workspace: { slug: 'multigraphic-ai' },
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

    return { ok: true, ...membership };
  } catch {
    return { ok: false, status: 503, message: 'The operations database is unavailable.' };
  }
}

export function operationsAccessError(access: OperationsAccessFailure) {
  return NextResponse.json({ error: access.message }, { status: access.status });
}