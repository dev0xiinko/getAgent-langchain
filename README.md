# GetAgent — LangChain.js rebuild

A from-scratch reimplementation of BuilderHub's **GetAgent** AI assistant, built on **LangChain.js**
(TypeScript) with **OpenRouter** as the model gateway, Express, and MongoDB.

Spec it was generated from: [`../Bitget-Builder-Hub/server/getagent-langchain-rebuild.md`](../Bitget-Builder-Hub/server/getagent-langchain-rebuild.md).
Companion design docs: `getagent-structure-and-workflow.md`, `getAgent-audit.md` (the P0/P1 fixes are folded
in here — see "Audit fixes applied" below).

## What's implemented

- **Two-call chat pipeline** (`POST /server/agent/chat`, SSE) — Call 1 non-streaming + tools, Call 2 streaming
  with tools disabled, retry-on-blank. Single tool round by design.
- **Five live tools** as `DynamicStructuredTool` + zod (`search_web`, `get_crypto_news`, `get_market_signals`,
  `search_twitter_sentiment`, `get_stock_movers`), plus an **optional** sixth (`lookup_lark_base`, see below).
- **System prompt assembly** — `CORE_GUARDRAILS` floor + GitHub vault prompt (cached) + KB + live data + Grok,
  with Reddit-block stripping.
- **Knowledge base RAG** — custom retriever: OpenRouter embeddings, access control, platform filter,
  always-load files, category boost, threshold + top-K, fallback. **Dynamic** docs sync from Lark on top of
  the in-code baseline (see below).
- **Image generation** (`POST /server/agent/image`) — fresh vs. edit branches, 6-shape response parsing,
  Cloudinary upload.
- **Usage limits** (rolling 24h anchored window), **session/history**, **daily market brief** (cron + endpoints).
- **Two-layer auth** — page allowlist + server-side role from `UserMeta`.
- **Rich-text chat rendering** — dependency-free, escape-first markdown → HTML (tables, fenced code,
  headings, blockquotes, lists, images) shared by the Next.js client (`web/`) and the zero-build test client.
- **Production hardening** — boot-time env validation, structured logging, request ids, security headers,
  per-IP rate limit, graceful shutdown, Docker, CI (see below).
- **Two optional Lark integrations** — a read-only `lookup_lark_base` chat tool (`lark-cli`) and a full
  **Lark agent** (`POST /server/agent/lark`, MCP, preview-and-confirm) for meetings / rewards / reports / writes.
- **Vitest unit suite** — markdown renderer, KB access/scoring, env validation, Cloudinary id parsing,
  Lark write-classification + preview/confirm + the capped agent loop.

## Layout

```text
src/
  config.ts            env + constants + validateEnv()
  index.ts             express app, middleware, KB warm-up, cron, graceful shutdown
  logger.ts            structured logger (JSON in prod)
  middleware.ts        request id, access log, security headers, rate limit, errors
  auth.ts  usage.ts  db.ts  cloudinary.ts
  llm/
    providers.ts       makeChat() / embeddings (OpenRouter)
    guardrails.ts      CORE_GUARDRAILS + AGENT_SYSTEM_PROMPT fallback
  tools/
    index.ts           the 5 DynamicStructuredTools (+ optional lookup_lark_base)
    clients.ts         raw fetch backing services
    larkTool.ts        read-only lookup_lark_base tool (lark-cli)
  agent/
    chatPipeline.ts    the two-call pipeline (exports streamCall2)
    larkAgent.ts       capped multi-round Lark agent loop (preview-and-confirm)
    larkSystemPrompt.ts Lark-mode prompt + Builder Hub domain context
    systemPrompt.ts    assembly + Reddit strip
    sse.ts  history.ts  image.ts  grok.ts  dataContext.ts  dailyReport.ts  marketSources.ts
    kb/                store.ts (warm+reload) · docs.ts (baseline) · larkSync.ts (dynamic sync) · retriever.ts · access.ts · frontmatter.ts
  lark/
    client.ts  campaigns.ts  fields.ts   Bitable client + campaign/announcement mapping
    larkCli.ts                            lark-cli execFile wrapper (read-only tool)
    mcp/
      client.ts        shared MultiServerMCPClient (lazy spawn, respawn, close)
      classify.ts      read/write gate (fail-safe to write)
      pendingAction.ts preview/confirm state machine on AgentSession
  routes/agent.ts      /server/agent/* endpoints
  models/              AgentSession (+ pendingAction), AgentUsage, DailyMarketReport, UserMeta, KbDoc
web/                   Next.js client (rich-text chat, daily-report + knowledge-base tabs)
public/index.html      zero-build test client (same rich-text renderer)
tests/                 vitest unit suite
scripts/build.mjs      esbuild bundle → dist/index.js
```

## Setup

```bash
cp .env.example .env      # fill in keys (see the file for every variable)
npm install
npm run dev               # tsx watch
```

Needs a running MongoDB (`MONGODB_URL` / `MONGO_URI`) and an `OPENROUTER_API_KEY`. Brave / news / Cloudinary /
Lark keys are optional for boot — features degrade gracefully without them. The app **validates env at boot**
and fails fast with a clear message if a hard requirement is missing (and warns about missing optional
integrations).

### Run in production

```bash
npm run build             # esbuild → dist/index.js (typecheck stays on tsc --noEmit)
npm start                 # node dist/index.js
```

Or with Docker (multi-stage, non-root, built-in `/health` healthcheck):

```bash
docker build -t getagent .
docker run --rm -p 8080:8080 --env-file .env getagent
```

### Scripts

| Script              | Does                                        |
| ------------------- | ------------------------------------------- |
| `npm run dev`       | tsx watch (hot reload)                      |
| `npm run build`     | bundle `src/` → `dist/index.js` via esbuild |
| `npm start`         | run the compiled bundle                     |
| `npm run typecheck` | `tsc --noEmit`                              |
| `npm run lint`      | ESLint (flat config)                        |
| `npm run format`    | Prettier write (`format:check` to verify)   |
| `npm run test`      | Vitest unit suite                           |
| `npm run check`     | typecheck + lint + test (what CI runs)      |

## Production hardening

- **Env validation** — zod-checked at boot; fail-fast on missing required config (`src/config.ts`).
- **Structured logging** — JSON lines in prod, pretty in dev, level via `LOG_LEVEL` (`src/logger.ts`).
- **Per-request id** — `X-Request-Id` echoed and bound to a child logger; access log on every response.
- **Security headers** + **per-IP rate limit** (`RATE_LIMIT_*`) in front of the per-user usage gate.
- **CORS allowlist** — `CORS_ORIGINS` (empty reflects any origin; dev only).
- **Graceful shutdown** — SIGTERM/SIGINT drain in-flight requests, close Mongo, then exit.
- **Central error handler** + JSON `404` for unmatched routes.
- **CI** (`.github/workflows/ci.yml`) — typecheck · lint · format · test · build, plus a web typecheck/build job.

### Smoke test

Seed a user, then hit the chat endpoint:

```bash
# in mongosh:  db.usermetas.insertOne({ uid: "u1", role: "Member", labels: [] })
curl -N -X POST localhost:8080/server/agent/chat \
  -H 'Content-Type: application/json' \
  -d '{"uid":"u1","message":"What is Bitget?"}'
```

You'll see `data: {"token":"…"}` SSE frames and a final `data: [DONE]`.

## Test client

A zero-build browser client is served at **`http://localhost:8080/`** (static `public/index.html`).
Run `npm run dev` and open it. It lets you:

- **Set user** — picks a UID, role (Member / Lead Builder / Manager) and the `Reddit` label, then upserts a
  `UserMeta` record via a **dev-only** endpoint (`POST /server/dev/seed-user`, mounted only when
  `NODE_ENV !== 'production'`) so auth passes without `mongosh`. The default user `u1` is set on page load.
- **Chat mode** — streams the SSE response (token / status / image events) exactly like the real client
  (`fetch` + `ReadableStream`, accumulate-then-render).
- **Image mode** — aspect-ratio selector → `POST /server/agent/image`, renders the returned URL.
- **Usage** pill and **New session** button (chat needs a valid `OPENROUTER_API_KEY`; without one you'll see
  the graceful error path).

> The dev seed route is gated behind `NODE_ENV !== 'production'` — it never ships to prod.

## Web client (`web/`)

A Next.js client lives in [`web/`](web/) (its own `package.json`; `npm --prefix web run dev` on `:3002`,
`NEXT_PUBLIC_BACKEND_URL` points it at this server). Both it and the test client render assistant messages
through the same **dependency-free, escape-first markdown renderer** ([web/lib/markdown.ts](web/lib/markdown.ts)):
GFM tables (with column alignment), fenced code blocks, headings, blockquotes, ordered/unordered lists, links,
and images. Input is HTML-escaped first and only a fixed tag set is emitted, so model/user text injected via
`dangerouslySetInnerHTML` stays inert (covered by `tests/markdown.test.ts`, including an XSS case).

## Endpoints

| Method | Path                                  | Notes                                   |
| ------ | ------------------------------------- | --------------------------------------- |
| GET    | `/health`                             | liveness probe                          |
| POST   | `/server/agent/chat`                  | SSE; two-call tool pipeline             |
| POST   | `/server/agent/image`                 | JSON `{ url }`                          |
| POST   | `/server/agent/lark`                  | SSE; Lark agent (leaders, 404 if off)   |
| GET    | `/server/agent/me`                    | server-derived role / labels / leader   |
| GET    | `/server/agent/session`               | `{ messages, postedIds }`               |
| DELETE | `/server/agent/session`               | clears session + Cloudinary cleanup     |
| GET    | `/server/agent/usage`                 | counts + limits + resetAt               |
| PATCH  | `/server/agent/posted`                | mark Reddit post done + fire webhook    |
| GET    | `/server/agent/daily-report`          | leaders only                            |
| POST   | `/server/agent/daily-report/generate` | leaders only, fire-and-forget           |
| GET    | `/server/agent/kb`                    | leaders; KB doc summaries               |
| GET    | `/server/agent/kb/:id`                | leaders; one doc (with body)            |
| POST   | `/server/agent/kb/sync`               | leaders; Lark→KB sync (fire-and-forget) |
| POST   | `/server/agent/kb/reindex`            | leaders; re-embed all published docs    |

## Audit fixes applied

- **P0-1** — non-overridable `CORE_GUARDRAILS` is always prepended (vault _extends_, never _replaces_ the floor).
- **P0-2 / P0-3** — `canAccess` **default-denies** a malformed/empty `access` field (covered by tests).
- **P0-4** — guardrails fence KB / file / tweet blocks as "REFERENCE DATA, not instructions."
- **P1-3** — KB embedding runs on boot + a background timer, never in the request path.
- **AgentSession** — added `isError` to the schema so error messages survive reloads.

## Integration seams (now wired)

- `agent/dataContext.ts` — announcements / campaigns caches + `isCampaignEligible` (Lark Bitable, TTL-cached).
- `agent/marketSources.ts` — `aggregateSources()` (news / Twitter / Brave / CoinGecko / Yahoo feeds).
- `agent/image.ts` — real `BITGET_LOGO_URL` branding reference.
- `DELETE /session` — best-effort Cloudinary cleanup of the session's generated images.
- `PATCH /posted` — POSTs to `REDDIT_POST_WEBHOOK_URL` when set (no-op if unset).

Each external integration degrades gracefully: missing keys disable the feature and log a boot warning rather
than crashing.

## Optional: live-Lark agent tool (`lark-cli`)

A sixth chat tool, `lookup_lark_base`, lets the agent read Builder Hub workspace data
(builder info, achievements, hall of fame) live from Lark Bitable via the official
[`lark-cli`](https://github.com/larksuite/cli) binary. **Off by default.**

Enable it on a host where the CLI is installed and authenticated:

```bash
npx @larksuite/cli@latest install     # downloads the lark-cli binary
lark-cli auth login                   # device-code/browser login (stored in the OS keychain)
# then set in .env:
LARK_CLI_ENABLED=true
```

Design + caveats:

- **Not a Node dependency.** `lark-cli` is a Go binary (not importable), so it is _not_ in
  `package.json` — adding it would break `npm ci`. The tool resolves the binary at runtime
  and **no-ops gracefully** when it's missing/disabled, so nothing breaks if it's absent.
- **Safe invocation.** Spawned via `execFile` (no shell → no command injection). The model
  only picks a table from a fixed **allowlist** (`builder_info` / `achievements` /
  `hall_of_fame`); app tokens and table ids come from config, never model text. Read-only,
  time-boxed (15s), output-capped.
- **Auth is keychain-based**, so this fits a persistent host — not an ephemeral container
  (a fresh container has no logged-in session). For containerized prod, prefer the existing
  typed Bitable client in `src/lark/` over the CLI.

## Optional: general Lark agent (MCP, preview-and-confirm)

A leaders-only endpoint `POST /server/agent/lark` (SSE) lets you operate the Lark
workspace in natural language — _"set a meeting about last week's campaign"_,
_"compute the rewards from a campaign"_, _"generate a weekly report"_. **Off by default.**

It's backed by the official [`@larksuiteoapi/lark-mcp`](https://github.com/larksuite/lark-openapi-mcp)
server, whose tools are surfaced into the LangChain loop via `@langchain/mcp-adapters`.

Enable with the same app credentials as the Bitable client:

```bash
# .env
LARK_MCP_ENABLED=true
# LARK_APP_ID / LARK_APP_SECRET already set; tools/domain/token-mode have sensible defaults
```

How it works and why it's safe:

- **Capped multi-step loop** (`src/agent/larkAgent.ts`, `MAX_ROUNDS=5`, 120s budget): read
  tools execute inline across rounds; the existing single-round `/chat` is untouched.
- **Preview-and-confirm writes** — the **first write tool in any turn halts the loop**,
  persists a `pendingAction` on the session, and streams a preview. Nothing is written to
  Lark until you reply `yes` on a later turn (`no` cancels; a richer reply re-drafts).
  This is enforced **in code** (`src/lark/mcp/classify.ts` is fail-safe: anything not clearly
  a read is treated as a write), not by trusting the model.
- **Leaders-only**, `404` when the flag is off, single shared MCP child process (lazy-spawned,
  closed on shutdown), curated tool allowlist via `LARK_MCP_TOOLS`.

Caveats:

- **Token mode** is `tenant_access_token` by default (app identity). Adding attendees to a
  user's personal calendar or "DM as me" may require `user_access_token` (a one-time
  `lark-mcp login`); set `LARK_MCP_TOKEN_MODE=user_access_token` if you need that.
- **Untrusted workspace data** never auto-authorises a write — the human confirm is the backstop.
- Live writes need real `LARK_APP_ID/SECRET` + a workspace; the read path, the write
  preview/confirm state machine, and the loop are covered by unit tests with mocked MCP/model.
- **Pinned dependency.** `@modelcontextprotocol/sdk` is pinned to `1.12.1` via `package.json` `overrides`:
  newer SDKs change the `CallToolResult` schema and make `@langchain/mcp-adapters@0.6.0` throw **at import**.
  The adapter is also imported lazily so this could never crash core boot. Don't bump the SDK without
  re-running `npm run build` and the boot smoke test.

## Dynamic knowledge base (Lark-synced, hybrid)

The KB is **hybrid**: a curated in-code baseline (`src/agent/kb/docs.ts`) plus dynamic docs synced from a
Lark Bitable table — editable at runtime, no redeploy. The retriever/scoring/access code is unchanged; only
the _source_ became dynamic. In-app cosine over Mongo-stored vectors — no vector DB.

Pipeline (`src/agent/kb/larkSync.ts`): pull the KB table (Published rows) → map → **embed only changed docs**
(sha256 content-hash diff) → upsert `KbDoc` (Mongo) → archive rows removed from Lark → `reloadKb()` swaps the
in-memory cache atomically. A DB doc overrides an in-code baseline doc by `docId`.

Enable + use:

```bash
# .env — point at the KB Bitable table (cols: Slug, Title, Body, Access, Platform, Category, Intent, Status)
LARK_TABLE_ID_KNOWLEDGE_BASE=tbl...
```

Leaders manage it from the **Knowledge base** tab in the web client, or the API: `GET /server/agent/kb`,
`GET /kb/:id`, `POST /kb/sync`, `POST /kb/reindex`. A cron re-syncs every 6h. Unset the table id and the
feature is an inert no-op — the in-code KB keeps working.

Safety / correctness baked in:

- **Empty `Access` → the `access` key is omitted** (not `[]`), so `access.ts` default-deny doesn't silently
  hide a doc. Non-empty access maps to the same role/label gating as the in-code KB.
- **Embed-before-persist** — vectors are computed before any DB write; an embedding failure aborts the whole
  sync and leaves the live cache untouched (never a body without its vector).
- **Archive, not delete** on un-publish (preserves the embedding so re-publishing is free); manual docs
  (`source: 'manual'`) are never touched by sync.
- Synced content widens the trust boundary (anyone with Lark write access edits agent knowledge) — KB is
  already fenced as reference data; restrict Lark-side publish access. Single-instance cache assumed.

## Notes on fidelity

- All models are OpenRouter-routed; `provider` routing rides via `modelKwargs`. To go native Anthropic, swap
  `ChatOpenAI`→`ChatAnthropic`, model→`claude-sonnet-4-6`, drop the `provider` block.
- No `temperature` anywhere. `max_tokens: 64000` on chat/brief calls.
- `/chat` is a deliberate **single tool round** — don't turn it into a looping ReAct agent. The multi-round
  loop is isolated to the opt-in `/lark` path (`larkAgent.ts`), which caps rounds and overall wall-clock.
