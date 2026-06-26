import { afterEach, describe, expect, it, vi } from "vitest";

// Don't let a real on-disk .env leak into these assertions — control env explicitly.
vi.mock("dotenv", () => ({ default: { config: () => ({ parsed: {} }) } }));

const ENV = { ...process.env };

afterEach(() => {
  process.env = { ...ENV };
  vi.resetModules();
});

/** Fresh-import config with a controlled environment (config reads env at import time). */
async function load(overrides: Record<string, string>) {
  vi.resetModules();
  process.env = { ...ENV };
  for (const k of [
    "OPENROUTER_API_KEY",
    "MONGODB_URL",
    "MONGO_URI",
    "NODE_ENV",
    "CLOUDINARY_CLOUD_NAME",
    "CORS_ORIGINS",
  ]) {
    delete process.env[k];
  }
  Object.assign(process.env, overrides);
  return import("../src/config");
}

describe("validateEnv", () => {
  it("throws when OPENROUTER_API_KEY is missing", async () => {
    const { validateEnv } = await load({});
    expect(() => validateEnv()).toThrow(/OPENROUTER_API_KEY/);
  });

  it("returns a warnings array (no throw) in development with the key set", async () => {
    const { validateEnv } = await load({ OPENROUTER_API_KEY: "sk-test" });
    const warnings = validateEnv();
    expect(Array.isArray(warnings)).toBe(true);
  });

  it("throws in production without a Mongo URI", async () => {
    const { validateEnv } = await load({ OPENROUTER_API_KEY: "sk-test", NODE_ENV: "production" });
    expect(() => validateEnv()).toThrow(/MONGODB_URL/);
  });

  it("passes in production with key + Mongo, and warns about open CORS", async () => {
    const { validateEnv } = await load({
      OPENROUTER_API_KEY: "sk-test",
      NODE_ENV: "production",
      MONGODB_URL: "mongodb://h/db",
    });
    const warnings = validateEnv();
    expect(warnings.some((w) => w.includes("CORS_ORIGINS"))).toBe(true);
  });

  it("rejects an out-of-range PORT", async () => {
    const { validateEnv } = await load({ OPENROUTER_API_KEY: "sk-test", PORT: "99999" });
    expect(() => validateEnv()).toThrow(/PORT/);
  });
});
