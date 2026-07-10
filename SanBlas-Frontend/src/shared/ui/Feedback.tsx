import { cn } from "./cn";

export function PageLoader({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "px-4 py-10 text-center text-sm font-semibold text-text-muted",
        className,
      )}
      role="status"
      aria-live="polite"
    >
      Cargando...
    </div>
  );
}

export function EmptyState({
  title,
  description,
  className,
}: {
  title: string;
  description?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-dashed border-border-strong bg-surface px-4 py-8 text-center text-text-muted",
        className,
      )}
    >
      <p className="text-base font-semibold text-slate-700">{title}</p>
      {description ? (
        <p className="mt-2 text-sm leading-relaxed">{description}</p>
      ) : null}
    </div>
  );
}

export function ErrorMessage({
  message,
  className,
}: {
  message: string;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "rounded-xl bg-danger-bg px-4 py-3 text-sm text-danger",
        className,
      )}
      role="alert"
    >
      {message}
    </p>
  );
}
