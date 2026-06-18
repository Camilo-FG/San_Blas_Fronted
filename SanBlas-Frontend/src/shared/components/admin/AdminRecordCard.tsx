import type { ReactNode } from "react";
import "./adminResponsiveData.css";

export interface AdminRecordMeta {
  icon?: ReactNode;
  label: string;
  value: ReactNode;
}

export interface AdminRecordAction {
  label: string;
  onClick: () => void;
  icon?: ReactNode;
  variant?: "primary" | "ghost" | "danger";
  disabled?: boolean;
  ariaLabel?: string;
}

interface AdminRecordCardProps {
  title: string;
  subtitle?: string;
  code?: string;
  icon?: ReactNode;
  accent?: string;
  badges?: ReactNode;
  meta?: AdminRecordMeta[];
  footer?: ReactNode;
  actions?: AdminRecordAction[];
  onViewDetail?: () => void;
  viewLabel?: string;
}

export function AdminRecordCard({
  title,
  subtitle,
  code,
  icon,
  accent = "#003366",
  badges,
  meta,
  footer,
  actions,
  onViewDetail,
  viewLabel = "Ver más",
}: AdminRecordCardProps) {
  const quickActions =
    actions ??
    (onViewDetail
      ? [
          {
            label: viewLabel,
            onClick: onViewDetail,
            variant: "primary" as const,
          },
        ]
      : []);

  return (
    <article className="admin-record-card">
      <div className="admin-record-card__header">
        {icon && (
          <div
            className="admin-record-card__icon"
            style={{ background: `${accent}14`, color: accent }}
            aria-hidden="true"
          >
            {icon}
          </div>
        )}

        <div className="admin-record-card__head-text">
          {code && <p className="admin-record-card__code">{code}</p>}
          <h3 className="admin-record-card__title">{title}</h3>
          {subtitle && <p className="admin-record-card__subtitle">{subtitle}</p>}
        </div>

        {badges && <div className="admin-record-card__badges">{badges}</div>}
      </div>

      {meta && meta.length > 0 && (
        <dl className="admin-record-card__meta">
          {meta.map((item) => (
            <div key={item.label} className="admin-record-card__meta-item">
              <dt>
                {item.icon}
                <span>{item.label}</span>
              </dt>
              <dd>{item.value}</dd>
            </div>
          ))}
        </dl>
      )}

      {footer && <div className="admin-record-card__footer-slot">{footer}</div>}

      {quickActions.length > 0 && (
        <div className="admin-record-card__actions">
          {quickActions.map((action) => (
            <button
              key={action.label}
              type="button"
              className={`admin-record-card__action admin-record-card__action--${action.variant ?? "ghost"}`}
              onClick={action.onClick}
              disabled={action.disabled}
              aria-label={action.ariaLabel ?? action.label}
            >
              {action.icon}
              <span>{action.label}</span>
            </button>
          ))}
        </div>
      )}
    </article>
  );
}
