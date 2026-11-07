import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';
import { systemsPayloadSchema } from '@/lib/admin-schemas';

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

  const systems = await prisma.supportedSystem.findMany({ orderBy: { sortOrder: 'asc' } });
  return NextResponse.json({ systems });
}

export async function PUT(request: NextRequest) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!process.env.DATABASE_URL) return configError();

  const parsed = systemsPayloadSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid payload', issues: parsed.error.issues }, { status: 400 });
  }

  const { systems } = parsed.data;

  await prisma.supportedSystem.deleteMany({});
  if (systems.length > 0) {
    await prisma.supportedSystem.createMany({
      data: systems.map((system) => ({
        name: system.name,
        slug: system.slug,
        logoUrl: system.logoUrl,
        shortDescription: system.shortDescription,
        experience: system.experience,
        projectLinks: system.projectLinks,
        certificateLinks: system.certificateLinks,
        resourceLinks: system.resourceLinks,
        sortOrder: system.sortOrder,
        isActive: system.isActive,
      })),
    });
  }

  return NextResponse.json({ success: true });
}
