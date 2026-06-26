"use client";
import { MessageSquare, ImageIcon, FileBarChart, BookOpen, Plus, LogOut, Sun, Moon, X } from "lucide-react";
import { cn } from "@/lib/cn";
import type { Me, Mode, Tab, Usage } from "@/lib/types";
import type { Theme } from "@/lib/theme";
import { Brand } from "@/components/Brand";

function Meter({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  const near = pct >= 80;
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-[11px]">
        <span className="text-muted">{label}</span>
        <span className={cn("tabular-nums", near ? "text-danger" : "text-muted")}>
          {value}/{max}
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-surface2">
        <div
          className={cn("h-full rounded-full transition-all duration-500", near ? "bg-danger" : "bg-brand")}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function NavItem({
  active,
  icon: Icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: typeof MessageSquare;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
        active ? "bg-brand/12 font-medium text-brand" : "text-muted hover:bg-surface2 hover:text-text",
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {label}
    </button>
  );
}

export function Sidebar({
  me,
  usage,
  tab,
  onTab,
  mode,
  onMode,
  onNewSession,
  onDisconnect,
  theme,
  onToggleTheme,
  mobileOpen,
  onCloseMobile,
}: {
  me: Me;
  usage: Usage | null;
  tab: Tab;
  onTab: (t: Tab) => void;
  mode: Mode;
  onMode: (m: Mode) => void;
  onNewSession: () => void;
  onDisconnect: () => void;
  theme: Theme;
  onToggleTheme: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}) {
  return (
    <>
      {/* mobile backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-30 bg-black/50 backdrop-blur-sm transition-opacity md:hidden",
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={onCloseMobile}
      />
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-[270px] flex-col border-r border-border bg-surface",
          "transition-transform duration-200 md:static md:z-auto md:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between px-4 py-4">
          <Brand />
          <button
            onClick={onCloseMobile}
            className="rounded-lg p-1.5 text-muted hover:bg-surface2 hover:text-text md:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-3">
          <button
            onClick={onNewSession}
            className="flex w-full items-center gap-2 rounded-xl border border-border bg-surface2 px-3 py-2.5 text-sm font-medium transition hover:border-brand/50 hover:bg-brand/10"
          >
            <Plus className="h-4 w-4 text-brand" />
            New session
          </button>
        </div>

        <nav className="mt-4 flex flex-col gap-0.5 px-3">
          <NavItem active={tab === "chat"} icon={MessageSquare} label="Chat" onClick={() => onTab("chat")} />
          {me.leader && (
            <NavItem
              active={tab === "report"}
              icon={FileBarChart}
              label="Daily report"
              onClick={() => onTab("report")}
            />
          )}
          {me.leader && (
            <NavItem
              active={tab === "kb"}
              icon={BookOpen}
              label="Knowledge base"
              onClick={() => onTab("kb")}
            />
          )}
        </nav>

        {tab === "chat" && (
          <div className="mt-5 px-3">
            <div className="mb-1.5 px-1 text-[11px] font-medium uppercase tracking-wide text-muted">Mode</div>
            <div className="flex gap-1 rounded-xl border border-border bg-surface2 p-1">
              {(
                [
                  ["chat", "Chat", MessageSquare],
                  ["image", "Image", ImageIcon],
                ] as const
              ).map(([m, label, Icon]) => (
                <button
                  key={m}
                  onClick={() => onMode(m)}
                  className={cn(
                    "flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 text-[13px] transition",
                    mode === m
                      ? "bg-brand text-brand-fg font-medium shadow-sm"
                      : "text-muted hover:text-text",
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        {usage && (
          <div className="mt-5 flex flex-col gap-3 px-4">
            <Meter label="Chat messages" value={usage.chatCount} max={usage.chatLimit} />
            <Meter label="Images" value={usage.imageCount} max={usage.imageLimit} />
          </div>
        )}

        <div className="flex-1" />

        <div className="border-t border-border p-3">
          <div className="mb-2 flex items-center gap-2.5 rounded-lg px-2 py-1.5">
            <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand/15 text-xs font-semibold uppercase text-brand">
              {me.uid.slice(0, 2)}
            </div>
            <div className="min-w-0 flex-1 leading-tight">
              <div className="truncate text-sm font-medium">{me.uid}</div>
              <div className="flex items-center gap-1.5 text-[11px] text-muted">
                {me.role}
                {me.leader && (
                  <span className="rounded bg-brand/15 px-1 py-px text-[10px] font-medium text-brand">
                    leader
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-1.5">
            <button
              onClick={onToggleTheme}
              title="Toggle theme"
              className="grid h-8 w-8 place-items-center rounded-lg border border-border text-muted transition hover:bg-surface2 hover:text-text"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <button
              onClick={onDisconnect}
              className="flex h-8 flex-1 items-center justify-center gap-1.5 rounded-lg border border-border text-[13px] text-muted transition hover:bg-surface2 hover:text-text"
            >
              <LogOut className="h-3.5 w-3.5" />
              Disconnect
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
