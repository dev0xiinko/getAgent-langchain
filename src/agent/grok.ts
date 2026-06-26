import { HumanMessage } from "@langchain/core/messages";
import { makeChat } from "../llm/providers";
import { GROK_MODEL } from "../config";

/** Pull twitter.com / x.com URLs out of a message (dedup, strip trailing punctuation). */
export function extractTwitterUrls(text: string): string[] {
  const re = /https?:\/\/(?:www\.)?(?:twitter\.com|x\.com)\/[^\s)]+/gi;
  const found = (text.match(re) ?? []).map((u) => u.replace(/[.,!?]+$/, ""));
  return [...new Set(found)];
}

/**
 * Analyse tweet URLs via Grok (`x-ai/grok-4.3:online`). Single non-tool call.
 * Returns null on any failure so the prompt simply omits the block.
 */
export async function fetchGrokTweetAnalysis(urls: string[]): Promise<string | null> {
  if (!urls.length) return null;
  try {
    const model = makeChat({ streaming: false, model: GROK_MODEL });
    const prompt =
      `Analyse the following Twitter/X posts. For each URL, give a concise analysis: main content, key ` +
      `claims, tone, author, engagement, and any notable replies. If a post is unavailable, say so.\n\n` +
      urls.map((u, i) => `${i + 1}. ${u}`).join("\n");
    const res = await model.invoke([new HumanMessage(prompt)], { timeout: 30_000 });
    const content = typeof res.content === "string" ? res.content : "";
    return content || null;
  } catch {
    return null;
  }
}
