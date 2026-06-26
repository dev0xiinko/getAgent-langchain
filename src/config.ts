import dotenv from "dotenv";
import { z } from "zod";

// Load `.env.local` first (local secrets), then fall back to `.env`.
// Plain dotenv only auto-loads `.env`; `.env.local` is a Next.js/Vite convention
// it does NOT read by default, so we point at it explicitly.
dotenv.config({ path: [".env.local", ".env"] });

/** Runtime config sourced from env. */
export const config = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  isProd: process.env.NODE_ENV === "production",
  port: Number(process.env.PORT ?? 8080),
  /** Comma-separated allowlist of browser origins. Empty = reflect any origin (dev only). */
  corsOrigins: (process.env.CORS_ORIGINS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),
  /** Optional webhook the `/posted` route calls to trigger the real Reddit post. */
  redditWebhookUrl: process.env.REDDIT_POST_WEBHOOK_URL ?? "",
  // Accept either key name. Your Atlas string is under MONGODB_URL; MONGO_URI was the
  // localhost fallback. Prefer the Atlas cluster, fall back to MONGO_URI, then localhost.
  mongoUri: process.env.MONGODB_URL ?? process.env.MONGO_URI ?? "mongodb://127.0.0.1:27017/getagent",
  openrouterApiKey: process.env.OPENROUTER_API_KEY ?? "",
  braveKey: process.env.BRAVE_SEARCH_API_KEY ?? "",
  newsToken: process.env.NEWS_MARKETS_TOKEN ?? "",
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME ?? "",
    apiKey: process.env.CLOUDINARY_API_KEY ?? "",
    apiSecret: process.env.CLOUDINARY_API_SECRET ?? "",
  },
  /** Page allowlist — mirrors VITE_GETAGENT_UIDS on the client. */
  getagentUids: (process.env.GETAGENT_UIDS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),
  /** Lark (Feishu) Bitable — campaign / announcement data source. */
  lark: {
    appId: process.env.LARK_APP_ID ?? "",
    appSecret: process.env.LARK_APP_SECRET ?? "",
    dataBaseToken: process.env.LARK_DATA_BASE_APP_TOKEN ?? "",
    rewardsBaseToken: process.env.LARK_REWARDS_BASE_APP_TOKEN ?? "",
    tables: {
      builderInfo: process.env.LARK_TABLE_ID_BUILDER_INFO ?? "",
      campaigns: process.env.LARK_TABLE_ID_CAMPAIGNS ?? "",
      achievement: process.env.LARK_TABLE_ID_ACHIEVEMENT ?? "",
      announcements: process.env.LARK_TABLE_ID_ANNOUNCEMENTS ?? "",
      hallOfFame: process.env.LARK_TABLE_ID_HALL_OF_FAME ?? "",
      // Dynamic-KB source table; empty disables Lark KB sync (in-code KB still works).
      knowledgeBase: process.env.LARK_TABLE_ID_KNOWLEDGE_BASE ?? "",
    },
  },
  /**
   * Optional live-Lark chat tool backed by the official `lark-cli` binary
   * (https://github.com/larksuite/cli). Off by default: the CLI authenticates via
   * device-code/keychain, so it only works on a host where an operator has run
   * `lark-cli auth login`. The tool degrades gracefully (no-op) when disabled or
   * when the binary/credentials are absent.
   */
  larkCli: {
    enabled: process.env.LARK_CLI_ENABLED === "true",
    bin: process.env.LARK_CLI_BIN ?? "lark-cli",
  },
  /**
   * Optional general Lark agent (`POST /server/agent/lark`) backed by the official
   * `@larksuiteoapi/lark-mcp` server. Off by default. Uses the same LARK_APP_ID/SECRET
   * as the Bitable client; writes go through preview-and-confirm, enforced in code.
   */
  larkMcp: {
    enabled: process.env.LARK_MCP_ENABLED === "true",
    domain: process.env.LARK_MCP_DOMAIN ?? "https://open.larksuite.com",
    // Comma/space-separated tool ids or presets passed to lark-mcp `-t`.
    tools: process.env.LARK_MCP_TOOLS ?? "preset.calendar.default,preset.im.default,preset.base.default",
    // auto | tenant_access_token | user_access_token (app creds → tenant by default).
    tokenMode: process.env.LARK_MCP_TOKEN_MODE ?? "tenant_access_token",
  },
};

// ── Lark ─────────────────────────────────────────────────
export const LARK_BASE_URL = "https://open.larksuite.com";
export const LARK_DATA_TTL = 5 * 60_000; // campaign/announcement cache TTL

// ── OpenRouter ───────────────────────────────────────────
export const OPENROUTER_BASE = "https://openrouter.ai/api/v1";
export const OR_HEADERS = {
  "HTTP-Referer": "https://builderhub.bitget.com",
  "X-Title": "Bitget BuilderHub",
};

// ── Models (all OpenRouter-routed) ───────────────────────
export const AGENT_MODEL = "anthropic/claude-sonnet-4-6";
export const AGENT_IMAGE_MODEL = "google/gemini-3.1-flash-image-preview";
export const GROK_MODEL = "x-ai/grok-4.3:online";
export const KB_EMBED_MODEL = "openai/text-embedding-3-large";

/** OpenRouter routing block reused on chat calls. No `temperature` anywhere — model default. */
export const CHAT_PROVIDER = {
  order: ["anthropic", "amazon-bedrock/global"],
  allow_fallbacks: true,
  require_parameters: true,
  data_collection: "deny",
};

export const MAX_TOKENS = 64000;

// ── HTTP rate limiting (per-IP, in front of the per-user usage gate) ──
export const RATE_LIMIT_WINDOW_MS = Number(process.env.RATE_LIMIT_WINDOW_MS ?? 60_000);
export const RATE_LIMIT_MAX = Number(process.env.RATE_LIMIT_MAX ?? 120);

// ── Usage limits (rolling 24h, anchored at windowStart) ──
export const AGENT_CHAT_LIMIT = 20;
export const AGENT_IMAGE_LIMIT = 10;
export const AGENT_WINDOW_MS = 24 * 60 * 60 * 1000;

// ── Knowledge base ───────────────────────────────────────
export const KB_TTL = 60_000; // system prompt + KB tree cache TTL
export const KB_ALWAYS = [
  "builderhub-website-overview",
  "builderhub-frequently-asked-questions",
  "bitget-company-profile",
  "bitget-trading-products",
  "market-research-data-sources",
];
export const KB_MAX_FILES = 8; // semantic cap, excludes always-load
export const KB_SIM_THRESHOLD = 0.25; // min cosine sim AFTER category boost

// ── Environment validation ───────────────────────────────
// Hard requirements: PORT must be a real port; in production the model gateway and
// a Mongo URI are mandatory (the app is useless without them). Optional integrations
// only emit a warning so non-prod boots and degrades gracefully, as documented.
const envSchema = z.object({
  PORT: z.coerce.number().int().positive().max(65535).default(8080),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
});

const OPTIONAL_INTEGRATIONS: Array<[keyof typeof config | string, string]> = [
  ["braveKey", "BRAVE_SEARCH_API_KEY — daily-report stock/forex fallback"],
  ["newsToken", "NEWS_MARKETS_TOKEN — daily-report news/Twitter feeds"],
  ["redditWebhookUrl", "REDDIT_POST_WEBHOOK_URL — /posted webhook is a no-op without it"],
];

/**
 * Validate env at boot. Throws (fail-fast) on missing hard requirements; returns a
 * list of non-fatal warnings for missing optional integrations.
 */
export function validateEnv(): string[] {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `  - ${i.path.join(".")}: ${i.message}`).join("\n");
    throw new Error(`Invalid environment:\n${issues}`);
  }

  const fatal: string[] = [];
  if (!config.openrouterApiKey) fatal.push("OPENROUTER_API_KEY is required (the model gateway).");
  if (config.isProd) {
    if (!process.env.MONGODB_URL && !process.env.MONGO_URI) {
      fatal.push("MONGODB_URL (or MONGO_URI) is required in production.");
    }
    if (config.cloudinary.cloudName && (!config.cloudinary.apiKey || !config.cloudinary.apiSecret)) {
      fatal.push("CLOUDINARY_CLOUD_NAME is set but CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET are missing.");
    }
  }
  if (fatal.length) {
    throw new Error(`Missing required configuration:\n${fatal.map((f) => `  - ${f}`).join("\n")}`);
  }

  const warnings: string[] = [];
  for (const [key, hint] of OPTIONAL_INTEGRATIONS) {
    if (!(config as Record<string, unknown>)[key as string]) warnings.push(hint);
  }
  if (config.isProd && config.corsOrigins.length === 0) {
    warnings.push("CORS_ORIGINS is empty — all origins are allowed. Set it to lock down browser access.");
  }
  if (config.larkMcp.enabled && (!config.lark.appId || !config.lark.appSecret)) {
    warnings.push(
      "LARK_MCP_ENABLED is true but LARK_APP_ID / LARK_APP_SECRET are missing — the Lark agent will be unavailable.",
    );
  }
  return warnings;
}
