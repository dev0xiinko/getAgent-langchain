import mongoose, { Schema } from "mongoose";

const AttachedFileSchema = new Schema({ base64: String, name: String, type: String }, { _id: false });

const MessageSchema = new Schema(
  {
    role: { type: String, enum: ["user", "assistant"], required: true },
    content: { type: String, required: true },
    toolUsed: { type: String, default: null },
    isImage: { type: Boolean, default: false },
    // Added vs. legacy: persist error messages so a reload doesn't re-trigger polling.
    isError: { type: Boolean, default: false },
    attachedFiles: { type: [AttachedFileSchema], default: [] },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false },
);

// A single drafted Lark write awaiting user confirmation (preview-and-confirm).
const PendingActionSchema = new Schema(
  {
    toolName: { type: String, required: true },
    args: { type: Schema.Types.Mixed, required: true },
    preview: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

/**
 * A user owns many conversations, one document each, keyed by (uid, sessionId).
 * The reserved Lark session below keeps the leader-only Lark agent's history and
 * pending-write state isolated from the user-visible chat sessions.
 */
export const LARK_SESSION_ID = "__lark__";

const AgentSessionSchema = new Schema(
  {
    uid: { type: String, required: true, index: true },
    // Client-generated conversation id (uuid). Unique per uid; see compound index below.
    sessionId: { type: String, required: true },
    // Auto-derived from the first user message; shown in the history list.
    title: { type: String, default: "" },
    messages: { type: [MessageSchema], default: [] },
    postedIds: { type: [String], default: [] },
    // At most one pending Lark write at a time; null when nothing awaits confirmation.
    pendingAction: { type: PendingActionSchema, default: null },
  },
  { timestamps: true },
);

// One conversation per (uid, sessionId).
AgentSessionSchema.index({ uid: 1, sessionId: 1 }, { unique: true });

export type AgentMessage = mongoose.InferSchemaType<typeof MessageSchema>;
export type PendingAction = mongoose.InferSchemaType<typeof PendingActionSchema>;
export const AgentSession = mongoose.model("AgentSession", AgentSessionSchema);
