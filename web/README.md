# GetAgent Web

A standalone Next.js chat frontend for the GetAgent backend. It runs as its own
app and talks to the agent over HTTP/SSE — it does **not** depend on the server's
built-in `public/` test page.

## Setup

```bash
cd web
npm install
cp .env.local.example .env.local   # set NEXT_PUBLIC_BACKEND_URL to the agent's URL
npm run dev                        # http://localhost:3002
```

The backend (the Express server in `../`) must be running and reachable at
`NEXT_PUBLIC_BACKEND_URL` (default `http://localhost:8080`). CORS is already open
on the backend, so cross-origin works out of the box.

## Auth

Enter a Bitget **UID** on the connect screen. The backend derives role/labels from
its `UserMeta` record (never trusted from the client). In dev, use the
**“Seed a user”** panel to create a UID with a chosen role via the `/server/dev`
route (mounted only when `NODE_ENV !== production`).

## Features (full parity)

- **Chat** — streaming responses (SSE), markdown + images, tool-status line
- **Image** — generation mode with aspect ratio + reference-image attach
- **Session** — history loads on connect; “New session” clears it
- **Usage** — live chat/image counts vs limits
- **Daily report** — leaders only: view today's market brief and trigger generation

## Contract

All calls go to `${NEXT_PUBLIC_BACKEND_URL}/server/agent/*`. The typed client lives
in `lib/api.ts`; `streamChat()` reads the SSE body manually (EventSource can't POST).
