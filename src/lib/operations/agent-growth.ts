import { prisma } from '@/lib/prisma';
import { SKILL_XP, skillKey } from '@/lib/operations/skill-model';

export { SKILL_LEVELS, SKILL_XP, renderMarkdown, skillLevel, taskRecordMarkdown } from '@/lib/operations/skill-model';

// Skills come from the agent's approved responsibilities, so they track the real contract.
export async function ensureAgentSkills(workspaceId: string, agentDefinitionId: string) {
  const version = await prisma.agentVersion.findFirst({
    where: { workspaceId, agentDefinitionId, status: 'APPROVED' },
    orderBy: { version: 'desc' },
    select: { responsibilities: true },
  });
  const names = (version?.responsibilities ?? []).slice(0, 12);
  if (!names.length) return;
  await prisma.agentSkill.createMany({
    data: names.map(name => ({ workspaceId, agentDefinitionId, key: skillKey(name), name: name.slice(0, 200) })),
    skipDuplicates: true,
  });
}

export async function awardSkillXp(workspaceId: string, agentDefinitionId: string, event: 'TASK_SUCCEEDED' | 'MEETING_CONTRIBUTION' | 'OUTPUT_APPROVED' | 'REVISION_REQUESTED') {
  await ensureAgentSkills(workspaceId, agentDefinitionId);
  const now = new Date();
  const data = event === 'REVISION_REQUESTED'
    ? { revisionCount: { increment: 1 }, lastPracticedAt: now }
    : event === 'OUTPUT_APPROVED'
      ? { xp: { increment: SKILL_XP.OUTPUT_APPROVED }, approvedCount: { increment: 1 }, lastPracticedAt: now }
      : { xp: { increment: SKILL_XP[event] }, successCount: { increment: 1 }, lastPracticedAt: now };
  await prisma.agentSkill.updateMany({ where: { workspaceId, agentDefinitionId }, data });
}

export async function writeWorkRecord(input: { workspaceId: string; sourceKey: string; kind: 'TASK' | 'MEETING' | 'REVIEW'; projectId?: string | null; agentDefinitionId?: string | null; title: string; markdown: string }) {
  await prisma.workRecord.upsert({
    where: { workspaceId_sourceKey: { workspaceId: input.workspaceId, sourceKey: input.sourceKey } },
    create: { ...input, title: input.title.slice(0, 300) },
    update: {},
  });
}

export async function recordReviewOutcome(input: { workspaceId: string; approvalId: string; ownerUserId: string; decision: 'APPROVED' | 'REJECTED' | 'CHANGES_REQUESTED'; comment: string | null; artifactVersionId: string }) {
  const version = await prisma.artifactVersion.findFirst({
    where: { workspaceId: input.workspaceId, id: input.artifactVersionId },
    select: { projectId: true, agentDefinitionId: true, artifact: { select: { title: true } } },
  });
  if (!version?.agentDefinitionId) return;
  const agent = await prisma.agentDefinition.findUnique({ where: { workspaceId_id: { workspaceId: input.workspaceId, id: version.agentDefinitionId } }, select: { id: true, key: true, name: true } });
  if (!agent) return;

  await awardSkillXp(input.workspaceId, agent.id, input.decision === 'APPROVED' ? 'OUTPUT_APPROVED' : 'REVISION_REQUESTED');
  await writeWorkRecord({
    workspaceId: input.workspaceId,
    sourceKey: `review:${input.approvalId}`,
    kind: 'REVIEW',
    projectId: version.projectId,
    agentDefinitionId: agent.id,
    title: `Review · ${version.artifact.title}: ${input.decision.replaceAll('_', ' ').toLowerCase()}`,
    markdown: `# Owner review\n\n**Deliverable:** ${version.artifact.title}  \n**Agent:** ${agent.name}  \n**Decision:** ${input.decision.replaceAll('_', ' ')}  \n**Date:** ${new Date().toISOString()}\n\n## Comment\n\n${input.comment?.trim() || '_No comment._'}`,
  });

  // Owner feedback becomes approved, agent-scoped lessons that future runs retrieve.
  if (input.decision !== 'APPROVED' && input.comment?.trim()) {
    await prisma.knowledgeDocument.upsert({
      where: { workspaceId_knowledgeKey_version: { workspaceId: input.workspaceId, knowledgeKey: `lesson-${agent.key}-${input.approvalId}`, version: 1 } },
      create: {
        workspaceId: input.workspaceId,
        knowledgeKey: `lesson-${agent.key}-${input.approvalId}`,
        version: 1,
        title: `Lesson for ${agent.name}: ${version.artifact.title}`.slice(0, 180),
        scope: 'LESSONS_LEARNED',
        source: 'Owner review feedback',
        status: 'APPROVED',
        evidenceStatus: 'OWNER_CONFIRMED',
        createdById: input.ownerUserId,
        projectId: version.projectId,
        agentDefinitionId: agent.id,
        content: `The owner requested changes (${input.decision.replaceAll('_', ' ').toLowerCase()}) on "${version.artifact.title}". Apply this feedback to future work:\n\n${input.comment.trim()}`,
      },
      update: {},
    });
  }
}
