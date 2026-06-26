import mongoose, { Schema } from "mongoose";

/**
 * A dynamic knowledge-base document, synced from Lark (or seeded manually). Merged
 * with the in-code `KB_DOCS` baseline at embed time (see agent/kb/store.ts) — a DB
 * doc whose `docId` matches a baseline id overrides it.
 *
 * `vector` is the stored embedding so we never re-embed unchanged content on boot;
 * `contentHash` (sha256 of the exact embed input) drives the embed-on-change diff.
 */
const KbDocSchema = new Schema(
  {
    // The KB id/slug — the merge + override key. NOT Mongo's _id.
    docId: { type: String, required: true, unique: true, index: true },
    title: { type: String, default: "" },
    body: { type: String, required: true },
    // KbMeta bag (access[], platform, category, intent, type, …) — kept open like the in-code KB.
    meta: { type: Schema.Types.Mixed, default: {} },
    vector: { type: [Number], default: [] },
    contentHash: { type: String, default: "" },
    source: { type: String, enum: ["lark", "manual"], default: "lark", index: true },
    status: { type: String, enum: ["published", "draft", "archived"], default: "published", index: true },
    // Lark record id, for delete/archive reconciliation across syncs.
    larkRecordId: { type: String, default: null },
  },
  { timestamps: true }, // updatedAt doubles as "last synced"
);

export type KbDocRow = mongoose.InferSchemaType<typeof KbDocSchema>;
export const KbDoc = mongoose.model("KbDoc", KbDocSchema);
