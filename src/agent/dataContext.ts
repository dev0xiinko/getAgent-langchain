/**
 * Live platform data injected under "=== LIVE PLATFORM DATA ===".
 *
 * Sources campaigns + announcements from Lark Bitable (see src/lark/). Campaigns
 * are eligibility-filtered per user (target team / target label / manual + auto
 * UID selection), mirroring the legacy Builder Hub. Returns "" when there's
 * nothing to inject or Lark is unavailable.
 */
import { getAnnouncements, getCampaigns } from "../lark/campaigns";
import type { Campaign } from "../lark/campaigns";

export type { Campaign, Announcement } from "../lark/campaigns";

interface User {
  uid: string;
  team?: string;
  labels?: string[];
}

/** A campaign with no targeting is open to all; otherwise team/label/UID must match. */
function isCampaignEligible(c: Campaign, user: User): boolean {
  const hasTargeting =
    c.targetTeam.length > 0 ||
    c.targetLabel.length > 0 ||
    c.autoSelectedUIDs.length > 0 ||
    c.manualSelectedUIDs.length > 0;
  if (!hasTargeting) return true;

  if (user.team && c.targetTeam.includes(user.team)) return true;
  if (user.labels?.some((l) => c.targetLabel.includes(l))) return true;
  if (c.autoSelectedUIDs.includes(user.uid) || c.manualSelectedUIDs.includes(user.uid)) return true;
  return false;
}

function formatCampaign(c: Campaign, i: number): string {
  const rewards = [
    c.traineeRewards && `Trainee: ${c.traineeRewards}`,
    c.coreBuilderRewards && `Core: ${c.coreBuilderRewards}`,
    c.vipBuilderRewards && `VIP: ${c.vipBuilderRewards}`,
    c.extraRewards && `Extra: ${c.extraRewards}`,
  ]
    .filter(Boolean)
    .join(" | ");

  const lines = [
    `[${i + 1}] ID:${c.id} | "${c.title}" | ${c.progress} | ${c.platform || "—"} | deadline: ${c.deadline || "—"}`,
    c.taskCategory && `Category: ${c.taskCategory}`,
    c.description && `Description: ${c.description}`,
    c.keyMessage && `Key Message: ${c.keyMessage}`,
    c.guidelines && `Guidelines: ${c.guidelines}`,
    rewards && `Rewards: ${rewards}`,
    c.rewardRequirements && `Reward Requirements: ${c.rewardRequirements}`,
  ].filter(Boolean);
  return lines.join("\n");
}

export async function buildDataContext(user: User): Promise<string> {
  const parts: string[] = [];

  const [announcements, campaigns] = await Promise.all([
    getAnnouncements().catch(() => []),
    getCampaigns().catch(() => []),
  ]);

  if (announcements.length) {
    const items = announcements
      .slice(0, 8)
      .map((a, i) => `[${i + 1}] "${a.title}" — ${a.date}${a.author ? ` (by ${a.author})` : ""}\n${a.body}`);
    parts.push(`=== CURRENT ANNOUNCEMENTS ===\n${items.join("\n\n")}`);
  }

  const eligible = campaigns.filter((c) => isCampaignEligible(c, user));
  if (eligible.length) {
    const ongoing = eligible.filter((c) => c.progress.toLowerCase().includes("ongoing"));
    const recent = eligible.filter((c) => !c.progress.toLowerCase().includes("ongoing")).slice(0, 3);
    const items = [...ongoing, ...recent].map(formatCampaign);
    parts.push(`=== CAMPAIGNS ===\n${items.join("\n\n")}`);
  }

  return parts.join("\n\n");
}
