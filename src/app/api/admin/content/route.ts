import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { isAdminRequest } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';
import { ensureSeedData } from '@/lib/bootstrap';

export const runtime = 'nodejs';

const payloadSchema = z.object({
  blocks: z.array(
    z.object({
      id: z.string().optional(),
      slug: z.string(),
      type: z.enum(['HERO', 'ABOUT', 'EXPERIENCE', 'CONTACT']),
      title: z.string(),
      subtitle: z.string().nullable().optional(),
      content: z.any(),
      sortOrder: z.number().int().nonnegative(),
      isActive: z.boolean(),
    })
  ),
  projects: z.array(
    z.object({
      id: z.string().optional(),
      title: z.string(),
      slug: z.string(),
      summary: z.string(),
      description: z.string(),
      imageUrl: z.string().nullable().optional(),
      githubUrl: z.string().nullable().optional(),
      liveUrl: z.string().nullable().optional(),
      technologies: z.array(z.string()),
      sortOrder: z.number().int().nonnegative(),
      isActive: z.boolean(),
    })
  ),
  systems: z.array(
    z.object({
      id: z.string().optional(),
      name: z.string(),
      slug: z.string(),
      logoUrl: z.string(),
      shortDescription: z.string(),
      experience: z.string(),
      projectLinks: z.array(z.string()),
      certificateLinks: z.array(z.string()),
      resourceLinks: z.array(z.string()),
      sortOrder: z.number().int().nonnegative(),
      isActive: z.boolean(),
    })
  ),
  certificates: z.array(
    z.object({
      id: z.string().optional(),
      title: z.string(),
      issuer: z.string(),
      fileUrl: z.string(),
      externalUrl: z.string().nullable().optional(),
      issuedAt: z.string().nullable().optional(),
      sortOrder: z.number().int().nonnegative(),
      isActive: z.boolean(),
    })
  ),
});

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

  await ensureSeedData();

  const [blocks, projects, systems, certificates, chatSessions] = await Promise.all([
    prisma.contentBlock.findMany({ orderBy: { sortOrder: 'asc' } }),
    prisma.project.findMany({ orderBy: { sortOrder: 'asc' } }),
    prisma.supportedSystem.findMany({ orderBy: { sortOrder: 'asc' } }),
    prisma.certificate.findMany({ orderBy: { sortOrder: 'asc' } }),
    prisma.chatSession.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    }),
  ]);

  return NextResponse.json({ blocks, projects, systems, certificates, chatSessions });
}

export async function PUT(request: NextRequest) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!process.env.DATABASE_URL) {
    return NextResponse.json(
      { error: 'DATABASE_URL is not configured. Add it in Vercel and .env.local.' },
      { status: 500 }
    );
  }

  const body = await request.json();
  const parsed = payloadSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid payload', issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const { blocks, projects, systems, certificates } = parsed.data;

  await prisma.contentBlock.deleteMany({});
  await prisma.project.deleteMany({});
  await prisma.supportedSystem.deleteMany({});
  await prisma.certificate.deleteMany({});

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

  if (projects.length > 0) {
    await prisma.project.createMany({
      data: projects.map((project) => ({
        title: project.title,
        slug: project.slug,
        summary: project.summary,
        description: project.description,
        imageUrl: project.imageUrl ?? null,
        githubUrl: project.githubUrl ?? null,
        liveUrl: project.liveUrl ?? null,
        technologies: project.technologies,
        sortOrder: project.sortOrder,
        isActive: project.isActive,
      })),
    });
  }

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
