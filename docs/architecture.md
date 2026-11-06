# Architecture

## Application shape

- Keep one Next.js App Router application and the existing PostgreSQL/Prisma database.
- Host the internal UI under `/admin/multigraphic-ai`; the existing admin middleware protects page navigation.
- Use authenticated Next.js Route Handlers for writes and reads. They independently verify the admin token and active owner membership, then scope every query by workspace ID.
- Keep the public portfolio CMS `Project` model unchanged. `OperationsProject` is the separately scoped operational project record.
- Keep provider calls, integration credentials, and storage access server-side. Never store provider secrets in JSON settings or browser payloads.

## Identity and authorization

The initial release reuses the site's `ADMIN_DASHBOARD_TOKEN` as the credential and maps it to the owner selected by `MULTIGRAPHIC_OWNER_EMAIL`. Successful sign-in issues a seven-day HMAC-signed `admin_session` cookie (`HttpOnly`, `SameSite=Lax`, `Secure` in production); middleware verifies it with Web Crypto, while Node route handlers use constant-time signature comparison. Cookie-authenticated mutations require an exact same-origin request. Bearer automation is accepted only after constant-time comparison with the configured token; an arbitrary Bearer header never bypasses CSRF checks. Login requests are capped at 4 KiB while streaming and rate-limited through durable Postgres buckets. This remains a single-owner bootstrap, not multi-user authentication. Membership role and status are checked server-side on every operations request. Future client access requires individual identity, session-based membership authorization, and corresponding permission tests.

Workspace IDs are required on operational records. Compound unique keys and foreign keys constrain project, task, agent, run, artifact, and client references to the same workspace. Route handlers never accept a workspace ID as authority from the browser.

## Persistence

Prisma models operational data alongside the existing CMS models. The first migration baselines the existing portfolio schema for clean installs; subsequent additive migrations add operations, execution, website delivery, rate limits, artifact lineage, and headquarters profiles. For an existing installation with legacy tables but no migration history, mark only the verified baseline as applied before deploying additive migrations. Do not apply a destructive reset to a shared database.

Starter agent definitions and seven idempotently seeded character profiles are persisted. Character profiles bind an owner or staff/agent appearance, communication style, room, and desk to the workspace; AI employees link to same-workspace agent definitions (including Reception & Intake); only the owner has no agent contract. No project, client, run, or usage activity is seeded. The current milestone requires PostgreSQL; without it the real directory returns an explicit setup/unavailable state. An opt-in in-memory demo is separately labeled, contains no work records, and has no mutation actions.

## Headquarters presentation

`/admin/multigraphic-ai` is the primary full-building experience: three cutaway storeys, exterior plaza, glass elevator, stair flights, rooftop garden, room fixtures, and a slim navigation rail. `headquarters-model.ts` provides the data-driven room program; only Level 02 · Delivery is active, with ten spaces including kitchenette, accessible restroom, and meeting room. Ground and Level 03 have reception/waiting, client/strategy meetings, library, HR/Agent Academy, operations/finance, kitchenette/restroom, founder, command, video, and music rooms marked planned. Client-only React Three Fiber renders the architecture and procedural people. A bounded grid pathfinder is shared by click-to-move and keyboard movement. Player position and animation remain transient in the browser. The authenticated headquarters API reads only the resolved workspace and derives employee state from persisted task records; no idle model calls or synthesized activity are used. `/admin/multigraphic-ai/overview` preserves the previous command center.

The world offers Whole Building, Ground, Delivery, and Leadership view modes. Whole Building shows the entire architectural shell; Ground and Leadership isolate planned floor layouts with no employee/work state; Delivery isolates the active floor and enables navigation. It also offers bounded orbit/zoom, quick room navigation, an accessible directory alternative, a reduced-motion control, and a lower graphics preset. It polls persisted state every 15 seconds only while the real workspace view is open and visible. On narrow screens the camera widens, in-world labels are hidden, and the directory retains all names, roles, and statuses.

## Knowledge and agent contracts

`KnowledgeDocument` versions are grouped by workspace-scoped `knowledgeKey`. Every version includes scope, source, status, evidence status, creator membership, and optional same-workspace client/project/agent ownership. PostgreSQL check constraints enforce the required owner for client, project, lessons-learned, and agent-instruction scopes. Knowledge chunks belong to one exact document version; agent runs can pin exact agent-version and knowledge-document IDs.

Agent contracts are immutable `AgentVersion` records. Registry metadata can move to a newer version while historical run references continue to point to the earlier version. Only one version per agent may be approved at a time; the database enforces this with a partial unique index. Draft saves never activate execution.

The operations seed creates one agent-scoped role handbook per AI starter definition. These are draft/unverified knowledge documents derived from the versioned role contract, not owner facts. They remain excluded from execution prompts until individually approved; the worker retrieves only approved `AGENT_INSTRUCTIONS` for the exact assigned agent definition and pins those document IDs to `AgentRunKnowledge`. Outputs use concise rationale/evidence summaries and never request private chain-of-thought.

Document uploads accept UTF-8 TXT, Markdown, CSV, PDF, and DOCX up to 4 MiB. PDF.js and Mammoth extract plain text server-side with page/text limits and explicit unsupported, invalid, empty, and parser-failure responses. DOCX archives are streamed through a bounded ZIP preflight before Mammoth parsing. Search is case-insensitive keyword matching over approved chunks, constrained by workspace, exact scope, and exact client/project/agent selector. Semantic retrieval and OCR are not configured.

Original uploads use private Vercel Blob. Uploads fail explicitly when private storage is disconnected; text-only records remain available. Download routes authorize the workspace in the request handler and return private, no-store responses. Extracted content is plain text, never rendered as HTML or used to override agent instructions.

## Durable execution decision

Trigger.dev SDK 4.8.3 is the durable worker boundary. `multigraphic-workflow-run` uses a workspace concurrency queue, bounded retries, a 30-minute maximum, deterministic dispatch keys, and an application-owned lease. WorkflowRun, task, approval, event, usage, and tool-call records remain the source of product state; Trigger.dev IDs are correlation handles only.

Plan generation uses the Google GenAI SDK v2 Interactions API with a strict website-delivery JSON Schema, `store: false`, no provider fallback, and a second Zod/DAG/stage validation pass. The specification is bounded to eight static marketing pages, exact scope flags, BCP 47 languages, approved asset inventory, owner-reviewed copy, metadata, responsive behavior, accessibility and contrast. Each stage requires an enabled, approved specialist, and implementation requires the exact `website-specification` approval. The plan stays a draft until owner acceptance; the accepted plan is hash-bound and materialized transactionally into tasks/dependencies. A worker only claims accepted runs and persists validated output, usage, errors, retries, and cancellation checkpoints.

Trigger project credentials are not configured in this environment. Accepted plans remain explicitly `BLOCKED` at dispatch until `TRIGGER_PROJECT_REF` and `TRIGGER_SECRET_KEY` are configured and the worker is deployed with database/provider environment variables. In the local fictional demo, two actual Gemini planning requests returned HTTP 503 for `gemini-3.8-flash` after 39.7s and 48.294s; neither returned token usage, a draft plan, or tasks. The failure and measured duration are persisted, with no provider fallback or simulated run.

Generated code is never executed on the Next.js or ordinary Trigger worker host. The bounded static-site implementation uses `@vercel/sandbox` Firecracker microVMs, pinned temporary browser tooling, npm-registry-only egress during tooling setup, then `deny-all` egress for build and browser checks. The SDK accepts Vercel OIDC or a complete access-token/team/project tuple; these credentials are absent here. Private source archives and screenshots require `BLOB_READ_WRITE_TOKEN`. The only agent tool registered is an optional workspace/project-scoped read-only project-brief tool; no external side-effect or publishing tool is available. Artifact decisions and revision actions remain owner-controlled.

## Artifacts and integrations

Artifact metadata and versions are stored in PostgreSQL with exact source workflow and revision numbers. Source archives and desktop/mobile screenshots use private Vercel Blob and authenticated `no-store` download routes; verification reports are stored as text. Each version requires owner review. Revision requests bind to the exact version, atomically consume one of two run-level revision slots, close stale reviews, and redispatch only implementation/verification/delivery through Trigger. Measured Sandbox phase/CPU durations are recorded separately from token counts and estimated/reported dollars. Integration records hold non-secret settings and status only.

## Operational behavior

Route handlers validate requests, return explicit error states, and write audit events transactionally with project changes. Future background tasks must be idempotent, retry-bounded, cancellable where practical, and observable through persisted run/task state plus the workflow provider.
