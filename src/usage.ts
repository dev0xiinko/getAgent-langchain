import { AgentUsage } from "./models/AgentUsage";
import { AGENT_CHAT_LIMIT, AGENT_IMAGE_LIMIT, AGENT_WINDOW_MS } from "./config";

type Kind = "chat" | "image";

const limitFor = (k: Kind) => (k === "chat" ? AGENT_CHAT_LIMIT : AGENT_IMAGE_LIMIT);
const countField = (k: Kind) => (k === "chat" ? "chatCount" : "imageCount");

export interface GateResult {
  ok: boolean;
  resetAt: number | null;
}

/**
 * Pre-request gate. The window is ANCHORED at windowStart (not sliding):
 * once 24h since windowStart elapses, the next successful request opens a fresh window.
 */
export async function checkUsage(uid: string, kind: Kind): Promise<GateResult> {
  const doc = await AgentUsage.findOne({ uid }).lean();
  const now = Date.now();
  const inWindow = !!doc?.windowStart && now - doc.windowStart < AGENT_WINDOW_MS;
  if (!doc || !inWindow) return { ok: true, resetAt: null };

  const count = (doc as any)[countField(kind)] ?? 0;
  if (count >= limitFor(kind)) return { ok: false, resetAt: doc.windowStart + AGENT_WINDOW_MS };
  return { ok: true, resetAt: doc.windowStart + AGENT_WINDOW_MS };
}

/** Post-success increment (non-leaders only). Resets the window if it has expired. */
export async function incrementUsage(uid: string, kind: Kind): Promise<void> {
  const doc = await AgentUsage.findOne({ uid });
  const now = Date.now();
  const inWindow = !!doc?.windowStart && now - doc.windowStart < AGENT_WINDOW_MS;
  const field = countField(kind);

  if (doc && inWindow) {
    (doc as any)[field] = ((doc as any)[field] ?? 0) + 1;
    await doc.save();
  } else {
    await AgentUsage.updateOne(
      { uid },
      {
        $set: { windowStart: now, chatCount: kind === "chat" ? 1 : 0, imageCount: kind === "image" ? 1 : 0 },
      },
      { upsert: true },
    );
  }
}

export async function getUsage(uid: string) {
  const doc = await AgentUsage.findOne({ uid }).lean();
  const now = Date.now();
  const inWindow = !!doc?.windowStart && now - doc.windowStart < AGENT_WINDOW_MS;
  return {
    chatCount: inWindow ? (doc?.chatCount ?? 0) : 0,
    imageCount: inWindow ? (doc?.imageCount ?? 0) : 0,
    chatLimit: AGENT_CHAT_LIMIT,
    imageLimit: AGENT_IMAGE_LIMIT,
    resetAt: inWindow && doc ? doc.windowStart + AGENT_WINDOW_MS : null,
  };
}
