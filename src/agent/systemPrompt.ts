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

// Teaches the model to offer clickable quick-reply buttons. The web client parses a
// trailing ```suggest block and renders each line as a button that sends on click.
const QUICK_REPLY_INSTRUCTIONS = `=== INTERACTIVE QUICK REPLIES (UI capability) ===
The chat UI can turn your reply into clickable buttons so the user taps instead of typing. To offer them, end your message with a fenced block tagged \`suggest\`, one option per line:

\`\`\`suggest
X/Twitter
Reddit
CoinMarketCap
All platforms
\`\`\`

Rules:
- Use quick replies whenever the user's next answer is a choice from a small, discrete set — clarifying questions (platform, goal, content type, asset), confirmations (Yes / No), or an obvious next step.
- Ask ONE question per message and offer its options as quick replies. NEVER list several open questions in one message when the answers are discrete choices. This SUPERSEDES any earlier guidance about confirming the brief by asking about topic, platform, goal, and requirements together — gather those one at a time with quick replies instead, then draft.
- Each option MUST be a complete, self-contained user reply that makes sense on its own when clicked (e.g. "Drive sign-ups", not "Goal").
- Keep them short: 2–6 options, ideally ≤ 6 words each.
- Put the block LAST, after your message text. Never mention the block, "buttons", or "options below" in your prose — the UI renders them automatically.
- Do NOT use quick replies for open-ended creative input (e.g. "what should the post say?") or when there are no sensible preset answers.

Worked example — the user says "draft a campaign for me". Do NOT ask all four questions at once. Instead reply with just the first:

Happy to help! Which platform is this campaign for?

\`\`\`suggest
X/Twitter
Reddit
CoinMarketCap
A combination
\`\`\`

Then, after they answer, ask the next single question (what it's about, then the goal) the same way — one question, one \`suggest\` block each — before drafting.`;

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

  let content = `${CORE_GUARDRAILS}\n\n${base}\n\n${QUICK_REPLY_INSTRUCTIONS}`;
  if (kbCtx) content += `\n\n=== KNOWLEDGE BASE ===\n${kbCtx}`;
  if (dataCtx) content += `\n\n=== LIVE PLATFORM DATA ===\n${dataCtx}`;
  if (tweetCtx) content += `\n\n=== TWITTER/X CONTENT (via Grok) ===\n${tweetCtx}`;
  return content;
}
