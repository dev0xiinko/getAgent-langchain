import { randomUUID } from "node:crypto";
import { rateLimit } from "express-rate-limit";
import type { CorsOptions } from "cors";
import type { ErrorRequestHandler, NextFunction, Request, RequestHandler, Response } from "express";
import { config, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS } from "./config";
import { logger, type Logger } from "./logger";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      id: string;
      log: Logger;
    }
  }
}

/** Stamp each request with an id (echoed as `X-Request-Id`) and a bound child logger. */
export const requestContext: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
  const incoming = req.header("x-request-id");
  req.id = incoming && incoming.length <= 128 ? incoming : randomUUID();
  req.log = logger.child({ reqId: req.id });
  res.setHeader("X-Request-Id", req.id);
  next();
};

/** Access log on response finish: method, path, status, duration. */
export const requestLogger: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
  const start = process.hrtime.bigint();
  res.on("finish", () => {
    const ms = Number(process.hrtime.bigint() - start) / 1e6;
    const line = { method: req.method, path: req.path, status: res.statusCode, ms: Math.round(ms) };
    if (res.statusCode >= 500) req.log.error("request", line);
    else if (res.statusCode >= 400) req.log.warn("request", line);
    else req.log.info("request", line);
  });
  next();
};

/** Minimal, dependency-free security headers (the subset helmet would set for a JSON API). */
export const securityHeaders: RequestHandler = (_req: Request, res: Response, next: NextFunction) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader("X-DNS-Prefetch-Control", "off");
  res.setHeader("X-Permitted-Cross-Domain-Policies", "none");
  if (config.isProd) {
    res.setHeader("Strict-Transport-Security", "max-age=15552000; includeSubDomains");
  }
  next();
};

/** CORS: reflect an explicit allowlist in prod; reflect any origin when none is set (dev). */
export const corsOptions: CorsOptions = {
  origin(origin, cb) {
    if (!origin || config.corsOrigins.length === 0 || config.corsOrigins.includes(origin)) {
      return cb(null, true);
    }
    cb(null, false);
  },
};

/** Per-IP rate limiter mounted in front of the per-user usage gate. */
export const apiRateLimiter = rateLimit({
  windowMs: RATE_LIMIT_WINDOW_MS,
  limit: RATE_LIMIT_MAX,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "rate_limited" },
});

/** 404 for unmatched routes. */
export const notFound: RequestHandler = (_req: Request, res: Response) => {
  res.status(404).json({ error: "not_found" });
};

/** Terminal error handler — logs with the request id and returns a safe JSON shape. */
export const errorHandler: ErrorRequestHandler = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const log = req.log ?? logger;
  log.error("unhandled_error", { message: (err as Error)?.message, stack: (err as Error)?.stack });
  if (res.headersSent) return next(err);
  res.status(500).json({ error: "internal_error", requestId: req.id });
};
