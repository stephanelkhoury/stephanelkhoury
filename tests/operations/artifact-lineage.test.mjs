import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { test } from 'node:test';

const testDatabaseUrl = process.env.OPERATIONS_TEST_DATABASE_URL;
if (testDatabaseUrl) {
  const parsedUrl = new URL(testDatabaseUrl);
  const databaseName = parsedUrl.pathname.replace(/^\//, '').split('?')[0];
  if (!['localhost', '127.0.0.1', '::1'].includes(parsedUrl.hostname) || !databaseName.startsWith('multigraphic_ai_validation_')) {
    throw new Error('OPERATIONS_TEST_DATABASE_URL must target a local multigraphic_ai_validation_* database.');
  }
  process.env.DATABASE_URL = testDatabaseUrl;
}

test('artifact versions pin same-project task, exact run, approved agent version, and input references', { skip: !testDatabaseUrl }, async () => {
  const { PrismaClient } = await import('@prisma/client');
  const prisma = new PrismaClient();
  const suffix = randomUUID();
  let definitionId;
  let projectId;
  let otherProjectId;
  let runId;
  let otherRunId;
  let artifactId;

  try {
    const workspace = await prisma.workspace.findUniqueOrThrow({ where: { slug: 'multigraphic-ai' } });
    const [manager, analyst] = await Promise.all([
      prisma.agentDefinition.findUniqueOrThrow({ where: { workspaceId_key: { workspaceId: workspace.id, key: 'project-manager' } } }),
      prisma.agentDefinition.findUniqueOrThrow({ where: { workspaceId_key: { workspaceId: workspace.id, key: 'business-analyst' } } }),
    ]);
    const managerVersion = await prisma.agentVersion.findFirstOrThrow({ where: { workspaceId: workspace.id, agentDefinitionId: manager.id, status: 'APPROVED' } });
    const definition = await prisma.workflowDefinition.create({ data: { workspaceId: workspace.id, key: `lineage-${suffix}`, name: 'Artifact lineage test', definition: { version: 1 } } });
    definitionId = definition.id;
    const project = await prisma.operationsProject.create({ data: { workspaceId: workspace.id, name: `Lineage ${suffix}`, slug: `lineage-${suffix}` } });
    projectId = project.id;
    const otherProject = await prisma.operationsProject.create({ data: { workspaceId: workspace.id, name: `Other lineage ${suffix}`, slug: `other-lineage-${suffix}` } });
    otherProjectId = otherProject.id;
    const run = await prisma.workflowRun.create({ data: { workspaceId: workspace.id, workflowDefinitionId: definition.id, projectId: project.id, status: 'SUCCEEDED' } });
    runId = run.id;
    const otherRun = await prisma.workflowRun.create({ data: { workspaceId: workspace.id, workflowDefinitionId: definition.id, projectId: otherProject.id, status: 'SUCCEEDED' } });
    otherRunId = otherRun.id;
    const task = await prisma.operationsTask.create({ data: { workspaceId: workspace.id, projectId: project.id, workflowRunId: run.id, agentDefinitionId: manager.id, planKey: 'build', title: 'Build website', status: 'SUCCEEDED' } });
    const otherTask = await prisma.operationsTask.create({ data: { workspaceId: workspace.id, projectId: otherProject.id, workflowRunId: otherRun.id, agentDefinitionId: manager.id, planKey: 'build', title: 'Other build', status: 'SUCCEEDED' } });
    const artifact = await prisma.artifact.create({ data: { workspaceId: workspace.id, projectId: project.id, title: 'Website source', kind: 'WEBSITE_SOURCE_ARCHIVE' } });
    artifactId = artifact.id;
    const version = await prisma.artifactVersion.create({
      data: {
        workspaceId: workspace.id,
        artifactId: artifact.id,
        projectId: project.id,
        workflowRunId: run.id,
        taskId: task.id,
        agentDefinitionId: manager.id,
        agentVersionId: managerVersion.id,
        revisionNumber: 0,
        version: 1,
        inputReferences: { briefSha256: 'a'.repeat(64), acceptedPlanHash: 'b'.repeat(64), knowledgeDocumentIds: [] },
      },
    });
    assert.equal(version.projectId, project.id);
    assert.equal(version.taskId, task.id);
    assert.equal(version.agentVersionId, managerVersion.id);
    assert.equal(version.inputReferences.acceptedPlanHash, 'b'.repeat(64));

    await assert.rejects(prisma.artifactVersion.create({
      data: {
        workspaceId: workspace.id,
        artifactId: artifact.id,
        projectId: project.id,
        workflowRunId: run.id,
        taskId: otherTask.id,
        agentDefinitionId: manager.id,
        agentVersionId: managerVersion.id,
        revisionNumber: 1,
        version: 2,
      },
    }));
    await assert.rejects(prisma.artifactVersion.create({
      data: {
        workspaceId: workspace.id,
        artifactId: artifact.id,
        projectId: project.id,
        workflowRunId: run.id,
        taskId: task.id,
        agentDefinitionId: analyst.id,
        agentVersionId: managerVersion.id,
        revisionNumber: 2,
        version: 3,
      },
    }));
  } finally {
    if (artifactId) await prisma.artifact.deleteMany({ where: { id: artifactId } });
    if (runId || otherRunId) await prisma.workflowRun.deleteMany({ where: { id: { in: [runId, otherRunId].filter(Boolean) } } });
    if (definitionId) await prisma.workflowDefinition.deleteMany({ where: { id: definitionId } });
    if (projectId || otherProjectId) await prisma.operationsProject.deleteMany({ where: { id: { in: [projectId, otherProjectId].filter(Boolean) } } });
    await prisma.$disconnect();
  }
});
