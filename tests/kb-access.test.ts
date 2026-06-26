import { describe, expect, it } from "vitest";
import { canAccess, categoryBoost, cosineSim, detectPlatform } from "../src/agent/kb/access";
import type { KbMeta } from "../src/agent/kb/frontmatter";

const meta = (m: Partial<KbMeta>): KbMeta => m as KbMeta;

describe("canAccess (P0-2/P0-3 default-deny)", () => {
  it("treats a file with no access field as open to all", () => {
    expect(canAccess("Member", meta({}), [])).toBe(true);
  });

  it("DENIES when the access field is present but malformed or empty", () => {
    expect(canAccess("Manager", meta({ access: [] }), [])).toBe(false);
    expect(canAccess("Manager", meta({ access: "manager" as unknown as string[] }), [])).toBe(false);
  });

  it("gates reddit_team files behind the Reddit label", () => {
    expect(canAccess("Member", meta({ access: ["reddit_team"] }), ["Reddit"])).toBe(true);
    expect(canAccess("Member", meta({ access: ["reddit_team"] }), [])).toBe(false);
  });

  it("respects role-scoped access", () => {
    expect(canAccess("Manager", meta({ access: ["manager"] }), [])).toBe(true);
    expect(canAccess("Member", meta({ access: ["manager"] }), [])).toBe(false);
    expect(canAccess("Member", meta({ access: ["trainee"] }), [])).toBe(true);
  });
});

describe("detectPlatform", () => {
  it("detects platforms from the query", () => {
    expect(detectPlatform("write a tweet about BTC")).toBe("twitter");
    expect(detectPlatform("post to reddit")).toBe("reddit");
    expect(detectPlatform("update the CMC listing")).toBe("cmc");
    expect(detectPlatform("how do rewards work")).toBe(null);
  });
});

describe("categoryBoost", () => {
  it("boosts matching category/intent and stays neutral otherwise", () => {
    expect(categoryBoost(meta({ category: "content-templates" }), "help me write a post")).toBeCloseTo(1.3);
    expect(categoryBoost(meta({ category: "campaigns" }), "plan a campaign")).toBeCloseTo(1.3);
    expect(categoryBoost(meta({ category: "platform" }), "totally unrelated text")).toBe(1.0);
  });
});

describe("cosineSim", () => {
  it("is 1 for identical, 0 for orthogonal or zero vectors", () => {
    expect(cosineSim([1, 2, 3], [1, 2, 3])).toBeCloseTo(1);
    expect(cosineSim([1, 0], [0, 1])).toBeCloseTo(0);
    expect(cosineSim([0, 0], [1, 1])).toBe(0);
  });
});
