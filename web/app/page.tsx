"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ApiError,
  clearSession,
  generateImage,
  getMe,
  getSession,
  getUsage,
  seedUser,
  streamChat,
} from "@/lib/api";
import type { AttachedFile, ChatMessage, Me, Usage } from "@/lib/types";
import { Message } from "@/components/Message";
import { Composer } from "@/components/Composer";
import { DailyReport } from "@/components/DailyReport";
import { KnowledgeBase } from "@/components/KnowledgeBase";

type Tab = "chat" | "report" | "kb";
type Mode = "chat" | "image";

export default function Page() {
  const [uid, setUid] = useState("");
  const [me, setMe] = useState<Me | null>(null);
  const [usage, setUsage] = useState<Usage | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [tab, setTab] = useState<Tab>("chat");
  const [mode, setMode] = useState<Mode>("chat");
  const [aspect, setAspect] = useState("1:1");
  const [busy, setBusy] = useState(false);
  const [seedRole, setSeedRole] = useState("Member");

  const scrollRef = useRef<HTMLDivElement>(null);
  const uidInputRef = useRef<HTMLInputElement>(null);

  // Restore last uid.
  useEffect(() => {
    const saved = localStorage.getItem("getagent_uid");
    if (saved && uidInputRef.current) uidInputRef.current.value = saved;
  }, []);

  // Autoscroll on new content.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, status]);

  const refreshUsage = useCallback((id: string) => {
    getUsage(id)
      .then(setUsage)
      .catch(() => {});
  }, []);

  async function connect(id: string) {
    setError("");
    try {
      const meRes = await getMe(id);
      setMe(meRes);
      setUid(id);
      localStorage.setItem("getagent_uid", id);
      const session = await getSession(id);
      setMessages(session.messages ?? []);
      refreshUsage(id);
      if (!meRes.leader) setTab("chat");
    } catch (e) {
      const code = e instanceof ApiError ? e.code : "connection failed";
      setError(
        code === "not_allowed"
          ? "uid not on the allowlist"
          : code === "no_access"
            ? "no UserMeta for this uid — seed it below (dev) or create one"
            : code,
      );
      setMe(null);
    }
  }

  async function doSeed() {
    const id = uidInputRef.current?.value.trim();
    if (!id) return;
    setError("");
    try {
      await seedUser({ uid: id, role: seedRole });
      await connect(id);
    } catch (e) {
      setError(e instanceof ApiError ? e.code : "seed failed (dev route off in production)");
    }
  }

  function disconnect() {
    setMe(null);
    setMessages([]);
    setUsage(null);
    setUid("");
    localStorage.removeItem("getagent_uid");
  }

  async function onSend(text: string, files: AttachedFile[]) {
    if (!me || busy) return;
    setError("");
    setBusy(true);
    setMessages((m) => [...m, { role: "user", content: text, attachedFiles: files }]);

    try {
      if (mode === "image") {
        await runImage(text, files);
      } else {
        await runChat(text, files);
      }
    } finally {
      setBusy(false);
      setStatus("");
      refreshUsage(me.uid);
    }
  }

  async function runChat(text: string, files: AttachedFile[]) {
    let assistantIdx = -1;
    setMessages((m) => {
      assistantIdx = m.length;
      return [...m, { role: "assistant", content: "" }];
    });
    const setAssistant = (fn: (prev: ChatMessage) => ChatMessage) =>
      setMessages((m) => m.map((msg, i) => (i === assistantIdx ? fn(msg) : msg)));

    try {
      for await (const frame of streamChat({ uid: me!.uid, message: text, attachedFiles: files })) {
        if (frame.status) setStatus(frame.status);
        if (frame.token) setAssistant((p) => ({ ...p, content: p.content + frame.token }));
        if (frame.error) setAssistant((p) => ({ ...p, content: p.content + frame.error, isError: true }));
      }
    } catch (e) {
      const code = e instanceof ApiError ? e.code : "stream failed";
      const msg =
        code === "daily_limit" ? "Daily chat limit reached." : "Something went wrong — please try again.";
      setAssistant((p) => ({ ...p, content: p.content || msg, isError: true }));
    }
  }

  async function runImage(prompt: string, files: AttachedFile[]) {
    try {
      // The attachment (if any) is the reference image — a base64 data-URL string.
      const ref = files[0]?.base64;
      const { url } = await generateImage({ uid: me!.uid, prompt, aspectRatio: aspect, attachedFile: ref });
      setMessages((m) => [...m, { role: "assistant", content: `![generated](${url})`, isImage: true }]);
    } catch (e) {
      const code = e instanceof ApiError ? e.code : "image failed";
      const msg =
        code === "daily_limit"
          ? "Daily image limit reached."
          : `Image generation failed — ${code}. Please try again.`;
      setMessages((m) => [...m, { role: "assistant", content: msg, isError: true }]);
    }
  }

  async function newSession() {
    if (!me) return;
    await clearSession(me.uid).catch(() => {});
    setMessages([]);
    refreshUsage(me.uid);
  }

  // ── Not connected: login panel ──
  if (!me) {
    return (
      <div className="app" style={{ gridTemplateColumns: "1fr" }}>
        <div className="main" style={{ alignItems: "center", justifyContent: "center" }}>
          <div className="group" style={{ width: 320, gap: 10 }}>
            <h1>GetAgent</h1>
            <label>Bitget UID</label>
            <input
              ref={uidInputRef}
              placeholder="your uid"
              onKeyDown={(e) => e.key === "Enter" && connect((e.target as HTMLInputElement).value.trim())}
            />
            <button className="primary" onClick={() => connect(uidInputRef.current?.value.trim() ?? "")}>
              Connect
            </button>
            {error && <div className="banner">{error}</div>}
            <details style={{ marginTop: 8 }}>
              <summary style={{ color: "var(--muted)", cursor: "pointer", fontSize: 12 }}>
                Dev: seed a user
              </summary>
              <div className="group" style={{ marginTop: 8 }}>
                <select value={seedRole} onChange={(e) => setSeedRole(e.target.value)}>
                  <option>Member</option>
                  <option>Lead Builder</option>
                  <option>Manager</option>
                </select>
                <button className="ghost" onClick={doSeed}>
                  Seed &amp; connect
                </button>
              </div>
            </details>
          </div>
        </div>
      </div>
    );
  }

  // ── Connected ──
  const chatDisabled = busy;
  return (
    <div className="app">
      <aside className="sidebar">
        <h1>GetAgent</h1>
        <div className="group">
          <label>User</label>
          <span className="pill">
            {me.uid} · {me.role}
          </span>
          {usage && (
            <span className="pill">
              chat {usage.chatCount}/{usage.chatLimit} · img {usage.imageCount}/{usage.imageLimit}
            </span>
          )}
          {me.leader && <span className="pill">leader</span>}
        </div>

        <div className="group">
          <label>Mode</label>
          <div className="tabs" style={{ padding: 0, border: "none", background: "none" }}>
            <button className={mode === "chat" ? "active" : ""} onClick={() => setMode("chat")}>
              Chat
            </button>
            <button className={mode === "image" ? "active" : ""} onClick={() => setMode("image")}>
              Image
            </button>
          </div>
        </div>

        <div className="group">
          <button className="ghost" onClick={newSession}>
            New session
          </button>
          <button className="ghost" onClick={disconnect}>
            Disconnect
          </button>
        </div>
      </aside>

      <main className="main">
        <div className="tabs">
          <button className={tab === "chat" ? "active" : ""} onClick={() => setTab("chat")}>
            Chat
          </button>
          {me.leader && (
            <button className={tab === "report" ? "active" : ""} onClick={() => setTab("report")}>
              Daily report
            </button>
          )}
          {me.leader && (
            <button className={tab === "kb" ? "active" : ""} onClick={() => setTab("kb")}>
              Knowledge base
            </button>
          )}
        </div>

        {error && <div className="banner">{error}</div>}

        {tab === "report" && me.leader ? (
          <DailyReport uid={me.uid} />
        ) : tab === "kb" && me.leader ? (
          <KnowledgeBase uid={me.uid} />
        ) : (
          <>
            <div className="messages" ref={scrollRef}>
              {messages.length === 0 ? (
                <div className="empty">Start the conversation.</div>
              ) : (
                messages.map((m, i) => <Message key={i} msg={m} />)
              )}
            </div>
            <div className="status">{status}</div>
            <Composer
              mode={mode}
              aspect={aspect}
              onAspectChange={setAspect}
              disabled={chatDisabled}
              onSend={onSend}
            />
          </>
        )}
      </main>
    </div>
  );
}
