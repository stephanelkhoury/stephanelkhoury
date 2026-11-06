# Progress

Updated: 2026-11-06

## Complete

- Added workspace/client/operations-project/brief, agent/version, workflow/run, task/dependency, run/tool-call, knowledge, artifact/version, approval, usage, audit, and integration Prisma models with workspace compound keys.
- Generated an additive PostgreSQL migration that leaves the existing public CMS tables unchanged.
- Added idempotent owner/workspace setup and eight disabled starter capability definitions. No example client, project, completed work, revenue, run, approval, or usage records are created.
- Added protected project list/create/detail/update and agent registry endpoints with owner membership checks, workspace-scoped reads/writes, validation, and transactional project audit events.
- Added `/admin/multigraphic-ai` project list, brief editor, create/edit/detail routes, search/status filters, registry view, and loading/empty/error/disconnected states.
- Added six knowledge scopes with versioned records, source/evidence/status metadata, ownership validation, creator membership, and exact client/project/agent relations.
- Added private Blob attachment metadata/download authorization and bounded text, PDF, and DOCX extraction with explicit unsupported/invalid/empty/parser errors.
- Added approved-only exact-scope keyword search, knowledge detail/history/revision/approval/archive screens, and no semantic retrieval or OCR fallback.
- Added full agent contracts, seven working definitions, seven draft capabilities, version-1 seeds, draft-version edits, approval/supersession, and run version pins.
- Added complete agent list/detail/edit/history UI with explicit unavailable state until provider/tools are configured.
- Added the owner command center over persisted workspace data: responsive dashboard, project search/status/archive/restore, project workspace sections, approvals, deliverables and revisions, integrations, usage, activity, and project-scoped navigation. Empty states reflect database records; no synthetic charts or activity were introduced.
- Added private deliverable version preview/download, exact artifact-version review decisions, version-bound revision notes, and RTL-aware direction for user-authored text fields.
- Added environment placeholders and database setup guidance for existing and brand-new databases.
- Recorded product, architecture, data model, plan, decisions, and this continuation state in `docs/`.
- Added Gemini v2 structured plan generation with strict schema/DAG validation, idempotent draft runs, and Project Manager contract/version pinning.
- Added owner edit/accept flow with exact canonical plan hash, saved-brief snapshot check, budget gate, and atomic task/dependency materialization.
- Added Trigger.dev 4.8.3 task/config, workspace concurrency, bounded retries, same-run lease recovery, run cancellation, durable states, event history, outputs, and estimated/reported cost separation.
- Added exact-action approval records and owner decisions, canonical payload hashing, dispatch revision idempotency, and task-level approval gates.
- Added typed tool registry with one optional workspace/project-scoped read-only brief tool, contract allowlisting, call budgets, timeouts, idempotency, and audit history. No external side-effect or generated-code execution tool is registered.
- Added project workflow panel for plan generation/review, task outputs, run state/activity, approvals, tool calls, usage estimates, cancellation, and explicit provider/dispatch blockers.
- Added additive execution migration `20261106000000_execution_layer` and documented required Trigger project/key and Sandbox configuration.
- Added the bounded website-delivery contract: up to eight static marketing pages, language tags, structured copy/metadata/SEO, design tokens with contrast checks, responsive/accessibility requirements, asset provenance, English/Arabic separate-scope flags, required specialist stages, and an exact implementation approval gate.
- Added a deterministic static HTML/CSS renderer that escapes all copy, accepts only the approved sitemap/section/language keys, limits functionality to implemented static features, and records asset-license uncertainty and content claims for owner fact-checking.
- Added a worker-only Vercel Sandbox runner with pinned browser tooling installed outside the project manifest, npm-registry-only egress during setup, deny-all egress for build/browser checks, measured phase/CPU/network duration, five viewport checks, link/metadata/asset/landmark checks, keyboard skip-link check, axe WCAG 2.1 A/AA scan, and mobile/desktop screenshots.
- Added private source archive, screenshot, and verification-report artifact versions tied to exact workflow/revision IDs; download uses authenticated private Blob routes, artifact decisions gate run success, and owner revisions are capped at two with atomic database counters.
- Added measured model/sandbox durations to usage records, distinct from token-reported, estimated, or unreported dollar cost; run-specific verification reports record generated paths, content claims, dependency changes, asset provenance, and the absence of human design review/publishing.

## Verification

- `DATABASE_URL=... npx prisma validate` passed without warnings.
- `DATABASE_URL=... npx prisma generate` passed.
- `node --check prisma/seed-operations.mjs` passed.
- Both the fresh-install migration chain and the existing-install baseline path were applied to local PostgreSQL databases; the operations migration includes workspace scope checks and a single-approved-agent-version index. Test-only databases were dropped after verification; the labeled fictional demo database is retained locally.
- Seed rerun was idempotent: one workspace/membership, 14 agent definitions/versions, zero enabled agents, and six owner-confirmed knowledge records.
- `npm run test:operations` passed 12 tests, including successful PDF/DOCX extraction, invalid definitions/scopes, local persistence, client-scope isolation, and database constraints. With `OPERATIONS_TEST_BASE_URL`, it also verifies HTTP authorization and exact client filtering. The URL guard accepts only a local `multigraphic_ai_validation_*` database.
- `npx tsc --noEmit`, `npm run lint`, and focused lint for touched admin/operations surfaces passed.
- Final command-center verification: `npx tsc --noEmit`, `npm run lint`, direct ESLint over Multigraphic AI routes/components, `npx prisma validate`, all 25 `npm run test:operations` tests, and `DATABASE_URL='' npm run build` passed. Test and schema commands used only the disposable local validation database; build had database access disabled.
- Browser checked project creation, brief save/reload, archive/restore, and the explicit missing-Gemini state (no run or fabricated plan created). Dashboard and project detail had no document overflow at 320, 375, 390, 768, and 1280px; project navigation remains internally scrollable on narrow screens. Project-filtered approvals and activity loaded their persisted empty/record states.
- Final browser pass loaded Dashboard, Approvals, Deliverables, Integrations, Usage, Activity, Agents, Knowledge, and Project workspace. A local TXT/Markdown file-import test could not be completed because the browser harness lacks Node `Buffer`/`TextEncoder` and requires a Buffer for file upload; this did not modify the project.
- `DATABASE_URL='' npm run build` passed and included the agent, knowledge, and project routes without contacting Neon.
- Browser project create/edit/reload persisted the project and updated summary in the disposable local database.
- Local browser exercised agent draft-version creation/approval/supersession, knowledge text draft creation/reload/approval/search, `401` unauthenticated access, invalid agent/scope/status responses, and 375px agent/knowledge layouts with no horizontal overflow.
- Upload errors were verified: unsupported extension returns `415`; supported file upload returns a clear `503` because private Blob credentials/store are disconnected in this environment.
- Local Multigraphic demo server runs at `http://localhost:3333` against only the labeled fictional demo database; the configured managed Neon database was not read or changed.
- The configured managed Neon database was never migrated or seeded.
- Fresh-install migrations and the existing-install legacy-baseline upgrade path both applied successfully to disposable local PostgreSQL databases; test-only databases are removed after verification while the labeled local demo is retained.
- `npm run test:operations` passed 25 tests with no skips against the disposable local database, including run idempotency, JSONB-stable approval hashes, tool-call idempotency, usage basis, plan DAG validation, exact-approval gates, scope isolation, budget checks, cancellation, and lease recovery.
- `npx tsc --noEmit`, `npm run lint`, `npx prisma validate`, and `DATABASE_URL='' npm run build` passed. A Webpack-backed browser check exercised the plan/run panel, small viewport layout, missing-provider state, exact approval display, and Trigger-not-configured blocked state without invoking Gemini or Trigger.
- The requested real Gemini smoke call used `store:false`; Google returned HTTP 503 for `gemini-3.8-flash`. Provider connectivity was confirmed, but a successful generation was not. Trigger.dev project credentials and Vercel Sandbox credentials are not configured.
- Local fictional demonstration project `DEMO - Northstar Studio Marketing Site (Fictional)` was created through the owner UI in disposable local database `multigraphic_ai_validation_website_20261106_f2c91a`; no client or commercial claims/assets were used. Its two real plan requests returned HTTP 503 after 39.7s and 48.294s. The second persisted `FAILED`, measured `durationMs: 48294`, `usageReported: false`, no plan, zero tasks, and zero usage records. The project remains `DRAFT`; no accepted plan, generated files, artifact review, revisions, or delivery are claimed.
- The separate local database `multigraphic_ai_validation_website_suite_20261106_3ab7c` was migrated/seeded for regression testing only; all 35 operations tests passed with no skips after seeding its required fixture, then that database was dropped.
- Latest `npx tsc --noEmit`, repository lint, direct ESLint over operations routes/components/lib/worker/tests, `npx prisma validate`, all 35 operations tests, and `DATABASE_URL='' npm run build` passed. The build had database access disabled.
- `npm audit --omit=dev --audit-level=critical` reports 21 production dependency findings (3 moderate, 16 high, 2 critical), including the currently installed Next.js and protobuf.js versions. No automatic dependency remediation was applied; production readiness requires a separately reviewed dependency update and regression pass.
- Real plan success and the sequence after brief analysis are blocked by Gemini 503. Actual accepted tasks, worker progress, source archive, screenshots, human review, revision, and delivery remain unexecuted because `TRIGGER_PROJECT_REF`, `TRIGGER_SECRET_KEY`, Vercel Sandbox OIDC/access credentials, `BLOB_READ_WRITE_TOKEN`, and a service database are unavailable in the app environment. The configured remote database was never read or changed.

## Not Yet Verified

- New agent creation form is not yet exercised end to end.
- Successful private Blob upload/download is externally blocked until a private store is connected.
- Semantic retrieval and OCR are intentionally unavailable.
- Trigger.dev worker dispatch/deployed recovery remains blocked until a project ref and `TRIGGER_SECRET_KEY` are configured; the SDK/task boundary and local persistence are implemented.
- Successful real-provider plan generation remains unverified because Gemini returned HTTP 503 during the smoke test.
- Generated code remains blocked until isolated Vercel Sandbox credentials/project access are configured.

## Next Session

1. Configure `TRIGGER_PROJECT_REF` and `TRIGGER_SECRET_KEY`, deploy the worker, then verify real dispatch, cancellation, retry, and crash recovery.
2. Retry the small non-stored Gemini structured smoke request when the provider is available; then run a full brief-to-plan smoke against a local test project.
3. Configure private Vercel Blob for uploads and isolated Vercel Sandbox before enabling engineering/code tasks.
4. Add a dedicated task board/readiness calculation and artifact review/QA evidence after the worker integrations are reachable.
5. Do not enable client access until individual authentication and authorization tests replace the shared admin token.

## Hardening Status (2026-11-06)

- Replaced the middleware's Node crypto dependency with Web Crypto verification and added parity tests against the Node session verifier.
- Removed the pre-authentication Bearer-header CSRF bypass. Only an exact, constant-time verified Bearer token can authorize automation; cookie mutations require exact same-origin validation.
- Added an actual streamed-byte cap for login JSON, including requests without a trustworthy `Content-Length` header.
- Added regression coverage for invalid Bearer headers on cross-origin cookie mutations and oversized streamed login bodies.
- Current verification: production build and TypeScript checks pass; Prisma schema validation passes; 55 operation tests pass and 3 Postgres persistence tests are skipped because `OPERATIONS_TEST_DATABASE_URL` was not set. No remote database was accessed.
- Current lint has three errors in existing blog/chat effects (`src/app/blog/[slug]/page.tsx` and `src/components/dynamic/LiveChatWidget.tsx`); these are outside the operations changes and remain unresolved.
- Current `npm audit --omit=dev` reports 16 findings (14 high, 2 moderate, 0 critical). Several suggested remediations require a major Prisma change; assess upgrades in a dedicated compatibility pass.
- Do not add departments or promote this to production yet. Gemini returned HTTP 503 in the last real planning attempts; Trigger project credentials, Vercel Sandbox credentials, private Blob credentials, and a disposable Postgres test URL are not available in the current app environment. See `docs/multigraphic-ai-readiness.md` for the release gates.

## Milestone A: Playable Headquarters (2026-11-06)

### Implemented

- Promoted `/admin/multigraphic-ai` to the interactive 3D Delivery floor and preserved the prior command center at `/admin/multigraphic-ai/overview`.
- Added the additive `CharacterProfile` model/migration and idempotent seed profiles for Stephan, Receptionist, Maya, Leo, Adam, Nora, and Sami. AI employees link to existing workspace agent definitions; the receptionist is a staff-only profile with no AI contract. Desk/profile edits are preserved on seed reruns.
- Added a complete three-storey cutaway: Ground · Business & People and Level 03 · Leadership & Media are visible but planned; Level 02 · Delivery is active with 10 spaces, including receptionist/brief intake, five delivery roles, owner review, kitchenette, accessible restroom, and meeting room.
- Added four navigation modes—Whole Building, Ground, Delivery, and Leadership. Ground and Leadership isolate a planned floor without employees or workflow status; Delivery retains the active navigation and staff state.
- Added ground and executive programs with reception/waiting, client/strategy meetings, HR/Agent Academy, operations/finance, knowledge library, video/music studios, kitchenettes, and restrooms, plus an exterior plaza, glass elevator, stair flights, steel/glass framing, and rooftop pergola/gardens.
- Added reception seating/counter, conference furniture, kitchenette appliances, restroom stalls/toilets/sinks, room labels, desks, chairs, plants, and procedural original character geometry with profile-driven skin, hair, clothing, accent, and accessories.
- Added click-to-move plus focused-canvas WASD/arrow movement using the shared bounded half-meter grid and wall/furniture blockers; room navigation, bounded orbit/zoom, overview reset, lower graphics preset, and reduced-motion toggle are available.
- Added an authenticated workspace-scoped headquarters API and employee panels for persisted assignment/task history, tool summaries, blockers, deliverables, and recorded usage. No chat or model status is fabricated; real state is polled only while visible.
- Added a keyboard/list alternative and an explicitly labeled, in-memory demo mode with no task/tool/artifact/usage records or workflow mutation links. Ground and Leadership floors remain planned.

### Verified

- `npx tsc --noEmit`, `npx prisma validate`, seed syntax checks, and focused ESLint passed for the new scene, workspace, API, and model.
- `tests/operations/headquarters-model.test.mjs` verifies the seven starter identities/unique desks, full facility program, task-to-character states, obstacle detours, and boundary rejection. The latest `npm run test:operations` result was 56 passed, 0 failed, and 3 skipped Postgres tests.
- `DATABASE_URL='' npm run build` passed, compiling 55/55 static pages plus the headquarters API and overview route.
- Browser verification used a loopback-only preview with a throwaway admin token and empty `DATABASE_URL`: at 1365x768 the full three-storey building, 14 planned-room plaques, and seven identities rendered; List view showed the isolated demo with no action links; Escape closed the panel; room navigation selected Project Management.
- At 375x812, the document and stage had no horizontal overflow. Tiny in-world labels are hidden while the directory keeps all 10 rooms and seven profiles accessible. The Receptionist panel has no task/action links because it has no agent contract.
- Tested all four view modes at 1365x768 and 375x812: Whole Building shows the full structure; Ground and Leadership show their planned room programs with no employees; Delivery shows ten rooms and seven profiles. The mobile selector fits without horizontal overflow.
- The real headquarters API returned the expected setup-unavailable response with the database URL empty. The remote database was not read or changed; real profile persistence is not verified until the new migration is applied to an authorized local test database.

### Remaining

- Apply and test `20261106050000_headquarters_characters` on a disposable local Postgres database, then run `operations:seed` and verify profiles survive reload and reruns.
- No live worker health signal or execution integrations are available, so real agents remain disconnected; Gemini, Trigger.dev, Sandbox, and Blob gates from `docs/multigraphic-ai-readiness.md` still apply.
- Milestone B HR editing/evaluations and activation of planned floors/departments remain unimplemented; do not mark them active.

### Run locally

Set a local `DATABASE_URL`, `ADMIN_DASHBOARD_TOKEN`, and `MULTIGRAPHIC_OWNER_EMAIL` in `.env` using `.env.example` as the template. Run `npm run operations:migrate`, then `npm run operations:seed`, then `npm run dev`; sign in and open `/admin/multigraphic-ai`. With no database, sign in and select **Explore demo** to inspect only isolated fictional profiles.

## Full Company Architecture (2026-11-06)

- Expanded the cutaway into three connected storeys with an exterior plaza, glass elevator, stair flights, steel/glass framing, rooftop pergola, and planted edges.
- Ground · Business & People is visible and planned: Reception & Waiting, Client Meeting, Knowledge Library, HR & Agent Academy, Operations & Finance, kitchenette, and restrooms.
- Level 02 · Delivery remains the only active floor and now has 10 navigable spaces: Reception/Brief Intake, Project Management, Design, Engineering, QA, Content, Owner Review, kitchenette, restroom, and project-review meeting room.
- Level 03 · Leadership & Media is visible and planned: Founder, Command, Video, Music, Strategy Meeting, kitchenette, and restrooms.
- Added a persistent Receptionist staff profile with no linked AI agent. The role is visible as Not connected and has no task/tool actions; demo mode uses the same boundary.
- Added actual reception/waiting seating, conference tables/chairs, kitchenette counters/sinks/fridge/cabinets, restroom stalls/toilets/sinks, and room-specific interior fixtures. Room labels are HTML overlays, not textures.
- Desktop browser at 1365x768 showed 14 planned-room plaques, seven staff/owner identities, the full building shell, and no document-width overflow. Mobile at 375px showed no document/stage overflow; the list remains the readable names/status alternative.
- `npx tsc --noEmit`, five headquarters model tests, focused scene/shell ESLint, and `DATABASE_URL='' npm run build` passed. Three database-backed operations tests remain skipped without `OPERATIONS_TEST_DATABASE_URL`; no configured remote database was accessed.

## Role Knowledge and Decision Summaries (2026-11-06)

- Added one structured, agent-scoped role handbook for each of the 14 AI starter contracts. Each pack contains mission, responsibilities, exclusions, required inputs, output schema, allowed tools/scopes, escalation, approvals, evaluation criteria, and evidence/response-traceability guidance.
- Seeded packs are `DRAFT` and `UNVERIFIED`; reruns skip existing role pack version 1 so owner edits/approvals are preserved. Worker retrieval remains filtered to `APPROVED` knowledge for the exact agent ID and persists selected document IDs on the agent run.
- Agent detail API/UI exposes handbook title, version, source, status, and evidence state, with a direct link to the exact agent-instruction knowledge filter.
- Worker prompts request concise high-level rationale summaries with source IDs, assumptions, checks, and unresolved questions. Private chain-of-thought is not requested or exposed.
- Added contract tests for all seeded handbooks, exact-agent scope, draft/unverified defaults, and rationale/evidence boundaries. Database persistence of seed documents remains unverified because no disposable local Postgres test URL was configured.

## Architectural headquarters and company tools (2026-11-06)

See `company-upgrade.md` for the current implementation. It supersedes the earlier visual milestone: all three floors can be explored, the directory includes sixteen owner/staff/agent profiles, and all departments have management screens. Added People & Academy profile editing, immutable-version contract checks and assignment activation, a dependency-aware task board, and an owner-accepted structured text planning workflow for department specialists. Actual media rendering, browsing, publishing, client identity, and billing remain outside these service runtimes. The existing website execution integration gates remain in effect.

## Latest checkout verification (2026-11-06)

- Added Claude Messages and OpenAI Responses adapters for structured planning/task outputs; Gemini remains supported. Claude schemas are transformed only for the provider call, then the original schema is enforced in the application. OpenAI response storage is disabled.
- Wired provider selection through project planning, task execution, agent contract checks, acceptance pricing checks, and optional portfolio chat routing. Portfolio chat remains Gemini by default and supports explicit server-only provider selection.
- Added authenticated, rate-limited manual provider connection tests and readiness states. Provider credentials remain server environment variables and are never returned or stored. Unknown/unpriced models are blocked before plan generation or task acceptance.
- Added Claude/OpenAI/Gemini key/model placeholders to `.env.example` and setup instructions in [docs/ai-provider-setup.md](ai-provider-setup.md).
- `npm run test:operations` against loopback database `multigraphic_ai_validation_copilot_20261106` and the local HTTP preview: 71 passed, 0 failed, 0 skipped. The database was migrated and seeded with the test-only `validation-owner@example.test` identity.
- `npx tsc --noEmit`, `npx prisma validate`, focused ESLint across changed dashboard/provider/worker/chat files, and mocked provider-contract tests passed.
- `DATABASE_URL='' NEXT_DIST_DIR=.next-provider-release-check npm run build -- --webpack` passed and generated all 60 static pages. No migration or seed ran during this verification.
- Browser verification confirmed the main CMS dashboard card links to Headquarters; the live API returns 16 persisted profiles. The integrations API returns 200 from the validation DB, reports all three providers unconfigured, and exposes no key fields. A separate mocked browser pass verified Claude/OpenAI success-state UI without sending real provider requests.
- The configured remote database was not read or changed. Real Claude/OpenAI/Gemini connectivity, Trigger.dev execution, Sandbox, and Blob remain unverified until their credentials/services are configured.

## Reception agent and consistency pass (2026-11-06)

- Reception & Intake is the ninth department with its own agent (`receptionist`) at the Ground-floor lobby desk; every department maps to an existing agent contract (tested).
- New HTTP test: Reception contract check → activation → intake draft → owner acceptance → task assigned to the Reception agent → run `BLOCKED` because Trigger.dev is unconfigured.
- Agent detail now reports computed `available` and `blockers` instead of a hardcoded "Not runnable" label.
- `npm run test:operations` against the local validation DB: 73 passed, 0 failed, 0 skipped. `tsc` and focused ESLint pass.
- Reception handoff: when a Reception task succeeds, the worker reads `handoffAgentKey` (constrained in the prompt to enabled, approved, non-engineering specialists) and creates an idempotent `department-planning-v1` draft for that specialist. The draft still requires owner acceptance; invalid or disabled targets are recorded as a `reception.handoff_blocked` run event. Draft creation is shared via `src/lib/operations/department-draft.ts`. This worker path is unexercised until a provider key and Trigger.dev are configured.

## Fully local mode (2026-11-06)

- Added an Ollama model provider (zero cost, structured JSON via `format`) and an in-process local worker (`MULTIGRAPHIC_LOCAL_WORKER=1`, ignored on Vercel). Worker logic is split into `runWorkflow`/`markWorkflowFailed`, shared by Trigger.dev and the local worker; cancellation aborts in-flight local model calls and records the run as canceled.
- Fixed a worker bug never hit before (nested `AgentRunKnowledge` create passed `workspaceId`, which Prisma rejects).
- Reception's `handoffAgentKey` is constrained at generation to active specialist keys.
- Verified on this machine with local Postgres + `llama3.1:8b`: Reception triaged a bakery website request (PROJECT_INQUIRY, reply draft) in 30s, auto-drafted a `project-manager` task; after acceptance the Project Manager produced requirements and open questions (54s total). Both outputs await owner review.
- `npm run test:operations`: 73 passed, 0 failed, 0 skipped (with the local worker active). `tsc`, focused ESLint and an isolated production build pass.

## Unified dashboard design system (2026-11-07)

- One shell for every `/admin/multigraphic-ai/*` route (`OperationsShell`): brand sidebar (collapsible, remembered in the `ops-nav` cookie), top bar with breadcrumb, Light/Dark switch (`ops-theme` cookie, rendered on the server so there is no flash) and New brief. Headquarters uses the same shell; its own duplicate header is hidden.
- Semantic tokens in `src/app/admin/multigraphic-ai/theme.css` (`--ops-{bg,surface,surface-raised,border,border-strong,text,muted,subtle,accent,accent-strong,on-accent,blue,violet,green,amber,red}-rgb`) per theme; Tailwind exposes them as `ops-*` colours with opacity support (`bg-ops-accent/10`). Light is the studio palette (ivory, deep green, Georgia display type); dark is the same brand in deep green-black.
- 1,087 hard-coded Tailwind colours across 15 dashboard files were converted with `scripts/ops-tokens-codemod.mjs`; Departments/People/Task board/agent-check CSS is remapped onto the tokens. People avatar initials pick dark/light ink from the background.
- Guardrail: `tests/operations/design-tokens.test.mjs` fails on any hard-coded palette class, hex or `var(--ops-*)` arbitrary colour in dashboard components, and on a missing token in either theme.
- Verified in the browser: all 16 dashboard pages pass a WCAG AA text-contrast scan in both themes with zero horizontal overflow at 1440px; key pages and Headquarters reflow at 375px and 768px with no overflow. `npm run test:operations` 82/82, `tsc` and ESLint clean.
- Not themed: the 3D headquarters scene and its inner studio panels (owned by the parallel headquarters rewrite); they keep their own palette in both themes.

## Presence, meetings, skills, documentation, analytics (2026-11-06)

- Migrations `20261107000000_meetings_skills_records` and `20261107010000_meeting_external_run` add `Meeting`, `AgentSkill`, `WorkRecord` (additive only; applied to the local validation DB).
- Presence derived from records and live signals: Available, Sleeping (Ollama model not loaded), In meeting, Working, Not available, plus review/blocked states. Wake-up action for sleeping local models.
- Meetings: multi-agent contributions, facilitator synthesis, per-attendee draft tasks requiring owner acceptance; local worker and Trigger.dev task; cancel.
- Skills with XP/levels from task completion, meeting contribution and owner approval; owner change-request comments become approved lessons retrieved on the agent's future runs.
- Automatic work records for tasks, meetings and reviews; Documentation page with search and markdown download. Analytics page per agent/department.
- Verified live on this machine (local Postgres + `llama3.1:8b`): presence showed Sleeping before and Available after the model loaded; a 3-attendee kickoff meeting showed the attendees In meeting, concluded in 89s with 3 contributions and 3 desk drafts; Leo's accepted draft completed (+XP), a change request created an approved lesson, and Leo's next run pinned that lesson and addressed RTL and mobile breakpoints. Three work records and analytics totals matched.
- `npm run test:operations`: 79 passed, 1 failed (`company-governance` room-entrance pathing) because of the parallel in-progress headquarters architecture rewrite (`headquarters-architecture.ts`, `company-catalog.ts`, `company-navigation.ts`, `HeadquartersScene.tsx`), not these changes. That rewrite also replaced the scene code that walked meeting attendees to `meetingSeat()`; `HeadquartersCharacter.meeting` and `meetingSeat()` remain available to re-attach. `tsc` reports one error inside that rewritten scene (`maxTargetRadius`).
