"use client";
import { useRef, useState } from "react";
import type { AttachedFile } from "@/lib/types";

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
  disabled,
  onSend,
}: {
  mode: "chat" | "image";
  aspect: string;
  onAspectChange: (a: string) => void;
  disabled: boolean;
  onSend: (text: string, files: AttachedFile[]) => void;
}) {
  const [text, setText] = useState("");
  const [files, setFiles] = useState<AttachedFile[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  function submit() {
    const t = text.trim();
    if (!t || disabled) return;
    onSend(t, files);
    setText("");
    setFiles([]);
  }

  async function pickFiles(list: FileList | null) {
    if (!list) return;
    const added = await Promise.all(Array.from(list).map(fileToAttached));
    setFiles((f) => [...f, ...added]);
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <>
      {files.length > 0 && (
        <div className="attachments">
          {files.map((f, i) => (
            <span key={i} className="chip">
              {f.name}
              <button onClick={() => setFiles((arr) => arr.filter((_, j) => j !== i))}>×</button>
            </span>
          ))}
        </div>
      )}
      <div className="composer">
        {mode === "image" && (
          <select value={aspect} onChange={(e) => onAspectChange(e.target.value)} title="Aspect ratio">
            {ASPECTS.map((a) => (
              <option key={a}>{a}</option>
            ))}
          </select>
        )}
        <button
          className="ghost"
          onClick={() => fileRef.current?.click()}
          title="Attach image"
          disabled={disabled}
        >
          📎
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => void pickFiles(e.target.files)}
        />
        <textarea
          value={text}
          placeholder={
            mode === "chat"
              ? "Ask something… (Enter to send, Shift+Enter for newline)"
              : "Describe the image to generate…"
          }
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
        />
        <button className="primary" onClick={submit} disabled={disabled || !text.trim()}>
          {mode === "chat" ? "Send" : "Generate"}
        </button>
      </div>
    </>
  );
}
