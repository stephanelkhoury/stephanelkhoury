import type { CharacterStatus } from './headquarters-model';

export type CharacterAppearance = {
  skinTone?: string;
  hairStyle?: string;
  hairColor?: string;
  clothingColor?: string;
  accentColor?: string;
  accessory?: string;
};

export type HeadquartersCharacter = {
  id: string;
  key: string;
  displayName: string;
  jobTitle: string;
  department: string;
  roomKey: string;
  deskKey: string;
  communicationStyle: string;
  appearance: CharacterAppearance;
  isOwner: boolean;
  status: CharacterStatus | 'OWNER';
  agent: {
    id: string;
    key: string;
    enabled: boolean;
    capabilities: string[];
    version: number | null;
    versionStatus: string | null;
    allowedTools: string[];
  } | null;
  currentTask: {
    id: string;
    title: string;
    status: string;
    workflowRunId: string | null;
    project: { id: string; name: string };
    blocker: string | null;
  } | null;
  taskHistory: Array<{
    id: string;
    title: string;
    status: string;
    updatedAt: string;
    project: { id: string; name: string };
  }>;
  toolActivity: Array<{ id: string; name: string; status: string; startedAt: string; finishedAt: string | null }>;
  deliverables: Array<{
    id: string;
    title: string;
    status: string;
    project: string;
    version: number;
    reviewStatus: string | null;
    createdAt: string;
  }>;
  usage: { records: number; inputTokens: number; outputTokens: number; reportedCostUsd: string; estimatedCostUsd: string };
  meeting?: { id: string; roomKey: string; topic: string } | null;
  skills?: Array<{ name: string; level: number; levelName: string; xp: number; nextLevelXp: number | null }>;
};