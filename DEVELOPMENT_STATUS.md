# Development Status

> Snapshot for the team. Last updated **2026-06-26**. For the full architecture write-up see
> [`docs/reports/overview.md`](docs/reports/overview.md); for setup/run details see [`README.md`](README.md).
> This file is the "where are we / what's left / how do I help" view.

## TL;DR

The core GetAgent rebuild is **feature-complete and green**. Everything in the original spec is wired —
chat pipeline, tools, KB/RAG, image generation, usage limits, auth, daily report, and the two Lark
integrations. The remaining work is mostly **operational** (real keys, live-service integration testing,
deployment) rather than new feature code.

| Gate | Status |
|------|:------:|
| `npm run typecheck` (`tsc --noEmit`) | ✅ pass |
| `npm run test` (vitest) | ✅ 51 tests / 10 files pass |
| CI (`.github/workflows/ci.yml`) | ✅ typecheck · lint · format · test · build + web build |
| Node | `>=20` (developed on v24) |

## What works today

- **Two-call chat pipeline** — `POST /server/agent/chat` (SSE): Call 1 non-streaming + tools, Call 2
  streaming tools-off, retry-on-blank. Single tool round by design. — [`src/agent/chatPipeline.ts`](src/agent/chatPipeline.ts)
- **5 live tools** (+ optional `lookup_lark_base`) as `DynamicStructuredTool` + zod — [`src/tools/index.ts`](src/tools/index.ts)
- **System-prompt assembly** — `CORE_GUARDRAILS` floor + GitHub vault prompt + KB + live data + Grok — [`src/agent/systemPrompt.ts`](src/agent/systemPrompt.ts)
- **KB / RAG** — custom retriever (OpenRouter embeddings, access control, always-load, threshold + top-K),
  baseline docs + dynamic Lark sync — [`src/agent/kb/`](src/agent/kb/)
- **Image generation** — `POST /server/agent/image`, fresh/edit branches, Cloudinary upload, Bitget logo — [`src/agent/image.ts`](src/agent/image.ts)
- **Usage limits / session / daily market brief** (cron + endpoints)
- **Two-layer auth** — page allowlist + server-side role from `UserMeta`
- **Lark integrations** — read-only `lookup_lark_base` tool **and** the full Lark agent
  (`POST /server/agent/lark`, MCP, preview-and-confirm) — [`src/agent/larkAgent.ts`](src/agent/larkAgent.ts), [`src/lark/mcp/`](src/lark/mcp/)
- **Web client** (`web/`, Next.js, port 3002) + zero-build test client (`public/index.html`)
- **Production hardening** — boot env validation, structured logging, request ids, security headers,
  per-IP rate limit, graceful shutdown, Docker, CI

> ℹ️ The "Seams still wired as TODO" list in `docs/reports/overview.md` §8 is now **stale** — those seams
> (`aggregateSources`, `isCampaignEligible`, `BITGET_LOGO_URL`, session-image Cloudinary cleanup, Reddit
> webhook) are all implemented. Treat this file as the current truth.

## Status by area

| Area | State | Notes |
|------|:-----:|-------|
| Chat pipeline | ✅ Done | Covered by design, not yet load-tested |
| Tools (5 + lark lookup) | ✅ Done | Backing services degrade gracefully without keys |
| KB baseline + retriever | ✅ Done | Unit-tested (access + scoring) |
| KB dynamic Lark sync | 🟡 Needs live test | Logic done + unit-tested; not yet run against a real base |
| Image endpoint | ✅ Done | Needs real Cloudinary creds to exercise end-to-end |
| Daily market report | 🟡 Needs live test | `aggregateSources()` wired; quality depends on real data keys |
| Auth / usage limits | ✅ Done | Unit-tested |
| Lark agent (MCP, write path) | 🟡 Needs live test | Preview/confirm + capped loop unit-tested; MCP spawn needs real Lark app creds |
| Web client | 🟡 In progress | Builds + typechecks; UX polish / wiring review pending |
| Deployment | 🟡 Not done | Dockerfile + CI ready; no environment provisioned yet |

Legend: ✅ done · 🟡 in progress / needs real-key validation · ⬜ not started

## Known gaps / things to validate with real credentials

These are **not** code TODOs — the code paths exist. They just haven't been exercised against live services:

- [ ] **Lark MCP** — spawn + read/write classify + preview/confirm against a real Lark app (creds in `.env`).
      Note `classify.ts` **fails safe to "write"** (treats ambiguous as write → requires confirm).
- [ ] **KB Lark sync** — run `larkSync.ts` against the real base; confirm frontmatter/access mapping.
- [ ] **Daily report data quality** — run with real Brave / news / CoinGecko / Yahoo keys; the placeholder-
      stripping in `dailyReport.ts` hides missing data, so verify the brief is actually populated.
- [ ] **Cloudinary** image upload + session-delete cleanup with real creds.
- [ ] **Reddit webhook** (`PATCH /server/agent/posted`) against the real endpoint.
- [ ] **Load / concurrency** behavior of the SSE pipeline under multiple users.

## Getting started (co-dev onboarding)

```bash
cp .env.example .env      # fill in keys — see the file for every variable
npm install
npm run dev               # tsx watch → http://localhost:8080  (open it for the test client)
```

**Hard requirements to boot:** a running MongoDB (`MONGODB_URL` / `MONGO_URI`) and `OPENROUTER_API_KEY`.
Everything else (Brave / news / Cloudinary / Lark) is optional — the app validates env at boot, fails fast
on missing required config, and warns about missing optional integrations.

Web client:

```bash
cd web && npm install && npm run dev    # → http://localhost:3002
```

Before pushing, run the same gate CI runs:

```bash
npm run check    # typecheck + lint + test
```

## Suggested next priorities

1. **Provision a staging environment** (Mongo + the optional keys) and run the live-integration checklist above.
2. **Lark agent end-to-end** — highest-risk surface (it can write). Validate the read/write gate and the
   preview-and-confirm flow against a real base before exposing it.
3. **Web client wiring review** — confirm it talks to every endpoint (chat SSE, daily report, knowledge base tabs).
4. **Deployment** — wire the Docker image into a host; the `/health` endpoint is ready for a healthcheck.

## Where to look

| If you want to… | Start at |
|-----------------|----------|
| Understand the request flow | [`docs/reports/overview.md`](docs/reports/overview.md) |
| Run / configure | [`README.md`](README.md) + [`.env.example`](.env.example) |
| Change chat behavior | [`src/agent/chatPipeline.ts`](src/agent/chatPipeline.ts), [`src/agent/systemPrompt.ts`](src/agent/systemPrompt.ts) |
| Add/adjust a tool | [`src/tools/index.ts`](src/tools/index.ts), [`src/tools/clients.ts`](src/tools/clients.ts) |
| Work on Lark | [`src/agent/larkAgent.ts`](src/agent/larkAgent.ts), [`src/lark/mcp/`](src/lark/mcp/) |
| HTTP surface | [`src/routes/agent.ts`](src/routes/agent.ts) |
