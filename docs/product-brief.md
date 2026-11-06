# Multigraphic AI Product Brief

## Purpose

Multigraphic AI is Stephan El Khoury's internal digital-services operations platform. It turns a business brief into a structured project, coordinates specialist capabilities, executes supported work, reviews outputs, and asks Stephan for approval before delivery.

The initial product is a private owner-operated workspace inside the existing Multigraphic website application. Client-facing accounts and self-service SaaS administration are future options, not first-release requirements.

## Owner and users

- Stephan El Khoury is the workspace owner and final decision-maker.
- The first release is accessed through the existing protected admin area.
- Future users may include collaborators and client contacts, isolated by workspace, membership, and client relationships.

## Service capabilities

Capabilities are extensible and may be combined or run independently: project management; strategy and research; brand and UX/UI design; software engineering; QA, accessibility, and performance; SEO and content; media production; and business operations.

## Virtual headquarters

The building is the primary owner interface. The first release shows a complete three-storey cutaway: Ground · Business and People, Level 02 · Delivery, and Level 03 · Leadership and Media, plus the rooftop garden. Reception/waiting, meeting rooms, a knowledge library, HR/Agent Academy, operations/finance, kitchenettes, restrooms, Founder office, Command room, video/audio studios, and strategy meeting spaces are represented architecturally. Only the Level 02 Delivery floor is active; all other departments are marked planned. Employee state in the world is derived from persisted task records; movement and animation are client-only. A non-3D directory is available for keyboard and small-screen use. See `world-design.md` and `agent-system.md` for the implemented slice and its state boundary.

## Knowledge and agent governance

Knowledge is separated into company, owner-preference, client, project, agent-instruction, and lessons-learned scopes. Each version records source, status, evidence status, creator, and applicable client/project/agent. Retrieval selects one explicit scope; client records are never mixed. Uploaded content is untrusted reference data, not an instruction source.

Agent definitions are versioned contracts containing department, purpose, responsibilities, exclusions, required inputs, output schema, allowed tools, knowledge scopes, model configuration, budgets, limits, escalation, approvals, and evaluation criteria. Saving creates a new draft version; historical versions are not edited. Capabilities without configured providers/tools remain visibly unavailable, including video/audio production.

## Initial website-delivery workflow

The first operational service is bounded to static marketing websites with up to eight pages, content, metadata, responsive behavior, accessibility requirements, and verified owner-provided raster assets. It does not include e-commerce, payment processing, authenticated applications, publishing, or deployment; those requests are flagged for separate scope.

Brief analysis → owner-reviewed requirements/assumptions → owner-approved UX/UI and content specification → isolated implementation → build and browser/accessibility verification → up to two owner-requested revisions → owner approval of exact artifact versions → private source archive, screenshots, and verification report.

Generated code runs only in an isolated Vercel Sandbox microVM. Browser tools are installed outside the project manifest with temporary npm-registry-only egress; the VM switches to deny-all egress before build and browser checks. Publishing requires separate explicit approval and is not part of this service.

Independent tasks may run concurrently. A dependent task cannot become ready until its upstream output is accepted. Agents prepare work; they do not approve or deliver it on Stephan's behalf.

## First milestone acceptance

- Protected operations navigation with a playable first-floor headquarters as the primary route and the previous command center retained under Overview.
- Persisted workspace-scoped character profiles for the owner, receptionist, and five initial delivery-agent identities.
- Click-to-move and keyboard movement constrained by room and furniture blockers, with a list-based alternative.
- Persistent, workspace-scoped project creation, editing, listing, and detail views.
- An idempotently seeded registry of clearly marked, disabled starter capability definitions.
- Explicit loading, empty, missing-configuration, and failure states.
- No seeded clients, completed projects, revenue, activity, or agent runs.
- Product/data decisions and local setup documented in this repository.

## Service limitations and external readiness

The bounded website plan, static renderer, isolated build/browser runner, artifact versioning, owner review, and two-revision workflow are implemented in code. End-to-end generation/delivery remains unavailable until Gemini returns a valid plan, Trigger.dev is configured and deployed, Vercel Sandbox credentials are supplied to the worker, private Blob is connected, and a database is configured for the service. Missing integrations remain explicit; no simulation is presented as work.

Client access, billing, public deployment/publishing, arbitrary application code, e-commerce, payment processing, and authenticated products remain outside this first service. Semantic retrieval and OCR are also not connected; knowledge search remains exact-scope keyword matching over extracted text.
