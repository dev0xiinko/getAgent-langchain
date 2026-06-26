"use client";
import { useEffect, useRef, useState } from "react";
import { Paperclip, ArrowUp, Square, X } from "lucide-react";
import { cn } from "@/lib/cn";
import type { AttachedFile, Mode } from "@/lib/types";

const ASPECTS = ["1:1", "16:9", "9:16", "4:3"];

function fileToAttached(file: File): Promise<AttachedFile> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve({ base64: String(reader.result), name: file.name, type: file.type });
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function Composer({
  mode,
  aspect,
  onAspectChange,
  busy,
  onSend,
  onStop,
}: {
  mode: Mode;
  aspect: string;
  onAspectChange: (a: string) => void;
  busy: boolean;
  onSend: (text: string, files: AttachedFile[]) => void;
  onStop?: () => void;
}) {
  const [text, setText] = useState("");
  const [files, setFiles] = useState<AttachedFile[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);

  // Auto-grow the textarea up to a max height.
  useEffect(() => {
    const ta = taRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = `${Math.min(ta.scrollHeight, 200)}px`;
  }, [text]);

  function submit() {
    const t = text.trim();
    if (!t || busy) return;
    onSend(t, files);
    setText("");
    setFiles([]);
  }

  async function pickFiles(list: FileList | null) {
    if (!list?.length) return;
    const added = await Promise.all(Array.from(list).map(fileToAttached));
    setFiles((f) => [...f, ...added]);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function onPaste(e: React.ClipboardEvent) {
    const imgs = Array.from(e.clipboardData.files).filter((f) => f.type.startsWith("image/"));
    if (imgs.length) {
      e.preventDefault();
      const added = await Promise.all(imgs.map(fileToAttached));
      setFiles((f) => [...f, ...added]);
    }
  }

  return (
    <div className="px-3 pb-3 md:px-6 md:pb-5">
      <div className="mx-auto max-w-3xl">
        <div className="rounded-2xl border border-border bg-surface shadow-lg shadow-black/10 transition focus-within:border-brand/50 focus-within:ring-2 focus-within:ring-brand/20">
          {files.length > 0 && (
            <div className="flex flex-wrap gap-2 px-3 pt-3">
              {files.map((f, i) => (
                <span key={i} className="group/att relative">
                  {f.type.startsWith("image/") ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={f.base64}
                      alt={f.name}
                      className="h-14 w-14 rounded-lg border border-border object-cover"
                    />
                  ) : (
                    <span className="flex h-14 items-center gap-1.5 rounded-lg border border-border bg-surface2 px-2.5 text-xs">
                      {f.name}
                    </span>
                  )}
                  <button
                    onClick={() => setFiles((arr) => arr.filter((_, j) => j !== i))}
                    className="absolute -right-1.5 -top-1.5 grid h-5 w-5 place-items-center rounded-full border border-border bg-surface text-muted hover:text-danger"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}

          <div className="flex items-end gap-2 p-2.5">
            <button
              onClick={() => fileRef.current?.click()}
              title="Attach image"
              className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-muted transition hover:bg-surface2 hover:text-text"
            >
              <Paperclip className="h-[18px] w-[18px]" />
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => void pickFiles(e.target.files)}
            />

            {mode === "image" && (
              <select
                value={aspect}
                onChange={(e) => onAspectChange(e.target.value)}
                title="Aspect ratio"
                className="h-9 shrink-0 rounded-lg border border-border bg-surface2 px-2 text-sm outline-none focus:border-brand"
              >
                {ASPECTS.map((a) => (
                  <option key={a}>{a}</option>
                ))}
              </select>
            )}

            <textarea
              ref={taRef}
              rows={1}
              value={text}
              placeholder={mode === "chat" ? "Ask anything…" : "Describe the image to generate…"}
              onChange={(e) => setText(e.target.value)}
              onPaste={onPaste}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  submit();
                }
              }}
              className="max-h-[200px] min-h-[36px] flex-1 resize-none self-center bg-transparent py-1.5 text-[15px] leading-relaxed outline-none placeholder:text-muted"
            />

            {busy && onStop ? (
              <button
                onClick={onStop}
                title="Stop"
                className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-surface2 text-text transition hover:bg-surface2/70"
              >
                <Square className="h-4 w-4 fill-current" />
              </button>
            ) : (
              <button
                onClick={submit}
                disabled={!text.trim() || busy}
                title={mode === "chat" ? "Send" : "Generate"}
                className={cn(
                  "grid h-9 w-9 shrink-0 place-items-center rounded-xl transition",
                  text.trim() && !busy
                    ? "bg-brand text-brand-fg hover:brightness-110"
                    : "bg-surface2 text-muted",
                )}
              >
                <ArrowUp className="h-[18px] w-[18px]" />
              </button>
            )}
          </div>
        </div>
        <p className="mt-2 text-center text-[11px] text-muted">
          {mode === "chat" ? (
            <>
              <kbd className="rounded border border-border px-1">Enter</kbd> to send ·{" "}
              <kbd className="rounded border border-border px-1">Shift+Enter</kbd> for newline
            </>
          ) : (
            "Image mode · attach a reference image to edit it"
          )}
        </p>
      </div>
    </div>
  );
}
