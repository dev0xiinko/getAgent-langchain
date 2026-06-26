import { describe, expect, it } from "vitest";
import { formatRecords, resolveTableId } from "../src/tools/larkTool";
import { config } from "../src/config";
import type { LarkRecord } from "../src/lark/larkCli";

const rec = (fields: Record<string, unknown>): LarkRecord => ({ record_id: "r", fields });

describe("resolveTableId", () => {
  it("returns null for names outside the allowlist (no arbitrary table access)", () => {
    expect(resolveTableId("campaigns")).toBe(null);
    expect(resolveTableId("../../etc")).toBe(null);
    expect(resolveTableId("")).toBe(null);
  });

  it("maps an allowlisted name to exactly its configured id (or null when unset)", () => {
    expect(resolveTableId("builder_info")).toBe(config.lark.tables.builderInfo || null);
    expect(resolveTableId("hall_of_fame")).toBe(config.lark.tables.hallOfFame || null);
  });
});

describe("formatRecords", () => {
  const records = [rec({ Name: "Alice", Rank: "Gold" }), rec({ Name: "Bob", Rank: "Silver" })];

  it("flattens records into compact labelled rows", () => {
    const out = formatRecords(records);
    expect(out).toContain("[1] Name: Alice | Rank: Gold");
    expect(out).toContain("[2] Name: Bob | Rank: Silver");
  });

  it("filters by query when matches exist", () => {
    const out = formatRecords(records, "bob");
    expect(out).toContain("Bob");
    expect(out).not.toContain("Alice");
  });

  it("falls back to all rows when the query matches nothing", () => {
    const out = formatRecords(records, "zzz");
    expect(out).toContain("Alice");
    expect(out).toContain("Bob");
  });

  it("reports cleanly when there are no records", () => {
    expect(formatRecords([])).toBe("No matching records found.");
  });
});
