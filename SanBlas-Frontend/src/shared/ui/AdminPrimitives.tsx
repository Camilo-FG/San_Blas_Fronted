import type { HTMLAttributes, InputHTMLAttributes, ReactNode } from "react";
import { Search } from "lucide-react";
import { cn } from "./cn";

export function AdminModule({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex flex-col gap-4", className)} {...props}>
      {children}
    </div>
  );
}

export function AdminToolbar({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-2xl border border-border-strong bg-surface p-4 shadow-sm md:flex-row md:flex-wrap md:items-center",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function AdminSearch({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="relative flex-1">
      <Search
        className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-slate-400"
        size={18}
      />
      <input
        className={cn(
          "min-h-11 w-full rounded-xl border border-border-strong bg-surface-muted py-2.5 pr-3.5 pl-10 text-sm text-slate-900 focus-visible:border-blue-400 focus-visible:bg-surface focus-visible:ring-3 focus-visible:ring-focus-ring focus-visible:outline-none",
          className,
        )}
        {...props}
      />
    </div>
  );
}

export function AdminTablePanel({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "overflow-x-auto rounded-2xl border border-border-strong bg-surface shadow-sm",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function AdminTable({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLTableElement>) {
  return (
    <table
      className={cn("w-full border-collapse text-sm", className)}
      {...props}
    >
      {children}
    </table>
  );
}

export function AdminTableHead({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead className={cn("bg-surface-muted", className)} {...props}>
      {children}
    </thead>
  );
}

export function AdminTableHeaderCell({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={cn(
        "border-b border-border-strong px-4 py-3.5 text-left text-xs font-extrabold tracking-wide text-royal-blue uppercase whitespace-nowrap",
        className,
      )}
      {...props}
    >
      {children}
    </th>
  );
}

export function AdminTableCell({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLTableCellElement>) {
  return (
    <td
      className={cn(
        "border-b border-slate-100 px-4 py-3.5 align-middle text-slate-700",
        className,
      )}
      {...props}
    >
      {children}
    </td>
  );
}

export function AdminTableRow({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr className={cn("hover:bg-surface-muted", className)} {...props}>
      {children}
    </tr>
  );
}

export function AdminTableActions({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)} {...props}>
      {children}
    </div>
  );
}

export function AdminTableFooter({
  className,
  children,
  pegadoAbajo = false,
  ...props
}: HTMLAttributes<HTMLDivElement> & { pegadoAbajo?: boolean }) {
  const barra = (
    <div
      className={cn(
        "mt-3.5 flex flex-wrap items-center justify-between gap-3 px-1 pt-3.5 text-sm text-text-muted",
        pegadoAbajo &&
          "fixed right-0 bottom-0 left-0 z-20 mt-0 border-t border-border bg-gray-50/95 px-4 pt-3 shadow-[0_-8px_24px_rgba(15,23,42,0.08)] backdrop-blur-sm pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-6 lg:left-64 lg:px-8",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );

  if (!pegadoAbajo) return barra;

  return (
    <>
      <div className="min-h-24 shrink-0 sm:min-h-20" aria-hidden="true" />
      {barra}
    </>
  );
}

export function AdminPagination({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex items-center gap-2", className)} {...props}>
      {children}
    </div>
  );
}

export function AdminPaginationButton({
  className,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={cn(
        "min-h-10 cursor-pointer rounded-xl bg-royal-blue px-3.5 py-2 text-sm font-bold text-white transition-colors hover:bg-royal-blue-dark focus-visible:ring-3 focus-visible:ring-focus-ring focus-visible:outline-none disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function AdminPageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h2 className="font-heading text-2xl font-extrabold text-royal-blue">
          {title}
        </h2>
        {subtitle ? (
          <p className="mt-1 max-w-3xl text-sm leading-relaxed text-text-secondary">
            {subtitle}
          </p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}
