import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authorizeOperationsRequest, operationsAccessError } from '@/lib/operations/auth';
import { readBoundedJsonBody } from '@/lib/bounded-json-body';
import { consumeRateLimit } from '@/lib/rate-limit';
import { ModelProviderError, testModelProvider, type ModelProviderId } from '@/lib/operations/model-provider';
import { websiteSandboxBlocker } from '@/lib/operations/website-sandbox-policy';
import { localWorkerEnabled } from '@/lib/operations/local-worker';
import { z } from 'zod';

export const runtime = 'nodejs';

function safeCapabilities(settings: unknown) {
  if (typeof settings !== 'object' || settings === null || Array.isArray(settings)) return [];
  const record = settings as Record<string, unknown>;
  const value = record.capabilities ?? record.scopes;
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string').slice(0, 40) : [];
}

const integrationTestSchema = z.object({ provider: z.enum(['gemini', 'anthropic', 'openai', 'ollama']) }).strict();

export async function GET(request: NextRequest) {
  const access = await authorizeOperationsRequest(request);
  if (!access.ok) return operationsAccessError(access);

  try {
    const records = await prisma.integration.findMany({
      where: { workspaceId: access.workspaceId },
      orderBy: { provider: 'asc' },
      select: { id: true, provider: true, status: true, connectedAt: true, updatedAt: true, settings: true },
    });
    const environment = [
      { key: 'ollama', name: 'Local Ollama models (no API cost)', configured: Boolean(process.env.OLLAMA_BASE_URL), capabilities: ['Structured plan generation', 'Structured task output', 'Runs on this machine'], setup: 'Install Ollama, run `ollama pull` for your model, then set OLLAMA_BASE_URL=http://127.0.0.1:11434, OLLAMA_MODEL, and MULTIGRAPHIC_DEFAULT_MODEL_PROVIDER=ollama.' },
      { key: 'local-worker', name: 'Local workflow worker', configured: localWorkerEnabled(), capabilities: ['Accepted-plan execution inside the local Next.js server', 'Cancellation'], setup: 'Set MULTIGRAPHIC_LOCAL_WORKER=1 for local development. Runs stop if the dev server stops; ignored on Vercel.' },
      { key: 'anthropic', name: 'Claude model provider', configured: Boolean(process.env.ANTHROPIC_API_KEY), capabilities: ['Structured plan generation', 'Structured task output'], setup: 'Set ANTHROPIC_API_KEY and ANTHROPIC_MODEL in the server and Trigger.dev environments, then run a connection test.' },
      { key: 'openai', name: 'OpenAI Codex-capable model provider', configured: Boolean(process.env.OPENAI_API_KEY), capabilities: ['Structured plan generation', 'Structured task output'], setup: 'Set OPENAI_API_KEY and OPENAI_CODEX_MODEL in the server and Trigger.dev environments, then run a connection test.' },
      { key: 'gemini', name: 'Gemini model provider', configured: Boolean(process.env.GEMINI_API_KEY), capabilities: ['Structured plan generation', 'Structured task output'], setup: 'Set GEMINI_API_KEY and GEMINI_MODEL in the server and Trigger.dev environments. A configured key does not guarantee current provider availability.' },
      { key: 'trigger', name: 'Durable workflow worker', configured: Boolean(process.env.TRIGGER_PROJECT_REF && process.env.TRIGGER_SECRET_KEY), capabilities: ['Accepted-plan dispatch', 'Retry and cancellation'], setup: 'Set TRIGGER_PROJECT_REF and TRIGGER_SECRET_KEY, deploy the task, and configure DATABASE_URL, MULTIGRAPHIC_DEFAULT_MODEL_PROVIDER, and the selected provider key/model in its environment.' },
      { key: 'private-blob', name: 'Private file storage', configured: Boolean(process.env.BLOB_READ_WRITE_TOKEN), capabilities: ['Private knowledge attachments', 'Private website archives and screenshots'], setup: 'Connect a private Vercel Blob store and set BLOB_READ_WRITE_TOKEN. Public storage is not used as a fallback.' },
      { key: 'sandbox', name: 'Isolated code execution', configured: !websiteSandboxBlocker(), capabilities: ['Website build and browser verification in an isolated microVM'], setup: 'Use VERCEL_OIDC_TOKEN in linked local/deployed Vercel environments or provide VERCEL_TOKEN, VERCEL_TEAM_ID, and VERCEL_PROJECT_ID for external execution.' },
    ];

    return NextResponse.json({
      required: environment,
      connected: records.map(({ settings, ...integration }) => ({ ...integration, grantedCapabilities: safeCapabilities(settings) })),
    });
  } catch {
    return NextResponse.json({ error: 'Integration status could not be loaded.' }, { status: 503 });
  }
}

export async function POST(request: NextRequest) {
  const access = await authorizeOperationsRequest(request);
  if (!access.ok) return operationsAccessError(access);

  const body = await readBoundedJsonBody(request.body, 2048);
  const parsed = body.ok ? integrationTestSchema.safeParse(body.value) : null;
  if (!parsed?.success) return NextResponse.json({ error: 'Choose a supported provider to test.' }, { status: 400 });
  const provider: ModelProviderId = parsed.data.provider;
  try {
    await prisma.integration.findUnique({
      where: { workspaceId_provider: { workspaceId: access.workspaceId, provider } },
      select: { id: true },
    });
  } catch {
    return NextResponse.json({ error: 'Operations database is not ready. Configure it and apply the operations migrations before testing a provider.' }, { status: 503 });
  }
  const rateLimit = await consumeRateLimit(`integration-test:${access.workspaceId}:${access.userId}:${provider}`, 5, 15 * 60 * 1000);
  if (rateLimit.storage === 'unavailable') return NextResponse.json({ error: 'Connection-test rate-limit storage is unavailable.' }, { status: 503 });
  if (!rateLimit.allowed) return NextResponse.json({ error: 'Provider tests are limited to five per provider every 15 minutes.' }, { status: 429, headers: { 'Retry-After': String(rateLimit.retryAfterSeconds) } });

  let result;
  try {
    result = await testModelProvider(provider);
  } catch (error) {
    const message = error instanceof ModelProviderError ? error.message : 'Provider connection test failed.';
    try {
      await prisma.integration.upsert({
        where: { workspaceId_provider: { workspaceId: access.workspaceId, provider } },
        create: { workspaceId: access.workspaceId, provider, status: 'ERROR', settings: { capabilities: ['Structured model generation'], lastTestError: message } },
        update: { status: 'ERROR', connectedAt: null, settings: { capabilities: ['Structured model generation'], lastTestError: message } },
      });
    } catch {
      return NextResponse.json({ error: 'Provider test failed, and its status could not be saved.' }, { status: 503 });
    }
    return NextResponse.json({ error: message }, { status: error instanceof ModelProviderError && error.status && error.status >= 400 && error.status < 500 ? error.status : 502 });
  }

  try {
    await prisma.integration.upsert({
      where: { workspaceId_provider: { workspaceId: access.workspaceId, provider } },
      create: { workspaceId: access.workspaceId, provider, status: 'CONNECTED', connectedAt: new Date(), settings: { capabilities: ['Structured model generation'], model: result.model, testedAt: new Date().toISOString() } },
      update: { status: 'CONNECTED', connectedAt: new Date(), settings: { capabilities: ['Structured model generation'], model: result.model, testedAt: new Date().toISOString() } },
    });
  } catch {
    return NextResponse.json({ error: 'The provider responded, but connection status could not be saved.' }, { status: 503 });
  }

  return NextResponse.json({ provider: result.provider, model: result.model, inputTokens: result.inputTokens, outputTokens: result.outputTokens, tested: true });
}