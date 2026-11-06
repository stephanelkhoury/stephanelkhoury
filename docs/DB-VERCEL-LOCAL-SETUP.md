# Database + Vercel + Local Setup Guide

This document is the single source of truth for provisioning and syncing the portfolio database across local and Vercel.

## 1) Architecture Overview

- **ORM**: Prisma
- **Database**: Neon PostgreSQL
- **Runtime**: Next.js Route Handlers
- **Seed source**: `prisma/seed.mjs`
- **Schema**: `prisma/schema.prisma`

The app uses these main tables:

- `ContentBlock`
- `Project`
- `SupportedSystem`
- `Certificate`
- `ChatSession`
- `ChatMessage`

## 2) Environment Variables

### Local files

- `.env.local` → used by Next.js local runtime
- `.env` → used by Prisma CLI commands

### Required keys

- `DATABASE_URL`
- `DATABASE_URL_UNPOOLED`
- `ADMIN_DASHBOARD_TOKEN`
- `GEMINI_API_KEY`
- `BLOB_READ_WRITE_TOKEN`

Additional Postgres compatibility keys are included in `.env` and `.env.local`:

- `PGHOST`, `PGHOST_UNPOOLED`, `PGUSER`, `PGDATABASE`, `PGPASSWORD`
- `POSTGRES_URL`, `POSTGRES_URL_NON_POOLING`, `POSTGRES_USER`, `POSTGRES_HOST`, `POSTGRES_PASSWORD`, `POSTGRES_DATABASE`, `POSTGRES_URL_NO_SSL`, `POSTGRES_PRISMA_URL`

## 3) Local First-Time Setup

```bash
npm install
npm run prisma:generate
npm run prisma:push
npm run prisma:seed
npm run dev
```

App URL: `http://localhost:3333`

Admin URL: `http://localhost:3333/admin`

## 4) Full Clean Reset (Destructive)

This drops and recreates the DB schema, then reseeds all application data.

```bash
npm run prisma:reset
```

Use this when you want a fully clean baseline.

## 5) Seed Behavior

`prisma/seed.mjs` does the following in one transaction:

1. Clears existing records in all app-owned tables
2. Inserts:
   - dynamic homepage blocks
   - portfolio projects
   - supported systems
   - certificates
   - one initial chat session and messages

This guarantees a predictable baseline dataset for local and production.

## 6) Vercel Sync Workflow

### Apply DB and app env vars (one-time or when rotating secrets)

```bash
npx vercel env ls
```

Ensure at minimum `Production` and `Development` have:

- `DATABASE_URL`
- `DATABASE_URL_UNPOOLED`
- `ADMIN_DASHBOARD_TOKEN`
- `GEMINI_API_KEY`
- `BLOB_READ_WRITE_TOKEN`

### Deploy

```bash
npx vercel --prod --yes
```

### Verify endpoints

```bash
curl -s -o /tmp/admin.json -w '%{http_code}' https://www.stephanelkhoury.com/api/admin/content -H 'Authorization: Bearer <ADMIN_DASHBOARD_TOKEN>'
curl -s -o /tmp/chat.json -w '%{http_code}' https://www.stephanelkhoury.com/api/chat -H 'content-type: application/json' --data '{"message":"Hello"}'
```

Expected: HTTP `200`.

## 7) Troubleshooting

### `DATABASE_URL is not configured`

- Add DB vars in Vercel and local `.env.local` / `.env`
- Redeploy with `npx vercel --prod --yes`

### Chat API returns fallback message

- DB is healthy, but Gemini provider request failed (quota/key/permissions)
- Verify `GEMINI_API_KEY` in Vercel
- Check provider quota/status

### Prisma cannot connect

- Verify Neon host/user/password/db in `DATABASE_URL`
- Ensure `sslmode=require` is present for Neon

## 8) Security Checklist

- Rotate `ADMIN_DASHBOARD_TOKEN` if it was ever exposed in logs
- Keep `.env` and `.env.local` out of Git (already ignored)
- Avoid sharing raw DB URLs publicly

## 9) Multigraphic AI Operations

Set `MULTIGRAPHIC_OWNER_EMAIL` in `.env` to the owner email for the private operations workspace. Keep `.env` local and do not paste database URLs or tokens into chat, source code, or browser code.

For an existing database that already contains the portfolio CMS tables from the previous `db push` setup, but has no Prisma migration history, mark only the matching legacy baseline as applied once. Then apply the operations migration and seed:

```bash
npm run prisma:generate
npm run operations:baseline:existing
npm run operations:migrate
npm run operations:seed
```

Do not run `operations:baseline:existing` if the legacy tables are missing, the schema does not match the baseline, or Prisma migration history already exists. In those cases, inspect the database before proceeding.

For a brand-new local database, deploy both ordered migrations, then seed:

```bash
npm run prisma:generate
npm run operations:migrate
npm run operations:seed
```

The first migration creates the existing portfolio tables; the second adds Multigraphic AI models and scope constraints. Never use a baseline command to bypass a failed migration. Do not run `prisma:reset` against a shared or production database.

The private workspace is at `/admin/multigraphic-ai`; the starter registry is at `/admin/multigraphic-ai/agents`. Project CRUD and workflow routes require an active owner membership. Agent execution uses immutable approved agent versions; starter definitions remain disabled until explicitly enabled and approved.

## 10) Knowledge and Agent Registry

Private knowledge uploads accept UTF-8 TXT, Markdown, CSV, PDF, and DOCX up to 4 MiB. PDF extraction is limited to 100 pages and extracted text to 250,000 characters. Uploads require a connected **private** Vercel Blob store; text-only records/search work without Blob. Unsupported, invalid, empty, oversized, and parser-failed uploads return explicit errors. OCR and semantic retrieval are not configured.

Agent saves create immutable draft versions. Only the owner can approve; approval supersedes the previous approved version. The first execution provider is Gemini; only explicitly allowlisted tools are available. Seeded company/owner knowledge is owner-provided background, not imported portfolio or confidential client history.

The focused suite can run without a database; its integration test is skipped unless an explicitly local validation URL is supplied. To run persistence/scope/authorization checks, create and seed a disposable local database named `multigraphic_ai_validation_*`, start the local app against it with a test-only admin token, then run:

```bash
OPERATIONS_TEST_DATABASE_URL="postgresql://.../multigraphic_ai_validation_<suffix>?schema=public" \
OPERATIONS_TEST_BASE_URL="http://localhost:3333" \
npm run test:operations
```

The test rejects non-local hosts and database names outside that prefix. Never use a managed or production URL for this variable.

## 11) Durable Workflow Execution

The additive migration `20261106000000_execution_layer` adds run/task lifecycle states, idempotency keys, lease/retry/cancellation fields, budget estimates, exact action approvals, events, and tool-call policy metadata. `npm run operations:migrate` applies all pending migrations for either a fresh database or a correctly baselined existing database.

Plan generation is a non-stored Gemini Interactions request. The API validates the full schema and dependency DAG, persists a draft, and does not create tasks until the owner accepts the plan. Accepted task execution is dispatched through Trigger.dev and is blocked explicitly when Trigger is not configured.

Configure `TRIGGER_PROJECT_REF` and `TRIGGER_SECRET_KEY` in the app environment. Deploy the task directory using the Trigger.dev CLI for that project. Configure `DATABASE_URL` and `GEMINI_API_KEY` in the Trigger.dev task environment as well; do not copy credentials into workflow records, task payloads, or browser code. Trigger.dev development still requires a real project and account configuration.

The current provider smoke test reached Gemini but returned HTTP 503 for `gemini-3.8-flash`; successful plan generation has not yet been verified. No silent provider fallback is enabled. Usage records store token counts and list-price cost estimates separately from provider-reported cost; reported cost remains null when the provider does not supply it.

Software-engineering tasks remain `AWAITING_INPUT` until isolated Vercel Sandbox execution is provisioned. Do not execute generated code in Next.js route handlers or on the ordinary Trigger worker host. No deploy/publish/email/purchase tool is registered. External side effects require a future exact-action approval and isolated tool integration.
