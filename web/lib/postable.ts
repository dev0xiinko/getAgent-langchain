/**
 * Pulls ready-to-publish content blocks out of an assistant message. The agent wraps
 * a finished tweet in a ```x fence; we render those as "Post on X" cards. Unclosed
 * blocks (still streaming) are hidden so the raw fence never flashes.
 */
export interface Postable {
  platform: "x";
  text: string;
}

const CLOSED = /```(?:x|tweet|twitter)[^\n]*\n([\s\S]*?)```/gi;
const OPEN = /```(?:x|tweet|twitter)[^\n]*\n[\s\S]*$/i;

export function extractPostable(content: string): { body: string; posts: Postable[] } {
  const posts: Postable[] = [];
  for (const m of content.matchAll(CLOSED)) {
    const text = m[1].trim();
    if (text) posts.push({ platform: "x", text });
  }
  let body = content.replace(CLOSED, "");
  body = body.replace(OPEN, ""); // drop an unclosed trailing block while streaming
  return { body: body.trim(), posts };
}

/** X "Web Intent" URL — opens the composer with the text prefilled. */
export function xIntentUrl(text: string): string {
  return `https://x.com/intent/tweet?text=${encodeURIComponent(text)}`;
}
