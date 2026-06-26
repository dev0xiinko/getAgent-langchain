"use client";
import { useState } from "react";
import { Copy, Check, RotateCcw, FileText, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/cn";
import type { ChatMessage } from "@/lib/types";
import { extractSuggestions } from "@/lib/suggestions";
import { MarkdownView } from "@/components/MarkdownView";
import { BrandMark } from "@/components/Brand";
import { TypingDots } from "@/components/ui";

function Attachments({ files }: { files: NonNullable<ChatMessage["attachedFiles"]> }) {
  return (
    <div className="mb-2 flex flex-wrap gap-2">
      {files.map((f, i) =>
        f.type.startsWith("image/") ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={i}
            src={f.base64}
            alt={f.name}
            className="h-16 w-16 rounded-lg border border-border object-cover"
          />
        ) : (
          <span
            key={i}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface2 px-2 py-1 text-xs"
          >
            <FileText className="h-3.5 w-3.5 text-muted" />
            {f.name}
          </span>
        ),
      )}
    </div>
  );
}

export function Message({
  msg,
  streaming,
  status,
  onRegenerate,
  onSuggest,
}: {
  msg: ChatMessage;
  streaming?: boolean;
  status?: string;
  onRegenerate?: () => void;
  onSuggest?: (text: string) => void;
}) {
  const [copied, setCopied] = useState(false);
  const isUser = msg.role === "user";

  // Split a trailing ```suggest block into clickable quick replies (assistant only).
  const { body, suggestions } = isUser
    ? { body: msg.content, suggestions: [] as string[] }
    : extractSuggestions(msg.content);

  function copy() {
    void navigator.clipboard.writeText(body);
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  }

  return (
    <div className={cn("group flex w-full animate-fade-in gap-3", isUser ? "flex-row-reverse" : "flex-row")}>
      {/* avatar */}
      {isUser ? (
        <div className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-surface2 text-[11px] font-semibold uppercase text-muted">
          you
        </div>
      ) : (
        <BrandMark className="mt-0.5 h-8 w-8 shrink-0" />
      )}

      <div
        className={cn("flex min-w-0 max-w-[min(680px,85%)] flex-col", isUser ? "items-end" : "items-start")}
      >
        <div
          className={cn(
            "rounded-2xl px-4 py-2.5 text-[15px] leading-relaxed",
            isUser && "rounded-tr-md border border-brand/25 bg-brand/12",
            !isUser && !msg.isError && "rounded-tl-md border border-border bg-surface",
            msg.isError && "rounded-tl-md border border-danger/40 bg-danger/10",
          )}
        >
          {msg.isError && (
            <div className="mb-1 flex items-center gap-1.5 text-xs font-medium text-danger">
              <AlertTriangle className="h-3.5 w-3.5" /> Error
            </div>
          )}
          {msg.attachedFiles && msg.attachedFiles.length > 0 && <Attachments files={msg.attachedFiles} />}

          {isUser ? (
            <p className="whitespace-pre-wrap break-words">{msg.content}</p>
          ) : streaming && !body ? (
            // No tokens yet — show an animated thinking / tool-status state.
            <div className="flex items-center gap-2 py-0.5">
              <TypingDots />
              <span className="shimmer text-[15px]">{status?.trim() || "Thinking…"}</span>
            </div>
          ) : (
            <div className="flex items-end gap-1">
              <MarkdownView content={body} />
              {streaming && (
                <span className="mb-1 inline-block h-4 w-[3px] shrink-0 animate-blink rounded-full bg-brand" />
              )}
            </div>
          )}
        </div>

        {/* clickable quick replies parsed from the agent's ```suggest block */}
        {!isUser && !streaming && suggestions.length > 0 && onSuggest && (
          <div className="mt-2 flex flex-wrap gap-2">
            {suggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => onSuggest(s)}
                className="rounded-full border border-brand/40 bg-brand/10 px-3 py-1.5 text-[13px] text-brand transition hover:bg-brand/20 active:scale-[0.98]"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* action row */}
        {!isUser && msg.content && !streaming && (
          <div className="mt-1 flex items-center gap-1 px-1 opacity-0 transition-opacity group-hover:opacity-100">
            <button
              onClick={copy}
              className="inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-xs text-muted transition hover:text-text"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-brand" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Copied" : "Copy"}
            </button>
            {onRegenerate && (
              <button
                onClick={onRegenerate}
                className="inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-xs text-muted transition hover:text-text"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Retry
              </button>
            )}
            {msg.toolUsed && <span className="px-1 text-xs text-muted">· via {msg.toolUsed}</span>}
          </div>
        )}
      </div>
    </div>
  );
}
