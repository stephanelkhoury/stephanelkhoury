CREATE TABLE "AgentEvaluation" (
  "id" TEXT NOT NULL,
  "workspaceId" TEXT NOT NULL,
  "agentDefinitionId" TEXT NOT NULL,
  "agentVersionId" TEXT NOT NULL,
  "passed" BOOLEAN NOT NULL,
  "checks" JSONB NOT NULL,
  "createdById" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AgentEvaluation_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "AgentEvaluation_agentVersion_fkey" FOREIGN KEY ("workspaceId", "agentDefinitionId", "agentVersionId") REFERENCES "AgentVersion"("workspaceId", "agentDefinitionId", "id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "AgentEvaluation_creator_fkey" FOREIGN KEY ("workspaceId", "createdById") REFERENCES "Membership"("workspaceId", "userId") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE INDEX "AgentEvaluation_workspaceId_agentDefinitionId_createdAt_idx" ON "AgentEvaluation"("workspaceId", "agentDefinitionId", "createdAt");
