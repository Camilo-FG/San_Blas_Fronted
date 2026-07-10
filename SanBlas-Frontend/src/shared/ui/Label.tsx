import type { LabelHTMLAttributes, ReactNode } from "react";
import { cn } from "./cn";

type LabelProps = LabelHTMLAttributes<HTMLLabelElement> & {
  children: ReactNode;
  required?: boolean;
};

export function Label({ className, children, required, ...props }: LabelProps) {
  return (
    <label
      className={cn(
        "mb-1.5 block text-sm font-semibold text-slate-800",
        className,
      )}
      {...props}
    >
      {children}
      {required ? <span className="ml-0.5 text-danger">*</span> : null}
    </label>
  );
}

export function FieldError({
  message,
  className,
}: {
  message?: string | null;
  className?: string;
}) {
  if (!message) return null;

  return (
    <p className={cn("mt-1.5 text-sm text-danger", className)} role="alert">
      {message}
    </p>
  );
}
