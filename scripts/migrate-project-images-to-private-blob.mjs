import { readFileSync } from 'node:fs';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { PrismaClient } from '@prisma/client';
import { put } from '@vercel/blob';

function parseEnvFile(envPath) {
  const content = readFileSync(envPath, 'utf8');
  const parsed = {};

  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const eq = trimmed.indexOf('=');
    if (eq < 0) continue;

    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    parsed[key] = value;
  }

  return parsed;
}

function inferContentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.png') return 'image/png';
  if (ext === '.jpg' || ext === '.jpeg') return 'image/jpeg';
  if (ext === '.webp') return 'image/webp';
  if (ext === '.gif') return 'image/gif';
  if (ext === '.svg') return 'image/svg+xml';
  return 'application/octet-stream';
}

function toApiBlobRoute(pathnameValue) {
  return `/api/blob/${pathnameValue.split('/').filter(Boolean).map(encodeURIComponent).join('/')}`;
}

async function main() {
  const envPath = process.argv[2] || '.env.blob.migration.prod.tmp';
  const absoluteEnvPath = path.resolve(process.cwd(), envPath);
  const env = parseEnvFile(absoluteEnvPath);

  for (const [key, value] of Object.entries(env)) {
    if (!process.env[key]) process.env[key] = value;
  }

  if (!process.env.DATABASE_URL && process.env.POSTGRES_PRISMA_URL) {
    process.env.DATABASE_URL = process.env.POSTGRES_PRISMA_URL;
  }

  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is missing and POSTGRES_PRISMA_URL fallback is not available.');
  }
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error('BLOB_READ_WRITE_TOKEN is missing.');
  }

  const prisma = new PrismaClient();
  let migrated = 0;
  let skippedMissing = 0;
  let failed = 0;

  try {
    const projects = await prisma.project.findMany({
      where: {
        imageUrl: {
          startsWith: '/uploads/',
        },
      },
      orderBy: { sortOrder: 'asc' },
      select: {
        id: true,
        slug: true,
        imageUrl: true,
      },
    });

    if (projects.length === 0) {
      console.log('No project rows need migration.');
    }

    for (const project of projects) {
      const original = project.imageUrl || '';
      const localPath = path.join(process.cwd(), 'public', original.replace(/^\/+/, ''));
      const baseName = path.basename(localPath);
      const targetPath = `migrations/projects/${project.slug}-${baseName}`;

      try {
        const bytes = await fs.readFile(localPath);
        const contentType = inferContentType(localPath);

        const uploaded = await put(targetPath, bytes, {
          access: 'private',
          addRandomSuffix: true,
          contentType,
        });

        await prisma.blobAsset.upsert({
          where: { pathname: uploaded.pathname },
          update: {
            url: uploaded.url,
            contentType,
            size: bytes.byteLength,
            source: 'project-image-migration',
          },
          create: {
            url: uploaded.url,
            pathname: uploaded.pathname,
            contentType,
            size: bytes.byteLength,
            source: 'project-image-migration',
          },
        });

        const apiPath = toApiBlobRoute(uploaded.pathname);
        await prisma.project.update({
          where: { id: project.id },
          data: { imageUrl: apiPath },
        });

        migrated += 1;
        console.log(`MIGRATED ${project.slug} -> ${apiPath}`);
      } catch (error) {
        if ((error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT')) {
          skippedMissing += 1;
          console.log(`SKIPPED_MISSING ${project.slug} -> ${original}`);
          continue;
        }

        failed += 1;
        const message = error instanceof Error ? error.message : String(error);
        console.log(`FAILED ${project.slug} -> ${message}`);
      }
    }

    console.log(`SUMMARY migrated=${migrated} skippedMissing=${skippedMissing} failed=${failed}`);

    const allProjects = await prisma.project.findMany({
      select: {
        slug: true,
        imageUrl: true,
      },
      orderBy: { sortOrder: 'asc' },
    });

    for (const item of allProjects) {
      console.log(`VERIFY ${item.slug} | ${item.imageUrl || ''}`);
    }
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`FATAL ${message}`);
  process.exit(1);
});