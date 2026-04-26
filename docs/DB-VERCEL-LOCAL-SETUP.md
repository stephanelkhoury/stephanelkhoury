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
