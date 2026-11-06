ALTER TABLE "ArtifactVersion"
  ADD COLUMN "projectId" TEXT,
  ADD COLUMN "taskId" TEXT,
  ADD COLUMN "agentDefinitionId" TEXT,
  ADD COLUMN "agentVersionId" TEXT,
  ADD COLUMN "inputReferences" JSONB NOT NULL DEFAULT '{}'::JSONB;

UPDATE "ArtifactVersion" AS version
SET "projectId" = artifact."projectId"
FROM "Artifact" AS artifact
WHERE version."workspaceId" = artifact."workspaceId"
  AND version."artifactId" = artifact."id";

ALTER TABLE "ArtifactVersion"
  ALTER COLUMN "projectId" SET NOT NULL;

CREATE UNIQUE INDEX "Artifact_workspaceId_id_projectId_key"
  ON "Artifact"("workspaceId", "id", "projectId");
CREATE UNIQUE INDEX "WorkflowRun_workspaceId_projectId_id_key"
  ON "WorkflowRun"("workspaceId", "projectId", "id");
CREATE UNIQUE INDEX "OperationsTask_workspaceId_projectId_workflowRunId_id_key"
  ON "OperationsTask"("workspaceId", "projectId", "workflowRunId", "id");

ALTER TABLE "ArtifactVersion"
  DROP CONSTRAINT "ArtifactVersion_workspaceId_artifactId_fkey";

ALTER TABLE "ArtifactVersion"
  ADD CONSTRAINT "ArtifactVersion_workspaceId_artifactId_projectId_fkey"
    FOREIGN KEY ("workspaceId", "artifactId", "projectId")
    REFERENCES "Artifact"("workspaceId", "id", "projectId") ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT "ArtifactVersion_workspaceId_projectId_fkey"
    FOREIGN KEY ("workspaceId", "projectId")
    REFERENCES "OperationsProject"("workspaceId", "id") ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT "ArtifactVersion_workspaceId_projectId_workflowRunId_fkey"
    FOREIGN KEY ("workspaceId", "projectId", "workflowRunId")
    REFERENCES "WorkflowRun"("workspaceId", "projectId", "id") ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT "ArtifactVersion_workspaceId_projectId_workflowRunId_taskId_fkey"
    FOREIGN KEY ("workspaceId", "projectId", "workflowRunId", "taskId")
    REFERENCES "OperationsTask"("workspaceId", "projectId", "workflowRunId", "id") ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT "ArtifactVersion_workspaceId_agentDefinitionId_agentVersionId_fkey"
    FOREIGN KEY ("workspaceId", "agentDefinitionId", "agentVersionId")
    REFERENCES "AgentVersion"("workspaceId", "agentDefinitionId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE INDEX "ArtifactVersion_workspaceId_projectId_createdAt_idx"
  ON "ArtifactVersion"("workspaceId", "projectId", "createdAt");
