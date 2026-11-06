# Multigraphic AI Product

Updated: 2026-11-06

## Product

Multigraphic AI is Stephan El Khoury's private virtual company workspace. The headquarters is the primary way to explore departments and employee agents; focused HTML panels handle project setup, knowledge, approvals, and deliverable review. A character is a visual representation of persisted company state, not evidence that a model is working.

## Owner and initial team

The first release is for Stephan as owner. Initial fictional starter identities include Stephan (owner) and 15 AI employees, one per agent contract, covering nine departments including Reception & Intake. Their appearance and assigned rooms/desks are editable data, not depictions of real people. The Receptionist is linked to the Reception & Intake agent: it classifies requests, recommends a department handoff and drafts replies; it does not send messages or book meetings. Future client access remains out of scope until individual identity and authorization replace the shared admin credential.

## First service

The bounded service remains static marketing-website delivery: brief, structured plan, owner approval, specialist outputs, isolated implementation, verification, revision, and artifact review. Publishing is a separate approved action. Commerce, payments, authenticated products, media rendering, and other departments remain planned until individually scoped and verified.

## Milestone A status

Implemented in the current repository: a three-storey cutaway with **Whole Building**, **Ground**, **Delivery**, and **Leadership** view buttons. Only Level 02 · Delivery is interactive. The active 10-room floor has Reception/Brief Intake, Project Management, Design, Engineering, QA, Content, Owner Review, kitchenette, accessible restroom, and project-review meeting room. The planned Ground floor includes visitor reception/waiting, client meeting, knowledge library, HR/Agent Academy, operations/finance, kitchenette, and restrooms. The planned Leadership/Media floor includes Founder, Command, Video, Music, strategy meeting, kitchenette, restrooms, and a rooftop garden. Persisted character profiles, procedural employee figures, click-to-move and WASD/arrow movement, obstacle-aware routing, bounded orbit/zoom, quick room selection, employee panels, and an accessible directory are implemented. Planned floors have no active agent work or fabricated status.

An isolated, opt-in demo supports visual exploration without PostgreSQL. It is visibly labeled, uses only static fictional profiles, and contains no task, message, tool, artifact, or usage records. The real directory requires the additive migration and `operations:seed`.

## Current limits

Gemini, Trigger.dev, Vercel Sandbox, private Blob, and the regular service database are not connected in the current local app environment. Real agent execution, task cancellation, artifact review, and live work states cannot be demonstrated here. Employees with no persisted task remain `Not connected`; there are no synthetic conversations, activity, or completion claims.

## Run locally

1. Configure a local `DATABASE_URL`, `ADMIN_DASHBOARD_TOKEN`, and `MULTIGRAPHIC_OWNER_EMAIL` in `.env` from `.env.example`.
2. Apply the migrations with `npm run operations:migrate` and seed the owner, agents, and characters with `npm run operations:seed`.
3. Start the app with `npm run dev`, sign in, and open `/admin/multigraphic-ai`.
4. If the service database is intentionally disconnected, choose **Explore demo**. Demo profiles are in-memory and cannot create or change company records.