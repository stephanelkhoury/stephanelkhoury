import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { authorizeOperationsRequest, operationsAccessError } from '@/lib/operations/auth';
import { createOperationsProjectSchema, createProjectSlug } from '@/lib/operations/project-validation';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const access = await authorizeOperationsRequest(request);
  if (!access.ok) return operationsAccessError(access);

  try {
    const projects = await prisma.operationsProject.findMany({
      where: { workspaceId: access.workspaceId },
      orderBy: [{ updatedAt: 'desc' }, { name: 'asc' }],
      select: {
        id: true,
        name: true,
        slug: true,
        summary: true,
        status: true,
        updatedAt: true,
        client: { select: { name: true } },
        _count: { select: { tasks: true } },
      },
    });

    return NextResponse.json({ projects });
  } catch {
    return NextResponse.json({ error: 'Projects could not be loaded.' }, { status: 503 });
  }
}

export async function POST(request: NextRequest) {
  const access = await authorizeOperationsRequest(request);
  if (!access.ok) return operationsAccessError(access);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Request body must be valid JSON.' }, { status: 400 });
  }

  const parsed = createOperationsProjectSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid project.' }, { status: 400 });
  }

  const slug = parsed.data.slug || createProjectSlug(parsed.data.name);
  if (!slug) {
    return NextResponse.json({ error: 'Add a project name that can be used to create a URL slug.' }, { status: 400 });
  }

  try {
    const project = await prisma.$transaction(async (transaction) => {
      const created = await transaction.operationsProject.create({
        data: {
          workspaceId: access.workspaceId,
          name: parsed.data.name,
          slug,
          summary: parsed.data.summary ?? '',
          status: parsed.data.status ?? 'DRAFT',
        },
      });

      if (parsed.data.brief) {
        await transaction.projectBrief.create({
          data: {
            workspaceId: access.workspaceId,
            projectId: created.id,
            content: parsed.data.brief,
          },
        });
      }

      await transaction.auditEvent.create({
        data: {
          workspaceId: access.workspaceId,
          actorId: access.userId,
          action: 'project.created',
          resource: 'OperationsProject',
          resourceId: created.id,
          metadata: { name: created.name, slug: created.slug },
        },
      });

      return created;
    });

    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json({ error: 'A project with this slug already exists in this workspace.' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Project could not be created.' }, { status: 503 });
  }
}