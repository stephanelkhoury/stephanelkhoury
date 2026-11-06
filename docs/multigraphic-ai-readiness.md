# Multigraphic AI Readiness

Updated: 2026-11-06

## Decision

Hold production enablement. The single-owner website workflow and bounded department text-planning workflow are implemented and locally verified with real persistence. Successful external model generation and durable delivery are not yet verified end to end.

## Verified

- `DATABASE_URL='' npm run build` completes on Next.js 16.4.5; middleware and all application routes compile.
- `npx tsc --noEmit` and `npx prisma validate` pass.
- The current suite reports 64 passing tests, 0 failures, and one HTTP scenario skipped when no preview URL is supplied. That HTTP scenario passes separately against the isolated preview: 65 tests covered across the two invocations. Database-backed tests ran against a freshly migrated and seeded disposable loopback-only database.
- Session signatures are checked in both Node and Edge-compatible Web Crypto paths. Regression tests cover tampered sessions, cross-origin cookie mutations with invalid Bearer headers, and login bodies exceeding the actual streamed-byte limit.
- The application has workspace-scoped records, exact approval hashes, bounded retries/revisions, private artifact routes, code execution isolated in Vercel Sandbox, and deny-all egress for website build/browser checks.

## Release Gates

- **Deployment persistence:** Local migration, artifact lineage, scope isolation, and workflow idempotency checks pass. Apply the additive migration and seed to the intended deployment database only as part of an authorized deployment.
- **Dependency risk:** `npm audit --omit=dev` reports 16 findings: 14 high, 2 moderate, and no critical. Several Prisma-related fixes cross a major-version boundary; resolve these with a reviewed compatibility plan and rerun build/tests before release.
- **Provider:** The last real Gemini planning calls returned HTTP 503. Confirm a successful structured response and persisted draft before enabling plan acceptance.
- **Durable execution:** Configure and verify the Trigger.dev project/key, worker deployment, retry/cancellation behavior, and database availability. These actions require explicit deployment authorization.
- **Isolation and storage:** Configure Vercel Sandbox credentials and private Blob storage, then verify archive/screenshot writes, authenticated downloads, and the complete owner-review/revision flow.
- **Code quality:** Repository lint currently fails on three existing React hook diagnostics in the blog detail page and live chat widget. Clear or explicitly waive these separately; they are outside the operations hardening changes.
- **Operations policy:** Define artifact/knowledge retention and deletion, Blob cleanup, backup/restore ownership, and production incident procedures before holding real client data.
- **Department boundary:** The department service permits structured text planning/drafting from supplied sources. Engineering remains in the website Sandbox workflow. Browsing, media rendering, publishing, purchases, and communications require separately defined integrations and acceptance checks.

## Scope Notes

- The admin token remains a shared single-owner bootstrap credential, not client authentication.
- The configured managed database was not read or changed during this verification.
- No production deployment, worker deployment, data migration, or external publishing was performed.
- The existing fictional demo data is not evidence of a successful generation or delivery; Gemini has not yet produced a plan in the current demo.
- The local `.env` attachment exposed database, Gemini, and admin credentials in conversation context. Rotate these credentials before further use; no values are repeated here.

## Headquarters Scope Update

- All three architectural floors are explorable. Level 02 hosts the website workflow; Ground and Leadership provide department planning and management. The Receptionist is linked to the Reception & Intake agent (ninth department).
- All nine migrations and the full seed were applied to the disposable local validation database. Sixteen persisted profiles were verified through the API and used in browser inspection of the floor and room zoom.
- Fifteen agent-specific role handbooks are seeded as draft/unverified records and visible from agent detail. Seed contract tests pass; the worker filters to approved knowledge for the exact agent ID. A live model knowledge-retrieval flow remains unverified.
- Agent responses use concise evidence-backed summaries; private chain-of-thought is not requested or exposed.
- Production readiness still requires the credential and external provider/worker/Sandbox/private Blob gates above. Local database verification does not establish live delivery readiness.
## Company upgrade scope

The architectural redesign and internal department management are implemented; see `company-upgrade.md`. Ground and Leadership are now explorable planning/management floors with fictional employee identities. A bounded structured-text department planning service is implemented alongside the website service. This does not activate browsing, rendering, publishing, payments, or other external capabilities. Contract checks are deterministic configuration checks rather than live performance evaluations. The new migration and full seed were applied only to a disposable local validation database.

## Latest checkout verification (2026-11-06)

- Claude, OpenAI Responses, and Gemini are supported by the server provider adapter. Provider selection is available for project planning and task workers; the public chat remains Gemini by default and can be changed through `PORTFOLIO_CHAT_PROVIDER`. OpenAI responses use `store: false`.
- The Integrations page provides explicit connection tests and persists provider status without storing secrets. The browser flow was verified with mocked responses only; live providers were not called.
- Final `npm run test:operations` against loopback-only `multigraphic_ai_validation_copilot_20261106` with `OPERATIONS_TEST_BASE_URL`: 71 passed, 0 failed, 0 skipped. The database was freshly migrated/seeded with the test-only owner fixture. Earlier skipped-run results above are historical.
- `npx tsc --noEmit`, `npx prisma validate`, and focused ESLint over the changed dashboard/provider/chat/worker files pass. `DATABASE_URL='' NEXT_DIST_DIR=.next-provider-release-check npm run build -- --webpack` passes and generates all 60 pages.
- Browser checks verified the main CMS entry card, 16 persisted employee profiles, and the integrations API against the local validation DB. Claude/OpenAI/Gemini report unconfigured, with no connection records or credential fields. A mocked provider response verified button success UI; no live provider call was made.
- Set matching provider keys, model IDs, and `MULTIGRAPHIC_DEFAULT_MODEL_PROVIDER` in both web and Trigger.dev environments. See [docs/ai-provider-setup.md](ai-provider-setup.md). Configure a database and run the authorized migrations/seed before using persisted operations.
- The configured remote database was not accessed, and no live model request, worker run, Sandbox job, or Blob operation was performed. Rotate credentials previously exposed in the conversation before further use.
