import { cn } from "@/lib/cn";

/** GetAgent brand mark — a teal gradient rounded square with a spark glyph. */
export function BrandMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "grid place-items-center rounded-xl bg-gradient-to-br from-brand to-brand/60 text-brand-fg shadow-sm shadow-brand/30",
        className,
      )}
    >
      <svg viewBox="0 0 24 24" className="h-[58%] w-[58%]" fill="none" aria-hidden>
        <path
          d="M12 2.5 14.2 9.2 21 11.5 14.2 13.8 12 20.5 9.8 13.8 3 11.5 9.8 9.2 12 2.5Z"
          fill="currentColor"
        />
      </svg>
    </span>
  );
}

export function Brand({ collapsed }: { collapsed?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <BrandMark className="h-8 w-8 shrink-0" />
      {!collapsed && (
        <div className="leading-tight">
          <div className="text-[15px] font-semibold tracking-tight">GetAgent</div>
          <div className="text-[11px] text-muted">Bitget BuilderHub</div>
        </div>
      )}
    </div>
  );
}
