import { AIMessage, HumanMessage, type BaseMessage, type MessageContent } from "@langchain/core/messages";
import { AgentSession } from "../models/AgentSession";

export interface AttachedFile {
  base64: string;
  name: string;
  type: string;
}

const MAX_HISTORY = 50;
const MAX_PERSIST_FILE_BYTES = 2 * 1024 * 1024; // 2MB — base64 only kept under this

/**
 * Load + trim history for the model call:
 *  1. drop isImage messages
 *  2. take last 50
 *  3. strip trailing user messages (avoids consecutive-user turns → blank replies)
 */
export async function loadHistory(uid: string, sessionId: string): Promise<BaseMessage[]> {
  const session = await AgentSession.findOne({ uid, sessionId }).lean();
  if (!session) return [];

  let msgs = (session.messages ?? []).filter((m: any) => !m.isImage).slice(-MAX_HISTORY);
  while (msgs.length && msgs[msgs.length - 1].role === "user") msgs = msgs.slice(0, -1);

  return msgs.map((m: any) =>
    m.role === "user" ? new HumanMessage(String(m.content)) : new AIMessage(String(m.content)),
  );
}

/** Extract text from a non-image attachment (PDF / DOCX / XLSX / UTF-8). */
async function extractText(file: AttachedFile): Promise<string> {
  const buf = Buffer.from(file.base64, "base64");
  try {
    if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
      const pdf = (await import("pdf-parse")).default;
      const { text } = await pdf(buf);
      return text?.trim() || `[File: ${file.name} — no extractable text]`;
    }
    if (file.name.toLowerCase().endsWith(".docx")) {
      const mammoth = await import("mammoth");
      const { value } = await mammoth.extractRawText({ buffer: buf });
      return value?.trim() || `[File: ${file.name} — no extractable text]`;
    }
    if (/\.(xlsx|xls|csv)$/i.test(file.name)) {
      const XLSX = await import("xlsx");
      const wb = XLSX.read(buf, { type: "buffer" });
      return wb.SheetNames.map((n) => XLSX.utils.sheet_to_csv(wb.Sheets[n])).join("\n\n");
    }
    return buf.toString("utf-8");
  } catch {
    return `[File: ${file.name} — could not extract text]`;
  }
}

/** Build the current-turn user content: multimodal if images are attached. */
export async function buildUserContent(message: string, files: AttachedFile[] = []): Promise<MessageContent> {
  const images = files.filter((f) => f.type.startsWith("image/"));
  const docs = files.filter((f) => !f.type.startsWith("image/"));

  let text = message;
  for (const d of docs) {
    const extracted = await extractText(d);
    text += `\n\n[File: ${d.name}]\n${extracted}`;
  }

  if (images.length === 0) return text;

  return [
    { type: "text", text },
    ...images.map((img) => ({
      type: "image_url" as const,
      image_url: {
        url: img.base64.startsWith("data:") ? img.base64 : `data:${img.type};base64,${img.base64}`,
      },
    })),
  ];
}

/** Derive a short, single-line conversation title from the first user message. */
export function deriveTitle(message: string): string {
  const t = message.replace(/\s+/g, " ").trim();
  if (!t) return "New chat";
  return t.length > 60 ? `${t.slice(0, 57)}…` : t;
}

/** Persist the inbound user message. base64 kept only if under 2MB. */
export async function persistUserMessage(
  uid: string,
  sessionId: string,
  message: string,
  files: AttachedFile[] = [],
): Promise<void> {
  const attachedFiles = files.map((f) => ({
    name: f.name,
    type: f.type,
    base64: Buffer.byteLength(f.base64, "base64") < MAX_PERSIST_FILE_BYTES ? f.base64 : "",
  }));
  await AgentSession.updateOne(
    { uid, sessionId },
    {
      $push: { messages: { role: "user", content: message, attachedFiles, timestamp: new Date() } },
      // Title is set once, when the conversation document is first created.
      $setOnInsert: { title: deriveTitle(message) },
    },
    { upsert: true },
  );
}

export async function persistAssistant(
  uid: string,
  sessionId: string,
  content: string,
  toolUsed: string | null,
  isError = false,
): Promise<void> {
  if (!content) return;
  await AgentSession.updateOne(
    { uid, sessionId },
    { $push: { messages: { role: "assistant", content, toolUsed, isError, timestamp: new Date() } } },
    { upsert: true },
  );
}

/** Image endpoint persists a user prompt + an assistant image message, both isImage. */
export async function persistImageMessages(
  uid: string,
  sessionId: string,
  prompt: string,
  url: string,
): Promise<void> {
  await AgentSession.updateOne(
    { uid, sessionId },
    {
      $setOnInsert: { title: deriveTitle(prompt) },
      $push: {
        messages: {
          $each: [
            { role: "user", content: prompt, isImage: true, timestamp: new Date() },
            {
              role: "assistant",
              content: `![Generated Image](${url})`,
              isImage: true,
              toolUsed: "image",
              timestamp: new Date(),
            },
          ],
        },
      },
    },
    { upsert: true },
  );
}
