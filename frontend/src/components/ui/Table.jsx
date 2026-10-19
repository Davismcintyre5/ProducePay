import { cn } from '@/lib/cn';

export function Table({ className, children }) {
  return (
    <div className={cn('w-full overflow-x-auto', className)}>
      <table className="w-full border-collapse text-sm">{children}</table>
    </div>
  );
}

export function TableHead({ className, children }) {
  return (
    <thead
      className={cn(
        'bg-slate-50 dark:bg-slate-800',
        className
      )}
    >
      {children}
    </thead>
  );
}

export function TableBody({ className, children }) {
  return <tbody className={cn('divide-y divide-slate-200 dark:divide-slate-700', className)}>{children}</tbody>;
}

export function TableRow({ className, children }) {
  return (
    <tr
      className={cn(
        'transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50',
        className
      )}
    >
      {children}
    </tr>
  );
}

export function TableHeaderCell({ className, children }) {
  return (
    <th
      className={cn(
        'px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300',
        className
      )}
    >
      {children}
    </th>
  );
}

export function TableCell({ className, children }) {
  return (
    <td className={cn('px-4 py-3 text-slate-700 dark:text-slate-200', className)}>
      {children}
    </td>
  );
}

export function TableEmpty({ colSpan = 1, children }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-12 text-center text-sm text-slate-400 dark:text-slate-500">
        {children}
      </td>
    </tr>
  );
}