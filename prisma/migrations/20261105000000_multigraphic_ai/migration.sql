-- CreateEnum
CREATE TYPE "WorkspaceRole" AS ENUM ('OWNER', 'ADMIN', 'MEMBER');

-- CreateEnum
CREATE TYPE "MembershipStatus" AS ENUM ('ACTIVE', 'INVITED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "OperationsProjectStatus" AS ENUM ('DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "OperationsTaskStatus" AS ENUM ('TODO', 'READY', 'IN_PROGRESS', 'IN_REVIEW', 'BLOCKED', 'DONE', 'CANCELED');

-- CreateEnum
CREATE TYPE "OperationsTaskPriority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "AgentRunStatus" AS ENUM ('QUEUED', 'RUNNING', 'SUCCEEDED', 'FAILED', 'CANCELED');

-- CreateEnum
CREATE TYPE "WorkflowRunStatus" AS ENUM ('QUEUED', 'RUNNING', 'WAITING', 'SUCCEEDED', 'FAILED', 'CANCELED');

-- CreateEnum
CREATE TYPE "ApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'CHANGES_REQUESTED', 'REJECTED');

-- CreateEnum
CREATE TYPE "IntegrationStatus" AS ENUM ('DISCONNECTED', 'CONNECTED', 'ERROR');

-- CreateEnum
CREATE TYPE "ArtifactStatus" AS ENUM ('DRAFT', 'IN_REVIEW', 'APPROVED', 'SUPERSEDED');

-- CreateEnum
CREATE TYPE "ToolCallStatus" AS ENUM ('SUCCEEDED', 'FAILED');

-- CreateEnum
CREATE TYPE "AgentDepartment" AS ENUM ('PROJECT_MANAGEMENT', 'STRATEGY_RESEARCH', 'BRAND_DESIGN', 'SOFTWARE_ENGINEERING', 'QUALITY_ASSURANCE', 'SEO_CONTENT', 'MEDIA_PRODUCTION', 'BUSINESS_OPERATIONS');

-- CreateEnum
CREATE TYPE "AgentVersionStatus" AS ENUM ('DRAFT', 'APPROVED', 'SUPERSEDED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "KnowledgeScope" AS ENUM ('COMPANY', 'OWNER_PREFERENCES', 'CLIENT', 'PROJECT', 'AGENT_INSTRUCTIONS', 'LESSONS_LEARNED');

-- CreateEnum
CREATE TYPE "KnowledgeStatus" AS ENUM ('DRAFT', 'APPROVED', 'SUPERSEDED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "KnowledgeEvidenceStatus" AS ENUM ('OWNER_CONFIRMED', 'SOURCE_SUPPORTED', 'ASSUMPTION', 'UNVERIFIED');

-- CreateEnum
CREATE TYPE "KnowledgeSourceType" AS ENUM ('OWNER_PROVIDED', 'MANUAL_ENTRY', 'UPLOADED_FILE');

-- CreateEnum
CREATE TYPE "KnowledgeExtractionStatus" AS ENUM ('SUCCEEDED', 'FAILED', 'NOT_APPLICABLE');

-- CreateTable
CREATE TABLE "Workspace" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Workspace_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Membership" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "WorkspaceRole" NOT NULL DEFAULT 'MEMBER',
    "status" "MembershipStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Membership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Client" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OperationsProject" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "clientId" TEXT,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "summary" TEXT NOT NULL DEFAULT '',
    "status" "OperationsProjectStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OperationsProject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectBrief" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "content" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectBrief_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentDefinition" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "capabilities" TEXT[],
    "isStarter" BOOLEAN NOT NULL DEFAULT false,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgentDefinition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentVersion" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "agentDefinitionId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "status" "AgentVersionStatus" NOT NULL DEFAULT 'DRAFT',
    "name" TEXT NOT NULL DEFAULT '',
    "description" TEXT NOT NULL DEFAULT '',
    "department" "AgentDepartment" NOT NULL DEFAULT 'PROJECT_MANAGEMENT',
    "purpose" TEXT NOT NULL DEFAULT '',
    "responsibilities" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "exclusions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "requiredInputs" JSONB NOT NULL DEFAULT '[]',
    "outputSchema" JSONB NOT NULL DEFAULT '{}',
    "allowedTools" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "knowledgeScopes" "KnowledgeScope"[] DEFAULT ARRAY[]::"KnowledgeScope"[],
    "instructions" TEXT NOT NULL DEFAULT '',
    "modelProvider" TEXT,
    "modelId" TEXT,
    "budgetUsd" DECIMAL(12,6),
    "maxDurationSeconds" INTEGER NOT NULL DEFAULT 600,
    "maxToolCalls" INTEGER NOT NULL DEFAULT 0,
    "maxOutputTokens" INTEGER NOT NULL DEFAULT 3000,
    "maxInputCharacters" INTEGER NOT NULL DEFAULT 20000,
    "escalationConditions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "approvalRequirements" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "evaluationCriteria" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AgentVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkflowDefinition" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "definition" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkflowDefinition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkflowRun" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "workflowDefinitionId" TEXT NOT NULL,
    "projectId" TEXT,
    "status" "WorkflowRunStatus" NOT NULL DEFAULT 'QUEUED',
    "externalRunId" TEXT,
    "input" JSONB,
    "output" JSONB,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkflowRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OperationsTask" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "agentDefinitionId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "status" "OperationsTaskStatus" NOT NULL DEFAULT 'TODO',
    "priority" "OperationsTaskPriority" NOT NULL DEFAULT 'NORMAL',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OperationsTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaskDependency" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "dependsOnTaskId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TaskDependency_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentRun" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "projectId" TEXT,
    "taskId" TEXT,
    "workflowRunId" TEXT,
    "agentDefinitionId" TEXT NOT NULL,
    "agentVersionId" TEXT,
    "status" "AgentRunStatus" NOT NULL DEFAULT 'QUEUED',
    "input" JSONB,
    "output" JSONB,
    "error" TEXT,
    "startedAt" TIMESTAMP(3),
    "finishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AgentRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ToolCall" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "agentRunId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" "ToolCallStatus" NOT NULL,
    "input" JSONB,
    "output" JSONB,
    "error" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),

    CONSTRAINT "ToolCall_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KnowledgeDocument" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "knowledgeKey" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "title" TEXT NOT NULL,
    "scope" "KnowledgeScope" NOT NULL,
    "sourceType" "KnowledgeSourceType" NOT NULL DEFAULT 'MANUAL_ENTRY',
    "source" TEXT NOT NULL,
    "status" "KnowledgeStatus" NOT NULL DEFAULT 'DRAFT',
    "evidenceStatus" "KnowledgeEvidenceStatus" NOT NULL DEFAULT 'UNVERIFIED',
    "createdById" TEXT NOT NULL,
    "clientId" TEXT,
    "projectId" TEXT,
    "agentDefinitionId" TEXT,
    "sourceUrl" TEXT,
    "contentType" TEXT,
    "content" TEXT NOT NULL DEFAULT '',
    "extractionStatus" "KnowledgeExtractionStatus" NOT NULL DEFAULT 'NOT_APPLICABLE',
    "extractionError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KnowledgeDocument_pkey" PRIMARY KEY ("id")
);

-- Enforce exact scope ownership in the database, not just in request validation.
ALTER TABLE "KnowledgeDocument" ADD CONSTRAINT "KnowledgeDocument_scope_owner_check" CHECK (
    ("scope" <> 'CLIENT' OR "clientId" IS NOT NULL) AND
    ("scope" <> 'PROJECT' OR "projectId" IS NOT NULL) AND
    ("scope" <> 'AGENT_INSTRUCTIONS' OR ("agentDefinitionId" IS NOT NULL AND "clientId" IS NULL AND "projectId" IS NULL)) AND
    ("scope" <> 'LESSONS_LEARNED' OR "clientId" IS NOT NULL OR "projectId" IS NOT NULL) AND
    ("scope" NOT IN ('COMPANY', 'OWNER_PREFERENCES') OR ("clientId" IS NULL AND "projectId" IS NULL AND "agentDefinitionId" IS NULL))
);

-- CreateTable
CREATE TABLE "KnowledgeChunk" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "knowledgeDocumentId" TEXT NOT NULL,
    "ordinal" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "KnowledgeChunk_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KnowledgeAttachment" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "knowledgeDocumentId" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "checksum" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "KnowledgeAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentRunKnowledge" (
    "workspaceId" TEXT NOT NULL,
    "agentRunId" TEXT NOT NULL,
    "knowledgeDocumentId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AgentRunKnowledge_pkey" PRIMARY KEY ("workspaceId","agentRunId","knowledgeDocumentId")
);

-- CreateTable
CREATE TABLE "Artifact" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "status" "ArtifactStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Artifact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArtifactVersion" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "artifactId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "storageKey" TEXT,
    "contentType" TEXT,
    "textContent" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ArtifactVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Approval" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "artifactId" TEXT NOT NULL,
    "artifactVersionId" TEXT NOT NULL,
    "reviewerId" TEXT NOT NULL,
    "status" "ApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Approval_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UsageRecord" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "agentRunId" TEXT,
    "provider" TEXT NOT NULL,
    "model" TEXT,
    "inputTokens" INTEGER NOT NULL DEFAULT 0,
    "outputTokens" INTEGER NOT NULL DEFAULT 0,
    "costUsd" DECIMAL(12,6),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UsageRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditEvent" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "actorId" TEXT,
    "action" TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "resourceId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Integration" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "status" "IntegrationStatus" NOT NULL DEFAULT 'DISCONNECTED',
    "settings" JSONB,
    "connectedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Integration_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Workspace_slug_key" ON "Workspace"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Membership_userId_status_idx" ON "Membership"("userId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Membership_workspaceId_userId_key" ON "Membership"("workspaceId", "userId");

-- CreateIndex
CREATE INDEX "Client_workspaceId_name_idx" ON "Client"("workspaceId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Client_workspaceId_id_key" ON "Client"("workspaceId", "id");

-- CreateIndex
CREATE INDEX "OperationsProject_workspaceId_updatedAt_idx" ON "OperationsProject"("workspaceId", "updatedAt");

-- CreateIndex
CREATE INDEX "OperationsProject_workspaceId_status_idx" ON "OperationsProject"("workspaceId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "OperationsProject_workspaceId_id_key" ON "OperationsProject"("workspaceId", "id");

-- CreateIndex
CREATE UNIQUE INDEX "OperationsProject_workspaceId_slug_key" ON "OperationsProject"("workspaceId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectBrief_workspaceId_projectId_key" ON "ProjectBrief"("workspaceId", "projectId");

-- CreateIndex
CREATE INDEX "AgentDefinition_workspaceId_enabled_idx" ON "AgentDefinition"("workspaceId", "enabled");

-- CreateIndex
CREATE UNIQUE INDEX "AgentDefinition_workspaceId_id_key" ON "AgentDefinition"("workspaceId", "id");

-- CreateIndex
CREATE UNIQUE INDEX "AgentDefinition_workspaceId_key_key" ON "AgentDefinition"("workspaceId", "key");

-- CreateIndex
CREATE INDEX "AgentVersion_workspaceId_agentDefinitionId_status_version_idx" ON "AgentVersion"("workspaceId", "agentDefinitionId", "status", "version");

-- CreateIndex
CREATE UNIQUE INDEX "AgentVersion_workspaceId_id_key" ON "AgentVersion"("workspaceId", "id");

-- CreateIndex
CREATE UNIQUE INDEX "AgentVersion_workspaceId_agentDefinitionId_id_key" ON "AgentVersion"("workspaceId", "agentDefinitionId", "id");

-- CreateIndex
CREATE UNIQUE INDEX "AgentVersion_workspaceId_agentDefinitionId_version_key" ON "AgentVersion"("workspaceId", "agentDefinitionId", "version");

-- At most one version is active for a definition; older runs keep their pinned version.
CREATE UNIQUE INDEX "AgentVersion_one_approved_per_definition" ON "AgentVersion"("workspaceId", "agentDefinitionId") WHERE "status" = 'APPROVED';

-- CreateIndex
CREATE UNIQUE INDEX "WorkflowDefinition_workspaceId_id_key" ON "WorkflowDefinition"("workspaceId", "id");

-- CreateIndex
CREATE UNIQUE INDEX "WorkflowDefinition_workspaceId_key_key" ON "WorkflowDefinition"("workspaceId", "key");

-- CreateIndex
CREATE INDEX "WorkflowRun_workspaceId_status_createdAt_idx" ON "WorkflowRun"("workspaceId", "status", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "WorkflowRun_workspaceId_id_key" ON "WorkflowRun"("workspaceId", "id");

-- CreateIndex
CREATE INDEX "OperationsTask_workspaceId_projectId_status_idx" ON "OperationsTask"("workspaceId", "projectId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "OperationsTask_workspaceId_projectId_id_key" ON "OperationsTask"("workspaceId", "projectId", "id");

-- CreateIndex
CREATE UNIQUE INDEX "TaskDependency_workspaceId_taskId_dependsOnTaskId_key" ON "TaskDependency"("workspaceId", "taskId", "dependsOnTaskId");

-- CreateIndex
CREATE INDEX "AgentRun_workspaceId_status_createdAt_idx" ON "AgentRun"("workspaceId", "status", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "AgentRun_workspaceId_id_key" ON "AgentRun"("workspaceId", "id");

-- CreateIndex
CREATE INDEX "ToolCall_workspaceId_agentRunId_startedAt_idx" ON "ToolCall"("workspaceId", "agentRunId", "startedAt");

-- CreateIndex
CREATE INDEX "KnowledgeDocument_workspaceId_scope_status_updatedAt_idx" ON "KnowledgeDocument"("workspaceId", "scope", "status", "updatedAt");

-- CreateIndex
CREATE INDEX "KnowledgeDocument_workspaceId_clientId_scope_status_idx" ON "KnowledgeDocument"("workspaceId", "clientId", "scope", "status");

-- CreateIndex
CREATE INDEX "KnowledgeDocument_workspaceId_projectId_scope_status_idx" ON "KnowledgeDocument"("workspaceId", "projectId", "scope", "status");

-- CreateIndex
CREATE INDEX "KnowledgeDocument_workspaceId_agentDefinitionId_scope_statu_idx" ON "KnowledgeDocument"("workspaceId", "agentDefinitionId", "scope", "status");

-- CreateIndex
CREATE UNIQUE INDEX "KnowledgeDocument_workspaceId_id_key" ON "KnowledgeDocument"("workspaceId", "id");

-- CreateIndex
CREATE UNIQUE INDEX "KnowledgeDocument_workspaceId_knowledgeKey_version_key" ON "KnowledgeDocument"("workspaceId", "knowledgeKey", "version");

-- CreateIndex
CREATE UNIQUE INDEX "KnowledgeChunk_workspaceId_knowledgeDocumentId_ordinal_key" ON "KnowledgeChunk"("workspaceId", "knowledgeDocumentId", "ordinal");

-- CreateIndex
CREATE INDEX "KnowledgeAttachment_workspaceId_knowledgeDocumentId_idx" ON "KnowledgeAttachment"("workspaceId", "knowledgeDocumentId");

-- CreateIndex
CREATE UNIQUE INDEX "KnowledgeAttachment_workspaceId_id_key" ON "KnowledgeAttachment"("workspaceId", "id");

-- CreateIndex
CREATE UNIQUE INDEX "KnowledgeAttachment_workspaceId_knowledgeDocumentId_storage_key" ON "KnowledgeAttachment"("workspaceId", "knowledgeDocumentId", "storageKey");

-- CreateIndex
CREATE INDEX "AgentRunKnowledge_workspaceId_knowledgeDocumentId_idx" ON "AgentRunKnowledge"("workspaceId", "knowledgeDocumentId");

-- CreateIndex
CREATE INDEX "Artifact_workspaceId_projectId_updatedAt_idx" ON "Artifact"("workspaceId", "projectId", "updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Artifact_workspaceId_id_key" ON "Artifact"("workspaceId", "id");

-- CreateIndex
CREATE UNIQUE INDEX "ArtifactVersion_workspaceId_artifactId_id_key" ON "ArtifactVersion"("workspaceId", "artifactId", "id");

-- CreateIndex
CREATE UNIQUE INDEX "ArtifactVersion_workspaceId_artifactId_version_key" ON "ArtifactVersion"("workspaceId", "artifactId", "version");

-- CreateIndex
CREATE INDEX "Approval_workspaceId_status_createdAt_idx" ON "Approval"("workspaceId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "UsageRecord_workspaceId_createdAt_idx" ON "UsageRecord"("workspaceId", "createdAt");

-- CreateIndex
CREATE INDEX "AuditEvent_workspaceId_createdAt_idx" ON "AuditEvent"("workspaceId", "createdAt");

-- CreateIndex
CREATE INDEX "AuditEvent_workspaceId_resource_resourceId_idx" ON "AuditEvent"("workspaceId", "resource", "resourceId");

-- CreateIndex
CREATE UNIQUE INDEX "Integration_workspaceId_provider_key" ON "Integration"("workspaceId", "provider");

-- AddForeignKey
ALTER TABLE "Membership" ADD CONSTRAINT "Membership_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Membership" ADD CONSTRAINT "Membership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Client" ADD CONSTRAINT "Client_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OperationsProject" ADD CONSTRAINT "OperationsProject_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OperationsProject" ADD CONSTRAINT "OperationsProject_workspaceId_clientId_fkey" FOREIGN KEY ("workspaceId", "clientId") REFERENCES "Client"("workspaceId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectBrief" ADD CONSTRAINT "ProjectBrief_workspaceId_projectId_fkey" FOREIGN KEY ("workspaceId", "projectId") REFERENCES "OperationsProject"("workspaceId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentDefinition" ADD CONSTRAINT "AgentDefinition_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentVersion" ADD CONSTRAINT "AgentVersion_workspaceId_agentDefinitionId_fkey" FOREIGN KEY ("workspaceId", "agentDefinitionId") REFERENCES "AgentDefinition"("workspaceId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowDefinition" ADD CONSTRAINT "WorkflowDefinition_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowRun" ADD CONSTRAINT "WorkflowRun_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowRun" ADD CONSTRAINT "WorkflowRun_workspaceId_workflowDefinitionId_fkey" FOREIGN KEY ("workspaceId", "workflowDefinitionId") REFERENCES "WorkflowDefinition"("workspaceId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowRun" ADD CONSTRAINT "WorkflowRun_workspaceId_projectId_fkey" FOREIGN KEY ("workspaceId", "projectId") REFERENCES "OperationsProject"("workspaceId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OperationsTask" ADD CONSTRAINT "OperationsTask_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OperationsTask" ADD CONSTRAINT "OperationsTask_workspaceId_projectId_fkey" FOREIGN KEY ("workspaceId", "projectId") REFERENCES "OperationsProject"("workspaceId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OperationsTask" ADD CONSTRAINT "OperationsTask_workspaceId_agentDefinitionId_fkey" FOREIGN KEY ("workspaceId", "agentDefinitionId") REFERENCES "AgentDefinition"("workspaceId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskDependency" ADD CONSTRAINT "TaskDependency_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskDependency" ADD CONSTRAINT "TaskDependency_workspaceId_projectId_taskId_fkey" FOREIGN KEY ("workspaceId", "projectId", "taskId") REFERENCES "OperationsTask"("workspaceId", "projectId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskDependency" ADD CONSTRAINT "TaskDependency_workspaceId_projectId_dependsOnTaskId_fkey" FOREIGN KEY ("workspaceId", "projectId", "dependsOnTaskId") REFERENCES "OperationsTask"("workspaceId", "projectId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentRun" ADD CONSTRAINT "AgentRun_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentRun" ADD CONSTRAINT "AgentRun_workspaceId_projectId_fkey" FOREIGN KEY ("workspaceId", "projectId") REFERENCES "OperationsProject"("workspaceId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentRun" ADD CONSTRAINT "AgentRun_workspaceId_projectId_taskId_fkey" FOREIGN KEY ("workspaceId", "projectId", "taskId") REFERENCES "OperationsTask"("workspaceId", "projectId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentRun" ADD CONSTRAINT "AgentRun_workspaceId_workflowRunId_fkey" FOREIGN KEY ("workspaceId", "workflowRunId") REFERENCES "WorkflowRun"("workspaceId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentRun" ADD CONSTRAINT "AgentRun_workspaceId_agentDefinitionId_fkey" FOREIGN KEY ("workspaceId", "agentDefinitionId") REFERENCES "AgentDefinition"("workspaceId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentRun" ADD CONSTRAINT "AgentRun_workspaceId_agentDefinitionId_agentVersionId_fkey" FOREIGN KEY ("workspaceId", "agentDefinitionId", "agentVersionId") REFERENCES "AgentVersion"("workspaceId", "agentDefinitionId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ToolCall" ADD CONSTRAINT "ToolCall_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ToolCall" ADD CONSTRAINT "ToolCall_workspaceId_agentRunId_fkey" FOREIGN KEY ("workspaceId", "agentRunId") REFERENCES "AgentRun"("workspaceId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KnowledgeDocument" ADD CONSTRAINT "KnowledgeDocument_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KnowledgeDocument" ADD CONSTRAINT "KnowledgeDocument_workspaceId_createdById_fkey" FOREIGN KEY ("workspaceId", "createdById") REFERENCES "Membership"("workspaceId", "userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KnowledgeDocument" ADD CONSTRAINT "KnowledgeDocument_workspaceId_clientId_fkey" FOREIGN KEY ("workspaceId", "clientId") REFERENCES "Client"("workspaceId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KnowledgeDocument" ADD CONSTRAINT "KnowledgeDocument_workspaceId_projectId_fkey" FOREIGN KEY ("workspaceId", "projectId") REFERENCES "OperationsProject"("workspaceId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KnowledgeDocument" ADD CONSTRAINT "KnowledgeDocument_workspaceId_agentDefinitionId_fkey" FOREIGN KEY ("workspaceId", "agentDefinitionId") REFERENCES "AgentDefinition"("workspaceId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KnowledgeChunk" ADD CONSTRAINT "KnowledgeChunk_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KnowledgeChunk" ADD CONSTRAINT "KnowledgeChunk_workspaceId_knowledgeDocumentId_fkey" FOREIGN KEY ("workspaceId", "knowledgeDocumentId") REFERENCES "KnowledgeDocument"("workspaceId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KnowledgeAttachment" ADD CONSTRAINT "KnowledgeAttachment_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KnowledgeAttachment" ADD CONSTRAINT "KnowledgeAttachment_workspaceId_knowledgeDocumentId_fkey" FOREIGN KEY ("workspaceId", "knowledgeDocumentId") REFERENCES "KnowledgeDocument"("workspaceId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentRunKnowledge" ADD CONSTRAINT "AgentRunKnowledge_workspaceId_agentRunId_fkey" FOREIGN KEY ("workspaceId", "agentRunId") REFERENCES "AgentRun"("workspaceId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentRunKnowledge" ADD CONSTRAINT "AgentRunKnowledge_workspaceId_knowledgeDocumentId_fkey" FOREIGN KEY ("workspaceId", "knowledgeDocumentId") REFERENCES "KnowledgeDocument"("workspaceId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Artifact" ADD CONSTRAINT "Artifact_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Artifact" ADD CONSTRAINT "Artifact_workspaceId_projectId_fkey" FOREIGN KEY ("workspaceId", "projectId") REFERENCES "OperationsProject"("workspaceId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArtifactVersion" ADD CONSTRAINT "ArtifactVersion_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArtifactVersion" ADD CONSTRAINT "ArtifactVersion_workspaceId_artifactId_fkey" FOREIGN KEY ("workspaceId", "artifactId") REFERENCES "Artifact"("workspaceId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Approval" ADD CONSTRAINT "Approval_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Approval" ADD CONSTRAINT "Approval_workspaceId_artifactId_artifactVersionId_fkey" FOREIGN KEY ("workspaceId", "artifactId", "artifactVersionId") REFERENCES "ArtifactVersion"("workspaceId", "artifactId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Approval" ADD CONSTRAINT "Approval_workspaceId_reviewerId_fkey" FOREIGN KEY ("workspaceId", "reviewerId") REFERENCES "Membership"("workspaceId", "userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsageRecord" ADD CONSTRAINT "UsageRecord_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsageRecord" ADD CONSTRAINT "UsageRecord_workspaceId_agentRunId_fkey" FOREIGN KEY ("workspaceId", "agentRunId") REFERENCES "AgentRun"("workspaceId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditEvent" ADD CONSTRAINT "AuditEvent_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditEvent" ADD CONSTRAINT "AuditEvent_workspaceId_actorId_fkey" FOREIGN KEY ("workspaceId", "actorId") REFERENCES "Membership"("workspaceId", "userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Integration" ADD CONSTRAINT "Integration_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
