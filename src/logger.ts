/**
 * Tiny dependency-free structured logger.
 *
 * - In production (`NODE_ENV=production`) it emits one JSON object per line, which
 *   ships cleanly to log aggregators (Datadog, Loki, CloudWatch, …).
 * - In development it prints a compact, colourised, human-readable line.
 *
 * Level is controlled by `LOG_LEVEL` (debug | info | warn | error); default `info`.
 * Attach structured fields by passing a context object as the second argument.
 */
type Level = "debug" | "info" | "warn" | "error";

const ORDER: Record<Level, number> = { debug: 10, info: 20, warn: 30, error: 40 };
const isProd = process.env.NODE_ENV === "production";
const threshold =
  ORDER[(process.env.LOG_LEVEL as Level) in ORDER ? (process.env.LOG_LEVEL as Level) : "info"];

const COLOR: Record<Level, string> = {
  debug: "\x1b[90m",
  info: "\x1b[36m",
  warn: "\x1b[33m",
  error: "\x1b[31m",
};
const RESET = "\x1b[0m";

function emit(level: Level, msg: string, ctx?: Record<string, unknown>): void {
  if (ORDER[level] < threshold) return;
  const time = new Date().toISOString();

  if (isProd) {
    process.stdout.write(JSON.stringify({ level, time, msg, ...ctx }) + "\n");
    return;
  }

  const tail = ctx && Object.keys(ctx).length ? " " + JSON.stringify(ctx) : "";
  const line = `${COLOR[level]}${level.toUpperCase().padEnd(5)}${RESET} ${msg}${tail}`;
  (level === "error" || level === "warn" ? process.stderr : process.stdout).write(line + "\n");
}

export interface Logger {
  debug(msg: string, ctx?: Record<string, unknown>): void;
  info(msg: string, ctx?: Record<string, unknown>): void;
  warn(msg: string, ctx?: Record<string, unknown>): void;
  error(msg: string, ctx?: Record<string, unknown>): void;
  /** Derive a logger that stamps every line with the given fields (e.g. a request id). */
  child(bindings: Record<string, unknown>): Logger;
}

function make(bindings: Record<string, unknown> = {}): Logger {
  const wrap = (level: Level) => (msg: string, ctx?: Record<string, unknown>) =>
    emit(level, msg, { ...bindings, ...ctx });
  return {
    debug: wrap("debug"),
    info: wrap("info"),
    warn: wrap("warn"),
    error: wrap("error"),
    child: (extra) => make({ ...bindings, ...extra }),
  };
}

export const logger = make();
