/**
 * Optional live-Lark chat tool. Lets the agent look up Builder Hub workspace data
 * (builder info, achievements, hall of fame) directly from Lark Bitable at request
 * time, via the official `lark-cli` binary. Registered only when enabled — see
 * `larkCliAvailable()` and the conditional in tools/index.ts.
 *
 * The model picks a table by *name* from a fixed allowlist; we resolve that to a
 * configured table id. The model never supplies app tokens or table ids.
 */
import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import { config } from "../config";
import { getText } from "../lark/fields";
import { listBaseRecords, type LarkRecord } from "../lark/larkCli";

/** Allowlisted, human-facing table names → configured Bitable table ids. */
export const LARK_TABLE_ALLOWLIST = {
  builder_info: () => config.lark.tables.builderInfo,
  achievements: () => config.lark.tables.achievement,
  hall_of_fame: () => config.lark.tables.hallOfFame,
} as const;

export type LarkTableName = keyof typeof LARK_TABLE_ALLOWLIST;

const MAX_RECORDS = 15;
const MAX_OUTPUT_CHARS = 6000;

/** Resolve an allowlisted table name to its configured id, or null if unknown/unset. */
export function resolveTableId(name: string): string | null {
  const get = LARK_TABLE_ALLOWLIST[name as LarkTableName];
  const id = get?.();
  return id || null;
}

/** Flatten records to a compact, model-friendly block, optionally filtered by `query`. */
export function formatRecords(records: LarkRecord[], query?: string): string {
  const rows = records.map((r) => {
    const parts = Object.entries(r.fields)
      .map(([k, v]) => {
        const val = getText(v);
        return val ? `${k}: ${val}` : "";
      })
      .filter(Boolean);
    return parts.join(" | ");
  });

  let filtered = rows.filter(Boolean);
  if (query?.trim()) {
    const q = query.toLowerCase();
    const hits = filtered.filter((row) => row.toLowerCase().includes(q));
    if (hits.length) filtered = hits;
  }
  if (!filtered.length) return "No matching records found.";

  return filtered
    .slice(0, MAX_RECORDS)
    .map((row, i) => `[${i + 1}] ${row}`)
    .join("\n")
    .slice(0, MAX_OUTPUT_CHARS);
}

export const lookupLarkBase = new DynamicStructuredTool({
  name: "lookup_lark_base",
  description:
    "Look up live Builder Hub workspace data from Lark: builder profiles/stats, achievement records, or the " +
    "hall of fame. Use when the user asks about a specific builder's standing, achievements, rankings, or who " +
    "is featured. Not for campaigns or announcements (those are already provided in context).",
  schema: z.object({
    table: z.enum(["builder_info", "achievements", "hall_of_fame"]).describe("Which workspace table to read"),
    query: z
      .string()
      .optional()
      .describe("Optional name/keyword to filter records by, e.g. a builder name or handle"),
  }),
  func: async ({ table, query }) => {
    const tableId = resolveTableId(table);
    if (!tableId) return `The "${table}" table is not configured, so it can't be looked up right now.`;
    try {
      const records = await listBaseRecords(tableId);
      return formatRecords(records, query);
    } catch (e) {
      return `Live Lark lookup is unavailable right now (${(e as Error).message}).`;
    }
  },
});
