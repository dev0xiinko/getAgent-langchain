"use client";
import { useEffect, useState } from "react";
import { ApiError, generateDailyReport, getDailyReport } from "@/lib/api";
import type { DailyReport as Report } from "@/lib/types";

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
      setTimeout(() => void load(), 30_000);
    } catch (e) {
      setError(e instanceof ApiError ? e.code : "failed to start generation");
      setBusy(false);
    }
  }

  return (
    <div className="report">
      <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 12 }}>
        <button className="primary" onClick={regenerate} disabled={busy}>
          {busy ? "Generating… (~30s)" : "Generate now"}
        </button>
        <button className="ghost" onClick={() => void load()} disabled={loading}>
          Refresh
        </button>
        {report && (
          <span className="pill">
            {report.date}
            {stale ? " · stale" : ""}
          </span>
        )}
      </div>
      {error && <div className="banner">{error}</div>}
      {loading ? (
        <div className="empty">Loading…</div>
      ) : report ? (
        <pre>{report.content}</pre>
      ) : (
        <div className="empty">No report yet. Click “Generate now”.</div>
      )}
    </div>
  );
}
