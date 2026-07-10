import type { ReactNode } from "react";
import { cn } from "../../ui";

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

const actionVariantClasses = {
  primary: "border-none bg-blue-600 text-white",
  ghost: "border border-slate-300 bg-surface text-slate-700",
  danger: "border border-red-200 bg-danger-bg text-danger",
} as const;

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
    <article className="flex flex-col gap-2.5 rounded-2xl border border-border-strong bg-surface px-3.5 py-3.5 shadow-[0_4px_14px_rgba(15,23,42,0.04)]">
      <div className="grid grid-cols-[auto_1fr] items-start gap-x-3 gap-y-2.5">
        {icon && (
          <div
            className="inline-flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-xl"
            style={{ background: `${accent}14`, color: accent }}
            aria-hidden="true"
          >
            {icon}
          </div>
        )}

        <div className="min-w-0">
          {code && (
            <p className="mb-0.5 text-[0.72rem] font-bold tracking-wide text-slate-400 uppercase">
              {code}
            </p>
          )}
          <h3 className="line-clamp-2 text-[0.95rem] leading-snug font-bold text-slate-900">
            {title}
          </h3>
          {subtitle && (
            <p className="mt-1 text-[0.8rem] leading-snug text-text-muted">{subtitle}</p>
          )}
        </div>

        {badges && (
          <div className="col-span-full flex flex-wrap gap-1.5">{badges}</div>
        )}
      </div>

      {meta && meta.length > 0 && (
        <dl className="m-0 grid grid-cols-2 gap-x-2.5 gap-y-2 rounded-xl border border-[#eef2f7] bg-surface-muted px-2.5 py-2.5">
          {meta.map((item) => (
            <div key={item.label} className="min-w-0">
              <dt className="m-0 flex items-center gap-1 text-[0.68rem] font-bold tracking-wide text-slate-400 uppercase">
                {item.icon}
                <span>{item.label}</span>
              </dt>
              <dd className="mt-0.5 truncate text-[0.8rem] font-semibold text-slate-700">
                {item.value}
              </dd>
            </div>
          ))}
        </dl>
      )}

      {footer && <div className="pt-0.5">{footer}</div>}

      {quickActions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {quickActions.map((action) => (
            <button
              key={action.label}
              type="button"
              className={cn(
                "inline-flex min-h-10 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-[10px] px-3 py-2 text-[0.82rem] font-bold focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-ring disabled:cursor-not-allowed disabled:opacity-65",
                actionVariantClasses[action.variant ?? "ghost"],
              )}
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
