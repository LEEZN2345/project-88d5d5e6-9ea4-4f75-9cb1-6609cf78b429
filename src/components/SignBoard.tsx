import { cn } from "@/lib/utils";

/**
 * SignBoard — mimics the physical apM stall signage:
 * a dark brushed-metal plate with backlit white letters and a small floor/code chip.
 *
 * variant:
 *   - apm       → cyan-white lit letters (apM building signage)
 *   - place     → cool-white lit letters (apM Place signage)
 *   - luxe      → warm champagne lit letters (apM Luxe)
 */
export function SignBoard({
  label,
  code,
  variant = "apm",
  size = "md",
  active = false,
  className,
  onClick,
}: {
  label: string;
  code?: string;
  variant?: "apm" | "place" | "luxe";
  size?: "sm" | "md" | "lg";
  active?: boolean;
  className?: string;
  onClick?: () => void;
}) {
  const litClass =
    variant === "luxe"
      ? "text-[#f7e6b8] [text-shadow:0_0_1px_rgba(255,240,200,0.9),0_0_10px_rgba(220,180,90,0.55),0_0_20px_rgba(200,150,60,0.35)]"
      : variant === "place"
      ? "text-lit"
      : "text-lit-cyan";

  const pad =
    size === "lg"
      ? "px-4 py-2.5"
      : size === "sm"
      ? "px-2.5 py-1"
      : "px-3 py-1.5";

  const fontSize =
    size === "lg" ? "text-lg" : size === "sm" ? "text-[11px]" : "text-[13px]";

  const Comp: any = onClick ? "button" : "div";
  return (
    <Comp
      onClick={onClick}
      className={cn(
        "sign-board font-display inline-flex items-center gap-2 rounded-[6px] uppercase tracking-tight transition",
        pad,
        active && "ring-2 ring-white/60 ring-offset-1 ring-offset-black/40",
        onClick && "active:translate-y-[1px]",
        className,
      )}
    >
      <span className={cn("font-extrabold leading-none", fontSize, litClass)}>
        {label}
      </span>
      {code && (
        <span className="ml-auto rounded-sm bg-white/8 px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-white/80">
          {code}
        </span>
      )}
    </Comp>
  );
}

/**
 * BrandPlate — bag-style banner block.
 * variant "apm" = white bag + apM blue text; "place" = graphite bag + lit-white text.
 */
export function BrandPlate({
  brand,
  tagline,
  variant = "apm",
  className,
}: {
  brand: string;
  tagline?: string;
  variant?: "apm" | "place";
  className?: string;
}) {
  if (variant === "place") {
    return (
      <div
        className={cn(
          "surface-place relative overflow-hidden rounded-xl px-5 py-6",
          className,
        )}
      >
        <div className="font-display text-lit text-3xl font-black leading-none">
          {brand}
        </div>
        {tagline && (
          <div className="mt-2 text-[10px] uppercase tracking-[0.25em] text-white/70">
            {tagline}
          </div>
        )}
      </div>
    );
  }
  return (
    <div
      className={cn(
        "surface-apm relative overflow-hidden rounded-xl border border-[color:var(--apm)]/10 px-5 py-6",
        className,
      )}
    >
      <div className="font-display text-3xl font-black leading-none text-[color:var(--apm-ink)]">
        {brand}
      </div>
      {tagline && (
        <div className="mt-2 text-[10px] uppercase tracking-[0.25em] text-[color:var(--apm)]/80">
          {tagline}
        </div>
      )}
    </div>
  );
}