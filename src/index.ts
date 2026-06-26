import express from "express";
import cors from "cors";
import path from "node:path";
import type { Server } from "node:http";
import { fileURLToPath } from "node:url";
import { config, validateEnv } from "./config";
import { logger } from "./logger";
import { connectDb, disconnectDb } from "./db";
import {
  apiRateLimiter,
  corsOptions,
  errorHandler,
  notFound,
  requestContext,
  requestLogger,
  securityHeaders,
} from "./middleware";
import { agentRouter } from "./routes/agent";
import { warmKb } from "./agent/kb/store";
import { scheduleDailyReport } from "./agent/dailyReport";
import { scheduleKbSync } from "./agent/kb/larkSync";
import { closeLarkMcp } from "./lark/mcp/client";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function main() {
  // Fail fast on bad/missing config before we touch the network.
  for (const w of validateEnv()) logger.warn("[config] " + w);

  await connectDb();

  const app = express();
  app.disable("x-powered-by");
  app.set("trust proxy", true); // honour X-Forwarded-* behind a load balancer

  app.use(requestContext);
  app.use(requestLogger);
  app.use(securityHeaders);
  app.use(cors(corsOptions));
  app.use(express.json({ limit: "25mb" })); // attachments arrive as base64

  app.get("/health", (_req, res) => res.json({ ok: true }));

  // Per-IP limiter in front of the per-user usage gate.
  app.use("/server/agent", apiRateLimiter, agentRouter);

  // Static test client at "/" (public/index.html).
  app.use(express.static(path.join(__dirname, "..", "public")));

  // Dev-only helpers for the test client (seed a UserMeta so auth passes).
  if (!config.isProd) {
    const { devRouter } = await import("./routes/dev");
    app.use("/server/dev", devRouter);
    logger.info("[server] dev routes mounted at /server/dev");
  }

  app.use(notFound);
  app.use(errorHandler);

  // Embed the in-code KB once on boot (never in the request path). The KB is static
  // code now — no background refresh; restart to pick up edits to agent/kb/docs.ts.
  warmKb().catch((e) => logger.warn("[kb] embed warm failed", { message: e.message }));

  scheduleDailyReport();
  scheduleKbSync(); // periodic Lark→KB sync (no-op when the table id is unset)

  const server = app.listen(config.port, () => logger.info(`[server] listening on :${config.port}`));
  installShutdown(server);
}

/** Drain in-flight requests, close the DB, then exit. Force-exits if drain stalls. */
function installShutdown(server: Server) {
  let closing = false;
  const shutdown = (signal: string) => {
    if (closing) return;
    closing = true;
    logger.info(`[server] ${signal} received — shutting down`);
    const force = setTimeout(() => {
      logger.error("[server] forced exit (drain timed out)");
      process.exit(1);
    }, 10_000);
    force.unref();
    server.close(async () => {
      await closeLarkMcp().catch(() => {});
      await disconnectDb().catch(() => {});
      logger.info("[server] closed cleanly");
      process.exit(0);
    });
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("unhandledRejection", (reason) =>
    logger.error("[process] unhandledRejection", { reason: String(reason) }),
  );
  process.on("uncaughtException", (err) => {
    logger.error("[process] uncaughtException", { message: err.message, stack: err.stack });
    shutdown("uncaughtException");
  });
}

main().catch((e) => {
  logger.error("[server] fatal", { message: (e as Error).message, stack: (e as Error).stack });
  process.exit(1);
});
