import type { BaseMessage } from "@langchain/core/messages";
import { embeddings } from "../../llm/providers";
import { KB_ALWAYS, KB_MAX_FILES, KB_SIM_THRESHOLD } from "../../config";
import { canAccess, categoryBoost, cosineSim, detectPlatform } from "./access";
import { kbFiles, warmKb } from "./store";

interface Ctx {
  role: string;
  labels: string[];
  history: BaseMessage[];
}

/** Embed the query context = last 20 non-image history msgs + the current query. */
async function embedQueryContext(query: string, history: BaseMessage[]): Promise<number[] | null> {
  try {
    const lines = history
      .slice(-20)
      .map((m) => `${m.getType() === "human" ? "user" : "assistant"}: ${String(m.content)}`);
    lines.push(`user: ${query}`);
    const [vec] = await embeddings.embedDocuments([lines.join("\n\n")]);
    return vec;
  } catch {
    return null;
  }
}

/**
 * Select KB context for a query. Returns a string of `### <path>\n<body>` blocks
 * (body only — frontmatter is never injected). Mirrors legacy `fetchKnowledgeBase`.
 */
export async function fetchKnowledgeBase(query: string, ctx: Ctx): Promise<string> {
  try {
    await warmKb(); // no-op once warm; embeds the in-code KB on first call
  } catch {
    // Embedding unavailable (e.g. bad key) → degrade to no KB rather than failing the chat.
  }
  const files = kbFiles();
  if (files.size === 0) return "";

  const queryVec = await embedQueryContext(query, ctx.history);
  const platform = detectPlatform(query);

  const scored: Array<{ path: string; body: string; isAlways: boolean; sim: number }> = [];
  for (const [path, f] of files) {
    if (!canAccess(ctx.role, f.meta, ctx.labels)) continue;
    const filePlatform = f.meta.platform;
    if (platform && filePlatform && !["—", "-"].includes(filePlatform) && filePlatform !== platform) continue;

    const isAlways = KB_ALWAYS.some((a) => path.includes(a));
    const sim = isAlways || !queryVec ? 0 : cosineSim(queryVec, f.vector) * categoryBoost(f.meta, query);
    scored.push({ path, body: f.body, isAlways, sim });
  }

  const always = scored.filter((s) => s.isAlways);
  let semantic = scored
    .filter((s) => !s.isAlways && s.sim >= KB_SIM_THRESHOLD)
    .sort((a, b) => b.sim - a.sim)
    .slice(0, KB_MAX_FILES);

  // Fallback: no query vector or zero semantic hits → first 3 accessible non-always files.
  if (!queryVec || semantic.length === 0) {
    semantic = scored.filter((s) => !s.isAlways).slice(0, 3);
  }

  const selected = [...always, ...semantic];
  return selected.map((s) => `### ${s.path}\n${s.body}`).join("\n\n");
}
