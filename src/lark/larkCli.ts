/**
 * Thin, safe wrapper around the official `lark-cli` binary
 * (https://github.com/larksuite/cli) for the optional live-Lark chat tool.
 *
 * Safety model:
 *  - Spawned with `execFile` (NO shell) and a fixed argument array, so nothing the
 *    model produces is ever interpreted by a shell — no command injection surface.
 *  - The only model-influenced input is a table *enum* that we map server-side to a
 *    configured table id; the app token and table id in the request path are never
 *    taken from model text.
 *  - Read-only: it issues a single GET against the Bitable records endpoint.
 *  - Time-boxed and output-capped; every failure mode degrades to a thrown Error the
 *    caller turns into a friendly tool message (the chat never crashes).
 *
 * Auth note: `lark-cli` stores credentials in the OS keychain via `lark-cli auth
 * login`. It must be installed and authenticated on the host; otherwise calls fail
 * and the tool reports itself unavailable.
 */
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { config } from "../config";
import { logger } from "../logger";

const pExecFile = promisify(execFile);

const TIMEOUT_MS = 15_000;
const MAX_BUFFER = 4 * 1024 * 1024;

export interface LarkRecord {
  record_id: string;
  fields: Record<string, unknown>;
}

/** True only when the operator opted in via env AND a base token is configured. */
export function larkCliAvailable(): boolean {
  return config.larkCli.enabled && Boolean(config.lark.dataBaseToken);
}

/**
 * List records from a Bitable table via `lark-cli api GET …`. `appToken` and
 * `tableId` are caller-controlled (never raw model text). Returns parsed records.
 */
export async function listBaseRecords(tableId: string, pageSize = 20): Promise<LarkRecord[]> {
  const appToken = config.lark.dataBaseToken;
  const path = `/open-apis/bitable/v1/apps/${appToken}/tables/${tableId}/records`;
  const args = ["api", "GET", path, "--params", JSON.stringify({ page_size: pageSize }), "--format", "json"];

  let stdout: string;
  try {
    ({ stdout } = await pExecFile(config.larkCli.bin, args, { timeout: TIMEOUT_MS, maxBuffer: MAX_BUFFER }));
  } catch (e) {
    const err = e as NodeJS.ErrnoException;
    if (err.code === "ENOENT") throw new Error("lark-cli binary not found on PATH");
    throw new Error(`lark-cli failed: ${(err.message ?? "unknown").slice(0, 200)}`);
  }

  let json: any;
  try {
    json = JSON.parse(stdout);
  } catch {
    throw new Error("lark-cli returned non-JSON output");
  }
  // lark-cli passes the raw Open API envelope straight through.
  if (json?.code && json.code !== 0) throw new Error(`Lark API error ${json.code}: ${json.msg ?? ""}`);
  const items = (json?.data?.items ?? json?.items) as LarkRecord[] | undefined;
  if (!Array.isArray(items)) throw new Error("unexpected lark-cli response shape");
  logger.debug("[lark-cli] listed records", { tableId, count: items.length });
  return items;
}
