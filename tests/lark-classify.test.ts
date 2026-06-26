import { describe, expect, it } from "vitest";
import { classifyTools, isWriteTool } from "../src/lark/mcp/classify";

describe("isWriteTool (the safety boundary)", () => {
  it("flags mutating actions as writes", () => {
    for (const n of [
      "im_v1_message_create",
      "calendar_v4_calendar_event_create",
      "calendar_v4_calendar_event_attendee_batch_add",
      "bitable_v1_app_table_record_update",
      "bitable_v1_app_table_record_delete",
      "im_v1_message_reply",
    ]) {
      expect(isWriteTool(n)).toBe(true);
    }
  });

  it("treats clear read actions as reads", () => {
    for (const n of [
      "bitable_v1_app_table_record_search",
      "calendar_v4_calendar_event_list",
      "im_v1_chat_get",
      "bitable_v1_app_table_field_list",
    ]) {
      expect(isWriteTool(n)).toBe(false);
    }
  });

  it("fails safe: unknown / ambiguous tool names are treated as writes", () => {
    expect(isWriteTool("some_new_unrecognized_tool")).toBe(true);
    expect(isWriteTool("im_v1_message_forward")).toBe(true);
    expect(isWriteTool("weird_v1_thing_transfer")).toBe(true);
  });

  it("classifyTools splits names into reads and writes", () => {
    const { reads, writes } = classifyTools(["bitable_v1_app_table_record_search", "im_v1_message_create"]);
    expect(reads).toEqual(["bitable_v1_app_table_record_search"]);
    expect(writes).toEqual(["im_v1_message_create"]);
  });
});
