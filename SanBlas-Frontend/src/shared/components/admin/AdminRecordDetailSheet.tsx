import { useEffect, useId, type ReactNode } from "react";
import { X } from "lucide-react";
import "./adminResponsiveData.css";

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
    <div className="admin-detail-sheet" role="presentation" onClick={onClose}>
      <div
        className="admin-detail-sheet__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(event) => event.stopPropagation()}
      >
        <header className="admin-detail-sheet__header">
          <div className="admin-detail-sheet__heading">
            {subtitle && (
              <p className="admin-detail-sheet__eyebrow">{subtitle}</p>
            )}
            <h3 id={titleId}>{title}</h3>
            {badges && (
              <div className="admin-detail-sheet__badges">{badges}</div>
            )}
          </div>

          <div className="admin-detail-sheet__header-actions">
            {primaryAction && (
              <button
                type="button"
                className="admin-detail-sheet__primary"
                onClick={primaryAction.onClick}
              >
                {primaryAction.icon}
                {primaryAction.label}
              </button>
            )}
            <button
              type="button"
              className="admin-detail-sheet__close"
              onClick={onClose}
              aria-label="Cerrar detalle"
            >
              <X size={20} />
            </button>
          </div>
        </header>

        <div className="admin-detail-sheet__body">{children}</div>

        {actions && (
          <footer className="admin-detail-sheet__footer">{actions}</footer>
        )}
      </div>
    </div>
  );
}
