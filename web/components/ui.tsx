import { forwardRef } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "ghost" | "subtle" | "danger";
type Size = "sm" | "md" | "icon";

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-brand text-brand-fg font-medium hover:brightness-110 active:brightness-95 shadow-sm shadow-brand/20",
  ghost: "bg-transparent text-text hover:bg-surface2 border border-border",
  subtle: "bg-surface2 text-text hover:bg-surface2/70 border border-border",
  danger: "bg-transparent text-danger hover:bg-danger/10 border border-danger/40",
};

const SIZES: Record<Size, string> = {
  sm: "h-8 px-3 text-[13px] rounded-lg gap-1.5",
  md: "h-9 px-3.5 text-sm rounded-lg gap-2",
  icon: "h-9 w-9 rounded-lg justify-center",
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "subtle", size = "md", className, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap transition-all duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60 focus-visible:ring-offset-0",
        "disabled:opacity-45 disabled:pointer-events-none select-none",
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...props}
    />
  );
});

export function Pill({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-border px-2.5 py-0.5",
        "text-xs text-muted",
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Animated three-dot indicator used while the agent is working. */
export function TypingDots() {
  return (
    <span className="inline-flex gap-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-1.5 w-1.5 rounded-full bg-brand animate-pulse-dot"
          style={{ animationDelay: `${i * 0.18}s` }}
        />
      ))}
    </span>
  );
}
