import mongoose from "mongoose";
import { embeddings } from "../../llm/providers";
import { KB_ALWAYS } from "../../config";
import { logger } from "../../logger";
import { KbDoc } from "../../models/KbDoc";
import { KB_DOCS } from "./docs";
import type { KbMeta } from "./frontmatter";

/** A KB doc plus its embedding, ready for the retriever. */
export interface KbFile {
  id: string;
  body: string;
  meta: KbMeta;
  vector: number[];
}

let cache: Map<string, KbFile> | null = null;
let warming: Promise<Map<string, KbFile>> | null = null;

/**
 * Build the merged KB cache: the in-code baseline (`KB_DOCS`, embedded in one batch)
 * plus published `KbDoc`s from Mongo using their STORED vectors (no re-embed on boot).
 * A DB doc whose `docId` matches a baseline id overrides it.
 */
async function build(): Promise<Map<string, KbFile>> {
  const m = new Map<string, KbFile>();

  const baseVectors = await embeddings.embedDocuments(KB_DOCS.map((d) => `${d.id}\n\n${d.body}`));
  KB_DOCS.forEach((d, i) => {
    m.set(d.id, { id: d.id, body: d.body, meta: d.meta, vector: baseVectors[i] ?? [] });
  });

  // Dynamic overlay — only if connected; never let a DB hiccup blank the baseline.
  try {
    if (mongoose.connection.readyState === 1) {
      const dbDocs = await KbDoc.find({ status: "published" }).select("docId body meta vector").lean();
      for (const d of dbDocs) {
        if (!d.vector?.length) continue; // skip un-embedded rows (defensive)
        if (KB_ALWAYS.includes(d.docId)) {
          logger.warn("[kb] dynamic doc overrides an always-load baseline (injected into every prompt)", {
            docId: d.docId,
          });
        }
        m.set(d.docId, { id: d.docId, body: d.body, meta: (d.meta ?? {}) as KbMeta, vector: d.vector });
      }
    }
  } catch (e) {
    logger.warn("[kb] dynamic overlay skipped", { message: (e as Error).message });
  }

  return m;
}

/** Coalesce concurrent builds; on success swap the cache, on failure keep the old one. */
function startBuild(): Promise<Map<string, KbFile>> {
  if (!warming) {
    warming = build().then(
      (m) => {
        cache = m;
        warming = null;
        return m;
      },
      (e) => {
        warming = null; // allow a later retry; cache stays as-is
        throw e;
      },
    );
  }
  return warming;
}

/**
 * Embed the KB once and cache it. Idempotent: returns the cached map if present,
 * otherwise builds (sharing one in-flight promise). A failed warm resets so the next
 * call retries. Call `reloadKb()` to force a rebuild after a sync/CRUD.
 */
export async function warmKb(): Promise<Map<string, KbFile>> {
  if (cache) return cache;
  return startBuild();
}

/** Force a rebuild (e.g. after a Lark sync). Keeps the previous cache if the build fails. */
export async function reloadKb(): Promise<Map<string, KbFile>> {
  return startBuild();
}

/** The embedded KB. Empty until `warmKb()` resolves. */
export function kbFiles(): Map<string, KbFile> {
  return cache ?? new Map();
}
