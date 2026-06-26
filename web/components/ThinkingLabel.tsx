"use client";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

// Rotating placeholders shown while the agent works and no concrete tool status
// is available. A real status (e.g. "Searching the web…") takes priority.
const PHRASES = [
  "Thinking",
  "Calibrating",
  "Analyzing",
  "Reasoning",
  "Synthesizing",
  "Connecting the dots",
  "Crunching the data",
  "Pulling it together",
  "Working through it",
];

export function ThinkingLabel({ status }: { status?: string }) {
  const [i, setI] = useState(0);

  useEffect(() => {
    if (status?.trim()) return; // a concrete status is showing — don't rotate
    const t = setInterval(() => setI((x) => (x + 1) % PHRASES.length), 1900);
    return () => clearInterval(t);
  }, [status]);

  const label = status?.trim() || PHRASES[i];

  return (
    <span className="relative inline-flex">
      <AnimatePresence mode="wait">
        <motion.span
          key={label}
          className="shimmer text-[15px]"
          initial={{ opacity: 0, y: 6, filter: "blur(3px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -6, filter: "blur(3px)" }}
          transition={{ duration: 0.32, ease: "easeOut" }}
        >
          {label}…
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
