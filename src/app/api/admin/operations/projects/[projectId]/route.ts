import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { authorizeOperationsRequest, operationsAccessError } from '@/lib/operations/auth';
import { createProjectSlug, updateOperationsProjectSchema } from '@/lib/operations/project-validation';

export const runtime = 'nodejs';

type RouteContext = { params: Promise<{ projectId: string }> };

export async function GET(request: NextRequest, { params }: RouteContext) {
  const access = await authorizeOperationsRequest(request);
  if (!access.ok) return operationsAccessError(access);

  const { projectId } = await params;
  try {
    const project = await prisma.operationsProject.findUnique({
      where: { workspaceId_id: { workspaceId: access.workspaceId, id: projectId } },
      include: {
        brief: { select: { content: true, updatedAt: true } },
        client: { select: { name: true } },
        tasks: {
          orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
          take: 100,
          select: { id: true, title: true, status: true, error: true, updatedAt: true, workflowRunId: true, planKey: true },
        },
        workflowRuns: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          select: {
            id: true,
            status: true,
            createdAt: true,
            finishedAt: true,
            error: true,
            events: { orderBy: { createdAt: 'desc' }, take: 8, select: { id: true, type: true, message: true, taskKey: true, createdAt: true } },
            approvals: { where: { status: 'PENDING' }, orderBy: { createdAt: 'asc' }, select: { id: true, actionKey: true, actionHash: true, status: true, task: { select: { title: true } } } },
          },
        },
        artifacts: {
          orderBy: { updatedAt: 'desc' },
          take: 30,
          select: {
            id: true,
            title: true,
            kind: true,
            status: true,
            updatedAt: true,
            versions: { orderBy: { version: 'desc' }, take: 1, select: { id: true, version: true, contentType: true, storageKey: true, createdAt: true, approvals: { where: { status: 'PENDING' }, select: { id: true } } } },
          },
        },
        knowledgeDocuments: {
          orderBy: { updatedAt: 'desc' },
          take: 30,
          select: {
            id: true,
            title: true,
            scope: true,
            status: true,
            evidenceStatus: true,
            updatedAt: true,
            attachments: { select: { id: true, fileName: true, contentType: true, fileSize: true } },
          },
        },
      },
    });

    if (!project) return NextResponse.json({ error: 'Project not found.' }, { status: 404 });
    const audit = await prisma.auditEvent.findMany({
      where: { workspaceId: access.workspaceId, resource: 'OperationsProject', resourceId: projectId },
      orderBy: { createdAt: 'desc' },
      take: 30,
      select: { id: true, action: true, metadata: true, createdAt: true, actorMembership: { select: { user: { select: { name: true } } } } },
    });
    return NextResponse.json({ project, audit });
  } catch {
    return NextResponse.json({ error: 'Project could not be loaded.' }, { status: 503 });
  }
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const access = await authorizeOperationsRequest(request);
  if (!access.ok) return operationsAccessError(access);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Request body must be valid JSON.' }, { status: 400 });
  }

  const parsed = updateOperationsProjectSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid project update.' }, { status: 400 });
  }

  const { projectId } = await params;
  const slug = parsed.data.slug ?? (parsed.data.name ? createProjectSlug(parsed.data.name) : undefined);
  if (slug === '') {
    return NextResponse.json({ error: 'Add a project name that can be used to create a URL slug.' }, { status: 400 });
  }

  try {
    const project = await prisma.$transaction(async (transaction) => {
      const updated = await transaction.operationsProject.update({
        where: { workspaceId_id: { workspaceId: access.workspaceId, id: projectId } },
        data: {
          ...(parsed.data.name !== undefined && { name: parsed.data.name }),
          ...(slug !== undefined && { slug }),
          ...(parsed.data.summary !== undefined && { summary: parsed.data.summary }),
          ...(parsed.data.status !== undefined && { status: parsed.data.status }),
        },
      });

      if (parsed.data.brief !== undefined) {
        await transaction.projectBrief.upsert({
          where: { workspaceId_projectId: { workspaceId: access.workspaceId, projectId } },
          create: { workspaceId: access.workspaceId, projectId, content: parsed.data.brief },
          update: { content: parsed.data.brief },
        });
      }

      await transaction.auditEvent.create({
        data: {
          workspaceId: access.workspaceId,
          actorId: access.userId,
          action: 'project.updated',
          resource: 'OperationsProject',
          resourceId: updated.id,
          metadata: { name: updated.name, slug: updated.slug, status: updated.status },
        },
      });

      return updated;
    });

    return NextResponse.json({ project });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json({ error: 'Project not found.' }, { status: 404 });
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json({ error: 'A project with this slug already exists in this workspace.' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Project could not be updated.' }, { status: 503 });
  }
}