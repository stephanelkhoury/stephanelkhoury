import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';
import { certificatesPayloadSchema } from '@/lib/admin-schemas';

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

  const certificates = await prisma.certificate.findMany({ orderBy: { sortOrder: 'asc' } });
  return NextResponse.json({ certificates });
}

export async function PUT(request: NextRequest) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!process.env.DATABASE_URL) return configError();

  const parsed = certificatesPayloadSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid payload', issues: parsed.error.issues }, { status: 400 });
  }

  const { certificates } = parsed.data;

  await prisma.certificate.deleteMany({});
  if (certificates.length > 0) {
    await prisma.certificate.createMany({
      data: certificates.map((certificate) => ({
        title: certificate.title,
        issuer: certificate.issuer,
        fileUrl: certificate.fileUrl,
        externalUrl: certificate.externalUrl ?? null,
        issuedAt: certificate.issuedAt ?? null,
        sortOrder: certificate.sortOrder,
        isActive: certificate.isActive,
      })),
    });
  }

  return NextResponse.json({ success: true });
}
