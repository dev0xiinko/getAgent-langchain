/**
 * Lark → dynamic KB sync. Pulls KB docs from a Lark Bitable table, embeds only the
 * rows whose content changed, upserts them into Mongo (`KbDoc`), archives rows that
 * disappeared from Lark, and reloads the in-memory KB cache — all without a restart.
 *
 * Two correctness invariants (see the plan):
 *  1. Empty `Access` → OMIT the `access` key (never set `access: []`), or access.ts
 *     default-deny would make the doc silently vanish.
 *  2. Embed BEFORE persist; if embedding throws, abort the whole sync (no upsert, no
 *     reload) so a partial failure never leaves a body without a matching vector.
 */
import { createHash } from "node:crypto";
import cron from "node-cron";
import { config } from "../../config";
import { logger } from "../../logger";
import { embeddings } from "../../llm/providers";
import { searchRecords, type LarkRecord } from "../../lark/client";
import { getDetailsText, getLabels, getText } from "../../lark/fields";
import { KbDoc } from "../../models/KbDoc";
import { reloadKb } from "./store";
import type { KbMeta } from "./frontmatter";

export interface MappedKbDoc {
  docId: string;
  title: string;
  body: string;
  meta: KbMeta;
  status: "published" | "draft" | "archived";
  larkRecordId: string;
}

/** Hash of the exact string fed to the embedder — the embed-on-change cache key. */
export function kbContentHash(docId: string, body: string): string {
  return createHash("sha256").update(`${docId}\n\n${body}`).digest("hex");
}

/** A doc needs (re)embedding when it's new, its content changed, or it has no vector. */
export function embeddingStale(
  prev: { contentHash?: string; vector?: number[] | null } | undefined,
  contentHash: string,
): boolean {
  return !prev || prev.contentHash !== contentHash || !prev.vector?.length;
}

function normStatus(raw: string): MappedKbDoc["status"] {
  const s = raw.toLowerCase();
  if (/archiv/.test(s)) return "archived";
  if (/publish/.test(s)) return "published";
  return "draft";
}

/**
 * Map a Lark Bitable record → a KB doc (pure; no vector yet). Returns null when the
 * row has no usable slug. Tolerates a couple of common column aliases.
 */
export function mapKbRow(record: LarkRecord): MappedKbDoc | null {
  const f = record.fields;
  const docId = getText(f["Slug"] || f["ID"] || f["Id"] || f["id"])
    .trim()
    .toLowerCase();
  if (!docId) return null;

  const meta: KbMeta = {};
  const platform = getText(f["Platform"]).trim();
  const category = getText(f["Category"]).trim();
  const intent = getLabels(f["Intent"]);
  const access = getLabels(f["Access"]);
  if (platform) meta.platform = platform;
  if (category) meta.category = category;
  if (intent.length) meta.intent = intent;
  if (access.length) meta.access = access; // INVARIANT 1: omit when empty → open-by-default

  return {
    docId,
    title: getText(f["Title"]).trim(),
    body: getDetailsText(f["Body"] || f["Content"]).trim(),
    meta,
    status: normStatus(getText(f["Status"])),
    larkRecordId: record.record_id,
  };
}

/**
 * Pull the KB table, diff-embed the changed docs, upsert, archive removed rows, and
 * reload the cache. No-op (and harmless) when the table id is unset.
 */
export async function runKbSync(): Promise<{ synced: number; embedded: number; archived: number }> {
  const tableId = config.lark.tables.knowledgeBase;
  if (!tableId) {
    logger.warn("[kb-sync] LARK_TABLE_ID_KNOWLEDGE_BASE unset — skipping");
    return { synced: 0, embedded: 0, archived: 0 };
  }

  const items = await searchRecords(config.lark.dataBaseToken, tableId, {
    filter: {
      conjunction: "and",
      conditions: [{ field_name: "Status", operator: "is", value: ["Published"] }],
    },
  });

  // Map + keep only valid published rows; dedupe by docId (last wins).
  const byId = new Map<string, MappedKbDoc>();
  for (const it of items) {
    const m = mapKbRow(it);
    if (m && m.docId && m.body && m.status === "published") byId.set(m.docId, m);
  }
  const mapped = [...byId.values()];

  const existing = await KbDoc.find({ source: "lark" }).select("docId contentHash vector").lean();
  const exMap = new Map(existing.map((e) => [e.docId, e]));

  const docs = mapped.map((d) => ({ ...d, contentHash: kbContentHash(d.docId, d.body) }));
  const toEmbed = docs.filter((d) => embeddingStale(exMap.get(d.docId), d.contentHash));

  // INVARIANT 2: embed the changed batch BEFORE any DB write. A throw here aborts the
  // whole sync (caller catches) and leaves the live cache untouched.
  const vectorById = new Map<string, number[]>();
  if (toEmbed.length) {
    const vectors = await embeddings.embedDocuments(toEmbed.map((d) => `${d.docId}\n\n${d.body}`));
    toEmbed.forEach((d, i) => vectorById.set(d.docId, vectors[i] ?? []));
  }
  for (const d of docs) {
    if (!vectorById.has(d.docId)) vectorById.set(d.docId, exMap.get(d.docId)?.vector ?? []);
  }

  if (docs.length) {
    await KbDoc.bulkWrite(
      docs.map((d) => ({
        updateOne: {
          filter: { docId: d.docId },
          update: {
            $set: {
              title: d.title,
              body: d.body,
              meta: d.meta,
              status: "published",
              source: "lark",
              larkRecordId: d.larkRecordId,
              contentHash: d.contentHash,
              vector: vectorById.get(d.docId) ?? [],
            },
          },
          upsert: true,
        },
      })),
    );
  }

  // Archive (don't delete — preserves the stored vector) Lark docs no longer present.
  const liveIds = new Set(docs.map((d) => d.docId));
  const stale = existing.filter((e) => !liveIds.has(e.docId)).map((e) => e.docId);
  let archived = 0;
  if (stale.length) {
    const r = await KbDoc.updateMany(
      { source: "lark", docId: { $in: stale }, status: { $ne: "archived" } },
      { $set: { status: "archived" } },
    );
    archived = r.modifiedCount ?? 0;
  }

  await reloadKb();
  logger.info("[kb-sync] done", { synced: docs.length, embedded: toEmbed.length, archived });
  return { synced: docs.length, embedded: toEmbed.length, archived };
}

/** Re-embed every published doc regardless of hash (recovery / model change). */
export async function reindexKb(): Promise<{ embedded: number }> {
  const docs = await KbDoc.find({ status: "published" }).select("docId body").lean();
  if (docs.length) {
    const vectors = await embeddings.embedDocuments(docs.map((d) => `${d.docId}\n\n${d.body}`));
    await KbDoc.bulkWrite(
      docs.map((d, i) => ({
        updateOne: {
          filter: { docId: d.docId },
          update: { $set: { vector: vectors[i] ?? [], contentHash: kbContentHash(d.docId, d.body) } },
        },
      })),
    );
  }
  await reloadKb();
  logger.info("[kb-sync] reindexed", { embedded: docs.length });
  return { embedded: docs.length };
}

/** Schedule a periodic Lark→KB sync (every 6h). No-op when the table id is unset. */
export function scheduleKbSync(): void {
  if (!config.lark.tables.knowledgeBase) return;
  cron.schedule(
    "0 */6 * * *",
    () => void runKbSync().catch((e) => logger.error("[kb-sync] failed", { message: (e as Error).message })),
    {
      timezone: "UTC",
    },
  );
  logger.info("[kb-sync] scheduled (every 6h UTC)");
}
