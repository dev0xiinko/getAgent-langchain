import { beforeEach, describe, expect, it, vi } from "vitest";

// Shared, mutable mock state (hoisted so the vi.mock factories can close over it).
const h = vi.hoisted(() => ({
  invokeQueue: [] as any[],
  sseEvents: [] as any[],
  sseDone: { v: false },
  readInvoke: vi.fn(async () => "RECORDS: a,b,c"),
  writeInvoke: vi.fn(async () => "SHOULD_NOT_RUN_UNCONFIRMED"),
  setPending: vi.fn(async () => {}),
  clearPending: vi.fn(async () => {}),
  getFreshPending: vi.fn(async () => null as any),
  classifyReply: vi.fn(async () => "UNRELATED"),
  streamCall2: vi.fn(async () => "FINAL ANSWER"),
  persistAssistant: vi.fn(async () => {}),
}));

vi.mock("../src/agent/sse", () => ({
  makeSse: () => ({
    send: (o: any) => h.sseEvents.push(o),
    ping: () => {},
    done: () => {
      h.sseDone.v = true;
    },
    closed: () => false,
  }),
}));

vi.mock("../src/llm/providers", () => ({
  makeChat: () => ({ bindTools: () => ({ invoke: async () => h.invokeQueue.shift() }) }),
}));

vi.mock("../src/agent/history", () => ({
  loadHistory: async () => [],
  persistUserMessage: async () => {},
  persistAssistant: h.persistAssistant,
}));

vi.mock("../src/agent/larkSystemPrompt", () => ({ buildLarkSystemPrompt: async () => "SYS" }));
vi.mock("../src/agent/chatPipeline", () => ({ streamCall2: h.streamCall2 }));

vi.mock("../src/lark/mcp/client", () => ({
  getLarkMcp: async () => ({
    client: {},
    tools: [{ name: "bitable_v1_app_table_record_search" }, { name: "im_v1_message_create" }],
    byName: new Map<string, any>([
      [
        "bitable_v1_app_table_record_search",
        { name: "bitable_v1_app_table_record_search", invoke: h.readInvoke },
      ],
      ["im_v1_message_create", { name: "im_v1_message_create", invoke: h.writeInvoke }],
    ]),
  }),
  resetLarkMcp: () => {},
  larkMcpReady: () => true,
}));

vi.mock("../src/lark/mcp/pendingAction", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../src/lark/mcp/pendingAction")>();
  return {
    ...actual, // keep real quickResolve / formatPreview / isPendingStale
    getFreshPending: h.getFreshPending,
    setPending: h.setPending,
    clearPending: h.clearPending,
    classifyReply: h.classifyReply,
  };
});

import { runLarkChat } from "../src/agent/larkAgent";

const res = {} as any;
const user = { uid: "u1", role: "Manager", labels: [] } as any;

beforeEach(() => {
  h.invokeQueue.length = 0;
  h.sseEvents.length = 0;
  h.sseDone.v = false;
  h.readInvoke.mockClear();
  h.writeInvoke.mockClear();
  h.setPending.mockClear();
  h.clearPending.mockClear();
  h.streamCall2.mockClear();
  h.getFreshPending.mockResolvedValue(null);
});

describe("runLarkChat — capped loop + preview/confirm", () => {
  it("executes read tools across rounds, then streams a final answer", async () => {
    h.invokeQueue.push(
      { tool_calls: [{ name: "bitable_v1_app_table_record_search", args: {}, id: "1" }], content: "" },
      { tool_calls: [], content: "" },
    );

    await runLarkChat({ res, user, message: "list this week's campaigns" });

    expect(h.readInvoke).toHaveBeenCalledTimes(1);
    expect(h.writeInvoke).not.toHaveBeenCalled();
    expect(h.streamCall2).toHaveBeenCalledTimes(1);
    expect(h.sseDone.v).toBe(true);
  });

  it("HALTS on a write: persists a pending action, previews it, executes nothing", async () => {
    h.invokeQueue.push({
      tool_calls: [{ name: "im_v1_message_create", args: { receive_id: "oc_x", content: "hi" }, id: "1" }],
      content: "",
    });

    await runLarkChat({ res, user, message: "message the team" });

    expect(h.writeInvoke).not.toHaveBeenCalled(); // the write must NOT run this turn
    expect(h.setPending).toHaveBeenCalledTimes(1);
    expect(h.setPending.mock.calls[0][1].toolName).toBe("im_v1_message_create");
    expect(h.streamCall2).not.toHaveBeenCalled();
    expect(h.sseEvents.some((e) => typeof e.token === "string" && e.token.includes("Proposed action"))).toBe(
      true,
    );
    expect(h.sseDone.v).toBe(true);
  });

  it("executes the pending write only after a bare 'yes' confirmation", async () => {
    h.getFreshPending.mockResolvedValue({
      toolName: "im_v1_message_create",
      args: { receive_id: "oc_x", content: "hi" },
      preview: "Proposed action — please confirm",
      createdAt: new Date(),
    });

    await runLarkChat({ res, user, message: "yes" });

    expect(h.writeInvoke).toHaveBeenCalledTimes(1); // now it runs
    expect(h.clearPending).toHaveBeenCalledTimes(1);
    expect(h.sseDone.v).toBe(true);
  });
});
