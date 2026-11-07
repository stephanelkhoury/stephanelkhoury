# Decisions

## 2026-11-05: Keep the operations platform in the existing Next.js application

The repository already has Next.js App Router, Prisma, PostgreSQL, admin authentication, and a deployment path. A separate application or microservice would add operational overhead without helping the internal first milestone.

## 2026-11-05: Keep public CMS projects separate from operational projects

The existing Prisma `Project` model powers public portfolio content. Operational records use `OperationsProject` and workspace compound keys so product work cannot silently change public project data or cross workspace boundaries.

## 2026-11-05: Establish an ordered migration history without resetting existing data

The repository previously had no migration history and provisioned legacy tables with `prisma db push`. Add a legacy baseline migration for clean installs, followed by the operations migration. Existing databases must verify the legacy schema and mark only the baseline as applied before deploying operations. The operations migration must actually run so its database-only scope and approved-version constraints are installed.

## 2026-11-05: Bootstrap one owner, prepare the data model for workspaces

Reuse the protected admin token for the internal milestone, map it to the configured owner email, and verify an active `OWNER` membership on every operations data request. Do not treat this shared token as client-ready authentication.

## 2026-11-05: Use Trigger.dev for durable agent execution

The official [Trigger.dev task overview](https://trigger.dev/docs/tasks/overview) documents long-running tasks, retriable execution, run handles, queues, concurrency controls, and task duration controls. The official [Inngest Next.js quick start](https://www.inngest.com/docs/getting-started/nextjs-quick-start) documents a Next.js endpoint-based execution integration and checkpointing. Trigger.dev is selected for the requested independently executed worker runtime and clear separation from the normal request lifecycle; this avoids operating Redis/worker infrastructure ourselves. Re-validate current APIs before integrating. No workflow provider SDK is added until the execution milestone.

## 2026-11-05: No simulated product activity

Seed only disabled starter definitions and the required owner/workspace. Do not create sample clients, projects, revenue, runs, approvals, or usage. Missing credentials and configuration must remain visibly disconnected.

## 2026-11-05: Keep integration secrets outside records and client code

Integration settings are non-secret configuration only. Provider secrets stay in server-side environment variables or a dedicated secrets service; generated artifacts use private storage and authorization rather than public URLs.

## 2026-11-05: Separate knowledge scopes and preserve evidence provenance

Company, owner preference, client, project, agent instruction, and lessons-learned records are distinct scopes. Client and project retrieval requires an exact owner selector. Uploaded text is untrusted reference data. Owner-provided background is seeded as owner-confirmed; project ideas are not completion evidence. Keyword retrieval is implemented first; semantic search and OCR remain off until configured and verified.

## 2026-11-05: Version agent contracts instead of editing history

Each agent save creates a new full contract version. Drafts are unavailable for runs; approval supersedes the prior approved version, and a partial unique index prevents two active versions. AgentRun and AgentRunKnowledge carry explicit version references for future reproducibility.

## 2026-11-05: Keep uploads private and extraction bounded

Use the existing Vercel Blob SDK with private access and an authenticated download route. Support UTF-8 text, Markdown, CSV, PDF, and DOCX only; cap uploads at 4 MiB, PDF pages at 100, extracted text at 250,000 characters, and return explicit errors for unsupported or failed extraction. Do not silently downgrade to public storage or claim OCR.

## 2026-11-06: Keep orchestration and approval state application-owned

Use Trigger.dev SDK 4.8.3 for durable execution, retries, queues, and cancellation, while PostgreSQL owns accepted plan hashes, task state, leases, budget estimates, approval decisions, usage, events, and idempotency. Provider/model output may propose a plan or task result but cannot transition application records. Runs resume from successful persisted tasks; repeated dispatches use stable run/revision idempotency keys.

The first provider is Gemini through `@google/genai` v2 Interactions with structured output and no silent provider switch. Validate output locally even after provider schema enforcement. Persist estimated list-price cost separately from provider-reported cost; keep reported cost null when Google does not provide it. Do not claim a successful live generation until a real request succeeds.

Required approvals bind to an immutable action payload hash and reviewer membership. The current registered tool surface is limited to a read-only, workspace/project-scoped brief lookup. External side effects require an exact matching approval. Generated code is blocked until an isolated Vercel Sandbox is configured; it must never execute on the application or ordinary worker host.

## 2026-11-06: Make the headquarters the primary interface, but keep status evidence database-owned

The first playable floor is the Delivery floor in the existing authenticated Multigraphic workspace. Room geometry and collision footprints share a data-driven layout; movement and animation are transient browser state. `CharacterProfile` stores stable employee identity and location and links to the existing agent contract. Character status is derived from saved task state; when there is no persisted task or worker health signal, employees remain visibly not connected. The old command center remains available at `/admin/multigraphic-ai/overview`.

There is no demo mode. The Headquarters shows only saved database records and an error with Retry when they cannot load.
