import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { authorizeOperationsRequest, operationsAccessError } from '@/lib/operations/auth';
import { chunkKnowledgeText } from '@/lib/operations/knowledge-extraction';
import { z } from 'zod';

export const runtime = 'nodejs';

type RouteContext = { params: Promise<{ documentId: string }> };

const revisionSchema = z.object({
  title: z.string().trim().min(2).max(180).optional(),
  source: z.string().trim().min(2).max(500).optional(),
  evidenceStatus: z.enum(['OWNER_CONFIRMED', 'SOURCE_SUPPORTED', 'ASSUMPTION', 'UNVERIFIED']).optional(),
  content: z.string().trim().min(1).max(250000).optional(),
}).strict().refine((value) => Object.keys(value).length > 0, 'Provide at least one field for the new version.');

const statusSchema = z.object({ status: z.enum(['APPROVED', 'ARCHIVED']) }).strict();

export async function GET(request: NextRequest, { params }: RouteContext) {
  const access = await authorizeOperationsRequest(request);
  if (!access.ok) return operationsAccessError(access);

  const { documentId } = await params;
  try {
    const document = await prisma.knowledgeDocument.findUnique({
      where: { workspaceId_id: { workspaceId: access.workspaceId, id: documentId } },
      include: {
        attachments: { select: { id: true, fileName: true, contentType: true, fileSize: true, checksum: true, createdAt: true } },
        client: { select: { id: true, name: true } },
        project: { select: { id: true, name: true } },
        agent: { select: { id: true, name: true, key: true } },
      },
    });
    if (!document) return NextResponse.json({ error: 'Knowledge record not found.' }, { status: 404 });

    const history = await prisma.knowledgeDocument.findMany({
      where: { workspaceId: access.workspaceId, knowledgeKey: document.knowledgeKey },
      orderBy: { version: 'desc' },
      select: { id: true, version: true, title: true, status: true, evidenceStatus: true, updatedAt: true },
    });

    return NextResponse.json({ document, history });
  } catch {
    return NextResponse.json({ error: 'Knowledge record could not be loaded.' }, { status: 503 });
  }
}

export async function POST(request: NextRequest, { params }: RouteContext) {
  const access = await authorizeOperationsRequest(request);
  if (!access.ok) return operationsAccessError(access);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Request body must be valid JSON.' }, { status: 400 });
  }

  const parsed = revisionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid knowledge revision.' }, { status: 400 });
  }

  const { documentId } = await params;
  try {
    const result = await prisma.$transaction(async (transaction) => {
      const current = await transaction.knowledgeDocument.findUnique({
        where: { workspaceId_id: { workspaceId: access.workspaceId, id: documentId } },
        include: { attachments: true },
      });
      if (!current) return null;

      const latest = await transaction.knowledgeDocument.findFirst({
        where: { workspaceId: access.workspaceId, knowledgeKey: current.knowledgeKey },
        orderBy: { version: 'desc' },
        select: { version: true },
      });
      const version = (latest?.version ?? current.version) + 1;
      const content = parsed.data.content ?? current.content;
      const created = await transaction.knowledgeDocument.create({
        data: {
          workspaceId: access.workspaceId,
          knowledgeKey: current.knowledgeKey,
          version,
          title: parsed.data.title ?? current.title,
          scope: current.scope,
          sourceType: current.sourceType,
          source: parsed.data.source ?? current.source,
          status: 'DRAFT',
          evidenceStatus: parsed.data.evidenceStatus ?? current.evidenceStatus,
          createdById: access.userId,
          clientId: current.clientId,
          projectId: current.projectId,
          agentDefinitionId: current.agentDefinitionId,
          sourceUrl: current.sourceUrl,
          contentType: current.contentType,
          content,
          extractionStatus: current.extractionStatus,
          extractionError: current.extractionError,
        },
      });

      await transaction.knowledgeChunk.createMany({
        data: chunkKnowledgeText(content).map((chunk, ordinal) => ({
          workspaceId: access.workspaceId,
          knowledgeDocumentId: created.id,
          ordinal,
          content: chunk,
          metadata: { scope: current.scope, evidenceStatus: parsed.data.evidenceStatus ?? current.evidenceStatus },
        })),
      });

      if (current.attachments.length > 0) {
        await transaction.knowledgeAttachment.createMany({
          data: current.attachments.map((attachment) => ({
            workspaceId: attachment.workspaceId,
            storageKey: attachment.storageKey,
            fileName: attachment.fileName,
            contentType: attachment.contentType,
            fileSize: attachment.fileSize,
            checksum: attachment.checksum,
            knowledgeDocumentId: created.id,
          })),
        });
      }

      await transaction.auditEvent.create({
        data: {
          workspaceId: access.workspaceId,
          actorId: access.userId,
          action: 'knowledge.version.created',
          resource: 'KnowledgeDocument',
          resourceId: created.id,
          metadata: { knowledgeKey: current.knowledgeKey, version },
        },
      });

      return created;
    });

    if (!result) return NextResponse.json({ error: 'Knowledge record not found.' }, { status: 404 });
    return NextResponse.json({ document: result }, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json({ error: 'Another version was created at the same time. Reload history and retry.' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Knowledge revision could not be saved.' }, { status: 503 });
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

  const parsed = statusSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Choose approve or archive.' }, { status: 400 });

  const { documentId } = await params;
  try {
    const result = await prisma.$transaction(async (transaction) => {
      const current = await transaction.knowledgeDocument.findUnique({
        where: { workspaceId_id: { workspaceId: access.workspaceId, id: documentId } },
        select: { id: true, knowledgeKey: true, version: true, status: true },
      });
      if (!current) return null;
      if (parsed.data.status === 'APPROVED' && current.status !== 'DRAFT') {
        return { conflict: true as const };
      }

      if (parsed.data.status === 'APPROVED') {
        await transaction.knowledgeDocument.updateMany({
          where: { workspaceId: access.workspaceId, knowledgeKey: current.knowledgeKey, status: 'APPROVED' },
          data: { status: 'SUPERSEDED' },
        });
      }

      const updated = await transaction.knowledgeDocument.update({
        where: { workspaceId_id: { workspaceId: access.workspaceId, id: current.id } },
        data: { status: parsed.data.status },
      });

      await transaction.auditEvent.create({
        data: {
          workspaceId: access.workspaceId,
          actorId: access.userId,
          action: parsed.data.status === 'APPROVED' ? 'knowledge.approved' : 'knowledge.archived',
          resource: 'KnowledgeDocument',
          resourceId: updated.id,
          metadata: { knowledgeKey: current.knowledgeKey, version: current.version },
        },
      });

      return { document: updated };
    });

    if (!result) return NextResponse.json({ error: 'Knowledge record not found.' }, { status: 404 });
    if ('conflict' in result) return NextResponse.json({ error: 'Only a draft version can be approved.' }, { status: 409 });
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: 'Knowledge status could not be changed.' }, { status: 503 });
  }
}