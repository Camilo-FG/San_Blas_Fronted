import type { InputHTMLAttributes } from "react";
import { cn } from "./cn";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  hasError?: boolean;
};

export function Input({ className, hasError, ...props }: InputProps) {
  return (
    <input
      className={cn(
        "min-h-11 w-full rounded-xl border-2 bg-surface-muted px-3.5 py-2.5 text-sm text-slate-900 transition-colors focus-visible:border-blue-400 focus-visible:bg-surface focus-visible:ring-3 focus-visible:ring-focus-ring focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60 dark:border-[#2b3b55] dark:bg-[#0d1830] dark:text-white dark:placeholder:text-[#7f8da3] dark:focus-visible:border-[#d9a928] dark:focus-visible:bg-[#0d1830]",
        hasError
          ? "border-red-400 bg-danger-bg dark:border-red-500 dark:bg-red-950/40"
          : "border-gray-300",
        className,
      )}
      {...props}
    />
  );
}
