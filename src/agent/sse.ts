import type { Response } from "express";

export interface Sse {
  send: (obj: Record<string, unknown>) => void;
  ping: () => void;
  done: () => void;
  closed: () => boolean;
}

/**
 * Wraps an Express response as an SSE stream.
 *
 * Wire forms:
 *   heartbeat   `: ping\n\n`               (SSE comment, not JSON)
 *   event       `data: {"token":"…"}\n\n`  (status | token | image | error)
 *   terminator  `data: [DONE]\n\n`
 */
export function makeSse(res: Response): Sse {
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no",
  });
  (res as any).flushHeaders?.();

  let closed = false;
  res.on("close", () => {
    closed = true;
  });

  return {
    send: (obj) => {
      if (!closed) res.write(`data: ${JSON.stringify(obj)}\n\n`);
    },
    ping: () => {
      if (!closed) res.write(`: ping\n\n`);
    },
    done: () => {
      if (!closed) {
        res.write("data: [DONE]\n\n");
        res.end();
        closed = true;
      }
    },
    closed: () => closed,
  };
}
