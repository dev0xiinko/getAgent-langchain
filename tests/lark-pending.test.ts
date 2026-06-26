import { describe, expect, it } from "vitest";
import { formatPreview, isPendingStale, PENDING_TTL_MS, quickResolve } from "../src/lark/mcp/pendingAction";

describe("quickResolve (bare yes/no fast path)", () => {
  it("resolves bare confirmations", () => {
    for (const m of ["yes", "Yes.", "confirm", "do it", "go ahead", "ok", "sure"]) {
      expect(quickResolve(m)).toBe("CONFIRM");
    }
  });

  it("resolves bare cancellations", () => {
    for (const m of ["no", "Nope", "cancel", "stop", "nevermind", "discard"]) {
      expect(quickResolve(m)).toBe("CANCEL");
    }
  });

  it("defers anything richer than a bare yes/no to the model (returns null)", () => {
    // Critical anti-misfire: "yes but ..." must NOT hard-confirm.
    for (const m of [
      "yes but at 4pm",
      "no wait, change the title",
      "confirm and also add Bob",
      "do it differently",
    ]) {
      expect(quickResolve(m)).toBe(null);
    }
  });
});

describe("isPendingStale", () => {
  it("is false within the TTL and true past it", () => {
    const now = 1_000_000_000_000;
    expect(isPendingStale(new Date(now - 1000), now)).toBe(false);
    expect(isPendingStale(new Date(now - PENDING_TTL_MS - 1), now)).toBe(true);
  });
});

describe("formatPreview", () => {
  it("renders a confirm-prompted preview for a calendar event", () => {
    const out = formatPreview("calendar_v4_calendar_event_create", {
      summary: "Campaign retro",
      description: "last week",
    });
    expect(out).toContain("Proposed action");
    expect(out).toContain("Campaign retro");
    expect(out.toLowerCase()).toContain("yes");
  });

  it("renders a message preview", () => {
    const out = formatPreview("im_v1_message_create", {
      receive_id: "oc_x",
      msg_type: "text",
      content: '{"text":"hi"}',
    });
    expect(out).toContain("oc_x");
  });

  it("falls back to JSON for unknown tools", () => {
    const out = formatPreview("something_v1_thing_create", { a: 1 });
    expect(out).toContain("```json");
  });
});
