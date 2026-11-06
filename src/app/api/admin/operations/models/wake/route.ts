import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { authorizeOperationsRequest, operationsAccessError } from '@/lib/operations/auth';
import { readBoundedJsonBody } from '@/lib/bounded-json-body';
import { consumeRateLimit } from '@/lib/rate-limit';
import { defaultModelForProvider, ModelProviderError, resolveModelProvider, wakeOllamaModel } from '@/lib/operations/model-provider';

export const runtime = 'nodejs';

const schema = z.object({ agentId: z.string().min(5).max(64) }).strict();

export async function POST(request: NextRequest) {
  const access = await authorizeOperationsRequest(request);
  if (!access.ok) return operationsAccessError(access);
  const body = await readBoundedJsonBody(request.body, 1024);
  const parsed = body.ok ? schema.safeParse(body.value) : null;
  if (!parsed?.success) return NextResponse.json({ error: 'Choose an agent to wake.' }, { status: 400 });
  try {
    const limit = await consumeRateLimit(`model-wake:${access.workspaceId}:${access.userId}`, 30, 15 * 60 * 1000);
    if (!limit.allowed) return NextResponse.json({ error: 'Wake requests are temporarily rate limited.' }, { status: 429 });
    const version = await prisma.agentVersion.findFirst({ where: { workspaceId: access.workspaceId, agentDefinitionId: parsed.data.agentId, status: 'APPROVED' }, orderBy: { version: 'desc' }, select: { modelProvider: true, modelId: true } });
    if (!version) return NextResponse.json({ error: 'This agent has no approved version.' }, { status: 409 });
    const provider = resolveModelProvider(version.modelProvider);
    if (provider !== 'ollama') return NextResponse.json({ error: 'Only local Ollama models sleep; hosted models are always available.' }, { status: 422 });
    const model = version.modelId?.trim() || defaultModelForProvider(provider);
    await wakeOllamaModel(model);
    return NextResponse.json({ model });
  } catch (error) {
    return NextResponse.json({ error: error instanceof ModelProviderError ? error.message : 'The model could not be woken.' }, { status: 503 });
  }
}
