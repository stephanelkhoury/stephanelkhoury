-- CreateEnum
CREATE TYPE "MeetingStatus" AS ENUM ('GATHERING', 'IN_SESSION', 'CONCLUDED', 'FAILED', 'CANCELED');

-- CreateTable
CREATE TABLE "Meeting" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "roomKey" TEXT NOT NULL,
    "facilitatorKey" TEXT NOT NULL,
    "participantKeys" TEXT[],
    "status" "MeetingStatus" NOT NULL DEFAULT 'GATHERING',
    "contributions" JSONB NOT NULL DEFAULT '[]',
    "outcome" JSONB,
    "error" TEXT,
    "startedAt" TIMESTAMP(3),
    "finishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Meeting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentSkill" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "agentDefinitionId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "xp" INTEGER NOT NULL DEFAULT 0,
    "successCount" INTEGER NOT NULL DEFAULT 0,
    "approvedCount" INTEGER NOT NULL DEFAULT 0,
    "revisionCount" INTEGER NOT NULL DEFAULT 0,
    "lastPracticedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgentSkill_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "AgentSkill_counts_check" CHECK ("xp" >= 0 AND "successCount" >= 0 AND "approvedCount" >= 0 AND "revisionCount" >= 0)
);

-- CreateTable
CREATE TABLE "WorkRecord" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "sourceKey" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "projectId" TEXT,
    "agentDefinitionId" TEXT,
    "title" TEXT NOT NULL,
    "markdown" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Meeting_workspaceId_status_createdAt_idx" ON "Meeting"("workspaceId", "status", "createdAt");
CREATE UNIQUE INDEX "Meeting_workspaceId_id_key" ON "Meeting"("workspaceId", "id");
CREATE UNIQUE INDEX "AgentSkill_workspaceId_agentDefinitionId_key_key" ON "AgentSkill"("workspaceId", "agentDefinitionId", "key");
CREATE INDEX "WorkRecord_workspaceId_createdAt_idx" ON "WorkRecord"("workspaceId", "createdAt");
CREATE INDEX "WorkRecord_workspaceId_agentDefinitionId_createdAt_idx" ON "WorkRecord"("workspaceId", "agentDefinitionId", "createdAt");
CREATE UNIQUE INDEX "WorkRecord_workspaceId_sourceKey_key" ON "WorkRecord"("workspaceId", "sourceKey");

-- AddForeignKey
ALTER TABLE "Meeting" ADD CONSTRAINT "Meeting_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Meeting" ADD CONSTRAINT "Meeting_workspaceId_projectId_fkey" FOREIGN KEY ("workspaceId", "projectId") REFERENCES "OperationsProject"("workspaceId", "id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AgentSkill" ADD CONSTRAINT "AgentSkill_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AgentSkill" ADD CONSTRAINT "AgentSkill_workspaceId_agentDefinitionId_fkey" FOREIGN KEY ("workspaceId", "agentDefinitionId") REFERENCES "AgentDefinition"("workspaceId", "id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "WorkRecord" ADD CONSTRAINT "WorkRecord_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "WorkRecord" ADD CONSTRAINT "WorkRecord_workspaceId_projectId_fkey" FOREIGN KEY ("workspaceId", "projectId") REFERENCES "OperationsProject"("workspaceId", "id") ON DELETE CASCADE ON UPDATE CASCADE;
