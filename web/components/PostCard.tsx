"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Copy, Check } from "lucide-react";
import { cn } from "@/lib/cn";
import { xIntentUrl } from "@/lib/postable";

const X_LIMIT = 280;

function XLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.66l-5.214-6.817-5.967 6.817H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117l11.966 15.644Z" />
    </svg>
  );
}

export function PostCard({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const over = text.length > X_LIMIT;

  function copy() {
    void navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="mt-2 w-full max-w-full overflow-hidden rounded-xl border border-border bg-bg/60"
    >
      <div className="flex items-center justify-between border-b border-border px-3.5 py-2">
        <span className="flex items-center gap-1.5 text-xs text-muted">
          <XLogo className="h-3.5 w-3.5" />
          Ready to post on X
        </span>
        <span className={cn("text-xs tabular-nums", over ? "text-danger" : "text-muted")}>
          {text.length}/{X_LIMIT}
        </span>
      </div>

      <p className="whitespace-pre-wrap break-words px-3.5 py-3 text-[15px] leading-relaxed">{text}</p>

      <div className="flex items-center gap-2 border-t border-border px-3.5 py-2.5">
        <a
          href={xIntentUrl(text)}
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-text px-3.5 text-[13px] font-medium text-bg transition hover:opacity-90"
        >
          <XLogo className="h-3.5 w-3.5" />
          Post on X
        </a>
        <button
          onClick={copy}
          className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border px-3 text-[13px] text-muted transition hover:text-text"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-brand" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "Copied" : "Copy"}
        </button>
        {over && <span className="ml-auto text-xs text-danger">Over 280 — X may reject it</span>}
      </div>
    </motion.div>
  );
}
