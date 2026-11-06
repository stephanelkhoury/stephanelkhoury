import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { authorizeOperationsRequest, operationsAccessError } from '@/lib/operations/auth';
import { readBoundedJsonBody } from '@/lib/bounded-json-body';
import { createDepartmentDraft } from '@/lib/operations/department-draft';
import { consumeRateLimit } from '@/lib/rate-limit';
export const runtime = 'nodejs';
const schema = z.object({ agentKey: z.string().min(2).max(80), budgetCapUsd: z.number().min(0.01).max(100) }).strict();
export async function POST(request: NextRequest, { params }: { params: Promise<{ projectId: string }> }) {
  const access = await authorizeOperationsRequest(request);
  if (!access.ok) return operationsAccessError(access);
  const idempotencyKey = request.headers.get('Idempotency-Key')?.trim();
  if (!idempotencyKey || !/^[a-zA-Z0-9._:-]{8,128}$/.test(idempotencyKey)) return NextResponse.json({ error: 'A valid Idempotency-Key is required.' }, { status: 400 });
  const body = await readBoundedJsonBody(request.body, 4096);
  const parsed = body.ok ? schema.safeParse(body.value) : null;
  if (!parsed?.success) return NextResponse.json({ error: 'Choose an agent and a valid budget.' }, { status: 400 });
  const { projectId } = await params;
  try {
    const duplicate = await prisma.workflowRun.findUnique({ where: { workspaceId_idempotencyKey: { workspaceId: access.workspaceId, idempotencyKey } } });
    if (duplicate) return NextResponse.json({ run: duplicate, duplicate: true });
    const limit = await consumeRateLimit(`department-plan:${access.workspaceId}:${access.userId}`, 20, 60 * 60 * 1000);
    if (!limit.allowed) return NextResponse.json({ error: 'Department planning is temporarily rate limited.' }, { status: limit.storage === 'unavailable' ? 503 : 429 });
    const result = await createDepartmentDraft({ workspaceId: access.workspaceId, actorId: access.userId, projectId, agentKey: parsed.data.agentKey, budgetCapUsd: parsed.data.budgetCapUsd, idempotencyKey });
    if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });
    return result.duplicate ? NextResponse.json({ run: result.run, duplicate: true }) : NextResponse.json({ run: result.run }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Department task plan could not be created.' }, { status: 503 });
  }
}
