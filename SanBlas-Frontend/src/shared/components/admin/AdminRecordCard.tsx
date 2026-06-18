import type { ReactNode } from "react";
import "./adminResponsiveData.css";

interface AdminRecordCardProps {
  title: string;
  subtitle?: string;
  badges?: ReactNode;
  onViewDetail: () => void;
  viewLabel?: string;
}

export function AdminRecordCard({
  title,
  subtitle,
  badges,
  onViewDetail,
  viewLabel = "Ver detalle",
}: AdminRecordCardProps) {
  return (
    <article className="admin-record-card">
      <div className="admin-record-card__main">
        <div className="admin-record-card__text">
          <h3 className="admin-record-card__title">{title}</h3>
          {subtitle && <p className="admin-record-card__subtitle">{subtitle}</p>}
          {badges && <div className="admin-record-card__badges">{badges}</div>}
        </div>
        <button
          type="button"
          className="admin-record-card__view"
          onClick={onViewDetail}
        >
          {viewLabel}
        </button>
      </div>
    </article>
  );
}
