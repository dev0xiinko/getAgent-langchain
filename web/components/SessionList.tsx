"use client";
import { MessageSquare, Trash2 } from "lucide-react";
import { cn } from "@/lib/cn";
import type { SessionSummary } from "@/lib/types";

function relativeTime(iso: string): string {
  const d = new Date(iso).getTime();
  if (Number.isNaN(d)) return "";
  const s = Math.floor((Date.now() - d) / 1000);
  if (s < 60) return "now";
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  if (s < 604800) return `${Math.floor(s / 86400)}d`;
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function SessionList({
  sessions,
  currentId,
  onSelect,
  onDelete,
}: {
  sessions: SessionSummary[];
  currentId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="px-4 pb-1 pt-1 text-[11px] font-medium uppercase tracking-wide text-muted">History</div>
      <div className="scrollbar-thin min-h-0 flex-1 overflow-y-auto px-2">
        {sessions.length === 0 ? (
          <p className="px-2 py-3 text-xs text-muted">No conversations yet.</p>
        ) : (
          <div className="flex flex-col gap-0.5">
            {sessions.map((s) => {
              const active = s.sessionId === currentId;
              return (
                <div
                  key={s.sessionId}
                  className={cn(
                    "group/item flex items-center gap-2 rounded-lg px-2 py-2 text-sm transition-colors",
                    active ? "bg-brand/12 text-text" : "text-muted hover:bg-surface2 hover:text-text",
                  )}
                >
                  <button
                    onClick={() => onSelect(s.sessionId)}
                    className="flex min-w-0 flex-1 items-center gap-2 text-left"
                  >
                    <MessageSquare className={cn("h-4 w-4 shrink-0", active ? "text-brand" : "text-muted")} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate">{s.title || "New chat"}</span>
                    </span>
                  </button>
                  <span className="shrink-0 text-[10px] tabular-nums text-muted group-hover/item:hidden">
                    {relativeTime(s.updatedAt)}
                  </span>
                  <button
                    onClick={() => onDelete(s.sessionId)}
                    title="Delete conversation"
                    className="hidden shrink-0 rounded p-0.5 text-muted hover:text-danger group-hover/item:block"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
