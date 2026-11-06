# Data Model

Operational records are separate from the public portfolio CMS. `OperationsProject` is the internal Project concept; the existing `Project` remains public marketing/portfolio content.

| Product concept | Prisma model | Isolation / key rule |
| --- | --- | --- |
| Workspace | `Workspace` | Unique slug; parent for operational records |
| User | `User` | Unique email; may join multiple workspaces |
| Membership | `Membership` | Unique workspace/user pair; role and active status |
| Client | `Client` | Workspace-scoped; unique composite identity |
| Project | `OperationsProject` | Workspace-scoped slug; optional client uses a composite same-workspace relation |
| Brief | `ProjectBrief` | One per workspace/project; content can be revised independently |
| Agent definition | `AgentDefinition` | Workspace-scoped stable key; starter flag and enabled state |
| Agent version | `AgentVersion` | Workspace/agent/version unique; complete immutable operating contract and one-approved-version partial unique index |
| Character profile | `CharacterProfile` | Workspace-scoped stable character key and unique desk; optional same-workspace agent-definition link; appearance, communication style, role, room, and desk are persisted separately from per-frame world movement |
| Workflow definition | `WorkflowDefinition` | Workspace-scoped key and JSON definition |
| Workflow run | `WorkflowRun` | Workspace-scoped lifecycle, plan/dispatch versions, exact accepted-plan hash, idempotency key, lease, retry/cancel state, and budget; external run ID is correlation only |
| Task | `OperationsTask` | Workspace/project/run scoped; plan key, assignment, inputs, acceptance criteria, resource/cost estimates, structured output/handoff, retry state, and required approvals |
| Task dependency | `TaskDependency` | Both task references include workspace and project keys |
| Workflow approval | `WorkflowApproval` | Same-workspace run/task/reviewer; exact action payload and canonical SHA-256 hash |
| Workflow event | `WorkflowEvent` | Workspace/run-scoped status, progress, approval, dispatch, and failure timeline |
| Agent run | `AgentRun` | Workspace-scoped; composite FK pins the agent version to the same agent definition |
| Tool call | `ToolCall` | Belongs to a run in the same workspace; records policy, approval hash, timeout, state, and idempotency key |
| Knowledge document | `KnowledgeDocument` | Versioned workspace key; six explicit scopes, provenance, evidence, status, creator membership, and same-workspace owner FKs |
| Knowledge chunk | `KnowledgeChunk` | Belongs to one exact document version in the same workspace |
| Knowledge attachment | `KnowledgeAttachment` | Private Blob key, checksum, MIME, size, and filename; scoped to one workspace/document version |
| Agent run knowledge pin | `AgentRunKnowledge` | Pins a run to exact knowledge document versions in the same workspace |
| Artifact | `Artifact` | Belongs to a same-workspace project |
| Artifact version | `ArtifactVersion` | Versioned metadata and private storage key; composite references pin the same-project source run, task, agent definition/version, revision number, and reference-only input provenance |
| Approval | `Approval` | Reviewer membership and artifact version are constrained to the same workspace |
| Usage | `UsageRecord` | Workspace/run-scoped provider/model/token facts; provider-reported and list-price estimated costs are separate |
| Audit event | `AuditEvent` | Workspace, optional actor, resource, action, and metadata |
| Integration | `Integration` | Unique provider per workspace; never stores credentials |

Compound unique keys support compound foreign keys. Workspace and parent relations cascade only where deleting the parent should delete child records; historic agent versions are restricted while referenced. Database checks require the correct owner for each knowledge scope. Approval reviewers and audit-event actors reference a membership in the same workspace. Route handlers additionally authorize workspace membership and include the resolved workspace ID in every query. Knowledge search includes only approved chunks from one requested scope and exact client/project/agent selector.

Run states are controlled by application transitions. A workflow run cannot be dispatched before plan acceptance; task assignments must reference enabled agents with approved versions; dependencies are validated as an acyclic graph before persistence. Approval records are immutable decisions over canonicalized action payloads, and changed actions require a new hash/approval. Trigger retries resume from persisted successful tasks, while expired database leases permit recovery after process restart.

The initial owner is represented by a `User` and `OWNER` `Membership`, provisioned by `operations:seed`. The shared admin token is only the first-release authentication gate; it does not represent a future client authorization model.
