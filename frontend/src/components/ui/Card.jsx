import { cn } from '@/lib/cn';

export function Card({ className, children }) {
  return <div className={cn('card-surface', className)}>{children}</div>;
}

export function CardHeader({ className, children }) {
  return (
    <div className={cn('border-b border-slate-200 px-5 py-4 dark:border-slate-700', className)}>
      {children}
    </div>
  );
}

export function CardTitle({ className, children }) {
  return (
    <h3 className={cn('text-base font-semibold text-slate-800 dark:text-slate-100', className)}>
      {children}
    </h3>
  );
}

export function CardBody({ className, children }) {
  return <div className={cn('p-5', className)}>{children}</div>;
}

export function CardFooter({ className, children }) {
  return (
    <div
      className={cn(
        'flex items-center justify-end gap-2 border-t border-slate-200 px-5 py-4 dark:border-slate-700',
        className
      )}
    >
      {children}
    </div>
  );
}

export default Card;