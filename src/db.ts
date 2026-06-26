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
}

export async function disconnectDb(): Promise<void> {
  await mongoose.disconnect();
}
