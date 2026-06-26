import type { KbMeta } from "./frontmatter";

export type Platform = "twitter" | "reddit" | "cmc" | null;

/**
 * Access control for KB files.
 *
 * Audit fixes applied vs. the legacy `_canAccess`:
 *  - P0-2/P0-3: DEFAULT-DENY when an `access` field is present but not a valid
 *    non-empty array (legacy returned `true`/public in that case).
 *  - A file with NO `access` field at all is still treated as open-to-all, matching
 *    legacy convention. Flip `OPEN_BY_DEFAULT` to false to require explicit access.
 */
const OPEN_BY_DEFAULT = true;

export function canAccess(role: string, meta: KbMeta, labels: string[]): boolean {
  const hasField = Object.prototype.hasOwnProperty.call(meta, "access");
  const access = meta.access;

  if (!hasField) return OPEN_BY_DEFAULT; // no access metadata → open (legacy behavior)
  if (!Array.isArray(access) || access.length === 0) return false; // malformed/empty → DENY

  if (access.includes("reddit_team")) return labels.includes("Reddit");
  if (role === "Manager") return access.includes("manager");
  if (role === "Lead Builder") return access.includes("lead_builder");
  // Member / trainee / unknown
  return access.includes("trainee") || access.includes("core_builder");
}

/** Detect a content platform from the query for KB platform filtering. */
export function detectPlatform(query: string): Platform {
  const q = query.toLowerCase();
  if (/\b(twitter|tweet|\bx\b|x\/twitter)\b/.test(q)) return "twitter";
  if (/\breddit\b/.test(q)) return "reddit";
  if (/\b(cmc|coinmarketcap)\b/.test(q)) return "cmc";
  return null;
}

/** Category/intent boost multiplier applied to cosine similarity (legacy `_categoryBoost`). */
export function categoryBoost(meta: KbMeta, query: string): number {
  let m = 1.0;
  const q = query.toLowerCase();
  const cat = String(meta.category ?? "");
  const intent = String(meta.intent ?? "");

  if (/write|create|draft|post|content|template/.test(q)) {
    if (/content-templates|content-guidelines/.test(cat)) m *= 1.3;
    if (intent === "content-creation") m *= 1.15;
  }
  if (/campaign|plan|pillar|brief|calendar/.test(q)) {
    if (cat === "campaigns") m *= 1.3;
    if (/campaign-planning|campaign-help/.test(intent)) m *= 1.15;
  }
  if (/how does|what is|how to earn|reward|platform|builderhub/.test(q)) {
    if (cat === "platform") m *= 1.2;
    if (intent === "platform-questions") m *= 1.1;
  }
  if (/auto-post/.test(q) && cat === "auto-posting") m *= 1.3;
  return m;
}

export function cosineSim(a: number[], b: number[]): number {
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  if (na === 0 || nb === 0) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}
