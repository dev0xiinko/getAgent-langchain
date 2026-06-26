/**
 * Preview-and-confirm state machine for Lark writes.
 *
 * A drafted write is persisted on the session as `pendingAction` (one at a time) and
 * is NOT executed until the user confirms on a later turn. Confirmation detection is
 * deliberately conservative: a bare "yes"/"no" short-circuits; anything richer
 * ("yes but at 4pm") is handed to a small model classifier so we never misfire a
 * real workspace write.
 */
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { makeChat } from "../../llm/providers";
import { AgentSession, LARK_SESSION_ID, type PendingAction } from "../../models/AgentSession";

export const PENDING_TTL_MS = 10 * 60_000;

export type Reply = "CONFIRM" | "CANCEL" | "MODIFY" | "UNRELATED";

// Bare confirmations/cancellations only — anything with extra words defers to the model.
const CONFIRM_EXACT =
  /^(y|yes|yep|yeah|confirm(ed)?|approve(d)?|do it|send it|go ahead|ok(ay)?|sure|proceed|please do)\s*[.!]*$/i;
const CANCEL_EXACT = /^(n|no|nope|cancel|stop|abort|never\s?mind|don'?t|do not|discard)\s*[.!]*$/i;

/** True once a pending action is older than the TTL and should be ignored. */
export function isPendingStale(createdAt: Date | string | number, now = Date.now()): boolean {
  return now - new Date(createdAt).getTime() > PENDING_TTL_MS;
}

/** Fast path: a bare yes/no resolves without a model call. Returns null if ambiguous. */
export function quickResolve(message: string): Reply | null {
  const m = message.trim();
  if (CONFIRM_EXACT.test(m)) return "CONFIRM";
  if (CANCEL_EXACT.test(m)) return "CANCEL";
  return null;
}

/** Render a drafted write as a short, human-readable preview block. Pure. */
export function formatPreview(toolName: string, args: Record<string, unknown>): string {
  const get = (k: string) => args[k];
  const line = (label: string, v: unknown) =>
    v == null || v === "" ? "" : `• ${label}: ${typeof v === "string" ? v : JSON.stringify(v)}`;

  let body: string;
  if (toolName.includes("calendar") && toolName.includes("event")) {
    body = [
      line("Summary", get("summary")),
      line("Start", (get("start_time") as any)?.timestamp ?? get("start_time")),
      line("End", (get("end_time") as any)?.timestamp ?? get("end_time")),
      line("Description", get("description")),
    ]
      .filter(Boolean)
      .join("\n");
  } else if (toolName.includes("message") && toolName.endsWith("_create")) {
    body = [line("To", get("receive_id")), line("Type", get("msg_type")), line("Content", get("content"))]
      .filter(Boolean)
      .join("\n");
  } else if (toolName.includes("record")) {
    body = [line("Fields", get("fields") ?? get("records"))].filter(Boolean).join("\n");
  } else {
    body = "```json\n" + JSON.stringify(args, null, 2).slice(0, 1500) + "\n```";
  }
  if (!body.trim()) body = "```json\n" + JSON.stringify(args, null, 2).slice(0, 1500) + "\n```";

  return `**Proposed action — please confirm**\n_${toolName}_\n${body}\n\nReply **yes** to do it, or **no** to cancel.`;
}

/** Model classifier for non-trivial replies to a proposed action. */
export async function classifyReply(message: string, preview: string): Promise<Reply> {
  const model = makeChat({ streaming: false });
  const res = await model.invoke(
    [
      new SystemMessage(
        "You classify a user's reply to a proposed workspace action. Answer with exactly one word: " +
          "CONFIRM (do it as drafted), CANCEL (don't), MODIFY (do it but with changes), or UNRELATED (the reply is about something else).",
      ),
      new HumanMessage(`PROPOSED ACTION:\n${preview}\n\nUSER REPLY:\n${message}\n\nOne word:`),
    ],
    { timeout: 15_000 },
  );
  const t = String(res.content ?? "").toUpperCase();
  if (t.includes("CONFIRM")) return "CONFIRM";
  if (t.includes("CANCEL")) return "CANCEL";
  if (t.includes("MODIFY")) return "MODIFY";
  return "UNRELATED";
}

// ── Persistence ──────────────────────────────────────────
// Lark pending writes live on the reserved Lark session document, isolated from
// the user's chat conversations.
export async function setPending(
  uid: string,
  action: { toolName: string; args: unknown; preview: string },
): Promise<void> {
  await AgentSession.updateOne(
    { uid, sessionId: LARK_SESSION_ID },
    { $set: { pendingAction: { ...action, createdAt: new Date() } } },
    { upsert: true },
  );
}

export async function clearPending(uid: string): Promise<void> {
  await AgentSession.updateOne({ uid, sessionId: LARK_SESSION_ID }, { $set: { pendingAction: null } });
}

/** Return the pending action if present and not stale; clears + returns null if stale. */
export async function getFreshPending(uid: string): Promise<PendingAction | null> {
  const session = await AgentSession.findOne({ uid, sessionId: LARK_SESSION_ID }).lean();
  const p = session?.pendingAction as PendingAction | null | undefined;
  if (!p) return null;
  if (isPendingStale(p.createdAt as Date)) {
    await clearPending(uid);
    return null;
  }
  return p;
}
