import type { BaseMessage } from "@langchain/core/messages";
import { CORE_GUARDRAILS, AGENT_SYSTEM_PROMPT } from "../llm/guardrails";
import { BASE_SYSTEM_PROMPT } from "./baseSystemPrompt";
import { fetchKnowledgeBase } from "./kb/retriever";
import { buildDataContext } from "./dataContext";
import { fetchGrokTweetAnalysis, extractTwitterUrls } from "./grok";

interface User {
  uid: string;
  role: string;
  labels: string[];
  team?: string;
}

/** Strip the Reddit auto-posting block unless the user has the `Reddit` label. */
function stripRedditBlock(prompt: string, labels: string[]): string {
  if (labels.includes("Reddit")) return prompt;
  return prompt.replace(/\nReddit Auto Posting[\s\S]*?(?=\nX[/\\]Twitter and CMC)/m, "\n").trim();
}

/**
 * Assemble the full system prompt. Order:
 *   CORE_GUARDRAILS (always, non-overridable)
 *   + base (vault || fallback, Reddit block conditionally stripped)
 *   + === KNOWLEDGE BASE ===
 *   + === LIVE PLATFORM DATA ===
 *   + === TWITTER/X CONTENT (via Grok) ===
 */
export async function buildSystemPrompt(opts: {
  user: User;
  query: string;
  history: BaseMessage[];
}): Promise<string> {
  const { user, query, history } = opts;

  const tweetUrls = extractTwitterUrls(query);

  const [kbCtx, dataCtx, tweetCtx] = await Promise.all([
    fetchKnowledgeBase(query, { role: user.role, labels: user.labels, history }),
    buildDataContext({ uid: user.uid, team: user.team, labels: user.labels }),
    tweetUrls.length ? fetchGrokTweetAnalysis(tweetUrls) : Promise.resolve(null),
  ]);

  // Base prompt now lives in code (was fetched from the GitHub vault); AGENT_SYSTEM_PROMPT
  // remains only as a last-resort fallback if BASE_SYSTEM_PROMPT is ever emptied.
  let base = BASE_SYSTEM_PROMPT || AGENT_SYSTEM_PROMPT;
  base = stripRedditBlock(base, user.labels);

  let content = `${CORE_GUARDRAILS}\n\n${base}`;
  if (kbCtx) content += `\n\n=== KNOWLEDGE BASE ===\n${kbCtx}`;
  if (dataCtx) content += `\n\n=== LIVE PLATFORM DATA ===\n${dataCtx}`;
  if (tweetCtx) content += `\n\n=== TWITTER/X CONTENT (via Grok) ===\n${tweetCtx}`;
  return content;
}
