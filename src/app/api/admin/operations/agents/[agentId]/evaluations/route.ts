import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authorizeOperationsRequest, operationsAccessError } from '@/lib/operations/auth';
import { agentVersionContractSchema } from '@/lib/operations/agent-validation';
import { evaluateAgentContract } from '@/lib/operations/agent-evaluation';
import { operationsToolRegistry } from '@/lib/operations/tool-registry';
import { readBoundedJsonBody } from '@/lib/bounded-json-body';
import { z } from 'zod';
export const runtime = 'nodejs';
type Context = { params: Promise<{ agentId: string }> };
export async function GET(request: NextRequest, { params }: Context) {
  const access = await authorizeOperationsRequest(request);
  if (!access.ok) return operationsAccessError(access);
  const { agentId } = await params;
  try {
    const evaluations = await prisma.agentEvaluation.findMany({ where: { workspaceId: access.workspaceId, agentDefinitionId: agentId }, orderBy: { createdAt: 'desc' }, take: 30, include: { agentVersion: { select: { version: true } } } });
    return NextResponse.json({ evaluations });
  } catch { return NextResponse.json({ error: 'Contract checks could not be loaded.' }, { status: 503 }); }
}
export async function POST(request: NextRequest, { params }: Context) {
  const access = await authorizeOperationsRequest(request);
  if (!access.ok) return operationsAccessError(access);
  const { agentId } = await params;
  const body = await readBoundedJsonBody(request.body, 4096);
  const parsed = body.ok ? z.object({ versionId: z.string().min(1).max(100) }).strict().safeParse(body.value) : null;
  if (!parsed?.success) return NextResponse.json({ error: 'Choose an exact agent version.' }, { status: 400 });
  try {
    const version = await prisma.agentVersion.findFirst({ where: { workspaceId: access.workspaceId, agentDefinitionId: agentId, id: parsed.data.versionId } });
    if (!version) return NextResponse.json({ error: 'Agent version not found.' }, { status: 404 });
    const contract = Object.fromEntries(Object.keys(agentVersionContractSchema.shape).map(key => [key, key === 'budgetUsd' ? Number(version.budgetUsd ?? 0) : version[key as keyof typeof version]]));
    const result = evaluateAgentContract(contract, Object.keys(operationsToolRegistry));
    const evaluation = await prisma.$transaction(async tx => {
      const saved = await tx.agentEvaluation.create({ data: { workspaceId: access.workspaceId, agentDefinitionId: agentId, agentVersionId: version.id, passed: result.passed, checks: result.checks, createdById: access.userId } });
      await tx.auditEvent.create({ data: { workspaceId: access.workspaceId, actorId: access.userId, action: 'agent.contract_checked', resource: 'AgentVersion', resourceId: version.id, metadata: { evaluationId: saved.id, passed: saved.passed, version: version.version } } });
      return saved;
    });
    return NextResponse.json({ evaluation }, { status: 201 });
  } catch { return NextResponse.json({ error: 'Contract check could not be saved.' }, { status: 503 }); }
}
