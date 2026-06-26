import type {
  AttachedFile,
  ChatFrame,
  ChatMessage,
  DailyReport,
  KbDocFull,
  KbDocSummary,
  Me,
  Usage,
} from "./types";

const BASE = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8080";
const api = (path: string) => `${BASE}/server/agent${path}`;

/** A typed error carrying the HTTP status + the backend's `error` code. */
export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    public resetAt?: number,
  ) {
    super(code);
  }
}

async function asJson<T>(res: Response): Promise<T> {
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, body?.error ?? `http_${res.status}`, body?.resetAt);
  return body as T;
}

// ── Auth / identity ───────────────────────────────────────
export const getMe = (uid: string) => fetch(api(`/me?uid=${encodeURIComponent(uid)}`)).then(asJson<Me>);

/**
 * DEV-ONLY: create/update a UserMeta so a fresh uid can pass auth. Hits the
 * `/server/dev` route, which the backend mounts only when NODE_ENV !== production.
 */
export const seedUser = (body: { uid: string; role?: string; labels?: string[]; team?: string }) =>
  fetch(`${BASE}/server/dev/seed-user`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }).then(asJson<{ ok: true; user: unknown }>);

// ── Session ───────────────────────────────────────────────
export const getSession = (uid: string) =>
  fetch(api(`/session?uid=${encodeURIComponent(uid)}`)).then(
    asJson<{ messages: ChatMessage[]; postedIds: string[] }>,
  );

export const clearSession = (uid: string) =>
  fetch(api(`/session`), {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ uid }),
  }).then(asJson<{ ok: true }>);

// ── Usage ─────────────────────────────────────────────────
export const getUsage = (uid: string) =>
  fetch(api(`/usage?uid=${encodeURIComponent(uid)}`)).then(asJson<Usage>);

// ── Image generation ──────────────────────────────────────
export const generateImage = (body: {
  uid: string;
  prompt: string;
  aspectRatio?: string;
  // Both are base64 data-URL strings (the backend calls .startsWith on them).
  referenceImage?: string;
  attachedFile?: string;
}) =>
  fetch(api(`/image`), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }).then(asJson<{ url: string }>);

// ── Daily report (leaders) ────────────────────────────────
export const getDailyReport = (uid: string) =>
  fetch(api(`/daily-report?uid=${encodeURIComponent(uid)}`)).then(asJson<{ report: DailyReport | null }>);

export const generateDailyReport = (uid: string) =>
  fetch(api(`/daily-report/generate`), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ uid }),
  }).then(asJson<{ ok: true; message: string }>);

// ── Dynamic knowledge base (leaders) ──────────────────────
export const listKb = (uid: string) =>
  fetch(api(`/kb?uid=${encodeURIComponent(uid)}`)).then(
    asJson<{ larkSyncEnabled: boolean; docs: KbDocSummary[] }>,
  );

export const getKbDoc = (uid: string, id: string) =>
  fetch(api(`/kb/${encodeURIComponent(id)}?uid=${encodeURIComponent(uid)}`)).then(asJson<{ doc: KbDocFull }>);

export const syncKb = (uid: string) =>
  fetch(api(`/kb/sync`), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ uid }),
  }).then(asJson<{ ok: boolean; message: string }>);

export const reindexKb = (uid: string) =>
  fetch(api(`/kb/reindex`), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ uid }),
  }).then(asJson<{ ok: boolean; message: string }>);

/**
 * Stream a chat turn. POSTs to the SSE endpoint and yields parsed frames as they
 * arrive. EventSource can't POST a body, so we read the response body manually and
 * split on the SSE record separator (`\n\n`). `: ping` heartbeats and `[DONE]` are
 * handled internally; the generator simply ends on `[DONE]` or stream close.
 */
export async function* streamChat(
  body: { uid: string; message: string; attachedFiles?: AttachedFile[] },
  signal?: AbortSignal,
): AsyncGenerator<ChatFrame> {
  const res = await fetch(api(`/chat`), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new ApiError(res.status, err?.error ?? `http_${res.status}`, err?.resetAt);
  }
  if (!res.body) throw new ApiError(500, "no_stream");

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    // SSE records are separated by a blank line.
    let sep: number;
    while ((sep = buffer.indexOf("\n\n")) !== -1) {
      const record = buffer.slice(0, sep);
      buffer = buffer.slice(sep + 2);

      for (const line of record.split("\n")) {
        if (!line.startsWith("data:")) continue; // skip `: ping` comments
        const data = line.slice(5).trim();
        if (data === "[DONE]") return;
        try {
          yield JSON.parse(data) as ChatFrame;
        } catch {
          /* ignore malformed frame */
        }
      }
    }
  }
}
