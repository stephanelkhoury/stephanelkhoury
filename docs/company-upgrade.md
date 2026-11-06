# Headquarters and company upgrade

Updated: 2026-11-06

## Implemented

The headquarters now opens on a full-size architectural Delivery floor, with an orthographic camera, room focus, pan/orbit/zoom, individual floor exploration, and a whole-building cutaway. The palette is warm ivory, sage, oak, and dark green. Rooms include glass partitions with actual doorway gaps, lounges, bookcases, workstations, meeting tables, kitchenettes, restrooms, video lighting/camera fixtures, and audio equipment. Characters use more proportionate bodies, editable appearance, and clickable HTML identity labels. A non-3D directory remains available. Movement footprints are shared with the rendered partition segments; tests verify routes to every Delivery entrance.

All nine departments have a workspace directory. All fifteen seeded agent contracts have fictional employee profiles alongside the owner: sixteen profiles total. Reception & Intake is linked to the Receptionist profile on the Ground-floor lobby; reseeding updates only that profile's agent link and preserves its other edits. People & Academy edits names, titles, departments, communication style, appearance, and validated room/desk pairs through authenticated, audited APIs.

Agent Academy persists deterministic contract checks against an exact immutable version. These checks validate contract structure, the registered-tool allowlist, tool budgets, provider compatibility, and evidence/escalation policy. They are configuration checks, not evidence of live agent performance. Enabling assignment requires a passing check for the approved version. Provider and worker readiness remain separate runtime gates.

The task board shows persisted tasks with dependency, approval, assignment, and cancellation readiness. Task completion cannot be dragged or manually invented.

## Two service boundaries

1. `website-delivery-v1`: the existing bounded static marketing website workflow. Engineering runs only in Vercel Sandbox. No publishing, commerce, payments, or authenticated products are added.
2. `department-planning-v1`: structured text planning/drafting for approved, enabled specialists, using supplied brief and approved scoped reference material. Preparing the one-task draft is deterministic and makes no model call. Owner acceptance pins the approved agent version, checks the saved brief and budget, materializes tasks transactionally, and dispatches through the existing durable worker. Results become private text artifacts with source references and exact-version owner review. This service performs no external browsing, rendering, communication, purchases, or publishing. Engineering is explicitly excluded from this text workflow.

Media departments can plan edits and production requirements; actual video/audio rendering still needs dedicated integrations. Research uses supplied sources; it does not claim live browsing. Individual client authentication, billing, external publication, semantic retrieval, OCR, retention automation, backups, and incident operations are not implemented by this upgrade.

## Workflow corrections

- Freshly persisted task outputs now update the worker's handoff map, so later tasks can consume results from the same worker invocation.
- Accepted runs pin exact agent-version IDs instead of silently taking a newer approved contract at execution time.
- Implementation approvals include the website specification in the hashed action payload.
- Accepted plan hashes cover the actual persisted dependency-ordered plan.
- Review completion checks every artifact version in the current revision. A rejected or changes-requested version cannot be bypassed by approving the last remaining pending item.
- The Sandbox browser server sends correct raster-image MIME types.
- Agent edits strip version metadata from editable contract fields.

## Setup and verification

Apply `20261106060000_agent_evaluations` with `npm run operations:migrate`, then run `operations:seed` against the intended local database. No remote migration is part of this upgrade. The seed provisions profiles and draft role handbooks while preserving edits and keeping starter agents disabled.

`NEXT_DIST_DIR` permits isolated local build/preview output, avoiding interference with an existing dev server. Its `.next-*` directories are ignored.

Verification uses a freshly initialized loopback-only Postgres instance and `multigraphic_ai_validation_hq_20261106`; external providers are disabled. The API scenario exercises unauthorized access, room/desk rejection, profile persistence, exact-version contract checks, activation, deterministic task draft, acceptance, dispatch-blocked persistence, repeated-request idempotency, task board output, and cancellation. Tests do not call a model or pretend to deliver generated work.

Verification passed: production build with `npm run build -- --webpack`, TypeScript, focused operations lint, 64 operation tests against the disposable database, and the separate HTTP scenario (65 tests covered with no failures). The default Turbopack build was blocked by the local sandbox's CSS-processing port restriction; the documented Webpack fallback completed successfully. Browser inspection covers the architectural floor and room zoom; mobile visual inspection was not completed. Successful Gemini/Trigger/Sandbox/Blob execution remains a separate integration gate. The isolated preview and Postgres instance were stopped after verification.

## Further architectural redesign

The current physical building design is documented in [headquarters-architecture.md](headquarters-architecture.md): aligned floors, a shared stair/lift core, entrance forecourt, role-specific room fit-outs, physical materials, and spatial/plan and daylight/evening controls. That document also records the remaining final visual-verification limits.
