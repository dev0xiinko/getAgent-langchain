/**
 * General Lark agent (`POST /server/agent/lark`). A capped multi-step tool loop over
 * the Lark MCP tools:
 *   - read tools execute inline across rounds;
 *   - the FIRST write tool in any turn HALTS the loop, persists a pending action, and
 *     streams a preview — nothing is written until the user confirms on a later turn.
 *
 * Write safety is enforced here in code (classify + halt), not by trusting the model.
 */
import { SystemMessage, HumanMessage, ToolMessage, type BaseMessage } from "@langchain/core/messages";
import type { Response } from "express";
import { makeChat } from "../llm/providers";
import { makeSse } from "./sse";
import { streamCall2 } from "./chatPipeline";
import { loadHistory, persistUserMessage, persistAssistant } from "./history";
import { LARK_SESSION_ID } from "../models/AgentSession";
import { buildLarkSystemPrompt } from "./larkSystemPrompt";
import { getLarkMcp, resetLarkMcp } from "../lark/mcp/client";
import { isWriteTool } from "../lark/mcp/classify";
import {
  classifyReply,
  clearPending,
  formatPreview,
  getFreshPending,
  quickResolve,
  setPending,
} from "../lark/mcp/pendingAction";
import type { AuthedUser } from "../auth";
import { logger } from "../logger";

const MAX_ROUNDS = 5;
const ROUND_TIMEOUT_MS = 45_000;
const WALL_CLOCK_MS = 120_000;
const MAX_TOOL_OUTPUT = 8000;

interface RunLarkArgs {
  res: Response;
  user: AuthedUser;
  message: string;
}

/** MCP tool output can be a string or content blocks — coerce to a capped string. */
function coerce(out: unknown): string {
  const s = typeof out === "string" ? out : JSON.stringify(out);
  return s.slice(0, MAX_TOOL_OUTPUT);
}

function statusFor(name: string): string {
  if (name.includes("calendar")) return "Working with the calendar…";
  if (name.includes("message") || name.includes("im_")) return "Working with messages…";
  if (name.includes("record") || name.includes("bitable")) return "Reading the Base…";
  return "Working…";
}

function friendly(err: unknown): string {
  const msg = (err as Error)?.message ?? "";
  if (/ENOENT|not found|spawn/i.test(msg)) return "The Lark connector isn't available right now.";
  if (/abort|timeout/i.test(msg)) return "That took longer than expected — please try again.";
  return "Something went wrong talking to Lark — please try again.";
}

export async function runLarkChat({ res, user, message }: RunLarkArgs): Promise<void> {
  const sse = makeSse(res);
  const heartbeat = setInterval(() => sse.ping(), 5000);

  let fullResponse = "";
  let toolUsed: string | null = null;
  let isError = false;
  let handled = false;
  let crashed = false;

  try {
    await persistUserMessage(user.uid, LARK_SESSION_ID, message);
    const { client: _client, tools, byName } = await getLarkMcp();
    void _client;

    // ── 1) Resolve an outstanding confirmation FIRST. ──
    const pending = await getFreshPending(user.uid);
    if (pending) {
      const decision = quickResolve(message) ?? (await classifyReply(message, pending.preview));
      if (decision === "CONFIRM") {
        sse.send({ status: "Doing it…" });
        const tool = byName.get(pending.toolName);
        if (!tool || !isWriteTool(pending.toolName)) {
          fullResponse = "That action is no longer available — nothing was changed.";
        } else {
          try {
            const result = coerce(await tool.invoke(pending.args as Record<string, unknown>));
            fullResponse = `Done ✅\n\n${result.slice(0, 600)}`;
          } catch (e) {
            isError = true;
            fullResponse = `That didn't go through: ${(e as Error).message}`;
          }
        }
        toolUsed = pending.toolName;
        await clearPending(user.uid);
        sse.send({ token: fullResponse });
        handled = true;
      } else if (decision === "CANCEL") {
        await clearPending(user.uid);
        fullResponse = "Okay — cancelled. Nothing was changed.";
        sse.send({ token: fullResponse });
        handled = true;
      } else {
        // MODIFY / UNRELATED → drop the stale draft and treat as a fresh request.
        await clearPending(user.uid);
      }
    }

    // ── 2) Capped multi-round tool loop. ──
    if (!handled) {
      const history = await loadHistory(user.uid, LARK_SESSION_ID);
      const today = new Date().toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        timeZone: "Asia/Kuala_Lumpur",
      });
      const working: BaseMessage[] = [
        new SystemMessage(await buildLarkSystemPrompt()),
        ...history,
        new HumanMessage(`Today is ${today} (UTC+8).\n\n${message}`),
      ];

      const model = makeChat({ streaming: false }).bindTools(tools);
      const deadline = Date.now() + WALL_CLOCK_MS;
      let halted = false;

      for (let round = 0; round < MAX_ROUNDS && Date.now() < deadline; round++) {
        const ai = await model.invoke(working, { timeout: ROUND_TIMEOUT_MS });
        const calls = Array.isArray(ai.tool_calls) ? ai.tool_calls : [];
        if (!calls.length) {
          working.push(ai);
          break;
        }

        // Any write in this turn → halt, preview the first write, execute NOTHING.
        const writeCall = calls.find((c) => isWriteTool(c.name));
        if (writeCall) {
          const preview = formatPreview(writeCall.name, (writeCall.args ?? {}) as Record<string, unknown>);
          await setPending(user.uid, { toolName: writeCall.name, args: writeCall.args ?? {}, preview });
          toolUsed = writeCall.name;
          fullResponse = preview;
          sse.send({ token: preview });
          halted = true;
          break;
        }

        // All reads → execute and continue the loop.
        working.push(ai);
        for (const c of calls) {
          sse.send({ status: statusFor(c.name) });
          let result: string;
          try {
            const tool = byName.get(c.name);
            result = tool ? coerce(await tool.invoke(c.args ?? {})) : `Tool error: unknown tool ${c.name}`;
          } catch (e) {
            result = `Tool error: ${(e as Error).message}`;
          }
          working.push(new ToolMessage({ tool_call_id: c.id!, content: result }));
          toolUsed = c.name;
        }
      }

      if (!halted) {
        fullResponse = await streamCall2(working, sse);
        if (!fullResponse) {
          fullResponse = "I couldn't complete that — please try again.";
          sse.send({ token: fullResponse });
        }
      }
    }

    sse.done();
  } catch (err) {
    crashed = true;
    logger.error("[lark] error", { message: (err as Error).message });
    isError = true;
    fullResponse = friendly(err);
    sse.send({ token: fullResponse });
    sse.done();
  } finally {
    clearInterval(heartbeat);
  }

  // A spawn/transport failure may mean a dead child — drop the singleton so the next
  // request respawns it.
  if (crashed) resetLarkMcp();

  await persistAssistant(user.uid, LARK_SESSION_ID, fullResponse, toolUsed, isError).catch((e) =>
    logger.error("[lark] persist failed", { message: (e as Error).message }),
  );
}
