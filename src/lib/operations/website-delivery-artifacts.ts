import { put } from '@vercel/blob';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import type { WebsiteDeliveryPlan } from '@/lib/operations/workflow-plan';
import type { WebsiteSandboxResult } from '@/lib/operations/website-sandbox';

export class WebsiteStorageUnavailableError extends Error {
  constructor(message = 'Private Vercel Blob storage is not configured. Set BLOB_READ_WRITE_TOKEN before creating website deliverables.') {
    super(message);
    this.name = 'WebsiteStorageUnavailableError';
  }
}

function jsonValue(value: unknown): Prisma.InputJsonValue {
  return value as Prisma.InputJsonValue;
}

export async function persistWebsiteDeliveryArtifacts(input: {
  workspaceId: string;
  projectId: string;
  workflowRunId: string;
  taskId: string;
  agentDefinitionId: string;
  agentVersionId: string;
  inputReferences: { briefSha256: string; acceptedPlanHash: string; knowledgeDocumentIds: string[] };
  reviewerId: string;
  projectName: string;
  plan: WebsiteDeliveryPlan;
  sandboxResult: WebsiteSandboxResult;
  generatedFiles: string[];
  revisionNumber: number;
  generatedClaimsToVerify: Array<{ taskKey: string; claim: string }>;
}) {
  const { workspaceId, projectId, workflowRunId, taskId, agentDefinitionId, agentVersionId, inputReferences, reviewerId, projectName, plan, sandboxResult, revisionNumber } = input;
  const expectedKinds = new Set(['WEBSITE_SOURCE_ARCHIVE', 'WEBSITE_VERIFICATION_REPORT', 'WEBSITE_SCREENSHOT']);
  const existingVersions = await prisma.artifactVersion.findMany({
    where: { workspaceId, workflowRunId, revisionNumber },
    select: { id: true, version: true, textContent: true, artifact: { select: { id: true, kind: true } }, approvals: { select: { id: true } } },
  });
  if (existingVersions.length === 4 && existingVersions.every(({ artifact }) => expectedKinds.has(artifact.kind))) {
    const reportText = existingVersions.find(({ artifact }) => artifact.kind === 'WEBSITE_VERIFICATION_REPORT')?.textContent;
    return {
      artifacts: existingVersions.map((version) => ({ artifactId: version.artifact.id, artifactVersionId: version.id, version: version.version, approvalId: version.approvals[0]?.id ?? '', kind: version.artifact.kind })),
      report: reportText ? JSON.parse(reportText) as Record<string, unknown> : {},
    };
  }
  if (!process.env.BLOB_READ_WRITE_TOKEN) throw new WebsiteStorageUnavailableError();
  const prefix = `multigraphic-ai/${workspaceId}/projects/${projectId}/website-delivery/${workflowRunId}`;
  const blobOptions = { access: 'private' as const, addRandomSuffix: true, cacheControlMaxAge: 0 };
  const [archive, desktop, mobile] = await Promise.all([
    put(`${prefix}/source.tar.gz`, sandboxResult.archive, { ...blobOptions, contentType: 'application/gzip' }),
    put(`${prefix}/preview-desktop.png`, sandboxResult.desktopScreenshot, { ...blobOptions, contentType: 'image/png' }),
    put(`${prefix}/preview-mobile.png`, sandboxResult.mobileScreenshot, { ...blobOptions, contentType: 'image/png' }),
  ]);

  const report = {
    project: projectName,
    workflowRunId,
    verifiedAt: new Date().toISOString(),
    scope: 'static marketing website; no e-commerce, payment processing, authentication, deployment, or public publishing',
    build: { command: 'npm run build', executed: true, result: 'passed', durationMs: sandboxResult.metrics.buildDurationMs },
    browser: { ...sandboxResult.browserReport, durationMs: sandboxResult.metrics.browserDurationMs },
    measuredUsage: sandboxResult.metrics,
    dependencies: { production: [], browserVerification: ['playwright-core@1.65.0', '@sparticuz/chromium@153.0.0', 'axe-core@4.14.0'], installedIn: 'temporary isolated sandbox tools directory', changedProjectManifest: false },
    generatedFiles: input.generatedFiles,
    revisionNumber: input.revisionNumber,
    assets: plan.website.brandAssets,
    claimsToVerify: plan.website.pages.flatMap((page) => page.sections.flatMap((section) => section.claimsToVerify.map((claim) => ({ page: page.path, section: section.key, claim })))),
    generatedClaimsToVerify: input.generatedClaimsToVerify,
    structuredDataRecommendations: plan.website.structuredDataRecommendations,
    review: { automatedChecks: 'executed', humanDesignReview: 'not performed; owner review required', publishing: 'not authorized or performed' },
  };
  const reportText = JSON.stringify(report, null, 2);

  const artifacts = [
    { title: 'Website source archive', kind: 'WEBSITE_SOURCE_ARCHIVE', storageKey: archive.pathname, contentType: 'application/gzip', textContent: null, metadata: { workflowRunId, archiveFormat: 'tar.gz', fileCount: input.generatedFiles.length, generatedFiles: input.generatedFiles, dependenciesChanged: false, revisionNumber: input.revisionNumber } },
    { title: 'Website verification report', kind: 'WEBSITE_VERIFICATION_REPORT', storageKey: null, contentType: 'application/json; charset=utf-8', textContent: reportText, metadata: { workflowRunId, report, automatedChecks: 'executed', humanDesignReview: 'not performed' } },
    { title: 'Website desktop screenshot', kind: 'WEBSITE_SCREENSHOT', storageKey: desktop.pathname, contentType: 'image/png', textContent: null, metadata: { workflowRunId, viewport: { width: 1280, height: 900 }, evidenceType: 'automated rendering' } },
    { title: 'Website mobile screenshot', kind: 'WEBSITE_SCREENSHOT', storageKey: mobile.pathname, contentType: 'image/png', textContent: null, metadata: { workflowRunId, viewport: { width: 390, height: 900 }, evidenceType: 'automated rendering' } },
  ];

  return prisma.$transaction(async (transaction) => {
    const saved = [];
    for (const item of artifacts) {
      const artifact = await transaction.artifact.findFirst({
        where: { workspaceId, projectId, kind: item.kind, title: item.title },
        orderBy: { updatedAt: 'desc' },
        select: { id: true },
      });
      const target = artifact
        ? await transaction.artifact.update({ where: { workspaceId_id: { workspaceId, id: artifact.id } }, data: { status: 'IN_REVIEW' }, select: { id: true } })
        : await transaction.artifact.create({ data: { workspaceId, projectId, title: item.title, kind: item.kind, status: 'IN_REVIEW' }, select: { id: true } });
      const previousVersion = await transaction.artifactVersion.findFirst({
        where: { workspaceId, artifactId: target.id },
        orderBy: { version: 'desc' },
        select: { version: true },
      });
      const version = await transaction.artifactVersion.create({
        data: {
          workspaceId,
          artifactId: target.id,
          projectId,
          workflowRunId,
          taskId,
          agentDefinitionId,
          agentVersionId,
          inputReferences: jsonValue(inputReferences),
          revisionNumber,
          version: (previousVersion?.version ?? 0) + 1,
          storageKey: item.storageKey,
          contentType: item.contentType,
          textContent: item.textContent,
          metadata: jsonValue(item.metadata),
        },
        select: { id: true, version: true },
      });
      const approval = await transaction.approval.create({
        data: { workspaceId, artifactId: target.id, artifactVersionId: version.id, reviewerId },
        select: { id: true },
      });
      saved.push({ artifactId: target.id, artifactVersionId: version.id, version: version.version, approvalId: approval.id, kind: item.kind });
    }

    await transaction.workflowEvent.create({
      data: {
        workspaceId,
        workflowRunId,
        type: 'website.delivery_ready',
        message: 'Build and automated browser checks passed. Source archive, screenshots, and verification report are awaiting owner review; no human design review or publishing is claimed.',
        metadata: jsonValue({ artifacts: saved, measuredUsage: sandboxResult.metrics }),
      },
    });
    await transaction.auditEvent.create({
      data: {
        workspaceId,
        actorId: reviewerId,
        action: 'website.delivery.created',
        resource: 'WorkflowRun',
        resourceId: workflowRunId,
        metadata: jsonValue({ projectId, artifacts: saved, sandboxMetrics: sandboxResult.metrics }),
      },
    });
    return { artifacts: saved, report };
  });
}