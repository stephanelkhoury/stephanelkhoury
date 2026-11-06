import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authorizeOperationsRequest, operationsAccessError } from '@/lib/operations/auth';
import { skillLevel } from '@/lib/operations/agent-growth';

export const runtime = 'nodejs';

type Bucket = { runs: number; succeeded: number; failed: number; canceled: number; meetingTurns: number; durationMs: number; timedRuns: number; inputTokens: number; outputTokens: number; costUsd: number; approved: number; changesRequested: number; rejected: number; pendingReview: number };
const emptyBucket = (): Bucket => ({ runs: 0, succeeded: 0, failed: 0, canceled: 0, meetingTurns: 0, durationMs: 0, timedRuns: 0, inputTokens: 0, outputTokens: 0, costUsd: 0, approved: 0, changesRequested: 0, rejected: 0, pendingReview: 0 });

function summarize(bucket: Bucket) {
  const decided = bucket.approved + bucket.changesRequested + bucket.rejected;
  const finished = bucket.succeeded + bucket.failed;
  return {
    ...bucket,
    costUsd: Number(bucket.costUsd.toFixed(6)),
    successRate: finished ? Math.round(bucket.succeeded / finished * 100) : null,
    approvalRate: decided ? Math.round(bucket.approved / decided * 100) : null,
    averageDurationSeconds: bucket.timedRuns ? Math.round(bucket.durationMs / bucket.timedRuns / 100) / 10 : null,
  };
}

export async function GET(request: NextRequest) {
  const access = await authorizeOperationsRequest(request);
  if (!access.ok) return operationsAccessError(access);
  const days = Math.min(365, Math.max(1, Number(request.nextUrl.searchParams.get('days')) || 30));
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  try {
    const [agents, runs, approvals, meetings, records] = await Promise.all([
      prisma.agentDefinition.findMany({
        where: { workspaceId: access.workspaceId },
        select: { id: true, key: true, name: true, enabled: true, characterProfile: { select: { displayName: true } }, versions: { orderBy: { version: 'desc' }, take: 1, select: { department: true, status: true } }, skills: { orderBy: { xp: 'desc' }, select: { name: true, xp: true, successCount: true, approvedCount: true, revisionCount: true, lastPracticedAt: true } } },
        orderBy: { name: 'asc' },
      }),
      prisma.agentRun.findMany({
        where: { workspaceId: access.workspaceId, createdAt: { gte: since } },
        select: { agentDefinitionId: true, status: true, startedAt: true, finishedAt: true, createdAt: true, taskId: true, usageRecords: { select: { inputTokens: true, outputTokens: true, costUsd: true, estimatedCostUsd: true } } },
        take: 10000,
      }),
      prisma.approval.findMany({ where: { workspaceId: access.workspaceId, createdAt: { gte: since } }, select: { status: true, artifactVersion: { select: { agentDefinitionId: true } } }, take: 10000 }),
      prisma.meeting.groupBy({ by: ['status'], where: { workspaceId: access.workspaceId, createdAt: { gte: since } }, _count: { _all: true } }),
      prisma.workRecord.count({ where: { workspaceId: access.workspaceId, createdAt: { gte: since } } }),
    ]);

    const byAgent = new Map<string, Bucket>(agents.map(agent => [agent.id, emptyBucket()]));
    const daily = new Map<string, { date: string; succeeded: number; failed: number; tokens: number }>();
    for (let offset = Math.min(days, 30) - 1; offset >= 0; offset -= 1) {
      const date = new Date(Date.now() - offset * 86_400_000).toISOString().slice(0, 10);
      daily.set(date, { date, succeeded: 0, failed: 0, tokens: 0 });
    }

    for (const run of runs) {
      const bucket = byAgent.get(run.agentDefinitionId);
      if (!bucket) continue;
      bucket.runs += 1;
      if (run.status === 'SUCCEEDED') bucket.succeeded += 1;
      if (run.status === 'FAILED') bucket.failed += 1;
      if (run.status === 'CANCELED') bucket.canceled += 1;
      if (!run.taskId) bucket.meetingTurns += 1;
      if (run.startedAt && run.finishedAt) { bucket.durationMs += run.finishedAt.getTime() - run.startedAt.getTime(); bucket.timedRuns += 1; }
      const tokens = run.usageRecords.reduce((sum, usage) => sum + usage.inputTokens + usage.outputTokens, 0);
      for (const usage of run.usageRecords) {
        bucket.inputTokens += usage.inputTokens;
        bucket.outputTokens += usage.outputTokens;
        bucket.costUsd += Number(usage.costUsd ?? usage.estimatedCostUsd ?? 0);
      }
      const day = daily.get(run.createdAt.toISOString().slice(0, 10));
      if (day) { if (run.status === 'SUCCEEDED') day.succeeded += 1; if (run.status === 'FAILED') day.failed += 1; day.tokens += tokens; }
    }
    for (const approval of approvals) {
      const bucket = approval.artifactVersion.agentDefinitionId ? byAgent.get(approval.artifactVersion.agentDefinitionId) : undefined;
      if (!bucket) continue;
      if (approval.status === 'APPROVED') bucket.approved += 1;
      else if (approval.status === 'CHANGES_REQUESTED') bucket.changesRequested += 1;
      else if (approval.status === 'REJECTED') bucket.rejected += 1;
      else bucket.pendingReview += 1;
    }

    const agentRows = agents.map(agent => {
      const skills = agent.skills.map(skill => { const level = skillLevel(skill.xp); return { ...skill, level: level.level, levelName: level.name, nextLevelXp: level.nextLevelXp }; });
      return {
        id: agent.id, key: agent.key, name: agent.name, displayName: agent.characterProfile?.displayName ?? agent.name, enabled: agent.enabled,
        department: agent.versions[0]?.department ?? null, versionStatus: agent.versions[0]?.status ?? null,
        metrics: summarize(byAgent.get(agent.id)!),
        skills,
        averageSkillLevel: skills.length ? Math.round(skills.reduce((sum, skill) => sum + skill.level, 0) / skills.length * 10) / 10 : null,
      };
    });

    const byDepartment = new Map<string, Bucket>();
    for (const agent of agents) {
      const department = agent.versions[0]?.department ?? 'UNASSIGNED';
      const target = byDepartment.get(department) ?? emptyBucket();
      const source = byAgent.get(agent.id)!;
      for (const key of Object.keys(target) as Array<keyof Bucket>) target[key] += source[key];
      byDepartment.set(department, target);
    }
    const total = emptyBucket();
    for (const bucket of byAgent.values()) for (const key of Object.keys(total) as Array<keyof Bucket>) total[key] += bucket[key];

    return NextResponse.json({
      days,
      totals: { ...summarize(total), workRecords: records, meetings: Object.fromEntries(meetings.map(item => [item.status, item._count._all])) },
      departments: Array.from(byDepartment, ([department, bucket]) => ({ department, metrics: summarize(bucket) })).sort((a, b) => b.metrics.runs - a.metrics.runs),
      agents: agentRows,
      daily: Array.from(daily.values()),
    });
  } catch {
    return NextResponse.json({ error: 'Analytics could not be loaded.' }, { status: 503 });
  }
}
