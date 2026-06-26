"use client";
import { useEffect, useState } from "react";
import { RefreshCw, Sparkles } from "lucide-react";
import { ApiError, generateDailyReport, getDailyReport } from "@/lib/api";
import type { DailyReport as Report } from "@/lib/types";
import { Button, Pill } from "@/components/ui";
import { MarkdownView } from "@/components/MarkdownView";

export function DailyReport({ uid }: { uid: string }) {
  const [report, setReport] = useState<Report | null>(null);
  const [stale, setStale] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const { report } = await getDailyReport(uid);
      setReport(report);
      setStale(Boolean(report?.stale));
    } catch (e) {
      setError(e instanceof ApiError ? e.code : "failed to load report");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid]);

  async function regenerate() {
    setBusy(true);
    setError("");
    try {
      await generateDailyReport(uid);
      // Generation is fire-and-forget on the server (~30s); poll once after a delay.
      setTimeout(() => {
        void load();
        setBusy(false);
      }, 30_000);
    } catch (e) {
      setError(e instanceof ApiError ? e.code : "failed to start generation");
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto flex h-full w-full max-w-3xl flex-col px-4 py-5 md:px-6">
      <div className="mb-4 flex flex-wrap items-center gap-2.5">
        <h2 className="mr-auto text-lg font-semibold tracking-tight">Daily market brief</h2>
        {report && (
          <Pill>
            {report.date}
            {stale && <span className="text-danger">· stale</span>}
          </Pill>
        )}
        <Button variant="ghost" size="sm" onClick={() => void load()} disabled={loading}>
          <RefreshCw className={loading ? "h-3.5 w-3.5 animate-spin" : "h-3.5 w-3.5"} />
          Refresh
        </Button>
        <Button variant="primary" size="sm" onClick={regenerate} disabled={busy}>
          <Sparkles className="h-3.5 w-3.5" />
          {busy ? "Generating… (~30s)" : "Generate now"}
        </Button>
      </div>

      {error && (
        <div className="mb-3 rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-[13px] text-danger">
          {error}
        </div>
      )}

      <div className="scrollbar-thin min-h-0 flex-1 overflow-y-auto">
        {loading ? (
          <div className="grid h-40 place-items-center text-sm text-muted">Loading…</div>
        ) : report ? (
          <div className="animate-fade-in rounded-2xl border border-border bg-surface p-5">
            <MarkdownView content={report.content} />
          </div>
        ) : (
          <div className="grid h-40 place-items-center text-sm text-muted">
            No report yet. Click “Generate now”.
          </div>
        )}
      </div>
    </div>
  );
}
