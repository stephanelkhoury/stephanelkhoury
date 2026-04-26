import { NextRequest, NextResponse } from 'next/server';
import { del, put } from '@vercel/blob';
import { isAdminRequest } from '@/lib/admin-auth';
import { getBlobDeliveryUrl } from '@/lib/blob';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

const MAX_FILE_SIZE = 8 * 1024 * 1024;
const ALLOWED_MIME = new Set(['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/svg+xml']);
const DEFAULT_FOLDER = 'cms';

function sanitizeFileName(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || 'file';
}

function normalizeFolder(raw: string | null) {
  const value = (raw || DEFAULT_FOLDER).trim().replace(/^\/+|\/+$/g, '');
  return value || DEFAULT_FOLDER;
}

export async function POST(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get('file');

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: 'Missing file' }, { status: 400 });
  }

  if (!ALLOWED_MIME.has(file.type)) {
    return NextResponse.json({ error: 'Unsupported image type' }, { status: 400 });
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: 'Image exceeds 8MB limit' }, { status: 400 });
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { error: 'BLOB_READ_WRITE_TOKEN is not configured. Add it in Vercel and .env.local.' },
      { status: 500 }
    );
  }

  const folder = normalizeFolder(formData.get('folder')?.toString() ?? null);
  const now = new Date();
  const year = String(now.getFullYear());
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const fileName = sanitizeFileName(file.name || 'image');
  const pathname = `uploads/${folder}/${year}/${month}/${fileName}`;

  const blob = await put(pathname, file, {
    access: 'private',
    addRandomSuffix: true,
    contentType: file.type,
  });

  const asset = await prisma.blobAsset.create({
    data: {
      url: blob.url,
      pathname: blob.pathname,
      contentType: file.type,
      size: file.size,
      source: 'admin-upload',
    },
  });

  return NextResponse.json({
    id: asset.id,
    url: getBlobDeliveryUrl(asset.pathname),
    blobUrl: asset.url,
    pathname: asset.pathname,
    contentType: asset.contentType,
    size: asset.size,
    createdAt: asset.createdAt,
  });
}

export async function GET(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const url = new URL(request.url);
  const folder = normalizeFolder(url.searchParams.get('folder'));
  const limit = Math.min(Math.max(Number(url.searchParams.get('limit') || 100), 1), 200);
  const prefix = `uploads/${folder}/`;

  const assets = await prisma.blobAsset.findMany({
    where: {
      pathname: {
        startsWith: prefix,
      },
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });

  return NextResponse.json({
    assets: assets.map((asset) => ({
      ...asset,
      url: getBlobDeliveryUrl(asset.pathname),
      blobUrl: asset.url,
    })),
  });
}

export async function DELETE(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { error: 'BLOB_READ_WRITE_TOKEN is not configured. Add it in Vercel and .env.local.' },
      { status: 500 }
    );
  }

  const body = await request.json().catch(() => null);
  const id = body?.id as string | undefined;
  const url = body?.url as string | undefined;
  const pathname = body?.pathname as string | undefined;

  if (!id && !url && !pathname) {
    return NextResponse.json(
      { error: 'Provide one of id, url, or pathname to delete a file.' },
      { status: 400 }
    );
  }

  const asset = id
    ? await prisma.blobAsset.findUnique({ where: { id } })
    : url
    ? await prisma.blobAsset.findUnique({ where: { url } })
    : await prisma.blobAsset.findUnique({ where: { pathname: pathname! } });

  if (!asset) {
    return NextResponse.json({ error: 'Asset not found in Neon metadata.' }, { status: 404 });
  }

  await del(asset.url);
  await prisma.blobAsset.delete({ where: { id: asset.id } });

  return NextResponse.json({ success: true, id: asset.id, url: asset.url });
}
