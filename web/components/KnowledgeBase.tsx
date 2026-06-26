"use client";
import { useEffect, useState } from "react";
import { RefreshCw, DatabaseZap, RotateCw, ArrowLeft, ChevronRight } from "lucide-react";
import { ApiError, getKbDoc, listKb, reindexKb, syncKb } from "@/lib/api";
import type { KbDocFull, KbDocSummary } from "@/lib/types";
import { Button, Pill } from "@/components/ui";
import { MarkdownView } from "@/components/MarkdownView";
import { cn } from "@/lib/cn";

const STATUS_STYLE: Record<string, string> = {
  published: "bg-brand/15 text-brand",
  draft: "bg-muted/15 text-muted",
  archived: "bg-danger/15 text-danger",
};

export function KnowledgeBase({ uid }: { uid: string }) {
  const [docs, setDocs] = useState<KbDocSummary[]>([]);
  const [larkSyncEnabled, setLarkSyncEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [open, setOpen] = useState<KbDocFull | null>(null);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const { docs, larkSyncEnabled } = await listKb(uid);
      setDocs(docs);
      setLarkSyncEnabled(larkSyncEnabled);
    } catch (e) {
      setError(e instanceof ApiError ? e.code : "failed to load KB");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid]);

  async function run(label: string, fn: () => Promise<{ message: string }>) {
    setBusy(label);
    setError("");
    try {
      const { message } = await fn();
      // Sync/reindex run server-side (fire-and-forget); re-poll after a delay.
      setTimeout(() => {
        void load();
        setBusy("");
      }, 8000);
      setError(message && message.startsWith("Lark KB") ? message : "");
    } catch (e) {
      setError(e instanceof ApiError ? e.code : `${label} failed`);
      setBusy("");
    }
  }

  async function view(id: string) {
    setError("");
    try {
      const { doc } = await getKbDoc(uid, id);
      setOpen(doc);
    } catch (e) {
      setError(e instanceof ApiError ? e.code : "failed to load doc");
    }
  }

  return (
    <div className="mx-auto flex h-full w-full max-w-4xl flex-col px-4 py-5 md:px-6">
      <div className="mb-4 flex flex-wrap items-center gap-2.5">
        <h2 className="mr-auto text-lg font-semibold tracking-tight">Knowledge base</h2>
        <Pill>{docs.length} docs</Pill>
        {!larkSyncEnabled && <Pill className="text-danger">Lark sync off</Pill>}
        <Button variant="ghost" size="sm" onClick={() => void load()} disabled={loading}>
          <RefreshCw className={loading ? "h-3.5 w-3.5 animate-spin" : "h-3.5 w-3.5"} />
          Refresh
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => run("Reindexing", () => reindexKb(uid))}
          disabled={!!busy}
        >
          <RotateCw className={cn("h-3.5 w-3.5", busy === "Reindexing" && "animate-spin")} />
          {busy === "Reindexing" ? "Reindexing…" : "Reindex"}
        </Button>
        <Button
          variant="primary"
          size="sm"
          onClick={() => run("Syncing", () => syncKb(uid))}
          disabled={!!busy}
        >
          <DatabaseZap className="h-3.5 w-3.5" />
          {busy === "Syncing" ? "Syncing… (~8s)" : "Sync now"}
        </Button>
      </div>

      {error && (
        <div className="mb-3 rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-[13px] text-danger">
          {error}
        </div>
      )}

      <div className="scrollbar-thin min-h-0 flex-1 overflow-y-auto">
        {open ? (
          <div className="animate-fade-in">
            <Button variant="ghost" size="sm" onClick={() => setOpen(null)} className="mb-3">
              <ArrowLeft className="h-3.5 w-3.5" /> Back to list
            </Button>
            <div className="rounded-2xl border border-border bg-surface p-5">
              <div className="mb-3 flex flex-wrap items-center gap-2 border-b border-border pb-3">
                <span className="font-medium">{open.title || open.docId}</span>
                <span
                  className={cn("rounded px-1.5 py-px text-[11px] font-medium", STATUS_STYLE[open.status])}
                >
                  {open.status}
                </span>
                <Pill>{open.source}</Pill>
              </div>
              <MarkdownView content={open.body} />
            </div>
          </div>
        ) : loading ? (
          <div className="grid h-40 place-items-center text-sm text-muted">Loading…</div>
        ) : docs.length === 0 ? (
          <div className="grid h-40 place-items-center text-sm text-muted">
            No KB documents yet. Click “Sync now” to pull from Lark.
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {docs.map((d) => (
              <button
                key={d.docId}
                onClick={() => void view(d.docId)}
                className="group flex items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3 text-left transition hover:border-brand/40 hover:bg-surface2"
              >
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{d.title || d.docId}</div>
                  <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-muted">
                    <span>{d.docId}</span>
                    {d.meta?.category && <span>· {String(d.meta.category)}</span>}
                    {d.updatedAt && <span>· {new Date(d.updatedAt).toLocaleDateString()}</span>}
                  </div>
                </div>
                <span className={cn("rounded px-1.5 py-px text-[11px] font-medium", STATUS_STYLE[d.status])}>
                  {d.status}
                </span>
                <span className="hidden text-[11px] text-muted sm:inline">{d.source}</span>
                <span
                  className={cn("text-xs", d.embedded ? "text-brand" : "text-muted")}
                  title={d.embedded ? "embedded" : "not embedded"}
                >
                  {d.embedded ? "● indexed" : "○"}
                </span>
                <ChevronRight className="h-4 w-4 text-muted transition group-hover:translate-x-0.5 group-hover:text-text" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
