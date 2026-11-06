# AI Provider Setup

Multigraphic AI supports Gemini, Anthropic Claude, and OpenAI's Responses API for coding-capable models. Provider credentials are read only by server and Trigger.dev processes. They are never accepted from the browser, returned by the integrations API, or stored in the workspace database.

## Local configuration

Copy the placeholder entries from `.env.example` into the ignored `.env.local` file and set the API keys there. Do not send API keys in chat or commit them.

```dotenv
MULTIGRAPHIC_DEFAULT_MODEL_PROVIDER="anthropic"
ANTHROPIC_API_KEY=""
ANTHROPIC_MODEL="claude-sonnet-5-5"
OPENAI_API_KEY=""
OPENAI_CODEX_MODEL="gpt-6.1-sol"
GEMINI_API_KEY=""
GEMINI_MODEL="gemini-3.8-flash"
```

The provider on an approved agent version overrides `MULTIGRAPHIC_DEFAULT_MODEL_PROVIDER`. If the server default is unset, both the web process and Trigger worker use Gemini. Model IDs may be set per agent version or by the provider-level model variables above.

The public portfolio chatbot remains on Gemini by default. To route it through another provider, set `PORTFOLIO_CHAT_PROVIDER` to `anthropic` or `openai` and optionally set `PORTFOLIO_CHAT_MODEL`. The chat route applies a 4,000-character message limit and a trusted-client rate limit before sending visitor text to the selected provider. Configure `RATE_LIMIT_TRUSTED_IP_HEADER` only when the named header is set by your trusted reverse proxy; if unset, rate limiting uses a shared bucket.

The default OpenAI model uses the Responses API, which supports structured outputs. It is an OpenAI-hosted coding-capable model, not a local Codex CLI process. The application still runs website source builds only inside the separately configured Vercel Sandbox.

## Fully local mode (no cloud compute)

Everything runs on this machine: local PostgreSQL, a local Ollama model, and an in-process worker inside `next dev`. Nothing is billed per request or per database compute hour.

1. Use a local database in `.env.local`, e.g. `DATABASE_URL="postgresql://<you>@127.0.0.1:5432/<db>?schema=public"`, then `npm run operations:migrate` and `npm run operations:seed`.
2. Start Ollama (`ollama serve`) and pull a model sized for your RAM (`ollama pull llama3.1:8b` for 16 GB).
3. Add to `.env.local`:

```dotenv
MULTIGRAPHIC_DEFAULT_MODEL_PROVIDER="ollama"
OLLAMA_BASE_URL="http://127.0.0.1:11434"
OLLAMA_MODEL="llama3.1:8b"
MULTIGRAPHIC_LOCAL_WORKER="1"
```

4. Run `npm run dev`, activate agents, and accept a task. The worker runs accepted plans in the dev server process; runs stop if the server stops (restart and re-accept). `MULTIGRAPHIC_LOCAL_WORKER` is ignored on Vercel. Small local models are slower and less precise than hosted models; outputs still pass schema validation and owner review.

## Enable deployment and workers

Set the same provider keys, model variables, and `MULTIGRAPHIC_DEFAULT_MODEL_PROVIDER` in the deployment environment and the Trigger.dev task environment. A key configured only for the Next.js web process does not configure the durable worker, and mismatched default-provider settings can route planning and execution to different providers. Keep the existing `DATABASE_URL`, Trigger.dev, Vercel Sandbox, and private Blob configuration requirements in place.

Open **Multigraphic AI → Integrations** and use **Test connection** for each configured provider. Each manual test sends one small structured request and may incur a small provider charge. The operations database and migrations must be ready first; otherwise the request is rejected before contacting the provider. A successful test is recorded without recording the key. A configured key alone is not evidence that the remote provider is reachable.

## Cost estimates

Known default model IDs have application-side token estimates based on the public provider pricing pages. Unknown model IDs are blocked before plan generation or task acceptance so an unpriced call cannot bypass run budget checks. Estimates use standard input/output rates and are not invoices; provider billing can differ due to caching, context length, account pricing, or future price changes.

Official references: [Claude structured outputs](https://platform.claude.com/docs/en/build-with-claude/structured-outputs), [Claude pricing](https://platform.claude.com/docs/en/about-claude/pricing), [OpenAI Responses API](https://developers.openai.com/api/reference/resources/responses/methods/create), [OpenAI structured outputs](https://developers.openai.com/api/docs/guides/structured-outputs), and [OpenAI pricing](https://developers.openai.com/api/docs/pricing).