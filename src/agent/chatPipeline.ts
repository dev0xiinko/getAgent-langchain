import { SystemMessage, HumanMessage, ToolMessage, type BaseMessage } from "@langchain/core/messages";
import type { Response } from "express";
import { makeChat } from "../llm/providers";
import { AGENT_TOOLS, TOOLS_BY_NAME, TOOL_STATUS } from "../tools/index";
import { makeSse, type Sse } from "./sse";
import { buildSystemPrompt } from "./systemPrompt";
import {
  loadHistory,
  buildUserContent,
  persistUserMessage,
  persistAssistant,
  type AttachedFile,
} from "./history";
import { incrementUsage } from "../usage";
import type { AuthedUser } from "../auth";

function friendlyError(err: unknown): string {
  const msg = (err as Error)?.message ?? "";
  if (/abort|timeout/i.test(msg)) {
    return "That took longer than expected — please try again.";
  }
  return "Something went wrong handling your request — please try again.";
}

/** Call 2: streaming, NO tools (≡ tool_choice:'none'). Returns the accumulated text. */
export async function streamCall2(working: BaseMessage[], sse: Sse): Promise<string> {
  const model = makeChat({ streaming: true });
  let text = "";
  const stream = await model.stream(working, { timeout: 90_000 });
  for await (const chunk of stream) {
    if (sse.closed()) break;
    const piece = typeof chunk.content === "string" ? chunk.content : "";
    if (piece) {
      text += piece;
      sse.send({ token: piece });
    }
  }
  return text;
}

interface RunChatArgs {
  res: Response;
  user: AuthedUser;
  leader: boolean;
  sessionId: string;
  message: string;
  attachedFiles?: AttachedFile[];
}

/**
 * Two-call chat pipeline:
 *   Call 1 — non-streaming, tools enabled (45s). Runs each tool once (single round).
 *   Call 2 — streaming, tools disabled (90s, retry once if blank).
 */
export async function runChat({
  res,
  user,
  leader,
  sessionId,
  message,
  attachedFiles = [],
}: RunChatArgs): Promise<void> {
  const sse = makeSse(res);
  const heartbeat = setInterval(() => sse.ping(), 5000);

  let fullResponse = "";
  let toolUsed: string | null = null;
  let isError = false;

  try {
    const history = await loadHistory(user.uid, sessionId);
    await persistUserMessage(user.uid, sessionId, message, attachedFiles);

    const [systemContent, userContent] = await Promise.all([
      buildSystemPrompt({ user, query: message, history }),
      buildUserContent(message, attachedFiles),
    ]);

    const messages: BaseMessage[] = [
      new SystemMessage(systemContent),
      ...history,
      new HumanMessage({ content: userContent }),
    ];

    // ── CALL 1: non-streaming, tools enabled ──
    const call1 = makeChat({ streaming: false }).bindTools(AGENT_TOOLS);
    const ai = await call1.invoke(messages, { timeout: 45_000 });

    const working: BaseMessage[] = [...messages];
    const hasToolCalls = Array.isArray(ai.tool_calls) && ai.tool_calls.length > 0;

    if (hasToolCalls) {
      working.push(ai);
      for (const tc of ai.tool_calls!) {
        toolUsed = tc.name;
        sse.send({ status: TOOL_STATUS[tc.name] ?? "Working…" });
        let result: string;
        try {
          const tool = TOOLS_BY_NAME[tc.name];
          result = tool ? String(await tool.invoke(tc.args)) : `Tool error: unknown tool ${tc.name}`;
        } catch (e) {
          result = `Tool error: ${(e as Error).message}`;
        }
        working.push(new ToolMessage({ tool_call_id: tc.id!, content: result }));
      }

      // ── CALL 2: streaming, no tools (retry once if blank) ──
      fullResponse = await streamCall2(working, sse);
      if (!fullResponse && !sse.closed()) {
        sse.send({ status: "Retrying…" });
        fullResponse = await streamCall2(working, sse);
      }
      if (!fullResponse) {
        fullResponse = "Something went wrong generating the response — please try again.";
        sse.send({ token: fullResponse });
      }
    } else {
      // No tools needed — emit Call 1's content directly.
      fullResponse = typeof ai.content === "string" ? ai.content : "";
      sse.send({ token: fullResponse });
    }

    sse.done();
  } catch (err) {
    console.error("[chat] error:", err);
    fullResponse = friendlyError(err);
    isError = true;
    sse.send({ token: fullResponse });
    sse.done();
  } finally {
    clearInterval(heartbeat);
  }

  // Persist + meter (after the stream is closed).
  await persistAssistant(user.uid, sessionId, fullResponse, toolUsed, isError).catch((e) =>
    console.error("[chat] persist failed:", e),
  );
  if (!leader && !isError) {
    await incrementUsage(user.uid, "chat").catch((e) => console.error("[chat] usage failed:", e));
  }
}
