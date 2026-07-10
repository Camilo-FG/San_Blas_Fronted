import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "./cn";

const variantClasses = {
  primary:
    "bg-teal text-white hover:bg-teal-hover focus-visible:ring-focus-ring",
  secondary:
    "border border-border-strong bg-surface text-royal-blue hover:bg-surface-muted focus-visible:ring-focus-ring",
  danger:
    "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-focus-ring",
  ghost:
    "border border-blue-200 bg-info-bg text-blue-600 hover:bg-blue-50 focus-visible:ring-focus-ring",
  royal:
    "bg-royal-blue text-white hover:bg-royal-blue-dark focus-visible:ring-focus-ring",
  outline:
    "border border-border-strong bg-surface text-royal-blue hover:bg-surface-muted focus-visible:ring-focus-ring",
} as const;

export type ButtonVariant = keyof typeof variantClasses;

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  children: ReactNode;
};

export function Button({
  variant = "primary",
  className,
  children,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold whitespace-nowrap transition-colors focus-visible:ring-3 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
        variantClasses[variant],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
