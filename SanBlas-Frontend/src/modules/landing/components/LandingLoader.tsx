import { cn } from "../../../shared/ui/cn";

export function LandingLoader({
  compact = false,
  className,
}: {
  compact?: boolean;
  className?: string;
}) {
  const size = compact ? "h-12 w-12" : "h-[88px] w-[88px]";
  const inset = compact ? "inset-1.5" : "inset-2.5";

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4",
        compact ? "py-8" : "min-h-[70vh] px-4 py-16",
        className,
      )}
      role="status"
      aria-live="polite"
    >
      <div className={cn("relative", size)}>
        <span className="absolute inset-0 rounded-full border border-royal-blue/20" />
        <span className="absolute -inset-2 animate-landing-pulse-ring rounded-full border border-royal-blue/35" />
        <span
          className={cn(
            "absolute animate-landing-spin rounded-full border-2 border-transparent border-t-royal-blue border-r-royal-blue/45",
            inset,
          )}
        />
        <span className="absolute inset-0 flex items-center justify-center">
          <span
            className={cn(
              "rounded-full bg-royal-blue shadow-[0_0_18px_rgba(0,51,102,0.45)]",
              compact ? "h-1.5 w-1.5" : "h-2.5 w-2.5",
            )}
          />
        </span>
      </div>
      <p
        className={cn(
          "m-0 font-semibold tracking-[0.18em] text-royal-blue uppercase",
          compact ? "text-[11px]" : "text-sm",
        )}
      >
        Cargando...
      </p>
    </div>
  );
}

export default LandingLoader;
