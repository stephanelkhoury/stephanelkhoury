import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authorizeOperationsRequest, operationsAccessError } from '@/lib/operations/auth';
import { redactOperationalError } from '@/lib/operations/error-redaction';
import { resolveCharacterStatus } from '@/lib/operations/headquarters-model';
import { executionReadiness } from '@/lib/operations/workflow-dispatch';
import { defaultModelForProvider, ollamaLoadedModels, resolveModelProvider } from '@/lib/operations/model-provider';
import { skillLevel } from '@/lib/operations/agent-growth';

export const runtime = 'nodejs';

const ACTIVE_TASK_STATES = ['DRAFT', 'QUEUED', 'RUNNING', 'AWAITING_INPUT', 'AWAITING_APPROVAL', 'READY', 'IN_PROGRESS', 'IN_REVIEW', 'BLOCKED'] as const;

export async function GET(request: NextRequest) {
  const access = await authorizeOperationsRequest(request);
  if (!access.ok) return operationsAccessError(access);

  try {
    const profiles = await prisma.characterProfile.findMany({
      where: { workspaceId: access.workspaceId },
      orderBy: [{ key: 'asc' }],
      include: {
        agentDefinition: {
          select: {
            id: true,
            key: true,
            enabled: true,
            capabilities: true,
            versions: {
              orderBy: { version: 'desc' },
              take: 1,
              select: { version: true, status: true, department: true, allowedTools: true, modelProvider: true, modelId: true },
            },
            skills: { orderBy: { xp: 'desc' }, take: 4, select: { name: true, xp: true } },
            tasks: {
              orderBy: { updatedAt: 'desc' },
              take: 8,
              select: { id: true, title: true, status: true, error: true, updatedAt: true, workflowRunId: true, workflowRun: { select: { status: true } }, project: { select: { id: true, name: true } } },
            },
            agentRuns: {
              orderBy: { createdAt: 'desc' },
              take: 4,
              select: {
                id: true,
                status: true,
                createdAt: true,
                toolCalls: { orderBy: { startedAt: 'desc' }, take: 4, select: { id: true, name: true, status: true, startedAt: true, finishedAt: true } },
                usageRecords: { select: { provider: true, model: true, inputTokens: true, outputTokens: true, costUsd: true, estimatedCostUsd: true, costBasis: true } },
              },
            },
          },
        },
      },
    });

    const agentIds = profiles.flatMap((profile) => profile.agentDefinition ? [profile.agentDefinition.id] : []);
    const artifactVersions = agentIds.length ? await prisma.artifactVersion.findMany({
      where: { workspaceId: access.workspaceId, agentDefinitionId: { in: agentIds } },
      orderBy: { createdAt: 'desc' },
      take: 24,
      select: {
        id: true,
        version: true,
        createdAt: true,
        agentDefinitionId: true,
        approvals: { orderBy: { createdAt: 'desc' }, take: 1, select: { status: true } },
        artifact: { select: { title: true, status: true, project: { select: { name: true } } } },
      },
    }) : [];

    const artifactsByAgent = new Map<string, typeof artifactVersions>();
    for (const artifact of artifactVersions) {
      if (!artifact.agentDefinitionId) continue;
      artifactsByAgent.set(artifact.agentDefinitionId, [...(artifactsByAgent.get(artifact.agentDefinitionId) ?? []), artifact]);
    }

    const [activeMeetings, loadedModels] = await Promise.all([
      prisma.meeting.findMany({ where: { workspaceId: access.workspaceId, status: { in: ['GATHERING', 'IN_SESSION'] } }, select: { id: true, roomKey: true, topic: true, participantKeys: true, facilitatorKey: true, status: true } }),
      ollamaLoadedModels(),
    ]);
    const meetingByAgent = new Map(activeMeetings.flatMap(meeting => meeting.participantKeys.map(key => [key, meeting] as const)));
    const modelAwake = (provider: string | null | undefined, modelId: string | null | undefined) => {
      try {
        const resolved = resolveModelProvider(provider);
        if (resolved !== 'ollama') return null;
        if (!loadedModels) return null;
        const model = modelId?.trim() || defaultModelForProvider(resolved);
        return loadedModels.has(model) || loadedModels.has(`${model}:latest`);
      } catch { return null; }
    };

    return NextResponse.json({
      execution: executionReadiness(),
      meetings: activeMeetings.map(({ participantKeys, ...meeting }) => ({ ...meeting, participantKeys })),
      profiles: profiles.map((profile) => {
        const definition = profile.agentDefinition;
        const latestTask = definition?.tasks[0] ?? null;
        const currentTask = definition?.tasks.find((task) => ACTIVE_TASK_STATES.includes(task.status as (typeof ACTIVE_TASK_STATES)[number])) ?? null;
        const latestVersion = definition?.versions[0] ?? null;
        const toolActivity = definition?.agentRuns.flatMap((run) => run.toolCalls.map((tool) => ({
          id: tool.id,
          name: tool.name,
          status: tool.status,
          startedAt: tool.startedAt,
          finishedAt: tool.finishedAt,
        }))).slice(0, 8) ?? [];
        const usageRecords = definition?.agentRuns.flatMap((run) => run.usageRecords) ?? [];

        return {
          id: profile.id,
          key: profile.key,
          displayName: profile.displayName,
          jobTitle: profile.jobTitle,
          department: profile.department,
          roomKey: profile.roomKey,
          deskKey: profile.deskKey,
          communicationStyle: profile.communicationStyle,
          appearance: profile.appearance,
          isOwner: profile.key === 'stephan',
          status: profile.key === 'stephan' ? 'OWNER' : resolveCharacterStatus({
            latestTaskStatus: latestTask?.status,
            latestRunStatus: latestTask?.workflowRun?.status,
            enabled: definition?.enabled ?? false,
            approvedVersion: latestVersion?.status === 'APPROVED',
            executionConnected: executionReadiness(latestVersion?.modelProvider).connected,
            inMeeting: Boolean(definition && meetingByAgent.has(definition.key)),
            modelAwake: modelAwake(latestVersion?.modelProvider, latestVersion?.modelId),
          }),
          meeting: definition && meetingByAgent.has(definition.key) ? { id: meetingByAgent.get(definition.key)!.id, roomKey: meetingByAgent.get(definition.key)!.roomKey, topic: meetingByAgent.get(definition.key)!.topic } : null,
          skills: definition?.skills.map(skill => { const level = skillLevel(skill.xp); return { name: skill.name, level: level.level, levelName: level.name, xp: skill.xp, nextLevelXp: level.nextLevelXp }; }) ?? [],
          agent: definition ? {
            id: definition.id,
            key: definition.key,
            enabled: definition.enabled,
            capabilities: definition.capabilities,
            version: latestVersion?.version ?? null,
            versionStatus: latestVersion?.status ?? null,
            allowedTools: latestVersion?.allowedTools ?? [],
          } : null,
          currentTask: currentTask ? {
            id: currentTask.id,
            title: currentTask.title,
            status: currentTask.status,
            workflowRunId: currentTask.workflowRunId,
            project: currentTask.project,
            blocker: currentTask.error ? redactOperationalError(currentTask.error) : null,
          } : null,
          taskHistory: definition?.tasks.map((task) => ({
            id: task.id,
            title: task.title,
            status: task.status,
            updatedAt: task.updatedAt,
            project: task.project,
          })) ?? [],
          toolActivity,
          deliverables: (definition ? artifactsByAgent.get(definition.id) ?? [] : []).map((artifact) => ({
            id: artifact.id,
            title: artifact.artifact.title,
            status: artifact.artifact.status,
            project: artifact.artifact.project.name,
            version: artifact.version,
            reviewStatus: artifact.approvals[0]?.status ?? null,
            createdAt: artifact.createdAt,
          })),
          usage: {
            records: usageRecords.length,
            inputTokens: usageRecords.reduce((sum, record) => sum + record.inputTokens, 0),
            outputTokens: usageRecords.reduce((sum, record) => sum + record.outputTokens, 0),
            reportedCostUsd: usageRecords.reduce((sum, record) => sum + Number(record.costUsd ?? 0), 0).toFixed(6),
            estimatedCostUsd: usageRecords.reduce((sum, record) => sum + Number(record.estimatedCostUsd ?? 0), 0).toFixed(6),
          },
        };
      }),
    });
  } catch {
    return NextResponse.json({ error: 'Headquarters profiles and persisted work could not be loaded.' }, { status: 503 });
  }
}