import mongoose, { Schema } from "mongoose";

const DailyMarketReportSchema = new Schema({
  date: { type: String, required: true, unique: true }, // 'YYYY-MM-DD' in UTC+8
  content: { type: String, required: true },
  generatedAt: { type: Date, default: Date.now },
});

export const DailyMarketReport = mongoose.model("DailyMarketReport", DailyMarketReportSchema);
