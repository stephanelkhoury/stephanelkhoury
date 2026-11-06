import { createHash, randomUUID } from 'node:crypto';
import { del, put } from '@vercel/blob';
import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { authorizeOperationsRequest, operationsAccessError } from '@/lib/operations/auth';
import { chunkKnowledgeText, extractKnowledgeText, KnowledgeExtractionError } from '@/lib/operations/knowledge-extraction';
import { createProjectSlug } from '@/lib/operations/project-validation';
import { createKnowledgeRecordSchema, createKnowledgeScopeFilter, knowledgeScopeSchema } from '@/lib/operations/knowledge-validation';
import { consumeRateLimit } from '@/lib/rate-limit';

export const runtime = 'nodejs';

const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;
const MAX_UPLOAD_REQUEST_BYTES = MAX_UPLOAD_BYTES + 512 * 1024;
const uploadContentTypes: Record<string, string> = {
  txt: 'text/plain',
  md: 'text/markdown',
  csv: 'text/csv',
  pdf: 'application/pdf',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
};

function extractionErrorResponse(error: KnowledgeExtractionError) {
  const status = error.code === 'UNSUPPORTED_FILE' ? 415 : error.code === 'TEXT_LIMIT' ? 413 : 422;
  return NextResponse.json({ error: error.message, code: error.code }, { status });
}

function encodeFilename(value: string) {
  return value.replace(/[\r\n"\\]/g, '_').slice(0, 180) || 'document';
}

export async function GET(request: NextRequest) {
  const access = await authorizeOperationsRequest(request);
  if (!access.ok) return operationsAccessError(access);

  const params = request.nextUrl.searchParams;
  const parsedScope = knowledgeScopeSchema.safeParse(params.get('scope'));
  const query = params.get('q')?.trim() ?? '';
  if (!parsedScope.success) return NextResponse.json({ error: 'Choose a valid knowledge scope before searching.' }, { status: 400 });
  const scope = parsedScope.data;
  if (query && (query.length < 2 || query.length > 200)) {
    return NextResponse.json({ error: 'Search text must be between 2 and 200 characters.' }, { status: 400 });
  }

  let scopeFilter: ReturnType<typeof createKnowledgeScopeFilter>;
  try {
    scopeFilter = createKnowledgeScopeFilter({
      scope,
      clientId: params.get('clientId') || undefined,
      projectId: params.get('projectId') || undefined,
      agentDefinitionId: params.get('agentDefinitionId') || undefined,
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Invalid knowledge scope.' }, { status: 400 });
  }

  try {
    if (query) {
      const matches = await prisma.knowledgeChunk.findMany({
        where: {
          workspaceId: access.workspaceId,
          content: { contains: query, mode: 'insensitive' },
          document: {
            workspaceId: access.workspaceId,
            status: 'APPROVED',
            ...scopeFilter,
          },
        },
        orderBy: [{ createdAt: 'desc' }, { ordinal: 'asc' }],
        take: 100,
        select: {
          content: true,
          document: {
            select: {
              id: true,
              knowledgeKey: true,
              version: true,
              title: true,
              scope: true,
              source: true,
              status: true,
              evidenceStatus: true,
              clientId: true,
              projectId: true,
              agentDefinitionId: true,
              updatedAt: true,
              client: { select: { name: true } },
              project: { select: { name: true } },
              agent: { select: { name: true } },
              _count: { select: { attachments: true } },
            },
          },
        },
      });

      const seen = new Set<string>();
      const documents = matches.flatMap(({ content, document }) => {
        if (seen.has(document.id)) return [];
        seen.add(document.id);
        return [{ ...document, snippet: content.slice(0, 480) }];
      });
      return NextResponse.json({ documents, searchMode: 'keyword', semanticSearchConnected: false });
    }

    const statuses = params.getAll('status');
    const allowedStatuses = new Set(['DRAFT', 'APPROVED', 'SUPERSEDED', 'ARCHIVED']);
    if (statuses.some((status) => !allowedStatuses.has(status))) {
      return NextResponse.json({ error: 'One or more knowledge statuses are invalid.' }, { status: 400 });
    }
    const where: Prisma.KnowledgeDocumentWhereInput = {
      workspaceId: access.workspaceId,
      ...scopeFilter,
      ...(statuses.length ? { status: { in: statuses as Prisma.EnumKnowledgeStatusFilter['in'] } } : {}),
    };

    const documents = await prisma.knowledgeDocument.findMany({
      where,
      orderBy: [{ updatedAt: 'desc' }, { version: 'desc' }],
      take: 100,
      select: {
        id: true,
        knowledgeKey: true,
        version: true,
        title: true,
        scope: true,
        sourceType: true,
        source: true,
        status: true,
        evidenceStatus: true,
        extractionStatus: true,
        clientId: true,
        projectId: true,
        agentDefinitionId: true,
        updatedAt: true,
        client: { select: { name: true } },
        project: { select: { name: true } },
        agent: { select: { name: true } },
        _count: { select: { attachments: true } },
      },
    });

    return NextResponse.json({ documents, searchMode: 'keyword', semanticSearchConnected: false });
  } catch {
    return NextResponse.json({ error: 'Knowledge records could not be loaded.' }, { status: 503 });
  }
}

export async function POST(request: NextRequest) {
  const access = await authorizeOperationsRequest(request);
  if (!access.ok) return operationsAccessError(access);

  const contentLength = Number(request.headers.get('content-length') ?? 0);
  if (contentLength > MAX_UPLOAD_REQUEST_BYTES) return NextResponse.json({ error: 'Knowledge upload request exceeds the 4 MiB file and multipart overhead limit.' }, { status: 413 });
  const uploadLimit = await consumeRateLimit(`knowledge-create:${access.workspaceId}:${access.userId}`, 20, 60 * 60 * 1000);
  if (uploadLimit.storage === 'unavailable') return NextResponse.json({ error: 'Knowledge upload rate-limit storage is unavailable.' }, { status: 503 });
  if (!uploadLimit.allowed) return NextResponse.json({ error: 'Knowledge creation is limited to 20 records per owner per hour. Try again later.' }, { status: 429, headers: { 'Retry-After': String(uploadLimit.retryAfterSeconds) } });

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: 'Upload form could not be read.' }, { status: 400 });
  }

  const fileValue = form.get('file');
  if (fileValue !== null && typeof fileValue !== 'string' && !(fileValue instanceof File)) {
    return NextResponse.json({ error: 'Invalid file upload.' }, { status: 400 });
  }
  const file = fileValue instanceof File ? fileValue : null;
  if (file && file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json({ error: 'Knowledge uploads are limited to 4 MiB per file.' }, { status: 413 });
  }

  const parsed = createKnowledgeRecordSchema.safeParse({
    title: form.get('title')?.toString(),
    scope: form.get('scope')?.toString(),
    source: form.get('source')?.toString(),
    evidenceStatus: form.get('evidenceStatus')?.toString(),
    clientId: form.get('clientId')?.toString(),
    projectId: form.get('projectId')?.toString(),
    agentDefinitionId: form.get('agentDefinitionId')?.toString(),
    content: file ? undefined : form.get('content')?.toString(),
  });
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid knowledge record.' }, { status: 400 });
  }

  const { scope, clientId, projectId, agentDefinitionId } = parsed.data;
  try {
    const [client, project, agent] = await Promise.all([
      clientId ? prisma.client.findFirst({ where: { workspaceId: access.workspaceId, id: clientId }, select: { id: true } }) : null,
      projectId ? prisma.operationsProject.findUnique({ where: { workspaceId_id: { workspaceId: access.workspaceId, id: projectId } }, select: { id: true, clientId: true } }) : null,
      agentDefinitionId ? prisma.agentDefinition.findUnique({ where: { workspaceId_id: { workspaceId: access.workspaceId, id: agentDefinitionId } }, select: { id: true } }) : null,
    ]);

    if (clientId && !client) return NextResponse.json({ error: 'Client not found in this workspace.' }, { status: 404 });
    if (projectId && !project) return NextResponse.json({ error: 'Project not found in this workspace.' }, { status: 404 });
    if (agentDefinitionId && !agent) return NextResponse.json({ error: 'Agent not found in this workspace.' }, { status: 404 });
    if (clientId && project?.clientId && project.clientId !== clientId) {
      return NextResponse.json({ error: 'The selected project does not belong to the selected client.' }, { status: 400 });
    }

    let content = parsed.data.content ?? '';
    let contentType: string | null = null;
    let checksum: string | null = null;
    let fileName: string | null = null;
    let fileSize: number | null = null;
    let fileBytes: Uint8Array | null = null;
    let sourceType: 'MANUAL_ENTRY' | 'UPLOADED_FILE' = 'MANUAL_ENTRY';

    if (file) {
      try {
          fileBytes = new Uint8Array(await file.arrayBuffer());
          content = await extractKnowledgeText(file.name, fileBytes);
      } catch (error) {
        if (error instanceof KnowledgeExtractionError) return extractionErrorResponse(error);
        return NextResponse.json({ error: 'Document extraction failed.' }, { status: 422 });
      }

      const extension = file.name.toLowerCase().split('.').pop() ?? '';
      contentType = uploadContentTypes[extension] ?? 'application/octet-stream';
      fileName = encodeFilename(file.name);
      fileSize = file.size;
      checksum = createHash('sha256').update(Buffer.from(fileBytes)).digest('hex');
      sourceType = 'UPLOADED_FILE';

      if (!process.env.BLOB_READ_WRITE_TOKEN && !process.env.VERCEL) {
        return NextResponse.json({ error: 'Private document storage is disconnected. Configure BLOB_READ_WRITE_TOKEN or connect a private Vercel Blob store.' }, { status: 503 });
      }
    }

    if (!content.trim()) return NextResponse.json({ error: 'Add searchable text or upload a supported document.' }, { status: 400 });
    const titleSlug = createProjectSlug(parsed.data.title) || createHash('sha256').update(parsed.data.title).digest('hex').slice(0, 12);
    const scopeOwner = projectId ?? clientId ?? agentDefinitionId ?? 'workspace';
    const knowledgeKey = `${scope.toLowerCase()}-${scopeOwner}-${titleSlug}`.slice(0, 180).replace(/-+$/g, '');
    const documentId = randomUUID();
    const chunks = chunkKnowledgeText(content);
    let uploadedBlob: { url: string; pathname: string } | null = null;

    if (file && fileBytes && fileName && contentType && checksum && fileSize !== null) {
      const storagePath = `multigraphic-ai/${access.workspaceId}/knowledge/${documentId}/${fileName}`;
      try {
        uploadedBlob = await put(storagePath, Buffer.from(fileBytes), {
          access: 'private',
          addRandomSuffix: true,
          contentType,
        });
      } catch {
        return NextResponse.json({ error: 'Private document upload failed. Verify the connected private Blob store.' }, { status: 503 });
      }
    }

    try {
      const document = await prisma.$transaction(async (transaction) => {
        const created = await transaction.knowledgeDocument.create({
          data: {
            id: documentId,
            workspaceId: access.workspaceId,
            knowledgeKey,
            version: 1,
            title: parsed.data.title,
            scope,
            sourceType,
            source: parsed.data.source,
            status: 'DRAFT',
            evidenceStatus: parsed.data.evidenceStatus,
            createdById: access.userId,
            clientId: clientId ?? null,
            projectId: projectId ?? null,
            agentDefinitionId: agentDefinitionId ?? null,
            contentType,
            content,
            extractionStatus: file ? 'SUCCEEDED' : 'NOT_APPLICABLE',
          },
        });

        await transaction.knowledgeChunk.createMany({
          data: chunks.map((chunk, ordinal) => ({
            workspaceId: access.workspaceId,
            knowledgeDocumentId: created.id,
            ordinal,
            content: chunk,
            metadata: { scope, evidenceStatus: parsed.data.evidenceStatus },
          })),
        });

        if (uploadedBlob && fileName && contentType && fileSize !== null && checksum) {
          await transaction.knowledgeAttachment.create({
            data: {
              workspaceId: access.workspaceId,
              knowledgeDocumentId: created.id,
              storageKey: uploadedBlob.pathname,
              fileName,
              contentType,
              fileSize,
              checksum,
            },
          });
        }

        await transaction.auditEvent.create({
          data: {
            workspaceId: access.workspaceId,
            actorId: access.userId,
            action: 'knowledge.created',
            resource: 'KnowledgeDocument',
            resourceId: created.id,
            metadata: { knowledgeKey, version: 1, scope, sourceType },
          },
        });

        return created;
      });

      return NextResponse.json({ document }, { status: 201 });
    } catch (error) {
      if (uploadedBlob) await del(uploadedBlob.url).catch(() => undefined);
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        return NextResponse.json({ error: 'A knowledge record with this title and scope already exists. Open its detail page to create a new version.' }, { status: 409 });
      }
      return NextResponse.json({ error: 'Knowledge record could not be saved.' }, { status: 503 });
    }
  } catch {
    return NextResponse.json({ error: 'Knowledge ownership could not be validated.' }, { status: 503 });
  }
}