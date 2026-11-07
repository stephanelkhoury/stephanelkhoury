# Sign-in and access control

People sign in with **email and password**. The old single shared password is gone for people; the static `ADMIN_DASHBOARD_TOKEN` remains only as the automation API token (Bearer header) and as the signing secret when `AUTH_SECRET` is not set.

## Roles

| Role | Operations workspace | Team page | Website CMS |
| --- | --- | --- | --- |
| OWNER | full | manages everyone except other owners | yes |
| ADMIN | full | invites members/clients, changes members | yes |
| MEMBER | full | no | no |
| CLIENT | blocked until the client portal exists | no | no |

The owner account cannot be changed from the Team page. Only the owner can create or change admins.

## Sessions

- Cookie `admin_session` (`v2.<token>.<expiry>.<signature>`), HttpOnly, SameSite=Lax, Secure in production, 7 days.
- The database stores only a SHA-256 hash of the token (`AuthSession`), so a database leak cannot be replayed.
- `src/proxy.ts` checks the signature at the edge; the API checks the database row, so sign-out, "sign out everywhere", disabling a person and password changes end sessions at once.
- Mutating requests with a cookie must come from the same origin.

## Protections

- Passwords: scrypt, at least 10 characters with letters and a number.
- Five wrong attempts lock the account for 15 minutes; per-IP rate limits apply to every auth endpoint.
- Unknown email and wrong password return the same message and take similar time; the reset form never reveals which emails exist.
- Two-factor (TOTP, authenticator app). The secret is stored encrypted (AES-256-GCM). A password alone never creates a session when two-factor is on.
- Reset and invite links are single use (reset 1 hour, invite 72 hours); using one signs out every session.

## Pages and APIs

- `/admin/sign-in`, `/admin/forgot-password`, `/admin/reset-password` (English and Arabic).
- `/admin/multigraphic-ai/account`: change password, two-factor, active sessions.
- `/admin/multigraphic-ai/team`: invite, change role, reset link, disable or enable.
- `/api/admin/auth/{login,logout,session,sessions,forgot,reset,account}` and `/api/admin/team[/userId]`.

## Setup

1. Apply migrations (`prisma migrate deploy`), then seed.
2. Set the owner password: `npm run auth:set-password -- info@stephanelkhoury.com`. It writes a random password to `.owner-credentials.txt` (git-ignored, never printed).
3. Email is optional. Without `SMTP_*`, the Team page shows invite and reset links to copy. For Gmail use `smtp.gmail.com`, port 465 and an app password.

## Local by default

`npm run dev` now runs `scripts/commands/local.sh`: a local PostgreSQL database, Ollama and the in-process worker, so nothing consumes cloud database hours. `npm run dev:neon` keeps the old cloud-connected behaviour. `npm run cmd:test` runs lint, type check and every test against a separate disposable database and server.
