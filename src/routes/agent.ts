import { Router, type Request, type Response } from "express";
import { authUser, isAllowlisted, isLeaderRole } from "../auth";
import { checkUsage, incrementUsage, getUsage } from "../usage";
import { runChat } from "../agent/chatPipeline";
import { generateImage } from "../agent/image";
import { uploadImageToCloudinary, deleteImagesByUrl } from "../cloudinary";
import { persistImageMessages } from "../agent/history";
import { runDailyReport, getDailyReport } from "../agent/dailyReport";
import { runLarkChat } from "../agent/larkAgent";
import { larkMcpReady } from "../lark/mcp/client";
import { runKbSync, reindexKb } from "../agent/kb/larkSync";
import { AgentSession, LARK_SESSION_ID } from "../models/AgentSession";
import { KbDoc } from "../models/KbDoc";
import { config } from "../config";
import { logger } from "../logger";

export const agentRouter = Router();

/** Pull image delivery URLs out of a session's persisted messages (`![alt](url)`). */
function imageUrlsFromSession(messages: Array<{ content?: string }> = []): string[] {
  const urls: string[] = [];
  for (const m of messages) {
    const match = /!\[[^\]]*\]\((https?:[^)]+)\)/.exec(m.content ?? "");
    if (match) urls.push(match[1]);
  }
  return urls;
}

/** Resolve uid → authed user, enforcing both access layers. Returns null + sends the response on failure. */
async function gateUser(req: Request, res: Response, uid?: string) {
  if (!uid) {
    res.status(400).json({ error: "uid required" });
    return null;
  }
  if (!isAllowlisted(uid)) {
    res.status(403).json({ error: "not_allowed" });
    return null;
  }
  const user = await authUser(uid);
  if (!user) {
    res.status(403).json({ error: "no_access" });
    return null;
  }
  return user;
}

/** Conversation used when a client doesn't supply a sessionId (e.g. the zero-build test client). */
const DEFAULT_SESSION_ID = "default";

/** Validate a client-supplied conversation id; rejects empties and the reserved Lark id. */
function normalizeSessionId(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const v = value.trim();
  if (!v || v.length > 128 || v === LARK_SESSION_ID) return null;
  return v;
}

// ── POST /server/agent/chat  (SSE) ───────────────────────
agentRouter.post("/chat", async (req: Request, res: Response) => {
  const { uid, sessionId, message, attachedFiles } = req.body ?? {};
  if (!message || typeof message !== "string" || !message.trim()) {
    return res.status(400).json({ error: "message required" });
  }
  const sid = normalizeSessionId(sessionId) ?? DEFAULT_SESSION_ID;
  const user = await gateUser(req, res, uid);
  if (!user) return;

  const leader = isLeaderRole(user.role);
  if (!leader) {
    const gate = await checkUsage(uid, "chat");
    if (!gate.ok) return res.status(429).json({ error: "daily_limit", resetAt: gate.resetAt });
  }

  await runChat({ res, user, leader, sessionId: sid, message: message.trim(), attachedFiles });
});

// ── POST /server/agent/image  (JSON) ─────────────────────
agentRouter.post("/image", async (req: Request, res: Response) => {
  const { uid, sessionId, prompt, referenceImage, attachedFile, aspectRatio } = req.body ?? {};
  if (!prompt || typeof prompt !== "string") return res.status(400).json({ error: "prompt required" });
  const sid = normalizeSessionId(sessionId) ?? DEFAULT_SESSION_ID;

  const user = await gateUser(req, res, uid);
  if (!user) return;

  const leader = isLeaderRole(user.role);
  if (!leader) {
    const gate = await checkUsage(uid, "image");
    if (!gate.ok) return res.status(429).json({ error: "daily_limit", resetAt: gate.resetAt });
  }

  try {
    const raw = await generateImage({ prompt, referenceImage, attachedFile, aspectRatio });
    if (!raw) return res.status(500).json({ error: "No image returned, please try again" });

    const url = raw.startsWith("data:") ? await uploadImageToCloudinary(raw) : raw;
    await persistImageMessages(uid, sid, prompt, url);
    if (!leader) await incrementUsage(uid, "image");
    res.json({ url });
  } catch (e) {
    console.error("[image] error:", e);
    res.status(500).json({ error: "Image generation failed, please try again" });
  }
});

// ── POST /server/agent/lark  (SSE, leaders only) ─────────
// General Lark agent: reads workspace data and drafts actions (meetings, messages,
// records). Writes go through preview-and-confirm. Returns 404 when disabled so the
// route is invisible unless LARK_MCP_ENABLED and credentials are set.
agentRouter.post("/lark", async (req: Request, res: Response) => {
  if (!larkMcpReady()) return res.status(404).json({ error: "not_found" });
  const { uid, message } = req.body ?? {};
  if (!message || typeof message !== "string" || !message.trim()) {
    return res.status(400).json({ error: "message required" });
  }
  const user = await gateUser(req, res, uid);
  if (!user) return;
  if (!isLeaderRole(user.role)) return res.status(403).json({ error: "leaders_only" });

  await runLarkChat({ res, user, message: message.trim() });
});

// ── GET /server/agent/me ─────────────────────────────────
// Lets a separate frontend resolve the authed user's server-derived role/labels
// (never trust a client-sent role). Drives role-gated UI (e.g. daily report).
agentRouter.get("/me", async (req: Request, res: Response) => {
  const user = await gateUser(req, res, req.query.uid as string);
  if (!user) return;
  res.json({
    uid: user.uid,
    role: user.role,
    labels: user.labels,
    team: user.team,
    leader: isLeaderRole(user.role),
  });
});

// ── GET /server/agent/sessions ───────────────────────────
// Conversation history list for the sidebar (newest first, lightweight: no message
// bodies, just title/preview/counts). Excludes the reserved Lark session.
agentRouter.get("/sessions", async (req: Request, res: Response) => {
  const user = await gateUser(req, res, req.query.uid as string);
  if (!user) return;
  const sessions = await AgentSession.aggregate([
    { $match: { uid: user.uid, sessionId: { $ne: LARK_SESSION_ID } } },
    { $sort: { updatedAt: -1 } },
    {
      $project: {
        _id: 0,
        sessionId: 1,
        title: 1,
        updatedAt: 1,
        createdAt: 1,
        messageCount: { $size: { $ifNull: ["$messages", []] } },
        preview: {
          $substrCP: [{ $ifNull: [{ $arrayElemAt: ["$messages.content", -1] }, ""] }, 0, 120],
        },
      },
    },
  ]);
  res.json({ sessions });
});

// ── GET /server/agent/session ────────────────────────────
// Messages for one conversation. Without `sessionId`, returns the most recent
// conversation (back-compat / initial load).
agentRouter.get("/session", async (req: Request, res: Response) => {
  const user = await gateUser(req, res, req.query.uid as string);
  if (!user) return;
  const sid = normalizeSessionId(req.query.sessionId);
  const query = sid
    ? { uid: user.uid, sessionId: sid }
    : { uid: user.uid, sessionId: { $ne: LARK_SESSION_ID } };
  const session = await AgentSession.findOne(query).sort({ updatedAt: -1 }).lean();
  res.json({
    sessionId: session?.sessionId ?? null,
    title: session?.title ?? "",
    messages: session?.messages ?? [],
    postedIds: session?.postedIds ?? [],
  });
});

// ── PATCH /server/agent/session ──────────────────────────  (rename a conversation)
agentRouter.patch("/session", async (req: Request, res: Response) => {
  const user = await gateUser(req, res, req.body?.uid);
  if (!user) return;
  const sid = normalizeSessionId(req.body?.sessionId);
  if (!sid) return res.status(400).json({ error: "sessionId required" });
  const title = String(req.body?.title ?? "")
    .trim()
    .slice(0, 120);
  if (!title) return res.status(400).json({ error: "title required" });
  await AgentSession.updateOne({ uid: user.uid, sessionId: sid }, { $set: { title } });
  res.json({ ok: true, title });
});

// ── DELETE /server/agent/session ─────────────────────────
agentRouter.delete("/session", async (req: Request, res: Response) => {
  const user = await gateUser(req, res, (req.body?.uid ?? req.query.uid) as string);
  if (!user) return;
  const sid = normalizeSessionId(req.body?.sessionId ?? req.query.sessionId);
  if (!sid) return res.status(400).json({ error: "sessionId required" });

  // Clean up this conversation's generated images from Cloudinary (fire-and-forget).
  const session = await AgentSession.findOne({ uid: user.uid, sessionId: sid }).lean();
  const urls = imageUrlsFromSession(session?.messages as Array<{ content?: string }>);
  if (urls.length) void deleteImagesByUrl(urls);

  await AgentSession.deleteOne({ uid: user.uid, sessionId: sid });
  res.json({ ok: true });
});

// ── GET /server/agent/usage ──────────────────────────────
agentRouter.get("/usage", async (req: Request, res: Response) => {
  const user = await gateUser(req, res, req.query.uid as string);
  if (!user) return;
  res.json(await getUsage(user.uid));
});

// ── PATCH /server/agent/posted ───────────────────────────
agentRouter.patch("/posted", async (req: Request, res: Response) => {
  const { uid, sessionId, postedId } = req.body ?? {};
  const user = await gateUser(req, res, uid);
  if (!user) return;
  if (postedId == null) return res.status(400).json({ error: "postedId required" });

  const sid = normalizeSessionId(sessionId);
  const query = sid ? { uid, sessionId: sid } : { uid, sessionId: { $ne: LARK_SESSION_ID } };
  await AgentSession.updateOne(query, { $addToSet: { postedIds: String(postedId) } });

  // Trigger the real Reddit post via the configured webhook (fire-and-forget, 8s cap).
  if (config.redditWebhookUrl) {
    void fireRedditWebhook(user.uid, String(postedId), req.log);
  }
  res.json({ ok: true });
});

async function fireRedditWebhook(uid: string, postedId: string, log = logger): Promise<void> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 8000);
  try {
    const r = await fetch(config.redditWebhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uid, postedId }),
      signal: ctrl.signal,
    });
    if (!r.ok) log.warn("[posted] reddit webhook non-2xx", { status: r.status, postedId });
  } catch (e) {
    log.warn("[posted] reddit webhook failed", { message: (e as Error).message, postedId });
  } finally {
    clearTimeout(t);
  }
}

// ── GET /server/agent/daily-report  (leaders only) ───────
agentRouter.get("/daily-report", async (req: Request, res: Response) => {
  const user = await gateUser(req, res, req.query.uid as string);
  if (!user) return;
  if (!isLeaderRole(user.role)) return res.status(403).json({ error: "leaders_only" });
  res.json(await getDailyReport());
});

// ── POST /server/agent/daily-report/generate  (leaders) ──
agentRouter.post("/daily-report/generate", async (req: Request, res: Response) => {
  const user = await gateUser(req, res, req.body?.uid);
  if (!user) return;
  if (!isLeaderRole(user.role)) return res.status(403).json({ error: "leaders_only" });
  res.json({ ok: true, message: "Generation started" });
  void runDailyReport(); // fire-and-forget
});

/** Leader gate shared by the dynamic-KB routes. */
async function leaderOnly(req: Request, res: Response) {
  const user = await gateUser(req, res, (req.query.uid ?? req.body?.uid) as string);
  if (!user) return null;
  if (!isLeaderRole(user.role)) {
    res.status(403).json({ error: "leaders_only" });
    return null;
  }
  return user;
}

// ── GET /server/agent/kb  (leaders) — doc summaries, no body/vector ──
agentRouter.get("/kb", async (req: Request, res: Response) => {
  if (!(await leaderOnly(req, res))) return;
  const docs = await KbDoc.aggregate([
    { $sort: { updatedAt: -1 } },
    {
      $project: {
        _id: 0,
        docId: 1,
        title: 1,
        meta: 1,
        status: 1,
        source: 1,
        updatedAt: 1,
        embedded: { $gt: [{ $size: { $ifNull: ["$vector", []] } }, 0] },
      },
    },
  ]);
  res.json({ larkSyncEnabled: Boolean(config.lark.tables.knowledgeBase), docs });
});

// ── GET /server/agent/kb/:id  (leaders) — full doc incl. body ──
agentRouter.get("/kb/:id", async (req: Request, res: Response) => {
  if (!(await leaderOnly(req, res))) return;
  const doc = await KbDoc.findOne({ docId: req.params.id }).select("-vector -_id -__v").lean();
  if (!doc) return res.status(404).json({ error: "not_found" });
  res.json({ doc });
});

// ── POST /server/agent/kb/sync  (leaders) — pull + diff-embed from Lark ──
agentRouter.post("/kb/sync", async (req: Request, res: Response) => {
  if (!(await leaderOnly(req, res))) return;
  if (!config.lark.tables.knowledgeBase) {
    return res.json({ ok: false, message: "Lark KB table not configured (LARK_TABLE_ID_KNOWLEDGE_BASE)" });
  }
  res.json({ ok: true, message: "Sync started" });
  void runKbSync().catch((e) => logger.error("[kb] sync failed", { message: (e as Error).message }));
});

// ── POST /server/agent/kb/reindex  (leaders) — re-embed all published docs ──
agentRouter.post("/kb/reindex", async (req: Request, res: Response) => {
  if (!(await leaderOnly(req, res))) return;
  res.json({ ok: true, message: "Reindex started" });
  void reindexKb().catch((e) => logger.error("[kb] reindex failed", { message: (e as Error).message }));
});
