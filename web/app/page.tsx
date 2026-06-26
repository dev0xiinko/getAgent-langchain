"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { Menu, ArrowDown, Sparkles, TrendingUp, Newspaper, PenLine } from "lucide-react";
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
import type { AttachedFile, ChatMessage, Me, Mode, Tab, Usage } from "@/lib/types";
import { useTheme } from "@/lib/theme";
import { Login } from "@/components/Login";
import { Sidebar } from "@/components/Sidebar";
import { Message } from "@/components/Message";
import { Composer } from "@/components/Composer";
import { DailyReport } from "@/components/DailyReport";
import { KnowledgeBase } from "@/components/KnowledgeBase";
import { TypingDots } from "@/components/ui";
import { BrandMark } from "@/components/Brand";

const SUGGESTIONS = [
  { icon: Sparkles, label: "What is Bitget?", text: "What is Bitget and what can it do?" },
  { icon: PenLine, label: "Draft a tweet about BTC", text: "Write a punchy tweet about Bitcoin's momentum." },
  {
    icon: TrendingUp,
    label: "Top US stock movers",
    text: "What are the top US stock gainers and losers today?",
  },
  { icon: Newspaper, label: "Latest crypto news", text: "Give me the latest high-impact crypto news." },
];

export default function Page() {
  const [me, setMe] = useState<Me | null>(null);
  const [usage, setUsage] = useState<Usage | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [tab, setTab] = useState<Tab>("chat");
  const [mode, setMode] = useState<Mode>("chat");
  const [aspect, setAspect] = useState("1:1");
  const [busy, setBusy] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [theme, toggleTheme] = useTheme();

  const scrollRef = useRef<HTMLDivElement>(null);
  const atBottomRef = useRef(true);
  const abortRef = useRef<AbortController | null>(null);

  const refreshUsage = useCallback((id: string) => {
    getUsage(id)
      .then(setUsage)
      .catch(() => {});
  }, []);

  // Autoscroll only when the user is already near the bottom.
  useEffect(() => {
    if (atBottomRef.current) scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, status]);

  function onScroll() {
    const el = scrollRef.current;
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 90;
    atBottomRef.current = atBottom;
    setShowScrollBtn(!atBottom && el.scrollHeight > el.clientHeight + 200);
  }

  function scrollToBottom() {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }

  async function connect(id: string) {
    if (!id) return;
    setError("");
    setConnecting(true);
    try {
      const meRes = await getMe(id);
      setMe(meRes);
      localStorage.setItem("getagent_uid", id);
      const session = await getSession(id);
      setMessages(session.messages ?? []);
      refreshUsage(id);
      if (!meRes.leader) setTab("chat");
    } catch (e) {
      const code = e instanceof ApiError ? e.code : "connection failed";
      setError(
        code === "not_allowed"
          ? "UID is not on the allowlist."
          : code === "no_access"
            ? "No UserMeta for this UID — seed it below (dev) or create one."
            : code,
      );
      setMe(null);
    } finally {
      setConnecting(false);
    }
  }

  async function doSeed(id: string, role: string) {
    setError("");
    setConnecting(true);
    try {
      await seedUser({ uid: id, role });
      await connect(id);
    } catch (e) {
      setError(e instanceof ApiError ? e.code : "seed failed (dev route off in production)");
      setConnecting(false);
    }
  }

  function disconnect() {
    abortRef.current?.abort();
    setMe(null);
    setMessages([]);
    setUsage(null);
    localStorage.removeItem("getagent_uid");
  }

  async function onSend(text: string, files: AttachedFile[]) {
    if (!me || busy) return;
    setError("");
    setSidebarOpen(false);
    setBusy(true);
    setMessages((m) => [...m, { role: "user", content: text, attachedFiles: files }]);
    try {
      if (mode === "image") await runImage(text, files);
      else await runChat(text, files);
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

    const ac = new AbortController();
    abortRef.current = ac;
    try {
      for await (const frame of streamChat(
        { uid: me!.uid, message: text, attachedFiles: files },
        ac.signal,
      )) {
        if (frame.status) setStatus(frame.status);
        if (frame.token) setAssistant((p) => ({ ...p, content: p.content + frame.token }));
        if (frame.error) setAssistant((p) => ({ ...p, content: p.content + frame.error, isError: true }));
      }
    } catch (e) {
      if (ac.signal.aborted) {
        setAssistant((p) => ({ ...p, content: p.content || "_Stopped._" }));
      } else {
        const code = e instanceof ApiError ? e.code : "stream failed";
        const msg =
          code === "daily_limit" ? "Daily chat limit reached." : "Something went wrong — please try again.";
        setAssistant((p) => ({ ...p, content: p.content || msg, isError: true }));
      }
    } finally {
      abortRef.current = null;
    }
  }

  async function runImage(prompt: string, files: AttachedFile[]) {
    try {
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

  function stop() {
    abortRef.current?.abort();
  }

  function regenerate() {
    if (busy) return;
    // Find the last user turn, drop everything after it, and resend.
    let lastUser = -1;
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === "user") {
        lastUser = i;
        break;
      }
    }
    if (lastUser < 0) return;
    const turn = messages[lastUser];
    setMessages((m) => m.slice(0, lastUser));
    void onSend(turn.content, turn.attachedFiles ?? []);
  }

  async function newSession() {
    if (!me) return;
    abortRef.current?.abort();
    await clearSession(me.uid).catch(() => {});
    setMessages([]);
    setSidebarOpen(false);
    refreshUsage(me.uid);
  }

  if (!me) {
    return <Login error={error} busy={connecting} onConnect={connect} onSeed={doSeed} />;
  }

  const lastAssistantIdx = messages.map((m) => m.role).lastIndexOf("assistant");
  const tabTitle = tab === "report" ? "Daily report" : tab === "kb" ? "Knowledge base" : "Chat";

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        me={me}
        usage={usage}
        tab={tab}
        onTab={(t) => {
          setTab(t);
          setSidebarOpen(false);
        }}
        mode={mode}
        onMode={setMode}
        onNewSession={newSession}
        onDisconnect={disconnect}
        theme={theme}
        onToggleTheme={toggleTheme}
        mobileOpen={sidebarOpen}
        onCloseMobile={() => setSidebarOpen(false)}
      />

      <main className="flex min-w-0 flex-1 flex-col">
        {/* header */}
        <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border px-4 md:px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="grid h-9 w-9 place-items-center rounded-lg text-muted hover:bg-surface2 hover:text-text md:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
          <h1 className="text-sm font-semibold tracking-tight">{tabTitle}</h1>
          {tab === "chat" && (
            <span className="rounded-full border border-border px-2 py-0.5 text-[11px] text-muted">
              {mode === "image" ? "Image mode" : "claude-sonnet-4-6"}
            </span>
          )}
        </header>

        {tab === "report" && me.leader ? (
          <DailyReport uid={me.uid} />
        ) : tab === "kb" && me.leader ? (
          <KnowledgeBase uid={me.uid} />
        ) : (
          <div className="relative flex min-h-0 flex-1 flex-col">
            <div ref={scrollRef} onScroll={onScroll} className="scrollbar-thin flex-1 overflow-y-auto">
              <div className="mx-auto w-full max-w-3xl px-4 py-6 md:px-6">
                {error && (
                  <div className="mb-4 rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-[13px] text-danger">
                    {error}
                  </div>
                )}

                {messages.length === 0 ? (
                  <div className="flex min-h-[55vh] flex-col items-center justify-center text-center animate-fade-up">
                    <BrandMark className="mb-5 h-16 w-16" />
                    <h2 className="text-2xl font-semibold tracking-tight">How can I help?</h2>
                    <p className="mt-1.5 max-w-md text-sm text-muted">
                      Ask about Bitget, the markets, or campaigns — or have me draft content for X, Reddit, or
                      CMC.
                    </p>
                    <div className="mt-7 grid w-full max-w-xl grid-cols-1 gap-2.5 sm:grid-cols-2">
                      {SUGGESTIONS.map((s) => (
                        <button
                          key={s.label}
                          onClick={() => onSend(s.text, [])}
                          className="group flex items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3 text-left text-sm transition hover:border-brand/40 hover:bg-surface2"
                        >
                          <s.icon className="h-4 w-4 shrink-0 text-brand" />
                          <span className="text-muted transition group-hover:text-text">{s.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-6">
                    {messages.map((m, i) => (
                      <Message
                        key={i}
                        msg={m}
                        streaming={
                          busy && mode === "chat" && i === messages.length - 1 && m.role === "assistant"
                        }
                        onRegenerate={i === lastAssistantIdx && !busy ? regenerate : undefined}
                      />
                    ))}
                    {busy && status && (
                      <div className="flex items-center gap-2 pl-11 text-[13px] text-muted animate-fade-in">
                        <TypingDots />
                        <span>{status}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {showScrollBtn && (
              <button
                onClick={scrollToBottom}
                className="absolute bottom-4 left-1/2 z-10 grid h-9 w-9 -translate-x-1/2 place-items-center rounded-full border border-border bg-surface text-muted shadow-lg transition hover:text-text"
              >
                <ArrowDown className="h-4 w-4" />
              </button>
            )}

            <Composer
              mode={mode}
              aspect={aspect}
              onAspectChange={setAspect}
              busy={busy}
              onSend={onSend}
              onStop={mode === "chat" ? stop : undefined}
            />
          </div>
        )}
      </main>
    </div>
  );
}
