import cron from "node-cron";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";
import { makeChat } from "../llm/providers";
import { DailyMarketReport } from "../models/DailyMarketReport";
import { config } from "../config";
import { DR_SYSTEM, DR_FORMAT } from "./dailyReportPrompt";
import { aggregateSources } from "./marketSources";

function todayUtc8(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kuala_Lumpur" }); // YYYY-MM-DD
}

function todayLong(): string {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "Asia/Kuala_Lumpur",
  });
}

/**
 * Drop any "•" bullet that still carries an unsubstituted numeric placeholder
 * (X.XX, $XX.XX, ±X.XX%) the model copied verbatim from the format template.
 * Scoped to bullets so headers and prose ("Twitter/X", "SpaceX") are untouched.
 */
function sanitizeDailyReport(content: string): string {
  // XX / X.X / X,X cover $XX.XX, ±X.XX% etc.; the [(+\-±]X% clause also catches the
  // single-X form "(+X%)" the legacy regex let through. "Twitter/X" / "SpaceX" (no
  // trailing %) stay safe.
  const PLACEHOLDER_RE = /XX|X[.,]X|[(+\-±]X%/;
  const lines = content.split("\n");
  const kept = lines.filter((line) => !(line.trim().startsWith("•") && PLACEHOLDER_RE.test(line)));
  const stripped = lines.length - kept.length;
  if (stripped > 0) console.log(`[daily-report] stripped ${stripped} placeholder line(s)`);
  return kept.join("\n");
}

/** Aggregate sources → synthesize the brief → upsert by date. Fire-and-forget safe. */
export async function runDailyReport(): Promise<void> {
  if (!config.newsToken) {
    console.warn("[daily-report] NEWS_MARKETS_TOKEN not set — skipping");
    return;
  }
  try {
    const raw = await aggregateSources();
    const model = makeChat({ streaming: false }); // no tools, no temperature
    const res = await model.invoke(
      [
        new SystemMessage(DR_SYSTEM),
        new HumanMessage(
          `Today is ${todayLong()} (report generated at 11:30 AM UTC+8).\n\nBelow is today's raw data from all sources:\n\n${raw}\n\n${DR_FORMAT}`,
        ),
      ],
      { timeout: 120_000 },
    );
    const content = typeof res.content === "string" ? res.content : "";
    const cleaned = sanitizeDailyReport(content);
    if (!cleaned.trim()) {
      console.error("[daily-report] empty after sanitize — skipping save");
      return;
    }
    await DailyMarketReport.findOneAndUpdate(
      { date: todayUtc8() },
      { content: cleaned, generatedAt: new Date() },
      { upsert: true },
    );
    console.log(`[daily-report] generated for ${todayUtc8()}`);
  } catch (e) {
    console.error("[daily-report] failed:", (e as Error).message);
  }
}

/** GET handler data: today's report, else newest flagged stale, else null. */
export async function getDailyReport() {
  const today = await DailyMarketReport.findOne({ date: todayUtc8() }).lean();
  if (today) return { report: today, stale: false };
  const latest = await DailyMarketReport.findOne().sort({ date: -1 }).lean();
  if (latest) return { report: latest, stale: true };
  return { report: null };
}

/** 03:30 UTC = 11:30 AM UTC+8. */
export function scheduleDailyReport(): void {
  cron.schedule("30 3 * * *", () => void runDailyReport(), { timezone: "UTC" });
  console.log("[daily-report] scheduled (03:30 UTC / 11:30 UTC+8)");
}
