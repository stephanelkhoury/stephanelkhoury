import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { test } from 'node:test';

const testDatabaseUrl = process.env.OPERATIONS_TEST_DATABASE_URL;
const testBaseUrl = process.env.OPERATIONS_TEST_BASE_URL;
if (testDatabaseUrl) {
  const parsedUrl = new URL(testDatabaseUrl);
  const databaseName = parsedUrl.pathname.replace(/^\//, '').split('?')[0];
  if (!['localhost', '127.0.0.1', '::1'].includes(parsedUrl.hostname) || !databaseName.startsWith('multigraphic_ai_validation_')) {
    throw new Error('OPERATIONS_TEST_DATABASE_URL must target a local multigraphic_ai_validation_* database.');
  }
  process.env.DATABASE_URL = testDatabaseUrl;
  process.env.MULTIGRAPHIC_OWNER_EMAIL = 'validation-owner@example.test';
  process.env.ADMIN_DASHBOARD_TOKEN = 'local-operations-test-token';
}
if (testBaseUrl) {
  const parsedBaseUrl = new URL(testBaseUrl);
  if (!['localhost', '127.0.0.1', '::1'].includes(parsedBaseUrl.hostname)) {
    throw new Error('OPERATIONS_TEST_BASE_URL must point to a local Next.js server.');
  }
}

test('operations persistence, authorization, scope isolation, and agent versioning', { skip: !testDatabaseUrl }, async () => {
  const [{ PrismaClient }, { starterAgents }] = await Promise.all([
    import('@prisma/client'),
    import('../../prisma/operations-seed-data.mjs'),
  ]);

  const prisma = new PrismaClient();
  const suffix = randomUUID();
  let clientAId;
  let clientBId;
  const documentIds = [];
  const draftVersionIds = [];
  let workspaceId;
  let agentId;

  try {
    const workspace = await prisma.workspace.findUniqueOrThrow({ where: { slug: 'multigraphic-ai' } });
    workspaceId = workspace.id;
    const owner = await prisma.user.findUniqueOrThrow({ where: { email: 'validation-owner@example.test' } });
    await assert.rejects(prisma.knowledgeDocument.create({
      data: {
        workspaceId,
        knowledgeKey: `invalid-client-scope-${suffix}`,
        version: 1,
        title: `Invalid client scope ${suffix}`,
        scope: 'CLIENT',
        sourceType: 'MANUAL_ENTRY',
        source: 'Local constraint test',
        status: 'DRAFT',
        evidenceStatus: 'UNVERIFIED',
        createdById: owner.id,
      },
    }));

    const approvedVersion = await prisma.agentVersion.findFirstOrThrow({
      where: { workspaceId, status: 'APPROVED' },
    });
    const approvedVersionData = { ...approvedVersion, version: approvedVersion.version + 100 };
    delete approvedVersionData.id;
    await assert.rejects(prisma.agentVersion.create({
      data: approvedVersionData,
    }));

    const [clientA, clientB] = await Promise.all([
      prisma.client.create({ data: { workspaceId, name: `Scope A ${suffix}` } }),
      prisma.client.create({ data: { workspaceId, name: `Scope B ${suffix}` } }),
    ]);
    clientAId = clientA.id;
    clientBId = clientB.id;
    const needle = `isolated-search-${suffix}`;

    for (const [clientId, title] of [[clientA.id, 'Scope A note'], [clientB.id, 'Scope B note']]) {
      const document = await prisma.knowledgeDocument.create({
        data: {
          workspaceId,
          knowledgeKey: `integration-test-${suffix}-${title.toLowerCase().replaceAll(' ', '-')}`,
          version: 1,
          title: `${title} ${suffix}`,
          scope: 'CLIENT',
          sourceType: 'MANUAL_ENTRY',
          source: 'Local integration test fixture',
          status: 'APPROVED',
          evidenceStatus: 'OWNER_CONFIRMED',
          createdById: owner.id,
          clientId,
          content: needle,
        },
      });
      documentIds.push(document.id);
      await prisma.knowledgeChunk.create({
        data: { workspaceId, knowledgeDocumentId: document.id, ordinal: 0, content: needle },
      });
    }

    const scopedMatches = await prisma.knowledgeChunk.findMany({
      where: {
        workspaceId,
        content: { contains: needle },
        document: { workspaceId, scope: 'CLIENT', status: 'APPROVED', clientId: clientA.id },
      },
      select: { document: { select: { id: true, clientId: true } } },
    });
    assert.equal(scopedMatches.length, 1);
    assert.equal(scopedMatches[0].document.clientId, clientA.id);

    if (testBaseUrl) {
      const path = `/api/admin/operations/knowledge?scope=CLIENT&clientId=${clientA.id}&q=${encodeURIComponent(needle)}`;
      const response = await fetch(new URL(path, testBaseUrl), { headers: { authorization: `Bearer ${process.env.OPERATIONS_TEST_ADMIN_TOKEN ?? 'local-operations-test-token'}` } });
      const result = await response.json();
      assert.equal(response.status, 200);
      assert.equal(result.documents.length, 1);
      assert.equal(result.documents[0].clientId, clientA.id);

      const unauthenticated = await fetch(new URL(path, testBaseUrl));
      assert.equal(unauthenticated.status, 401);
    }

    const agent = await prisma.agentDefinition.findUniqueOrThrow({ where: { workspaceId_key: { workspaceId, key: 'project-manager' } } });
    agentId = agent.id;
    const before = await prisma.agentVersion.findUniqueOrThrow({
      where: { workspaceId_agentDefinitionId_version: { workspaceId, agentDefinitionId: agentId, version: 1 } },
    });
    const latestVersion = await prisma.agentVersion.findFirstOrThrow({
      where: { workspaceId, agentDefinitionId: agentId },
      orderBy: { version: 'desc' },
    });
    const contract = Object.fromEntries(Object.entries(starterAgents[0]).filter(([field]) => !['key', 'status', 'capabilities'].includes(field)));
    const draftVersion = await prisma.agentVersion.create({
      data: {
        workspaceId,
        agentDefinitionId: agentId,
        version: latestVersion.version + 1,
        status: 'DRAFT',
        ...contract,
      },
    });
    assert.equal(draftVersion.version, latestVersion.version + 1);
    draftVersionIds.push(draftVersion.id);

    const after = await prisma.agentVersion.findUniqueOrThrow({
      where: { workspaceId_agentDefinitionId_version: { workspaceId, agentDefinitionId: agentId, version: 1 } },
    });
    assert.equal(after.status, before.status);
    assert.equal(after.instructions, before.instructions);
  } finally {
    if (draftVersionIds.length && workspaceId && agentId) {
      await prisma.agentVersion.deleteMany({ where: { workspaceId, agentDefinitionId: agentId, id: { in: draftVersionIds } } });
    }
    if (documentIds.length) await prisma.knowledgeDocument.deleteMany({ where: { id: { in: documentIds } } });
    if (clientAId || clientBId) await prisma.client.deleteMany({ where: { id: { in: [clientAId, clientBId].filter(Boolean) } } });
    await prisma.$disconnect();
  }
});
