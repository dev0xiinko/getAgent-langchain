/**
 * Lark Bitable field decoders. Bitable returns fields in wildly different shapes
 * (plain strings, rich-text segment arrays, link objects, number-array UID fields,
 * attachment arrays). These mirror the helpers in the legacy server's index.js so
 * the normalized output matches the Builder Hub exactly.
 */

type F = unknown;

/** Flatten any text-ish field to a plain string. */
export function getText(f: F): string {
  if (f === null || f === undefined) return "";
  if (Array.isArray(f)) {
    return f
      .map((s: any) => {
        if (!s || typeof s !== "object") return String(s ?? "");
        return s.text ?? s.en_name ?? s.name ?? s.value ?? "";
      })
      .join("")
      .trim();
  }
  if (typeof f === "string") return f;
  if (typeof f === "object") {
    const o = f as any;
    let val = o.stage_name ?? o.en_name ?? o.text ?? o.value ?? o.name ?? "";
    if (Array.isArray(val)) {
      return val
        .map((s: any) => {
          if (!s || typeof s !== "object") return String(s ?? "");
          return s.text || s.en_name || s.name || s.value || "";
        })
        .join("")
        .trim();
    }
    if (typeof val === "object" && val !== null) {
      val = val.text ?? val.value ?? val.en_name ?? val.name ?? "";
    }
    return typeof val === "string" ? val : String(val ?? "");
  }
  return String(f);
}

/** Like getText, but preserves links as markdown `[label](url)`. */
export function getDetailsText(f: F): string {
  if (f === null || f === undefined) return "";
  if (Array.isArray(f)) {
    return f
      .map((s: any) => {
        if (!s || typeof s !== "object") return String(s ?? "");
        if (typeof s.link === "string" && s.link) {
          const label =
            typeof s.text === "string" && s.text.trim() && s.text.trim() !== s.link ? s.text.trim() : null;
          return label ? `[${label}](${s.link})` : s.link;
        }
        if (typeof s.text === "string") return s.text;
        return "";
      })
      .join("")
      .trim();
  }
  if (typeof f === "string") return f;
  if (typeof f === "object") {
    const o = f as any;
    if (typeof o.link === "string" && o.link) return o.link;
    return getText(f);
  }
  return String(f);
}

/** Format a Lark epoch-ms timestamp as `YYYY/MM/DD HH:MM (GMT+8)`. */
export function getDateField(f: F): string {
  if (!f) return "";
  const ms = typeof f === "number" ? f : parseInt(String(f), 10);
  if (Number.isNaN(ms)) return String(f);
  const parts = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Singapore",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
    .formatToParts(new Date(ms))
    .reduce((acc: Record<string, string>, p) => {
      acc[p.type] = p.value;
      return acc;
    }, {});
  return `${parts.year}/${parts.month}/${parts.day} ${parts.hour}:${parts.minute} (GMT+8)`;
}

/** The raw epoch-ms of a date field (for sorting / range filters), or 0. */
export function getDateMs(f: F): number {
  if (!f) return 0;
  const ms = typeof f === "number" ? f : parseInt(String(f), 10);
  return Number.isNaN(ms) ? 0 : ms;
}

/** Multi-select / label field → string array. */
export function getLabels(f: F): string[] {
  if (!f) return [];
  if (Array.isArray(f)) {
    return f
      .map((s: any) => {
        if (typeof s === "string") return s;
        if (typeof s === "object") return s.text || s.value || s.name || "";
        return String(s);
      })
      .filter(Boolean);
  }
  if (typeof f === "string") return f ? [f] : [];
  if (typeof f === "object") return [(f as any).text || (f as any).value || ""].filter(Boolean);
  return [];
}

/** UID-list field (number-array or delimited text) → string array of UIDs. */
export function getUIDArray(f: F): string[] {
  if (!f) return [];
  if (typeof f === "object" && !Array.isArray(f) && Array.isArray((f as any).value)) {
    return (f as any).value.map((v: unknown) => String(v).trim()).filter(Boolean);
  }
  if (Array.isArray(f)) {
    return f.flatMap((s: any) => {
      const raw =
        typeof s === "string" ? s : typeof s === "object" ? s.text || s.value || s.name || "" : String(s);
      return String(raw)
        .split(/[\n,;\s]+/)
        .map((v) => v.trim())
        .filter(Boolean);
    });
  }
  const str = getText(f);
  return str
    ? str
        .split(/[\n,;\s]+/)
        .map((s) => s.trim())
        .filter(Boolean)
    : [];
}

export interface Attachment {
  url: string;
  name: string;
  type: string;
}

/** Attachment field → array of `{ url, name, type }`. */
export function getAttachments(f: F): Attachment[] {
  if (!f || !Array.isArray(f)) return [];
  return f
    .map((a: any) => ({ url: a.url || "", name: a.name || "", type: a.type || "" }))
    .filter((a) => a.url);
}
