import type { HTMLAttributes } from 'react';
import { cn } from './cn';

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  shimmer?: boolean;
}

export function Skeleton({ className, shimmer = true, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "rounded bg-slate-200/80 dark:bg-slate-700/50",
        shimmer && "animate-shimmer",
        className,
      )}
      aria-hidden="true"
      {...props}
    />
  );
}
