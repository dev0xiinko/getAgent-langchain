/**
 * Daily-report source aggregation. Ports the legacy Builder Hub fetchers
 * (_fetchMarketNews / _fetchTwitterSentiment / _fetchBraveData /
 * _fetchCoinGeckoPrices / _fetchYahooStocks) and assembles the exact labeled
 * sections that DR_SYSTEM references by name (COINGECKO, YAHOO FINANCE,
 * BRAVE SEARCH — …). Output is fed verbatim to the report model.
 */
import { config } from "../config";

const NM_BASE = "https://ai.6551.io";
const nmHeaders = () => ({
  Authorization: `Bearer ${config.newsToken}`,
  "Content-Type": "application/json",
});

const jpost = (url: string, body: unknown, headers: Record<string, string>): Promise<any> =>
  fetch(url, { method: "POST", headers, body: JSON.stringify(body) }).then((r) => r.json());

// ── OpenNews ──────────────────────────────────────────────
interface NewsData {
  highScore: any[];
  latestNews: any[];
  marketEngine: any[];
  predictionEngine: any[];
}
async function fetchMarketNews(): Promise<NewsData | null> {
  const h = nmHeaders();
  try {
    const [highScore, latestNews, marketEngine, predictionEngine] = await Promise.all([
      jpost(`${NM_BASE}/open/news_search`, { limit: 10, score: 70 }, h),
      jpost(`${NM_BASE}/open/news_search`, { limit: 12 }, h),
      jpost(`${NM_BASE}/open/news_search`, { limit: 8, engineTypes: { market: [] } }, h),
      jpost(`${NM_BASE}/open/news_search`, { limit: 8, engineTypes: { prediction: [] } }, h),
    ]);
    return {
      highScore: highScore?.data || [],
      latestNews: latestNews?.data || [],
      marketEngine: marketEngine?.data || [],
      predictionEngine: predictionEngine?.data || [],
    };
  } catch (err) {
    console.error(`[daily-report] OpenNews fetch failed: ${(err as Error).message}`);
    return null;
  }
}

// ── OpenTwitter ───────────────────────────────────────────
interface TwitterData {
  btc: any[];
  eth: any[];
  broadCrypto: any[];
}
async function fetchTwitterSentiment(): Promise<TwitterData | null> {
  const h = nmHeaders();
  const tw = (keywords: string, minLikes: number) =>
    jpost(`${NM_BASE}/open/twitter_search`, { keywords, product: "Top", maxResults: 8, minLikes }, h);
  try {
    const [btc, eth, broadCrypto] = await Promise.all([
      tw("bitcoin BTC price", 50),
      tw("ethereum ETH price", 50),
      tw("crypto altcoin market today", 100),
    ]);
    return { btc: btc?.data || [], eth: eth?.data || [], broadCrypto: broadCrypto?.data || [] };
  } catch (err) {
    console.error(`[daily-report] OpenTwitter fetch failed: ${(err as Error).message}`);
    return null;
  }
}

// ── Brave web search ──────────────────────────────────────
interface BraveData {
  stockGainers: string;
  stockLosers: string;
  stockMostActive: string;
  stockIndex: string;
  cfds: string;
  gold: string;
  silver: string;
  forex: string;
  keyEvents: string;
  btcPrediction: string;
  ethPrediction: string;
}
async function fetchBraveData(): Promise<BraveData | null> {
  if (!config.braveKey) return null;
  const headers = { Accept: "application/json", "X-Subscription-Token": config.braveKey };
  const bSearch = (q: string): Promise<any> =>
    fetch(`https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(q)}&count=5`, { headers })
      .then((r) => r.json())
      .catch(() => null);
  const todayStr = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "Asia/Kuala_Lumpur",
  });
  try {
    const [
      stockGainers,
      stockLosers,
      stockMostActive,
      stockIndex,
      cfds,
      gold,
      silver,
      forex,
      keyEvents,
      btcPrediction,
      ethPrediction,
    ] = await Promise.all([
      bSearch(
        `top US stock gainers yesterday previous session close price percent change NYSE NASDAQ large cap "$" "%"`,
      ),
      bSearch(
        `top US stock losers decliners yesterday previous session close price percent change NYSE NASDAQ large cap "$" "%"`,
      ),
      bSearch(
        `most active US stocks yesterday previous close price NYSE NASDAQ large cap high volume "$" "%"`,
      ),
      bSearch(`S&P 500 NASDAQ Dow Jones today ${todayStr} closing price change percent`),
      bSearch(`WTI crude oil price today ${todayStr} percent change`),
      bSearch(`gold spot price today per ounce USD ${todayStr}`),
      bSearch(`silver spot price per ounce USD today ${todayStr}`),
      bSearch(`DXY US dollar index EUR USD GBP USD forex today ${todayStr} price percent change`),
      bSearch(`key economic events earnings Fed ECB today ${todayStr}`),
      bSearch(`prediction market bitcoin BTC price odds today`),
      bSearch(`prediction market ethereum ETH price odds today`),
    ]);
    const extract = (d: any): string =>
      (d?.web?.results || []).map((r: any) => `${r.title}\n${r.description || ""}`).join("\n\n");
    return {
      stockGainers: extract(stockGainers),
      stockLosers: extract(stockLosers),
      stockMostActive: extract(stockMostActive),
      stockIndex: extract(stockIndex),
      cfds: extract(cfds),
      gold: extract(gold),
      silver: extract(silver),
      forex: extract(forex),
      keyEvents: extract(keyEvents),
      btcPrediction: extract(btcPrediction),
      ethPrediction: extract(ethPrediction),
    };
  } catch (err) {
    console.error(`[daily-report] Brave search failed: ${(err as Error).message}`);
    return null;
  }
}

// ── CoinGecko + Fear/Greed ────────────────────────────────
interface CgData {
  priceLines: string;
  globalLine: string;
  fgLine: string;
}
async function fetchCoinGeckoPrices(): Promise<CgData | null> {
  try {
    const cgHeaders = { Accept: "application/json" };
    const [markets, globalData, fearGreed]: any[] = await Promise.all([
      fetch(
        "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&page=1&sparkline=false&price_change_percentage=24h",
        { headers: cgHeaders },
      )
        .then((r) => r.json())
        .catch(() => null),
      fetch("https://api.coingecko.com/api/v3/global", { headers: cgHeaders })
        .then((r) => r.json())
        .catch(() => null),
      fetch("https://api.alternative.me/fng/", { headers: cgHeaders })
        .then((r) => r.json())
        .catch(() => null),
    ]);

    const fmt = (n: number | null | undefined, dec = 2) => (n != null ? n.toFixed(dec) : "?");
    const fmtLarge = (n: number | null | undefined) => {
      if (n == null) return "?";
      if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
      if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
      if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
      return `$${n.toFixed(0)}`;
    };

    const priceLines = (markets || [])
      .map((c: any, i: number) => {
        const chg = c.price_change_percentage_24h;
        const sign = chg >= 0 ? "+" : "";
        return `${i + 1}. ${c.symbol?.toUpperCase()} (${c.name}): $${fmt(c.current_price, c.current_price >= 1 ? 2 : 6)} (${sign}${fmt(chg)}% 24h) | MCap: ${fmtLarge(c.market_cap)} | Vol24h: ${fmtLarge(c.total_volume)}`;
      })
      .join("\n");

    const g = globalData?.data;
    const globalLine = g
      ? `Total Market Cap: ${fmtLarge(g.total_market_cap?.usd)} (${g.market_cap_change_percentage_24h_usd >= 0 ? "+" : ""}${fmt(g.market_cap_change_percentage_24h_usd)}% 24h)\n24h Volume: ${fmtLarge(g.total_volume?.usd)}`
      : "(unavailable)";

    const fg = fearGreed?.data?.[0];
    const fgLine = fg ? `Value: ${fg.value} — ${fg.value_classification}` : "(unavailable)";

    return { priceLines, globalLine, fgLine };
  } catch (err) {
    console.error(`[daily-report] CoinGecko fetch failed: ${(err as Error).message}`);
    return null;
  }
}

// ── Yahoo Finance screeners ───────────────────────────────
interface YfData {
  gainers: string | null;
  losers: string | null;
}
async function fetchYahooStocks(): Promise<YfData> {
  try {
    // yahoo-finance2 v3: default export is a class that must be instantiated.
    const YahooFinance: any = (await import("yahoo-finance2")).default;
    const yahooFinance: any = new YahooFinance({ suppressNotices: ["yahooSurvey"] });
    if (typeof yahooFinance?.screener !== "function") {
      return { gainers: null, losers: null }; // → "(unavailable)" → Brave fallback
    }
    const [gainersRes, losersRes] = await Promise.all([
      yahooFinance.screener({ scrIds: "day_gainers", count: 10 }).catch(() => null),
      yahooFinance.screener({ scrIds: "day_losers", count: 10 }).catch(() => null),
    ]);
    const fmt = (res: any): string | null => {
      const quotes = res?.quotes || [];
      if (!quotes.length) return null;
      return quotes
        .slice(0, 10)
        .map((q: any) => {
          const price = q.regularMarketPrice != null ? `$${q.regularMarketPrice.toFixed(2)}` : null;
          const chg = q.regularMarketChangePercent != null ? q.regularMarketChangePercent.toFixed(2) : null;
          const sign = chg != null && parseFloat(chg) >= 0 ? "+" : "";
          const pct = chg != null ? ` (${sign}${chg}%)` : "";
          const name = q.shortName || q.longName || q.symbol;
          return price
            ? `${q.symbol} ${price}${pct} — ${name}`
            : chg
              ? `${q.symbol} (${sign}${chg}%) — ${name}`
              : null;
        })
        .filter(Boolean)
        .join("\n");
    };
    return { gainers: fmt(gainersRes), losers: fmt(losersRes) };
  } catch (err) {
    console.error(`[daily-report] Yahoo fetch failed: ${(err as Error).message}`);
    return { gainers: null, losers: null };
  }
}

// ── Assembly ──────────────────────────────────────────────
const fmtNews = (arr: any[] | undefined) =>
  (arr || [])
    .map((n: any, i: number) => {
      const title = n.text || n.title || "(no title)";
      const source = n.newsType || n.source || "—";
      const score = n.score ?? n.aiRating?.score ?? "—";
      const sig = n.signal ?? n.aiRating?.signal ?? "—";
      const coins = n.coins?.length ? ` [${n.coins.map((c: any) => c.symbol || c).join(", ")}]` : "";
      return `${i + 1}. ${title} (${source}) | Score:${score} Signal:${sig}${coins}`;
    })
    .join("\n");

const fmtTweets = (arr: any[] | undefined) =>
  (arr || [])
    .map((t: any, i: number) => {
      const text = (t.text || t.content || "").slice(0, 240);
      const author = t.author?.username || t.username || "?";
      const likes = t.metrics?.likeCount ?? t.likeCount ?? 0;
      return `${i + 1}. @${author} (${likes} likes): ${text}`;
    })
    .join("\n");

/**
 * Fetch all feeds in parallel and build the labeled-sections string the report
 * model consumes. Capped at 40000 chars (CoinGecko first — never truncated).
 */
export async function aggregateSources(): Promise<string> {
  const [newsData, twitterData, braveData, cgData, yfData] = await Promise.all([
    fetchMarketNews(),
    fetchTwitterSentiment(),
    fetchBraveData(),
    fetchCoinGeckoPrices(),
    fetchYahooStocks(),
  ]);

  const sections = [
    `[COINGECKO — LIVE CRYPTO PRICES (top 20 by market cap)]\n${cgData?.priceLines || "(unavailable)"}`,
    `[COINGECKO — GLOBAL CRYPTO MARKET]\n${cgData?.globalLine || "(unavailable)"}`,
    `[ALTERNATIVE.ME — FEAR & GREED INDEX]\n${cgData?.fgLine || "(unavailable)"}`,
    `[YAHOO FINANCE — TOP US STOCK GAINERS TODAY (exact prices)]\n${yfData?.gainers || "(unavailable)"}`,
    `[YAHOO FINANCE — TOP US STOCK LOSERS TODAY (exact prices)]\n${yfData?.losers || "(unavailable)"}`,
    `[BRAVE SEARCH — US STOCK TOP GAINERS TODAY]\n${braveData?.stockGainers || "(unavailable)"}`,
    `[BRAVE SEARCH — US STOCK TOP LOSERS TODAY]\n${braveData?.stockLosers || "(unavailable)"}`,
    `[BRAVE SEARCH — MOST ACTIVE US STOCKS TODAY (prices for high-volume large-caps — use for Trending Today price lookup)]\n${braveData?.stockMostActive || "(unavailable)"}`,
    `[BRAVE SEARCH — S&P 500 / NASDAQ / DOW JONES TODAY]\n${braveData?.stockIndex || "(unavailable)"}`,
    `[BRAVE SEARCH — CFD WTI CRUDE OIL TODAY]\n${braveData?.cfds || "(unavailable)"}`,
    `[BRAVE SEARCH — GOLD SPOT PRICE TODAY]\n${braveData?.gold || "(unavailable)"}`,
    `[BRAVE SEARCH — SILVER SPOT PRICE TODAY (use exact figure here for the Silver CFD entry)]\n${braveData?.silver || "(unavailable)"}`,
    `[BRAVE SEARCH — FOREX DXY EUR/USD GBP/USD TODAY]\n${braveData?.forex || "(unavailable)"}`,
    `[OPENNEWS — HIGH IMPACT (AI score ≥70)]\n${fmtNews(newsData?.highScore)}`,
    `[OPENNEWS — LATEST NEWS STREAM]\n${fmtNews(newsData?.latestNews)}`,
    `[OPENNEWS — MARKET SIGNALS (liquidations, funding, price)]\n${fmtNews(newsData?.marketEngine)}`,
    `[OPENNEWS — PREDICTION SIGNALS]\n${fmtNews(newsData?.predictionEngine)}`,
    `[TWITTER/X — BTC SENTIMENT]\n${fmtTweets(twitterData?.btc)}`,
    `[TWITTER/X — ETH SENTIMENT]\n${fmtTweets(twitterData?.eth)}`,
    `[TWITTER/X — BROAD CRYPTO SENTIMENT]\n${fmtTweets(twitterData?.broadCrypto)}`,
    `[BRAVE SEARCH — KEY ECONOMIC EVENTS TODAY]\n${braveData?.keyEvents || "(unavailable)"}`,
    `[BRAVE SEARCH — PREDICTION MARKET BTC ODDS]\n${braveData?.btcPrediction || "(unavailable)"}`,
    `[BRAVE SEARCH — PREDICTION MARKET ETH ODDS]\n${braveData?.ethPrediction || "(unavailable)"}`,
  ].join("\n\n---\n\n");

  return sections.slice(0, 40000);
}
