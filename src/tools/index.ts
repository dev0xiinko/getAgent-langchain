import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import {
  toolSearchWeb,
  toolGetCryptoNews,
  toolGetMarketSignals,
  toolSearchTwitterSentiment,
  toolGetStockMovers,
} from "./clients";
import { larkCliAvailable } from "../lark/larkCli";
import { lookupLarkBase } from "./larkTool";
import { logger } from "../logger";

/**
 * The five LIVE chat tools. Descriptions are verbatim from the legacy
 * `AGENT_TOOLS` — the model routes on them, so do not paraphrase.
 *
 * Note: `generate_image` is intentionally NOT a chat tool. Image generation is a
 * separate endpoint (see agent/image.ts); the system prompt tells chat to refuse.
 */

const searchWeb = new DynamicStructuredTool({
  name: "search_web",
  description:
    "Search the web for general current events, non-crypto stock news, macro economic reports, or any topic " +
    "not covered by the specialised market tools. For crypto news or Twitter sentiment, prefer the dedicated tools.",
  schema: z.object({ query: z.string().describe("The search query") }),
  func: async ({ query }) => toolSearchWeb(query),
});

const getCryptoNews = new DynamicStructuredTool({
  name: "get_crypto_news",
  description:
    "Get real-time crypto and financial news with AI impact scores and trading signals (long/short/neutral). " +
    "Use for: latest news on any coin or token, exchange listing alerts, high-impact market events, whale " +
    "activity, or any crypto or financial market query. Always prefer this over search_web for crypto topics.",
  schema: z.object({
    query: z
      .string()
      .optional()
      .describe(
        'Short descriptive phrase (2-4 words) based on what the user asked — e.g. "Bitcoin whale movements", ' +
          '"Ethereum ETF approval", "new crypto listings today". More specific = better results.',
      ),
    signal: z.enum(["long", "short", "neutral"]).optional().describe("Filter by AI trading signal"),
  }),
  func: async ({ query, signal }) => toolGetCryptoNews(query, null, signal),
});

const getMarketSignals = new DynamicStructuredTool({
  name: "get_market_signals",
  description:
    "Get structured real-time market signals from specialised data feeds. Use the correct engine: " +
    "market = liquidations, funding rates, price signals; prediction = AI price prediction signals.",
  schema: z.object({
    engine: z.enum(["market", "prediction"]).describe("Signal category to fetch"),
    query: z
      .string()
      .optional()
      .describe(
        'Optional short phrase to narrow results, e.g. "Bitcoin liquidations", "ETH price prediction".',
      ),
  }),
  func: async ({ engine, query }) => toolGetMarketSignals(engine, query),
});

const searchTwitterSentiment = new DynamicStructuredTool({
  name: "search_twitter_sentiment",
  description:
    "Search Twitter/X for real-time social sentiment on any crypto asset, token, or market topic. Use when " +
    "user asks what traders or KOLs are saying, wants community sentiment, or asks about social buzz around " +
    "an asset or event.",
  schema: z.object({
    query: z
      .string()
      .describe('Short descriptive phrase, e.g. "Bitcoin price sentiment", "Solana KOL views".'),
  }),
  func: async ({ query }) => toolSearchTwitterSentiment(query),
});

const getStockMovers = new DynamicStructuredTool({
  name: "get_stock_movers",
  description:
    "Get real-time top gaining and/or losing US stocks for today — returns exact ticker symbols, current " +
    "prices, and % changes. Use when user asks about top gainers, top losers, biggest movers, best or worst " +
    "performing US stocks today, or any question about US stock performance today.",
  schema: z.object({
    type: z
      .enum(["gainers", "losers", "both"])
      .describe("Which movers to retrieve: gainers, losers, or both"),
  }),
  func: async ({ type }) => toolGetStockMovers(type),
});

export const AGENT_TOOLS = [
  searchWeb,
  getCryptoNews,
  getMarketSignals,
  searchTwitterSentiment,
  getStockMovers,
  // Live-Lark lookup is opt-in (needs `lark-cli` installed + authenticated on the host).
  ...(larkCliAvailable() ? [lookupLarkBase] : []),
];
if (larkCliAvailable()) logger.info("[tools] live Lark lookup enabled (lark-cli)");

export const TOOLS_BY_NAME: Record<string, DynamicStructuredTool> = Object.fromEntries(
  AGENT_TOOLS.map((t) => [t.name, t]),
);

/** {status} text emitted to the client before running each tool. */
export const TOOL_STATUS: Record<string, string> = {
  search_web: "Searching the web…",
  get_crypto_news: "Fetching crypto news…",
  get_market_signals: "Fetching market signals…",
  search_twitter_sentiment: "Checking Twitter sentiment…",
  get_stock_movers: "Fetching stock data…",
  lookup_lark_base: "Checking the Builder Hub workspace…",
  generate_image: "Generating image…",
};
