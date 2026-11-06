CREATE TABLE "CharacterProfile" (
  "id" TEXT NOT NULL,
  "workspaceId" TEXT NOT NULL,
  "agentDefinitionId" TEXT,
  "key" TEXT NOT NULL,
  "displayName" TEXT NOT NULL,
  "jobTitle" TEXT NOT NULL,
  "department" TEXT NOT NULL,
  "roomKey" TEXT NOT NULL,
  "deskKey" TEXT NOT NULL,
  "communicationStyle" TEXT NOT NULL DEFAULT '',
  "appearance" JSONB NOT NULL DEFAULT '{}'::JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CharacterProfile_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "CharacterProfile_workspaceId_key_key"
  ON "CharacterProfile"("workspaceId", "key");
CREATE UNIQUE INDEX "CharacterProfile_workspaceId_agentDefinitionId_key"
  ON "CharacterProfile"("workspaceId", "agentDefinitionId");
CREATE UNIQUE INDEX "CharacterProfile_workspaceId_deskKey_key"
  ON "CharacterProfile"("workspaceId", "deskKey");
CREATE INDEX "CharacterProfile_workspaceId_roomKey_idx"
  ON "CharacterProfile"("workspaceId", "roomKey");

ALTER TABLE "CharacterProfile"
  ADD CONSTRAINT "CharacterProfile_workspaceId_fkey"
    FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT "CharacterProfile_workspaceId_agentDefinitionId_fkey"
    FOREIGN KEY ("workspaceId", "agentDefinitionId") REFERENCES "AgentDefinition"("workspaceId", "id") ON DELETE CASCADE ON UPDATE CASCADE;