import { config } from "../config";

/** Small fetch helper with an AbortController timeout. */
async function fetchWithTimeout(url: string, init: RequestInit, ms: number): Promise<Response> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    return await fetch(url, { ...init, signal: ctrl.signal });
  } finally {
    clearTimeout(t);
  }
}

const NEWS_BASE = "https://ai.6551.io";
const ENGINE_SOURCES: Record<string, string[]> = { market: [], prediction: [] };

/** search_web → Brave web search. */
export async function toolSearchWeb(query: string): Promise<string> {
  if (!config.braveKey) return "Web search is unavailable right now.";
  const url = `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=6`;
  const res = await fetchWithTimeout(
    url,
    { headers: { "X-Subscription-Token": config.braveKey, Accept: "application/json" } },
    8000,
  );
  if (!res.ok) throw new Error(`Brave ${res.status}`);
  const data: any = await res.json();
  const results: any[] = data?.web?.results ?? [];
  if (!results.length) return "No web results found.";
  return results
    .slice(0, 6)
    .map((r, i) => `${i + 1}. ${r.title}\n   ${r.url}\n   ${r.description ?? ""}`)
    .join("\n\n");
}

async function newsSearch(body: Record<string, unknown>, ms: number): Promise<any> {
  if (!config.newsToken) throw new Error("News feed not configured");
  const res = await fetchWithTimeout(
    `${NEWS_BASE}/open/news_search`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${config.newsToken}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
    ms,
  );
  if (!res.ok) throw new Error(`news_search ${res.status}`);
  return res.json();
}

/** get_crypto_news → news feed with optional coins + signal. */
export async function toolGetCryptoNews(
  query?: string,
  coins?: string[] | null,
  signal?: "long" | "short" | "neutral",
): Promise<string> {
  const body: Record<string, unknown> = { limit: 8 };
  if (query) body.q = query;
  if (coins?.length) body.coins = coins;
  if (signal) body.signal = signal;
  const data = await newsSearch(body, 20000);
  return JSON.stringify(data?.data ?? data).slice(0, 8000);
}

/** get_market_signals → engine-scoped feed (market | prediction). */
export async function toolGetMarketSignals(engine: "market" | "prediction", query?: string): Promise<string> {
  const body: Record<string, unknown> = { limit: 8, engineTypes: { [engine]: ENGINE_SOURCES[engine] } };
  if (query) body.q = query;
  const data = await newsSearch(body, 10000);
  return JSON.stringify(data?.data ?? data).slice(0, 8000);
}

/** search_twitter_sentiment → Twitter/X social feed. */
export async function toolSearchTwitterSentiment(query: string): Promise<string> {
  if (!config.newsToken) throw new Error("Twitter feed not configured");
  const res = await fetchWithTimeout(
    `${NEWS_BASE}/open/twitter_search`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${config.newsToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({ keywords: query, product: "Top", maxResults: 8, minLikes: 20 }),
    },
    10000,
  );
  if (!res.ok) throw new Error(`twitter_search ${res.status}`);
  const data: any = await res.json();
  return JSON.stringify(data?.data ?? data).slice(0, 8000);
}

/** get_stock_movers → Yahoo Finance day_gainers / day_losers. */
export async function toolGetStockMovers(type: "gainers" | "losers" | "both"): Promise<string> {
  // yahoo-finance2 v3: default export is a class that must be instantiated.
  const YahooFinance: any = (await import("yahoo-finance2")).default;
  const yahooFinance: any = new YahooFinance({ suppressNotices: ["yahooSurvey"] });
  const ids =
    type === "both" ? ["day_gainers", "day_losers"] : [type === "losers" ? "day_losers" : "day_gainers"];
  const out: string[] = [];
  for (const scrId of ids) {
    try {
      const r: any = await yahooFinance.screener({ scrIds: scrId, count: 10 });
      const quotes: any[] = r?.quotes ?? [];
      out.push(
        `${scrId}:\n` +
          quotes
            .slice(0, 10)
            .map(
              (q) =>
                `  ${q.symbol} ${q.regularMarketPrice ?? "?"} (${(q.regularMarketChangePercent ?? 0).toFixed(2)}%)`,
            )
            .join("\n"),
      );
    } catch (e: any) {
      out.push(`${scrId}: unavailable (${e.message})`);
    }
  }
  return out.join("\n\n");
}
