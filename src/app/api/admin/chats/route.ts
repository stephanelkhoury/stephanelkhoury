import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!process.env.DATABASE_URL) {
    return NextResponse.json(
      { error: 'DATABASE_URL is not configured. Add it in Vercel and .env.local.' },
      { status: 500 }
    );
  }

  const chatSessions = await prisma.chatSession.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100,
    include: {
      messages: {
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  return NextResponse.json({ chatSessions });
}
