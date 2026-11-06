ALTER TYPE "OperationsTaskStatus" ADD VALUE IF NOT EXISTS 'DRAFT';
ALTER TYPE "OperationsTaskStatus" ADD VALUE IF NOT EXISTS 'QUEUED';
ALTER TYPE "OperationsTaskStatus" ADD VALUE IF NOT EXISTS 'RUNNING';
ALTER TYPE "OperationsTaskStatus" ADD VALUE IF NOT EXISTS 'AWAITING_INPUT';
ALTER TYPE "OperationsTaskStatus" ADD VALUE IF NOT EXISTS 'AWAITING_APPROVAL';
ALTER TYPE "OperationsTaskStatus" ADD VALUE IF NOT EXISTS 'FAILED';
ALTER TYPE "OperationsTaskStatus" ADD VALUE IF NOT EXISTS 'SUCCEEDED';

ALTER TYPE "WorkflowRunStatus" ADD VALUE IF NOT EXISTS 'DRAFT';
ALTER TYPE "WorkflowRunStatus" ADD VALUE IF NOT EXISTS 'AWAITING_INPUT';
ALTER TYPE "WorkflowRunStatus" ADD VALUE IF NOT EXISTS 'AWAITING_APPROVAL';
ALTER TYPE "WorkflowRunStatus" ADD VALUE IF NOT EXISTS 'BLOCKED';
ALTER TYPE "ToolCallStatus" ADD VALUE IF NOT EXISTS 'RUNNING';

ALTER TABLE "WorkflowRun"
  ADD COLUMN "idempotencyKey" TEXT,
  ADD COLUMN "planVersion" INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN "dispatchVersion" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "acceptedPlanHash" TEXT,
  ADD COLUMN "acceptedAt" TIMESTAMP(3),
  ADD COLUMN "startedAt" TIMESTAMP(3),
  ADD COLUMN "finishedAt" TIMESTAMP(3),
  ADD COLUMN "cancelRequestedAt" TIMESTAMP(3),
  ADD COLUMN "leaseOwner" TEXT,
  ADD COLUMN "leaseExpiresAt" TIMESTAMP(3),
  ADD COLUMN "attemptCount" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "maxAttempts" INTEGER NOT NULL DEFAULT 3,
  ADD COLUMN "budgetCapUsd" DECIMAL(12,6),
  ADD COLUMN "estimatedCostUsd" DECIMAL(12,6);

ALTER TABLE "OperationsTask"
  ADD COLUMN "workflowRunId" TEXT,
  ADD COLUMN "planKey" TEXT,
  ADD COLUMN "inputs" JSONB,
  ADD COLUMN "acceptanceCriteria" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN "estimatedMinutes" INTEGER,
  ADD COLUMN "estimatedCostUsd" DECIMAL(12,6),
  ADD COLUMN "estimatedResources" JSONB,
  ADD COLUMN "handoff" JSONB,
  ADD COLUMN "output" JSONB,
  ADD COLUMN "error" TEXT,
  ADD COLUMN "attemptCount" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "maxAttempts" INTEGER NOT NULL DEFAULT 3,
  ADD COLUMN "availableAt" TIMESTAMP(3);

ALTER TABLE "OperationsTask"
  ADD COLUMN "requiredApprovals" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

ALTER TABLE "UsageRecord"
  ADD COLUMN "estimatedCostUsd" DECIMAL(12,6),
  ADD COLUMN "costBasis" TEXT NOT NULL DEFAULT 'ESTIMATED',
  ADD COLUMN "workflowRunId" TEXT;

ALTER TABLE "ToolCall"
  ADD COLUMN "policy" TEXT NOT NULL DEFAULT 'READ_ONLY',
  ADD COLUMN "approvalHash" TEXT,
  ADD COLUMN "idempotencyKey" TEXT,
  ADD COLUMN "timeoutMs" INTEGER NOT NULL DEFAULT 5000;

CREATE UNIQUE INDEX "WorkflowRun_workspaceId_idempotencyKey_key"
  ON "WorkflowRun"("workspaceId", "idempotencyKey");
CREATE UNIQUE INDEX "OperationsTask_workspaceId_workflowRunId_planKey_key"
  ON "OperationsTask"("workspaceId", "workflowRunId", "planKey");
CREATE UNIQUE INDEX "ToolCall_workspaceId_agentRunId_idempotencyKey_key"
  ON "ToolCall"("workspaceId", "agentRunId", "idempotencyKey");

CREATE TABLE "WorkflowEvent" (
  "id" TEXT NOT NULL,
  "workspaceId" TEXT NOT NULL,
  "workflowRunId" TEXT NOT NULL,
  "taskKey" TEXT,
  "type" TEXT NOT NULL,
  "message" TEXT,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "WorkflowEvent_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "WorkflowApproval" (
  "id" TEXT NOT NULL,
  "workspaceId" TEXT NOT NULL,
  "workflowRunId" TEXT NOT NULL,
  "projectId" TEXT NOT NULL,
  "taskId" TEXT NOT NULL,
  "actionKey" TEXT NOT NULL,
  "actionPayload" JSONB NOT NULL,
  "actionHash" TEXT NOT NULL,
  "status" "ApprovalStatus" NOT NULL DEFAULT 'PENDING',
  "reviewerId" TEXT,
  "comment" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "reviewedAt" TIMESTAMP(3),
  CONSTRAINT "WorkflowApproval_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "WorkflowRun_workspaceId_leaseExpiresAt_idx"
  ON "WorkflowRun"("workspaceId", "leaseExpiresAt");
CREATE INDEX "OperationsTask_workspaceId_workflowRunId_status_idx"
  ON "OperationsTask"("workspaceId", "workflowRunId", "status");
CREATE INDEX "WorkflowEvent_workspaceId_workflowRunId_createdAt_idx"
  ON "WorkflowEvent"("workspaceId", "workflowRunId", "createdAt");
CREATE INDEX "WorkflowEvent_workspaceId_type_createdAt_idx"
  ON "WorkflowEvent"("workspaceId", "type", "createdAt");
CREATE UNIQUE INDEX "WorkflowApproval_workspaceId_id_key"
  ON "WorkflowApproval"("workspaceId", "id");
CREATE UNIQUE INDEX "WorkflowApproval_workspaceId_workflowRunId_actionKey_actionHash_key"
  ON "WorkflowApproval"("workspaceId", "workflowRunId", "actionKey", "actionHash");
CREATE INDEX "WorkflowApproval_workspaceId_workflowRunId_status_createdAt_idx"
  ON "WorkflowApproval"("workspaceId", "workflowRunId", "status", "createdAt");

ALTER TABLE "WorkflowRun"
  ADD CONSTRAINT "WorkflowRun_attemptCount_check" CHECK ("attemptCount" >= 0 AND "maxAttempts" > 0);
ALTER TABLE "WorkflowRun"
  ADD CONSTRAINT "WorkflowRun_budgetCapUsd_check" CHECK ("budgetCapUsd" IS NULL OR "budgetCapUsd" >= 0);
ALTER TABLE "OperationsTask"
  ADD CONSTRAINT "OperationsTask_attemptCount_check" CHECK ("attemptCount" >= 0 AND "maxAttempts" > 0);

ALTER TABLE "OperationsTask"
  ADD CONSTRAINT "OperationsTask_workspaceId_workflowRunId_fkey"
  FOREIGN KEY ("workspaceId", "workflowRunId")
  REFERENCES "WorkflowRun"("workspaceId", "id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UsageRecord"
  ADD CONSTRAINT "UsageRecord_workspaceId_workflowRunId_fkey"
  FOREIGN KEY ("workspaceId", "workflowRunId")
  REFERENCES "WorkflowRun"("workspaceId", "id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "WorkflowEvent"
  ADD CONSTRAINT "WorkflowEvent_workspaceId_fkey"
  FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "WorkflowEvent"
  ADD CONSTRAINT "WorkflowEvent_workspaceId_workflowRunId_fkey"
  FOREIGN KEY ("workspaceId", "workflowRunId")
  REFERENCES "WorkflowRun"("workspaceId", "id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "WorkflowApproval"
  ADD CONSTRAINT "WorkflowApproval_workspaceId_fkey"
  FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "WorkflowApproval"
  ADD CONSTRAINT "WorkflowApproval_workspaceId_workflowRunId_fkey"
  FOREIGN KEY ("workspaceId", "workflowRunId")
  REFERENCES "WorkflowRun"("workspaceId", "id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "WorkflowApproval"
  ADD CONSTRAINT "WorkflowApproval_workspaceId_projectId_taskId_fkey"
  FOREIGN KEY ("workspaceId", "projectId", "taskId")
  REFERENCES "OperationsTask"("workspaceId", "projectId", "id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "WorkflowApproval"
  ADD CONSTRAINT "WorkflowApproval_workspaceId_reviewerId_fkey"
  FOREIGN KEY ("workspaceId", "reviewerId")
  REFERENCES "Membership"("workspaceId", "userId") ON DELETE RESTRICT ON UPDATE CASCADE;