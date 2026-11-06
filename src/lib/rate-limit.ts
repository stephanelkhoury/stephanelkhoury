import { createHash } from 'node:crypto';
import { prisma } from '@/lib/prisma';
import { consumeMemoryRateLimit, type RateLimitResult } from './operations/rate-limit-memory';

type RateLimitRow = { allowed: boolean; count: number; expiresAt: Date };
let postgresCleanupCounter = 0;

export async function consumeRateLimit(key: string, limit: number, windowMs: number): Promise<RateLimitResult> {
  const keyHash = createHash('sha256').update(key).digest('hex');
  if (!process.env.DATABASE_URL) return consumeMemoryRateLimit(keyHash, limit, windowMs);

  try {
    const rows = await prisma.$queryRaw<RateLimitRow[]>`
      WITH changed AS (
        INSERT INTO "RateLimitBucket" ("keyHash", "count", "windowStartedAt", "expiresAt", "createdAt", "updatedAt")
        VALUES (${keyHash}, 1, NOW(), NOW() + (${windowMs} * INTERVAL '1 millisecond'), NOW(), NOW())
        ON CONFLICT ("keyHash") DO UPDATE SET
          "count" = CASE WHEN "RateLimitBucket"."expiresAt" <= NOW() THEN 1 ELSE "RateLimitBucket"."count" + 1 END,
          "windowStartedAt" = CASE WHEN "RateLimitBucket"."expiresAt" <= NOW() THEN NOW() ELSE "RateLimitBucket"."windowStartedAt" END,
          "expiresAt" = CASE WHEN "RateLimitBucket"."expiresAt" <= NOW() THEN NOW() + (${windowMs} * INTERVAL '1 millisecond') ELSE "RateLimitBucket"."expiresAt" END,
          "updatedAt" = NOW()
        WHERE "RateLimitBucket"."expiresAt" <= NOW() OR "RateLimitBucket"."count" < ${limit}
        RETURNING "count", "expiresAt"
      )
      SELECT TRUE AS allowed, "count", "expiresAt" FROM changed
      UNION ALL
      SELECT FALSE AS allowed, bucket."count", bucket."expiresAt"
      FROM "RateLimitBucket" AS bucket
      WHERE bucket."keyHash" = ${keyHash} AND NOT EXISTS (SELECT 1 FROM changed)
    `;

    postgresCleanupCounter += 1;
    if (postgresCleanupCounter % 100 === 0) {
      await prisma.$executeRaw`DELETE FROM "RateLimitBucket" WHERE "expiresAt" < NOW() - INTERVAL '1 day'`;
    }

    const result = rows[0];
    if (!result) return { allowed: false, retryAfterSeconds: Math.max(1, Math.ceil(windowMs / 1000)), storage: 'unavailable' };
    return {
      allowed: result.allowed,
      retryAfterSeconds: result.allowed ? 0 : Math.max(1, Math.ceil((result.expiresAt.getTime() - Date.now()) / 1000)),
      storage: 'postgres',
    };
  } catch {
    if (process.env.NODE_ENV !== 'production') return consumeMemoryRateLimit(keyHash, limit, windowMs);
    return { allowed: false, retryAfterSeconds: 60, storage: 'unavailable' };
  }
}