"use client";
import { useId } from "react";
import { cn } from "@/lib/cn";

/**
 * Bitget Builder Agent mark — a geometric lowercase "b" (stem + perfect-circle
 * bowl) on the teal gradient, with the autonomy "agent node" dot. Per the brand
 * sheet, the node is dropped below ~48px, so `node` defaults off on small avatars.
 * Gradient/mask ids are per-instance (useId) so multiple marks never collide.
 */
export function BrandMark({ className, node = true }: { className?: string; node?: boolean }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const g = `bbaG${uid}`;
  const gloss = `bbaGloss${uid}`;
  const mask = `bbaMask${uid}`;
  return (
    <svg viewBox="0 0 512 512" className={className} role="img" aria-label="Bitget Builder Agent">
      <defs>
        <linearGradient id={g} x1="0" y1="0" x2="512" y2="512" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#34F0CB" />
          <stop offset="0.52" stopColor="#19C7A8" />
          <stop offset="1" stopColor="#0B9D86" />
        </linearGradient>
        <linearGradient id={gloss} x1="0" y1="0" x2="0" y2="256" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#fff" stopOpacity="0.3" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <mask id={mask}>
          <rect width="512" height="512" fill="black" />
          <rect x="133" y="102" width="72" height="317" rx="31" fill="white" />
          <circle cx="281" cy="307" r="113" fill="white" />
          <circle cx="281" cy="307" r="49" fill="black" />
        </mask>
      </defs>
      <rect width="512" height="512" rx="112" fill={`url(#${g})`} />
      <rect width="512" height="256" rx="112" fill={`url(#${gloss})`} />
      <rect width="512" height="512" fill="#06201B" mask={`url(#${mask})`} />
      {node && (
        <>
          <circle cx="399" cy="113" r="26" fill="#06201B" />
          <circle cx="399" cy="113" r="11" fill="#BDFFF0" />
        </>
      )}
    </svg>
  );
}

/** Logo lockup: mark + "BITGET" eyebrow + "Builder Agent" wordmark (Space Grotesk). */
export function Brand({ collapsed }: { collapsed?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <BrandMark className="h-8 w-8 shrink-0" node={false} />
      {!collapsed && (
        <div className="leading-none">
          <div className="font-mono text-[9px] font-semibold tracking-[0.28em] text-brand">BITGET</div>
          <div className={cn("mt-1 text-[15px] font-bold tracking-[-0.03em]")}>Builder Agent</div>
        </div>
      )}
    </div>
  );
}
