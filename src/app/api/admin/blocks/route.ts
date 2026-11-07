import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';
import { ensureSeedData } from '@/lib/bootstrap';
import { blocksPayloadSchema } from '@/lib/admin-schemas';

export const runtime = 'nodejs';

function configError() {
  return NextResponse.json(
    { error: 'DATABASE_URL is not configured. Add it in Vercel and .env.local.' },
    { status: 500 }
  );
}

export async function GET(request: NextRequest) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!process.env.DATABASE_URL) return configError();

  await ensureSeedData();
  const blocks = await prisma.contentBlock.findMany({ orderBy: { sortOrder: 'asc' } });
  return NextResponse.json({ blocks });
}

export async function PUT(request: NextRequest) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!process.env.DATABASE_URL) return configError();

  const parsed = blocksPayloadSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid payload', issues: parsed.error.issues }, { status: 400 });
  }

  const { blocks } = parsed.data;

  await prisma.contentBlock.deleteMany({});
  if (blocks.length > 0) {
    await prisma.contentBlock.createMany({
      data: blocks.map((block) => ({
        slug: block.slug,
        type: block.type,
        title: block.title,
        subtitle: block.subtitle ?? null,
        content: block.content,
        sortOrder: block.sortOrder,
        isActive: block.isActive,
      })),
    });
  }

  return NextResponse.json({ success: true });
}
