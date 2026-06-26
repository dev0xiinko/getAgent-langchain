import { UserMeta } from "./models/UserMeta";
import { config } from "./config";

export interface AuthedUser {
  uid: string;
  role: string;
  labels: string[];
  team?: string;
}

export function isLeaderRole(role: string): boolean {
  return role === "Manager" || role === "Lead Builder";
}

/** Layer 1: page allowlist (mirrors VITE_GETAGENT_UIDS). Empty list = allow all. */
export function isAllowlisted(uid: string): boolean {
  if (config.getagentUids.length === 0) return true;
  return config.getagentUids.includes(uid);
}

/**
 * Layer 2: re-read role/labels from the DB. NEVER trust the client-sent role.
 * Returns null when the user has no UserMeta record (→ 403).
 */
export async function authUser(uid: string): Promise<AuthedUser | null> {
  const meta = await UserMeta.findOne({ uid }).lean();
  if (!meta) return null;
  return {
    uid,
    role: meta.role || "Member",
    labels: meta.labels || [],
    team: meta.team ?? undefined,
  };
}
