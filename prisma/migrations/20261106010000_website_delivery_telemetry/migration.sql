ALTER TABLE "ArtifactVersion"
  ADD COLUMN "workflowRunId" TEXT,
  ADD COLUMN "revisionNumber" INTEGER NOT NULL DEFAULT 0;

CREATE INDEX "ArtifactVersion_workspaceId_workflowRunId_idx"
  ON "ArtifactVersion"("workspaceId", "workflowRunId");

CREATE UNIQUE INDEX "ArtifactVersion_workspaceId_artifactId_workflowRunId_revisionNumber_key"
  ON "ArtifactVersion"("workspaceId", "artifactId", "workflowRunId", "revisionNumber");

ALTER TABLE "UsageRecord"
  ADD COLUMN "durationMs" INTEGER,
  ADD COLUMN "activeCpuDurationMs" INTEGER,
  ADD COLUMN "dependencySetupDurationMs" INTEGER,
  ADD COLUMN "buildDurationMs" INTEGER,
  ADD COLUMN "browserDurationMs" INTEGER;

