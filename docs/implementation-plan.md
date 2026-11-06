# Implementation Plan

## Milestone 1: Internal foundation

- [x] Add workspace/client/project/brief and extensible agent/workflow/task/artifact/approval/usage/integration persistence models.
- [x] Add additive PostgreSQL migrations and idempotent owner/starter-definition seed.
- [x] Add owner- and workspace-scoped project CRUD APIs.
- [x] Add operations navigation, project list/detail/create/edit, and agent registry views.
- [x] Verify typecheck, lint, production build, and actual project create/edit/reload persistence against a disposable local PostgreSQL database.

## Milestone 2: Knowledge and agent governance

- [x] Add six knowledge scopes, immutable versions, source/evidence/status metadata, and exact owner links.
- [x] Add private document upload, bounded PDF/DOCX/text extraction, keyword search, and explicit failure states.
- [x] Add complete agent contracts, seven working role definitions, seven draft capabilities, and version history.
- [x] Add draft-to-approved transitions, single-approved-version constraint, and run-to-agent/knowledge version pins.
- [x] Verify local database persistence, client-scope isolation, authorization, invalid definitions, and PDF/DOCX extraction.

## Milestone 3: Briefs and planning

- [x] Project brief editor and persisted brief snapshot in each plan run.
- [x] Bounded website plan generation, stage/DAG/scope/contrast/agent validation, owner edit/accept flow, and exact accepted-plan hash.
- [x] Materialize ordered tasks/dependencies only after acceptance; persist run/task events, approvals, estimates, usage, and outputs.
- [ ] Dedicated task board and readiness calculation.
- [x] Project workflow definition and owner-facing run status/activity/usage UI without fabricated runs.

## Milestone 4: Durable execution

- [x] Integrate Trigger.dev SDK v4 task/config and deterministic dispatch/idempotency boundaries.
- [x] Add one bounded website-delivery plan/worker and Gemini provider adapter; real plan output remains externally blocked by observed Gemini 503 responses.
- [x] Persist task/run transitions, retries, cancellation, leases, usage estimates, approvals, events, and audit records.
- [ ] Configure the Trigger.dev project and smoke-test deployed worker recovery/resume.
- [x] Do not substitute simulation for unavailable providers, workers, sandbox, or storage; preserve honest blocked/failed states.

## Milestone 5: Review and deliverables

- [x] Add private artifact storage/version management and exact run/revision provenance (runtime requires private Blob credentials).
- [x] Add exact artifact-version owner review and a two-revision, run-bound owner loop (dispatch requires Trigger credentials).
- [x] Add isolated static-site build, five-width browser checks, links/metadata/assets/landmark checks, keyboard skip-link check, axe WCAG 2.1 A/AA scan, desktop/mobile screenshots, and verification report (runtime requires Vercel Sandbox credentials).
- [ ] Complete an end-to-end live brief-to-reviewed-deliverable run after Gemini, Trigger.dev, Vercel Sandbox, private Blob, and service database configuration.

Code execution is implemented only for this bounded static marketing-site service and only inside Vercel Sandbox. No e-commerce, payment processing, authenticated application, deployment, or publishing task is enabled.

## Milestone 6: Client access and operations

- Replace shared-token identity with individual authentication and enforce membership roles.
- Add client-specific access, invitations, integration management, usage reporting, retention, and audit review.
- Reassess deployment, privacy, and cost controls before any public SaaS expansion.
