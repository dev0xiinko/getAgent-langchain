import { config, OPENROUTER_BASE, OR_HEADERS, AGENT_IMAGE_MODEL } from "../config";

const BITGET_LOGO_URL =
  "https://res.cloudinary.com/dvfpfem81/image/upload/v1781581172/Bitget_Logo_ycbgrl.png";
const BITGET_KEYWORDS = /\b(bitget|bgb|bit\s*get|bitegt|bitgett|bitgit)\b/i;
const BITGET_LOGO_NOTE =
  "\n\nIMPORTANT: Use the official Bitget logo/branding exactly as provided in the reference image. " +
  "Do not invent or alter the logo.";

interface ImageArgs {
  prompt: string;
  referenceImage?: string | null;
  attachedFile?: string | null;
  aspectRatio?: string;
}

function imagePart(url: string) {
  return { type: "image_url" as const, image_url: { url } };
}

/** Try every known response shape; return a data URL / remote URL or null. */
function parseImage(chatData: any): string | null {
  const msg = chatData?.choices?.[0]?.message;

  // Case 0: msg.images[]
  const img0 = msg?.images?.[0];
  if (img0) {
    const u = img0.image_url?.url ?? img0.url ?? img0.b64_json ?? (typeof img0 === "string" ? img0 : null);
    if (typeof u === "string")
      return u.startsWith("data:") || u.startsWith("http") ? u : `data:image/png;base64,${u}`;
  }

  const content = msg?.content;

  // Case 1: string content with embedded data URL or image URL
  if (typeof content === "string") {
    const data = content.match(/data:image\/[a-zA-Z]+;base64,[A-Za-z0-9+/=]+/);
    if (data) return data[0];
    const http = content.match(/https?:\/\/\S+\.(?:png|jpg|jpeg|webp|gif)/i);
    if (http) return http[0];
    // Case 1b: raw base64
    if (content.length > 200 && /^[A-Za-z0-9+/=\s]+$/.test(content)) {
      const head = Buffer.from(content.slice(0, 16), "base64").toString("hex");
      const mime = head.startsWith("89504e47")
        ? "png"
        : head.startsWith("47494638")
          ? "gif"
          : head.startsWith("52494646")
            ? "webp"
            : "jpeg";
      return `data:image/${mime};base64,${content.trim()}`;
    }
  }

  // Case 2: content array of parts
  if (Array.isArray(content)) {
    for (const p of content) {
      const u = p?.image_url?.url ?? p?.image?.source?.data;
      if (typeof u === "string") return u.startsWith("data:") ? u : `data:image/png;base64,${u}`;
    }
  }

  // Case 3: Gemini native parts / inline_data
  const parts = msg?.parts ?? chatData?.native_response?.candidates?.[0]?.content?.parts;
  if (Array.isArray(parts)) {
    for (const p of parts) {
      const d = p?.inline_data?.data;
      if (typeof d === "string") return `data:${p.inline_data.mime_type ?? "image/png"};base64,${d}`;
    }
  }

  // Case 4: top-level images endpoint shape
  const top = chatData?.data?.[0];
  if (top?.url) return top.url;
  if (top?.b64_json) return `data:image/png;base64,${top.b64_json}`;

  return null;
}

/** Generate or edit an image. Returns a data URL or remote URL (pre-Cloudinary). */
export async function generateImage(args: ImageArgs): Promise<string | null> {
  const { prompt, referenceImage, attachedFile, aspectRatio = "1:1" } = args;
  const isBitget = BITGET_KEYWORDS.test(prompt);
  const finalPrompt = isBitget ? prompt + BITGET_LOGO_NOTE : prompt;
  const headers = {
    Authorization: `Bearer ${config.openrouterApiKey}`,
    "Content-Type": "application/json",
    ...OR_HEADERS,
  };

  // All generation goes through chat/completions with modalities:["image"].
  // (OpenRouter has no /images/generations endpoint — it 404s — so fresh
  // generation and image editing share this one multimodal path.)
  const parts: any[] = [];
  if (isBitget) parts.push(imagePart(BITGET_LOGO_URL));
  if (referenceImage) parts.push(imagePart(referenceImage));
  if (attachedFile)
    parts.push(
      imagePart(attachedFile.startsWith("data:") ? attachedFile : `data:image/png;base64,${attachedFile}`),
    );
  parts.push({ type: "text", text: finalPrompt });

  const res = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      model: AGENT_IMAGE_MODEL,
      messages: [{ role: "user", content: parts.length === 1 ? finalPrompt : parts }],
      modalities: ["image", "text"],
      image_config: { aspect_ratio: aspectRatio || "1:1", image_size: "1K" },
      provider: { order: ["google-vertex"], allow_fallbacks: true, data_collection: "deny" },
    }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`image ${res.status}: ${body.slice(0, 400)}`);
  }
  return parseImage(await res.json());
}
