import { useEffect, useId, type ReactNode } from "react";
import { X } from "lucide-react";

interface AdminRecordDetailSheetProps {
  open: boolean;
  title: string;
  subtitle?: string;
  badges?: ReactNode;
  children: ReactNode;
  actions?: ReactNode;
  primaryAction?: {
    label: string;
    onClick: () => void;
    icon?: ReactNode;
  };
  onClose: () => void;
}

export function AdminRecordDetailSheet({
  open,
  title,
  subtitle,
  badges,
  children,
  actions,
  primaryAction,
  onClose,
}: AdminRecordDetailSheetProps) {
  const titleId = useId();

  useEffect(() => {
    if (!open) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[1300] flex items-end justify-center bg-slate-900/55 md:items-center md:p-4"
      role="presentation"
      onClick={onClose}
    >
      <div
        className="flex max-h-[94vh] w-full flex-col rounded-t-[18px] bg-surface shadow-[0_-8px_30px_rgba(15,23,42,0.18)] md:max-h-[88vh] md:max-w-[640px] md:rounded-[18px]"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(event) => event.stopPropagation()}
      >
        <header className="flex items-start justify-between gap-3 border-b border-border-strong px-[1.1rem] py-4">
          <div>
            {subtitle && (
              <p className="mb-1 text-[0.78rem] font-semibold text-text-muted">
                {subtitle}
              </p>
            )}
            <h3 id={titleId} className="text-[1.1rem] leading-snug text-royal-blue">
              {title}
            </h3>
            {badges && (
              <div className="mt-2 flex flex-wrap gap-1.5">{badges}</div>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {primaryAction && (
              <button
                type="button"
                className="inline-flex min-h-10 cursor-pointer items-center gap-1.5 rounded-[10px] border-none bg-blue-600 px-3 py-2 text-[0.85rem] font-bold text-white focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
                onClick={primaryAction.onClick}
              >
                {primaryAction.icon}
                {primaryAction.label}
              </button>
            )}
            <button
              type="button"
              className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-[10px] border-none bg-slate-100 text-slate-700 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
              onClick={onClose}
              aria-label="Cerrar detalle"
            >
              <X size={20} />
            </button>
          </div>
        </header>

        <div className="overflow-y-auto px-[1.1rem] py-4">{children}</div>

        {actions && (
          <footer className="flex flex-col gap-2.5 border-t border-border-strong px-[1.1rem] pt-3.5 pb-[1.1rem] md:flex-row md:flex-wrap md:justify-end">
            {actions}
          </footer>
        )}
      </div>
    </div>
  );
}
