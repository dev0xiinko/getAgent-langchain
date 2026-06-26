/**
 * Shared Lark MCP client. Spawns ONE `@larksuiteoapi/lark-mcp` stdio child for the
 * whole server (not per-user) and surfaces its tools into LangChain via
 * `@langchain/mcp-adapters`.
 *
 * Lifecycle: lazily spawned on first use behind a promise-singleton (so concurrent
 * first requests don't double-spawn); a failed spawn resets the singleton so the
 * next request can retry; `closeLarkMcp()` (wired into graceful shutdown) terminates
 * the child. The child binary is the *installed* package (resolved path) — never
 * `npx`, because the prod bundle is built with `--packages=external`.
 */
import { createRequire } from "node:module";
import path from "node:path";
import type { MultiServerMCPClient } from "@langchain/mcp-adapters";
import type { StructuredToolInterface } from "@langchain/core/tools";
import { config } from "../../config";
import { logger } from "../../logger";
import { classifyTools } from "./classify";

const require = createRequire(import.meta.url);

export interface LarkMcp {
  client: MultiServerMCPClient;
  tools: StructuredToolInterface[];
  byName: Map<string, StructuredToolInterface>;
}

let larkPromise: Promise<LarkMcp> | null = null;

/** True when the feature is enabled and the shared app credentials are present. */
export function larkMcpReady(): boolean {
  return config.larkMcp.enabled && Boolean(config.lark.appId && config.lark.appSecret);
}

/** Absolute path to the installed lark-mcp CLI entry (`dist/cli.js`). */
function resolveLarkMcpBin(): string {
  const pkgJson = require.resolve("@larksuiteoapi/lark-mcp/package.json");
  const bin = require("@larksuiteoapi/lark-mcp/package.json").bin?.["lark-mcp"] ?? "dist/cli.js";
  return path.join(path.dirname(pkgJson), bin);
}

async function spawn(): Promise<LarkMcp> {
  // Imported lazily so a connector/SDK load issue can never crash core server boot.
  const { MultiServerMCPClient } = await import("@langchain/mcp-adapters");
  const binJs = resolveLarkMcpBin();
  const args = [
    binJs,
    "mcp",
    "-a",
    config.lark.appId,
    "-s",
    config.lark.appSecret,
    "-d",
    config.larkMcp.domain,
    "-t",
    config.larkMcp.tools,
    "--token-mode",
    config.larkMcp.tokenMode,
    "-c",
    "snake", // OpenAI-safe tool names (no dots)
    "-l",
    "en",
    "-m",
    "stdio",
  ];

  const client = new MultiServerMCPClient({
    throwOnLoadError: true,
    prefixToolNameWithServerName: false,
    additionalToolNamePrefix: "",
    useStandardContentBlocks: true,
    mcpServers: {
      lark: { transport: "stdio", command: process.execPath, args, stderr: "inherit" },
    },
  });

  const tools = (await client.getTools()) as StructuredToolInterface[];
  const byName = new Map(tools.map((t) => [t.name, t]));
  const { reads, writes } = classifyTools(tools.map((t) => t.name));
  logger.info("[lark-mcp] connected", { tools: tools.length, reads: reads.length, writes: writes.length });
  return { client, tools, byName };
}

/** Get the shared client + tools, spawning on first use. Resets the singleton on failure. */
export function getLarkMcp(): Promise<LarkMcp> {
  if (!larkPromise) {
    larkPromise = spawn().catch((e) => {
      larkPromise = null; // allow a retry on the next request
      throw e;
    });
  }
  return larkPromise;
}

/** Drop the cached client (e.g. after a child crash) so the next call respawns. */
export function resetLarkMcp(): void {
  larkPromise = null;
}

/** Terminate the child and clear the singleton. Safe to call when never started. */
export async function closeLarkMcp(): Promise<void> {
  if (!larkPromise) return;
  try {
    const { client } = await larkPromise;
    await client.close();
    logger.info("[lark-mcp] closed");
  } catch (e) {
    logger.warn("[lark-mcp] close failed", { message: (e as Error).message });
  } finally {
    larkPromise = null;
  }
}
