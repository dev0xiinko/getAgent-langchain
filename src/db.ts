import mongoose from "mongoose";
import { config } from "./config";
import { logger } from "./logger";

/** Hide credentials before logging a connection string. */
function redact(uri: string): string {
  return uri.replace(/\/\/([^:@/]+):([^@/]+)@/, "//$1:***@");
}

export async function connectDb(): Promise<void> {
  mongoose.set("strictQuery", true);
  mongoose.connection.on("error", (e) => logger.error("[db] connection error", { message: e.message }));
  mongoose.connection.on("disconnected", () => logger.warn("[db] disconnected"));
  await mongoose.connect(config.mongoUri, { serverSelectionTimeoutMS: 10_000 });
  logger.info("[db] connected", { uri: redact(config.mongoUri) });
  await dropLegacyIndexes();
}

/**
 * Sessions moved from one-per-uid to many-per-(uid, sessionId). A dev DB created
 * before that change carries a stale `unique` index on `uid` that would block a
 * second conversation. Drop it once, idempotently, on boot.
 */
async function dropLegacyIndexes(): Promise<void> {
  try {
    const coll = mongoose.connection.collection("agentsessions");
    const indexes = await coll.indexes();
    const stale = indexes.find((i) => i.name === "uid_1" && i.unique);
    if (stale) {
      await coll.dropIndex("uid_1");
      logger.info("[db] dropped legacy unique index agentsessions.uid_1");
    }
  } catch (e) {
    logger.warn("[db] legacy index check skipped", { message: (e as Error).message });
  }
}

export async function disconnectDb(): Promise<void> {
  await mongoose.disconnect();
}
