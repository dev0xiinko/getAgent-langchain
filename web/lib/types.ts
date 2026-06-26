export interface AttachedFile {
  base64: string;
  name: string;
  type: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  toolUsed?: string | null;
  isImage?: boolean;
  isError?: boolean;
  attachedFiles?: AttachedFile[];
  timestamp?: string;
}

export interface Me {
  uid: string;
  role: string;
  labels: string[];
  team?: string;
  leader: boolean;
}

export interface Usage {
  chatCount: number;
  imageCount: number;
  chatLimit: number;
  imageLimit: number;
  resetAt: number | null;
}

export interface DailyReport {
  date: string;
  content: string;
  generatedAt: string;
  stale?: boolean;
}

/** SSE event the chat stream emits (one of these fields is set per frame). */
export interface ChatFrame {
  token?: string;
  status?: string;
  error?: string;
}

export interface KbMeta {
  access?: string[] | null;
  platform?: string;
  category?: string;
  intent?: string | string[];
  [k: string]: unknown;
}

export interface KbDocSummary {
  docId: string;
  title: string;
  meta: KbMeta;
  status: "published" | "draft" | "archived";
  source: "lark" | "manual";
  updatedAt: string;
  embedded: boolean;
}

export interface KbDocFull extends Omit<KbDocSummary, "embedded"> {
  body: string;
}
