import { describe, expect, it } from "vitest";
import { embeddingStale, kbContentHash, mapKbRow } from "../src/agent/kb/larkSync";
import type { LarkRecord } from "../src/lark/client";

const row = (fields: Record<string, unknown>, id = "rec1"): LarkRecord => ({ record_id: id, fields });

describe("mapKbRow", () => {
  it("maps the standard columns", () => {
    const m = mapKbRow(
      row({
        Slug: "Builderhub-FAQ",
        Title: "FAQ",
        Body: "Some **body**",
        Platform: "reddit",
        Category: "platform",
        Intent: ["platform-questions"],
        Access: ["manager"],
        Status: "Published",
      }),
    );
    expect(m).not.toBeNull();
    expect(m!.docId).toBe("builderhub-faq"); // lowercased
    expect(m!.title).toBe("FAQ");
    expect(m!.body).toContain("Some **body**");
    expect(m!.status).toBe("published");
    expect(m!.meta).toMatchObject({ platform: "reddit", category: "platform", access: ["manager"] });
    expect(m!.meta.intent).toEqual(["platform-questions"]);
  });

  it("OMITS the access key when Access is empty (must not default-deny)", () => {
    const m = mapKbRow(row({ Slug: "open-doc", Body: "x", Access: [], Status: "Published" }));
    expect(m).not.toBeNull();
    expect("access" in m!.meta).toBe(false); // INVARIANT 1
  });

  it("returns null when there is no slug", () => {
    expect(mapKbRow(row({ Title: "no id", Body: "x" }))).toBeNull();
  });

  it("normalizes status", () => {
    expect(mapKbRow(row({ Slug: "a", Body: "x", Status: "Draft" }))!.status).toBe("draft");
    expect(mapKbRow(row({ Slug: "a", Body: "x", Status: "Archived" }))!.status).toBe("archived");
    expect(mapKbRow(row({ Slug: "a", Body: "x", Status: "Published" }))!.status).toBe("published");
  });
});

describe("kbContentHash", () => {
  it("is stable and content-sensitive", () => {
    expect(kbContentHash("a", "body")).toBe(kbContentHash("a", "body"));
    expect(kbContentHash("a", "body")).not.toBe(kbContentHash("a", "body2"));
    expect(kbContentHash("a", "body")).not.toBe(kbContentHash("b", "body")); // id is part of the key
  });
});

describe("embeddingStale (diff selection)", () => {
  const hash = kbContentHash("a", "body");
  it("is stale for new docs, changed content, or missing vector", () => {
    expect(embeddingStale(undefined, hash)).toBe(true);
    expect(embeddingStale({ contentHash: "old", vector: [1] }, hash)).toBe(true);
    expect(embeddingStale({ contentHash: hash, vector: [] }, hash)).toBe(true);
    expect(embeddingStale({ contentHash: hash, vector: null }, hash)).toBe(true);
  });
  it("reuses the stored vector when hash matches and a vector exists", () => {
    expect(embeddingStale({ contentHash: hash, vector: [1, 2, 3] }, hash)).toBe(false);
  });
});
