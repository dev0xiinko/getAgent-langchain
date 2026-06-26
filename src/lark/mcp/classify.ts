/**
 * Read vs. write classification for Lark MCP tools — the safety boundary of the
 * preview-and-confirm contract.
 *
 * Tool names come from `lark-mcp` in snake_case (default `--tool-name-case snake`),
 * e.g. `im_v1_message_create`, `bitable_v1_app_table_record_search`.
 *
 * Fail-safe rule: a tool is a WRITE unless it *positively* looks like a read. A read
 * misclassified as a write only triggers a harmless extra confirmation; a write
 * misclassified as a read would execute an irreversible action with no confirmation —
 * so anything ambiguous or unrecognised is treated as a write.
 */

/** Action suffixes that mutate the workspace. */
const WRITE_SUFFIX =
  /_(create|update|delete|patch|put|remove|add|move|transfer|send|reply|forward|merge|copy|import|subscribe|unsubscribe|batch_create|batch_update|batch_delete|batch_add|batch_remove)$/;

/** Action suffixes that only read. */
const READ_SUFFIX = /_(get|list|search|query|read|batch_get|get_detail|describe|preview)$/;

/**
 * True if the tool mutates the workspace. Writes need preview-and-confirm; reads run
 * inline. Unknown/ambiguous names are treated as writes (fail-safe).
 */
export function isWriteTool(name: string): boolean {
  if (WRITE_SUFFIX.test(name)) return true;
  if (READ_SUFFIX.test(name)) return false;
  return true; // neither matched → assume it can write
}

/** Split tool names into reads and writes (for startup logging / review). */
export function classifyTools(names: string[]): { reads: string[]; writes: string[] } {
  const reads: string[] = [];
  const writes: string[] = [];
  for (const n of names) (isWriteTool(n) ? writes : reads).push(n);
  return { reads, writes };
}
