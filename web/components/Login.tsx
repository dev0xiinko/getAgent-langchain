"use client";
import { useEffect, useRef, useState } from "react";
import { Sparkles, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui";
import { BrandMark } from "@/components/Brand";

export function Login({
  error,
  busy,
  onConnect,
  onSeed,
}: {
  error: string;
  busy: boolean;
  onConnect: (uid: string) => void;
  onSeed: (uid: string, role: string) => void;
}) {
  const [uid, setUid] = useState("");
  const [role, setRole] = useState("Member");
  const [showDev, setShowDev] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem("getagent_uid");
    if (saved) setUid(saved);
    inputRef.current?.focus();
  }, []);

  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden px-4">
      {/* ambient brand glow */}
      <div className="pointer-events-none absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-brand/20 blur-[120px]" />
      <div className="relative w-full max-w-sm animate-fade-up">
        <div className="mb-7 flex flex-col items-center text-center">
          <BrandMark className="mb-4 h-16 w-16" />
          <div className="font-mono text-[10px] font-semibold tracking-[0.32em] text-brand">BITGET</div>
          <h1 className="mt-1 text-[28px] font-bold tracking-[-0.03em]">Builder Agent</h1>
          <p className="mt-1.5 font-mono text-xs text-muted">autonomous // build · deploy · iterate</p>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-5 shadow-xl shadow-black/20">
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted">
            Bitget UID
          </label>
          <input
            ref={inputRef}
            value={uid}
            onChange={(e) => setUid(e.target.value)}
            placeholder="Enter your UID"
            onKeyDown={(e) => e.key === "Enter" && onConnect(uid.trim())}
            className="h-11 w-full rounded-xl border border-border bg-surface2 px-3.5 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/30"
          />

          <Button
            variant="primary"
            className="mt-3 h-11 w-full text-[15px]"
            disabled={busy || !uid.trim()}
            onClick={() => onConnect(uid.trim())}
          >
            {busy ? "Connecting…" : "Connect"}
            {!busy && <ChevronRight className="h-4 w-4" />}
          </Button>

          {error && (
            <div className="mt-3 rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-[13px] text-danger">
              {error}
            </div>
          )}

          <button
            onClick={() => setShowDev((s) => !s)}
            className="mt-4 flex w-full items-center gap-1.5 text-xs text-muted transition hover:text-text"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Dev: seed a user
          </button>
          {showDev && (
            <div className="mt-2.5 flex gap-2 animate-fade-in">
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="h-9 flex-1 rounded-lg border border-border bg-surface2 px-2 text-sm outline-none focus:border-brand"
              >
                <option>Member</option>
                <option>Lead Builder</option>
                <option>Manager</option>
              </select>
              <Button variant="subtle" size="sm" onClick={() => uid.trim() && onSeed(uid.trim(), role)}>
                Seed &amp; connect
              </Button>
            </div>
          )}
        </div>
        <p className="mt-5 text-center text-xs text-muted">
          Content creation · market research · platform Q&amp;A
        </p>
      </div>
    </div>
  );
}
