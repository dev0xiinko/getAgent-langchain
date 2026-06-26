/**
 * Pulls a trailing ```suggest fenced block out of an assistant message and returns
 * the prose body plus the parsed quick-reply options. While a response is still
 * streaming, an unclosed block is hidden (stripped from the body, no chips yet) so
 * the user never sees the raw fence.
 */
const CLOSED = /```suggest(?:ions)?[^\n]*\n([\s\S]*?)```/i;
const OPEN = /```suggest(?:ions)?[^\n]*\n[\s\S]*$/i;

function cleanLine(line: string): string {
  return line
    .replace(/^\s*(?:[-*•]|\d+[.)])\s+/, "") // strip bullet / number markers
    .replace(/^["'`]+|["'`]+$/g, "") // strip wrapping quotes/backticks
    .trim();
}

export function extractSuggestions(content: string): { body: string; suggestions: string[] } {
  const closed = content.match(CLOSED);
  if (closed) {
    const suggestions = closed[1].split("\n").map(cleanLine).filter(Boolean).slice(0, 8);
    return { body: content.replace(closed[0], "").trim(), suggestions };
  }
  // Still streaming: hide the partial, unclosed block until it completes.
  if (OPEN.test(content)) {
    return { body: content.replace(OPEN, "").trim(), suggestions: [] };
  }
  return { body: content, suggestions: [] };
}
