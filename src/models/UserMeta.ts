import mongoose, { Schema } from "mongoose";

/** Source of truth for server-side authorization. The agent reads role + labels; never writes. */
const UserMetaSchema = new Schema(
  {
    uid: { type: String, required: true, unique: true, index: true },
    name: String,
    nickname: String,
    avatar: String,
    team: String,
    role: { type: String, enum: ["Manager", "Lead Builder", "Member"], default: "Member" },
    vipStatus: String,
    labels: { type: [String], default: [] }, // e.g. ['Reddit', 'CMC']
  },
  { timestamps: true },
);

export const UserMeta = mongoose.model("UserMeta", UserMetaSchema);
