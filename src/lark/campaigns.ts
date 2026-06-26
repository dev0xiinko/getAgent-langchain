import { config, LARK_DATA_TTL } from "../config";
import { searchRecords } from "./client";
import {
  getAttachments,
  getDateField,
  getDateMs,
  getDetailsText,
  getLabels,
  getText,
  getUIDArray,
} from "./fields";
import type { Attachment } from "./fields";

// ── Normalized shapes (mirror the legacy Builder Hub campaign/announcement model) ──

export interface Campaign {
  id: string;
  title: string;
  taskCategory: string;
  platform: string;
  assignedBy: string;
  targetTeam: string[];
  targetLabel: string[];
  autoSelectedUIDs: string[];
  manualSelectedUIDs: string[];
  description: string;
  keyMessage: string;
  guidelines: string;
  reference: string;
  traineeRewards: string;
  coreBuilderRewards: string;
  vipBuilderRewards: string;
  extraRewards: string;
  rewardRequirements: string;
  maxContent: string;
  deadline: string;
  deadlineMs: number;
  assignedDate: string;
  assignedDateMs: number;
  progress: string;
  thumbnail: Attachment[];
  images: Attachment[];
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  author: string;
  date: string;
  updatedAt: number;
  images: Attachment[];
}

// ── Module-level TTL caches (avoid hammering Lark on every chat turn) ──

let campaignCache: { data: Campaign[]; at: number } | null = null;
let announcementCache: { data: Announcement[]; at: number } | null = null;

function mapCampaign(item: { record_id: string; fields: Record<string, unknown> }): Campaign {
  const f = item.fields;
  return {
    id: getText(f["ID"]),
    title: getText(f["Title"]),
    taskCategory: getText(f["Task Category"]),
    platform: getText(f["Platforms"]).trim(),
    assignedBy: getText(f["Assigned By"]),
    targetTeam: getLabels(f["Target Team"]),
    targetLabel: getLabels(f["Label"]),
    autoSelectedUIDs: getUIDArray(f["Auto Selected Person (UID)"]),
    manualSelectedUIDs: getUIDArray(f["Manual Selected Person (UID)"]),
    description: getDetailsText(f["Description"]),
    keyMessage: getDetailsText(f["Key Message"]),
    guidelines: getDetailsText(f["Guidelines"]),
    reference: getDetailsText(f["References (Optional)"]),
    traineeRewards: getText(f["Trainee Rewards"]),
    coreBuilderRewards: getText(f["Core Builder Rewards"]),
    vipBuilderRewards: getText(f["VIP Builder Rewards"]),
    extraRewards: getText(f["Extra Rewards"]),
    rewardRequirements: getDetailsText(f["Requirements (Rewards)"]),
    maxContent: getText(f["Max No. Of Content/Engagement/Review"]),
    deadline: getDateField(f["Deadline (UTC +8)"]),
    deadlineMs: getDateMs(f["Deadline (UTC +8)"]),
    assignedDate: getDateField(f["Assigned Date (UTC +8)"]),
    assignedDateMs: getDateMs(f["Assigned Date (UTC +8)"]),
    progress: getText(f["Progress"]),
    thumbnail: getAttachments(
      f["Campaign Thumbnail (Optional)"] || f["Campaign Thumbnail (optional)"] || f["Campaign Thumbnail"],
    ),
    images: getAttachments(f["Image/Video (Optional)"]),
  };
}

/**
 * All campaigns that are ongoing or completed, newest first. Cached for
 * LARK_DATA_TTL; serves stale cache on fetch failure rather than throwing.
 */
export async function getCampaigns(): Promise<Campaign[]> {
  if (campaignCache && Date.now() - campaignCache.at < LARK_DATA_TTL) return campaignCache.data;
  try {
    const items = await searchRecords(config.lark.dataBaseToken, config.lark.tables.campaigns);
    const data = items
      .map(mapCampaign)
      .filter((c) => {
        const p = c.progress.toLowerCase().trim();
        return p.includes("ongoing") || p.includes("completed");
      })
      .sort((a, b) => b.assignedDateMs - a.assignedDateMs);
    campaignCache = { data, at: Date.now() };
    return data;
  } catch (e) {
    if (campaignCache) return campaignCache.data;
    throw e;
  }
}

/** Announcements with Status = "Announced", newest first. Cached for LARK_DATA_TTL. */
export async function getAnnouncements(): Promise<Announcement[]> {
  if (announcementCache && Date.now() - announcementCache.at < LARK_DATA_TTL) return announcementCache.data;
  try {
    const items = await searchRecords(config.lark.dataBaseToken, config.lark.tables.announcements, {
      filter: {
        conjunction: "and",
        conditions: [{ field_name: "Status", operator: "is", value: ["Announced"] }],
      },
    });
    const data = items
      .map((item) => {
        const f = item.fields;
        return {
          id: item.record_id,
          title: getText(f["Title"]),
          body: getDetailsText(f["Announcement"]),
          author: getText(f["Announce By"]),
          date: getDateField(f["Last Update"]),
          updatedAt: getDateMs(f["Last Update"]),
          images: getAttachments(f["Image/Video (Optional)"]),
        };
      })
      .filter((a) => a.title && a.body && a.author)
      .sort((a, b) => b.updatedAt - a.updatedAt);
    announcementCache = { data, at: Date.now() };
    return data;
  } catch (e) {
    if (announcementCache) return announcementCache.data;
    throw e;
  }
}
