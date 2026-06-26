/**
 * Metadata attached to each KB doc. Field names mirror the original Obsidian
 * frontmatter — the KB now lives in code (see kb/docs.ts), so nothing here parses
 * YAML anymore; this is just the shared type for access control and scoring.
 */
export interface KbMeta {
  /** Roles/labels allowed to see this doc. Missing → open; empty/malformed → denied (access.ts). */
  access?: string[] | null;
  platform?: string;
  category?: string;
  intent?: string | string[];
  [k: string]: unknown;
}
