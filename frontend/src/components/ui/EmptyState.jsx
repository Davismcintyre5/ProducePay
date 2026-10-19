import { cn } from '@/lib/cn';

export function EmptyState({ icon, title, description, action, className }) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center px-4 py-12 text-center',
        className
      )}
    >
      {icon && (
        <div
          className={cn(
            'mb-4 flex h-14 w-14 items-center justify-center rounded-full',
            'bg-slate-100 text-slate-400',
            'dark:bg-slate-800 dark:text-slate-500'
          )}
        >
          {icon}
        </div>
      )}

      {title && (
        <h3 className="text-base font-semibold text-slate-700 dark:text-slate-200">
          {title}
        </h3>
      )}

      {description && (
        <p className="mt-1 max-w-sm text-sm text-slate-500 dark:text-slate-400">
          {description}
        </p>
      )}

      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export default EmptyState;