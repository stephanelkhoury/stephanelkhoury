import { get } from '@vercel/blob';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authorizeOperationsRequest, operationsAccessError } from '@/lib/operations/auth';

export const runtime = 'nodejs';

export async function GET(request: NextRequest, { params }: { params: Promise<{ attachmentId: string }> }) {
  const access = await authorizeOperationsRequest(request);
  if (!access.ok) return operationsAccessError(access);

  const { attachmentId } = await params;
  try {
    const attachment = await prisma.knowledgeAttachment.findUnique({
      where: { workspaceId_id: { workspaceId: access.workspaceId, id: attachmentId } },
      select: { storageKey: true, fileName: true, contentType: true },
    });
    if (!attachment) return new NextResponse('Not found', { status: 404 });

    const blob = await get(attachment.storageKey, { access: 'private', useCache: false });
    if (!blob || blob.statusCode !== 200) return new NextResponse('Not found', { status: 404 });

    return new NextResponse(blob.stream, {
      headers: {
        'Content-Type': attachment.contentType,
        'Content-Disposition': `attachment; filename="${attachment.fileName}"`,
        'X-Content-Type-Options': 'nosniff',
        'Cache-Control': 'private, no-store',
      },
    });
  } catch {
    return NextResponse.json({ error: 'Private attachment could not be retrieved.' }, { status: 503 });
  }
}