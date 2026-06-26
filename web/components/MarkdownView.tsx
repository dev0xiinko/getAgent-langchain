"use client";
import { useEffect, useRef } from "react";
import { renderMarkdown } from "@/lib/markdown";

/**
 * Renders trusted assistant markup and, after each render, upgrades every
 * <pre> code block with a header bar (language label + copy button). The
 * upgrade runs in a ref effect so it re-applies as streamed content grows.
 */
export function MarkdownView({ content }: { content: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    root.querySelectorAll("pre").forEach((pre) => {
      if (pre.parentElement?.classList.contains("code-wrap")) return;
      const code = pre.querySelector("code");
      const lang = [...(code?.classList ?? [])].find((c) => c.startsWith("lang-"))?.slice(5) ?? "code";

      const wrap = document.createElement("div");
      wrap.className = "code-wrap";
      const head = document.createElement("div");
      head.className = "code-head";

      const name = document.createElement("span");
      name.textContent = lang;

      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "code-copy";
      btn.textContent = "Copy";
      btn.onclick = () => {
        void navigator.clipboard.writeText(code?.textContent ?? "");
        btn.textContent = "Copied";
        setTimeout(() => (btn.textContent = "Copy"), 1400);
      };

      head.append(name, btn);
      pre.parentElement?.insertBefore(wrap, pre);
      wrap.append(head, pre);
    });
  }, [content]);

  return <div ref={ref} className="md" dangerouslySetInnerHTML={{ __html: renderMarkdown(content || "") }} />;
}
