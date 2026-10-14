import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "./cn";

const variantClasses = {
  primary:
    "bg-teal text-white hover:bg-teal-hover focus-visible:ring-focus-ring",
  secondary:
    "border border-border-strong bg-slate-200 text-royal-blue hover:bg-slate-300 hover:text-royal-blue focus-visible:ring-focus-ring dark:border-white/15 dark:bg-[#334155] dark:text-[#f3f6fa] dark:hover:bg-[#475569] dark:hover:text-[#f3f6fa]",
  danger:
    "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-focus-ring",
  ghost:
    "border border-blue-200 bg-info-bg text-blue-600 hover:bg-blue-50 focus-visible:ring-focus-ring",
  royal:
    "bg-royal-blue text-white hover:bg-royal-blue-dark focus-visible:ring-focus-ring",
  outline:
    "border border-border-strong bg-slate-200 text-royal-blue hover:bg-slate-300 hover:text-royal-blue focus-visible:ring-focus-ring dark:border-white/15 dark:bg-[#334155] dark:text-[#f3f6fa] dark:hover:bg-[#475569] dark:hover:text-[#f3f6fa]",
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
