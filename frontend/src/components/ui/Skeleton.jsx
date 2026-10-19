import { cn } from '@/lib/cn';

export function Skeleton({ className, rounded = 'md' }) {
  const radius = {
    none: 'rounded-none',
    sm: 'rounded',
    md: 'rounded-md',
    lg: 'rounded-lg',
    full: 'rounded-full'
  }[rounded];

  return (
    <div
      className={cn('animate-pulse bg-slate-200 dark:bg-slate-700', radius, className)}
    />
  );
}

export default Skeleton;