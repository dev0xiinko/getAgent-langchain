import mongoose, { Schema } from "mongoose";

const AgentUsageSchema = new Schema(
  {
    uid: { type: String, required: true, unique: true, index: true },
    windowStart: { type: Number, default: 0 }, // ms epoch; anchor of the rolling 24h window
    chatCount: { type: Number, default: 0 },
    imageCount: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export const AgentUsage = mongoose.model("AgentUsage", AgentUsageSchema);
