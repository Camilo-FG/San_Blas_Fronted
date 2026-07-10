import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "./cn";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  accent?: boolean;
};

export function Card({ children, className, accent, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-surface p-6 shadow-sm",
        accent && "border-t-4 border-t-royal-blue",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
