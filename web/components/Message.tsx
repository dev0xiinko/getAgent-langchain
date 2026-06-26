import { renderMarkdown } from "@/lib/markdown";
import type { ChatMessage } from "@/lib/types";

export function Message({ msg }: { msg: ChatMessage }) {
  const cls = `msg ${msg.role}${msg.isError ? " error" : ""}`;
  return (
    <div className={cls}>
      <div className="role">{msg.role}</div>
      <div className="body" dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content || "") }} />
      {msg.toolUsed ? <div className="tool">via {msg.toolUsed}</div> : null}
    </div>
  );
}
