import { MembershipStatus, PrismaClient, WorkspaceRole } from '@prisma/client';
import { companyKnowledge, starterAgents, starterAgentKnowledge, starterCharacters } from './operations-seed-data.mjs';

const databaseUrl = process.env.DATABASE_URL;
const ownerEmail = process.env.MULTIGRAPHIC_OWNER_EMAIL?.trim().toLowerCase();

if (!databaseUrl) {
  throw new Error('DATABASE_URL is required to seed Multigraphic AI.');
}

if (!ownerEmail) {
  throw new Error('MULTIGRAPHIC_OWNER_EMAIL is required to seed the owner membership.');
}

const prisma = new PrismaClient();

const legacyKeys = {
  'project-manager': 'project-management',
  'business-analyst': 'strategy-research',
  'ux-ui-designer': 'brand-design',
  'full-stack-engineer': 'software-engineering',
  'qa-engineer': 'quality-seo',
  'seo-specialist': 'content-seo',
  'video-editor': 'media-production',
  'operations-assistant': 'business-operations',
};

function knowledgeChunks(content, chunkSize = 1200) {
  const chunks = [];
  for (let start = 0; start < content.length; start += chunkSize) {
    chunks.push(content.slice(start, start + chunkSize));
  }
  return chunks;
}

try {
  const workspace = await prisma.workspace.upsert({
    where: { slug: 'multigraphic-ai' },
    create: {
      slug: 'multigraphic-ai',
      name: process.env.MULTIGRAPHIC_WORKSPACE_NAME?.trim() || 'Multigraphic AI',
    },
    update: {},
  });

  const owner = await prisma.user.upsert({
    where: { email: ownerEmail },
    create: {
      email: ownerEmail,
      name: process.env.MULTIGRAPHIC_OWNER_NAME?.trim() || 'Stephan El Khoury',
    },
    update: {},
  });

  await prisma.membership.upsert({
    where: { workspaceId_userId: { workspaceId: workspace.id, userId: owner.id } },
    create: {
      workspaceId: workspace.id,
      userId: owner.id,
      role: WorkspaceRole.OWNER,
      status: MembershipStatus.ACTIVE,
    },
    update: { role: WorkspaceRole.OWNER, status: MembershipStatus.ACTIVE },
  });

  for (const agent of starterAgents) {
    let definition = await prisma.agentDefinition.findUnique({
      where: { workspaceId_key: { workspaceId: workspace.id, key: agent.key } },
    });

    if (!definition && legacyKeys[agent.key]) {
      const legacy = await prisma.agentDefinition.findUnique({
        where: { workspaceId_key: { workspaceId: workspace.id, key: legacyKeys[agent.key] } },
      });

      if (legacy) {
        definition = await prisma.agentDefinition.update({
          where: { workspaceId_id: { workspaceId: workspace.id, id: legacy.id } },
          data: {
            key: agent.key,
            name: agent.name,
            description: agent.description,
            capabilities: agent.capabilities,
            isStarter: true,
            enabled: false,
          },
        });
      }
    }

    definition ??= await prisma.agentDefinition.create({
      data: {
        workspaceId: workspace.id,
        key: agent.key,
        name: agent.name,
        description: agent.description,
        capabilities: agent.capabilities,
        isStarter: true,
        enabled: false,
      },
    });

    await prisma.agentVersion.upsert({
      where: {
        workspaceId_agentDefinitionId_version: {
          workspaceId: workspace.id,
          agentDefinitionId: definition.id,
          version: 1,
        },
      },
      create: {
        workspaceId: workspace.id,
        agentDefinitionId: definition.id,
        version: 1,
        status: agent.status,
        name: agent.name,
        description: agent.description,
        department: agent.department,
        purpose: agent.purpose,
        responsibilities: agent.responsibilities,
        exclusions: agent.exclusions,
        requiredInputs: agent.requiredInputs,
        outputSchema: agent.outputSchema,
        allowedTools: agent.allowedTools,
        knowledgeScopes: agent.knowledgeScopes,
        instructions: agent.instructions,
        modelProvider: agent.modelProvider,
        modelId: agent.modelId,
        budgetUsd: agent.budgetUsd,
        maxDurationSeconds: agent.maxDurationSeconds,
        maxToolCalls: agent.maxToolCalls,
        maxOutputTokens: agent.maxOutputTokens,
        maxInputCharacters: agent.maxInputCharacters,
        escalationConditions: agent.escalationConditions,
        approvalRequirements: agent.approvalRequirements,
        evaluationCriteria: agent.evaluationCriteria,
      },
      update: {},
    });
  }

  for (const character of starterCharacters) {
    const agentDefinition = character.agentKey
      ? await prisma.agentDefinition.findUniqueOrThrow({ where: { workspaceId_key: { workspaceId: workspace.id, key: character.agentKey } } })
      : null;
    const existingProfile = await prisma.characterProfile.findUnique({
      where: { workspaceId_key: { workspaceId: workspace.id, key: character.key } },
      select: { roomKey: true, deskKey: true },
    });
    const profileUpdate = { agentDefinitionId: agentDefinition?.id ?? null };
    if (character.key === 'receptionist' && existingProfile?.roomKey === 'reception' && existingProfile.deskKey === 'reception-desk') {
      profileUpdate.roomKey = character.roomKey;
      profileUpdate.deskKey = character.deskKey;
    }
    await prisma.characterProfile.upsert({
      where: { workspaceId_key: { workspaceId: workspace.id, key: character.key } },
      create: {
        workspaceId: workspace.id,
        agentDefinitionId: agentDefinition?.id ?? null,
        key: character.key,
        displayName: character.key === 'stephan' ? owner.name : character.displayName,
        jobTitle: character.jobTitle,
        department: character.department,
        roomKey: character.roomKey,
        deskKey: character.deskKey,
        communicationStyle: character.communicationStyle,
        appearance: character.appearance,
      },
      update: profileUpdate,
    });
  }

  for (const record of companyKnowledge) {
    const existing = await prisma.knowledgeDocument.findUnique({
      where: {
        workspaceId_knowledgeKey_version: {
          workspaceId: workspace.id,
          knowledgeKey: record.knowledgeKey,
          version: 1,
        },
      },
    });

    if (existing) continue;

    const document = await prisma.knowledgeDocument.create({
      data: {
        workspaceId: workspace.id,
        knowledgeKey: record.knowledgeKey,
        version: 1,
        title: record.title,
        scope: record.scope,
        sourceType: record.sourceType,
        source: record.source,
        status: record.status,
        evidenceStatus: record.evidenceStatus,
        createdById: owner.id,
        content: record.content,
        extractionStatus: 'NOT_APPLICABLE',
      },
    });

    await prisma.knowledgeChunk.createMany({
      data: knowledgeChunks(record.content).map((content, ordinal) => ({
        workspaceId: workspace.id,
        knowledgeDocumentId: document.id,
        ordinal,
        content,
        metadata: { sourceType: record.sourceType, evidenceStatus: record.evidenceStatus },
      })),
    });
  }

  for (const record of starterAgentKnowledge) {
    const existing = await prisma.knowledgeDocument.findUnique({
      where: {
        workspaceId_knowledgeKey_version: {
          workspaceId: workspace.id,
          knowledgeKey: record.knowledgeKey,
          version: 1,
        },
      },
    });
    if (existing) continue;

    const agent = await prisma.agentDefinition.findUniqueOrThrow({
      where: { workspaceId_key: { workspaceId: workspace.id, key: record.agentKey } },
      select: { id: true },
    });
    const document = await prisma.knowledgeDocument.create({
      data: {
        workspaceId: workspace.id,
        knowledgeKey: record.knowledgeKey,
        version: 1,
        title: record.title,
        scope: record.scope,
        sourceType: record.sourceType,
        source: record.source,
        status: record.status,
        evidenceStatus: record.evidenceStatus,
        createdById: owner.id,
        agentDefinitionId: agent.id,
        content: record.content,
        extractionStatus: 'NOT_APPLICABLE',
      },
    });

    await prisma.knowledgeChunk.createMany({
      data: knowledgeChunks(record.content).map((content, ordinal) => ({
        workspaceId: workspace.id,
        knowledgeDocumentId: document.id,
        ordinal,
        content,
        metadata: { scope: record.scope, agentKey: record.agentKey, evidenceStatus: record.evidenceStatus },
      })),
    });
  }

  console.log(`Operations workspace ready with ${starterAgents.length} agent definitions, ${starterCharacters.length} character profiles, ${companyKnowledge.length} company knowledge records, and ${starterAgentKnowledge.length} role handbooks.`);
} finally {
  await prisma.$disconnect();
}