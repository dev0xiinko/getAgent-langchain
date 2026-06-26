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

const AgentSessionSchema = new Schema(
  {
    uid: { type: String, required: true, unique: true, index: true },
    messages: { type: [MessageSchema], default: [] },
    postedIds: { type: [String], default: [] },
    // At most one pending Lark write at a time; null when nothing awaits confirmation.
    pendingAction: { type: PendingActionSchema, default: null },
  },
  { timestamps: true },
);

export type AgentMessage = mongoose.InferSchemaType<typeof MessageSchema>;
export type PendingAction = mongoose.InferSchemaType<typeof PendingActionSchema>;
export const AgentSession = mongoose.model("AgentSession", AgentSessionSchema);
