# Agent System

Updated: 2026-11-06

## Identity and configuration

`CharacterProfile` provides the employee-facing name, role, department, communication style, appearance, room, and desk. AI employee profiles reference one workspace-scoped `AgentDefinition`; only the owner profile has no agent definition. The Receptionist is linked to the `receptionist` (Reception & Intake Specialist) agent at the Ground-floor lobby desk. Capabilities and allowed tools come from the persisted definition and latest immutable `AgentVersion`, not from the 3D component. Seed upserts create missing characters but do not overwrite owner-edited profile values.

Each of the 15 AI starter roles, including Reception & Intake, receives an idempotent, role-specific handbook under `AGENT_INSTRUCTIONS`, attached to its exact `AgentDefinition`. The handbook is generated from that role's purpose, responsibilities, exclusions, required inputs, output schema, tool allowlist, knowledge scopes, escalation/approval gates, and evaluation criteria. Seeded handbooks are `DRAFT` and `UNVERIFIED`; they are not retrieved until the owner reviews and approves them. Seed reruns preserve any existing owner-reviewed version.

Reception & Intake can classify supplied requests, choose an internal handoff, and draft a reply. It cannot send messages, book meetings, or make external commitments without separately configured integrations and owner approval.

## Honest world state

`GET /api/admin/operations/headquarters` authorizes the admin session, resolves the active owner membership, and scopes profiles, tasks, agent runs, tool calls, artifacts, and usage to that workspace. It returns concise tool summaries and redacted blockers, never raw model prompts or private tool inputs.

Employee state maps from the latest persisted task: queued/ready, running/in-progress, waiting for owner input, approval review, blocked, failed, or completed. With no task, missing approved/enabled configuration, or no live worker health signal, the employee is not presented as working. The agent detail API reports `available` plus explicit `blockers` (approval, activation, provider key, model pricing, Trigger.dev worker). Tool animations run only for saved execution states; no model calls occur to animate idle staff.

Status summaries are generated deterministically from the saved task record. Persisted messages are not implemented; the panel says so rather than inventing conversations. Model responses may provide a concise high-level rationale summary with evidence/source IDs, assumptions, checks performed, and unresolved questions. Private chain-of-thought and hidden deliberation are not requested, stored, or exposed. Give-task, knowledge, review, revision, and cancellation actions are links or calls into existing operations flows, and cancellation is only available for a task with a workflow run ID.

## No demo data

The Headquarters shows only saved employee records from the database. When they cannot load it shows an error with a Retry action; there is no fictional fallback directory.

## Execution boundary

The existing backend remains responsible for model calls, durable Trigger.dev runs, typed tools, budget gates, approvals, and Vercel Sandbox isolation. The world client only visualizes saved state. Character movement, camera changes, and animation are transient and cannot create, advance, or complete an agent run. A new department needs its own contract, allowed-tool policy, isolation and budget requirements, and deterministic acceptance tests before it appears as active.

## Presence

`resolveCharacterStatus` in `headquarters-model.ts` derives each employee's status from saved records and live signals only. Order: a running task → **Working**; an active meeting (`GATHERING`/`IN_SESSION`) → **In meeting**; queued, draft/awaiting-input, review (including a succeeded task whose run awaits owner approval), blocked, failed; then live presence: no worker or provider → **Not available**; not activated or no approved version → **Not available**; local Ollama model not loaded (`/api/ps`) → **Sleeping**; otherwise **Available**. Finished or canceled work no longer occupies the employee. Hosted providers never report Sleeping. `POST /api/admin/operations/models/wake` loads an Ollama model for 30 minutes. Labels come from `presenceLabel()` so the scene and panels match.

## Meetings

`POST /api/admin/operations/meetings` (2–6 enabled, approved, available attendees; the facilitator must attend; the project needs a saved brief) creates a `Meeting` in the facilitator's floor meeting room and dispatches `runMeeting` (local worker or the `multigraphic-meeting-run` Trigger.dev task). Each attendee contributes in turn with a structured schema (perspective, proposals, risks, questions, information needed) and sees earlier contributions. The facilitator closes with summary, decisions, open questions and one action item per attendee, constrained to attendee keys. Each action item becomes a `department-planning-v1` draft task for that agent (idempotent per meeting/item) that still requires owner acceptance. Every turn is an `AgentRun` with a `UsageRecord`. `POST /meetings/:id/cancel` stops a meeting and aborts the local job. Minutes are written as a work record.

## Skills and improvement

`AgentSkill` rows are created from the agent's approved contract responsibilities. XP: +5 per completed task, +3 per meeting contribution, +15 per owner approval; change requests and rejections increase `revisionCount`. Levels: Trainee (0), Junior (50), Professional (150), Senior (300), Expert (500). When the owner requests changes or rejects with a comment, the comment is saved as an `APPROVED`, `OWNER_CONFIRMED` `LESSONS_LEARNED` knowledge document linked to the project and agent. The worker always retrieves that agent's lessons and pins them on future runs. Skill levels measure recorded outcomes; they do not change the model itself.

## Documentation

`WorkRecord` stores an automatic markdown record (idempotent by `sourceKey`) for every completed task (request, knowledge used, model, time, tokens, full output), every concluded meeting (minutes and action items), and every owner review (decision and comment). Records are browsable and downloadable at `/admin/multigraphic-ai/documentation`.

## Analytics

`GET /api/admin/operations/analytics?days=7|30|90` aggregates saved agent runs, usage records, owner approvals, meetings and work records per agent and department: runs, success rate, owner approval rate, average run time, meeting turns, tokens, cost basis and skill levels, plus daily throughput.