import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authorizeOperationsRequest, operationsAccessError } from '@/lib/operations/auth';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const access = await authorizeOperationsRequest(request);
  if (!access.ok) return operationsAccessError(access);

  try {
    const [count, totals, records] = await Promise.all([
      prisma.usageRecord.count({ where: { workspaceId: access.workspaceId } }),
      prisma.usageRecord.aggregate({ where: { workspaceId: access.workspaceId }, _sum: { inputTokens: true, outputTokens: true, costUsd: true, estimatedCostUsd: true } }),
      prisma.usageRecord.findMany({
        where: { workspaceId: access.workspaceId },
        orderBy: { createdAt: 'desc' },
        take: 200,
        select: {
          id: true,
          provider: true,
          model: true,
          inputTokens: true,
          outputTokens: true,
          costUsd: true,
          estimatedCostUsd: true,
          durationMs: true,
          activeCpuDurationMs: true,
          dependencySetupDurationMs: true,
          buildDurationMs: true,
          browserDurationMs: true,
          costBasis: true,
          createdAt: true,
          workflowRun: { select: { id: true, project: { select: { id: true, name: true } } } },
          agentRun: { select: { id: true, agent: { select: { name: true } }, task: { select: { title: true } } } },
        },
      }),
    ]);

    return NextResponse.json({
      count,
      truncated: count > records.length,
      totals: {
        inputTokens: totals._sum.inputTokens ?? 0,
        outputTokens: totals._sum.outputTokens ?? 0,
        reportedCostUsd: totals._sum.costUsd?.toString() ?? null,
        estimatedCostUsd: totals._sum.estimatedCostUsd?.toString() ?? null,
      },
      records,
    });
  } catch {
    return NextResponse.json({ error: 'Usage records could not be loaded.' }, { status: 503 });
  }
}