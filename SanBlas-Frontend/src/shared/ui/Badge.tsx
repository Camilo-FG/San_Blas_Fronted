import type { HTMLAttributes } from "react";
import { cn } from "./cn";

const badgeVariants = {
  success: "border-emerald-300 bg-success-bg text-success",
  warning: "border-orange-300 bg-warning-bg text-warning",
  danger: "border-red-300 bg-danger-bg text-danger",
  neutral: "border-border-strong bg-slate-100 text-slate-600",
  info: "border-blue-300 bg-info-bg text-info",
} as const;

export type BadgeVariant = keyof typeof badgeVariants;

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
};

export function Badge({
  variant = "neutral",
  className,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-bold",
        badgeVariants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
