"use client";
import { useEffect, useState } from "react";
import { ApiError, getKbDoc, listKb, reindexKb, syncKb } from "@/lib/api";
import { renderMarkdown } from "@/lib/markdown";
import type { KbDocFull, KbDocSummary } from "@/lib/types";

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
    <div className="report">
      <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 12, flexWrap: "wrap" }}>
        <button className="primary" onClick={() => run("Syncing", () => syncKb(uid))} disabled={!!busy}>
          {busy === "Syncing" ? "Syncing… (~8s)" : "Sync now"}
        </button>
        <button className="ghost" onClick={() => run("Reindexing", () => reindexKb(uid))} disabled={!!busy}>
          {busy === "Reindexing" ? "Reindexing…" : "Reindex"}
        </button>
        <button className="ghost" onClick={() => void load()} disabled={loading}>
          Refresh
        </button>
        <span className="pill">{docs.length} docs</span>
        {!larkSyncEnabled && <span className="pill">Lark sync off</span>}
      </div>

      {error && <div className="banner">{error}</div>}

      {open && (
        <div style={{ marginBottom: 12 }}>
          <button className="ghost" onClick={() => setOpen(null)}>
            ← Back to list
          </button>
          <div className="msg assistant" style={{ maxWidth: "100%", marginTop: 8 }}>
            <div className="role">
              {open.docId} · {open.status} · {open.source}
            </div>
            <div className="body" dangerouslySetInnerHTML={{ __html: renderMarkdown(open.body || "") }} />
          </div>
        </div>
      )}

      {!open &&
        (loading ? (
          <div className="empty">Loading…</div>
        ) : docs.length === 0 ? (
          <div className="empty">No KB documents yet. Click “Sync now” to pull from Lark.</div>
        ) : (
          <table className="kb-table">
            <thead>
              <tr>
                <th>Title / id</th>
                <th>Category</th>
                <th>Status</th>
                <th>Source</th>
                <th>Embedded</th>
                <th>Updated</th>
              </tr>
            </thead>
            <tbody>
              {docs.map((d) => (
                <tr key={d.docId} onClick={() => void view(d.docId)} style={{ cursor: "pointer" }}>
                  <td>
                    {d.title || <span style={{ color: "var(--muted)" }}>{d.docId}</span>}
                    {d.title && <div style={{ color: "var(--muted)", fontSize: 11 }}>{d.docId}</div>}
                  </td>
                  <td>{String(d.meta?.category ?? "—")}</td>
                  <td>{d.status}</td>
                  <td>{d.source}</td>
                  <td>{d.embedded ? "✓" : "—"}</td>
                  <td>{d.updatedAt ? new Date(d.updatedAt).toLocaleString() : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ))}
    </div>
  );
}
