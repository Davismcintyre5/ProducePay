import { forwardRef } from 'react';
import { cn } from '@/lib/cn';

export const Checkbox = forwardRef(function Checkbox(
  { label, className, id, ...props },
  ref
) {
  const checkboxId = id || props.name;

  return (
    <label
      htmlFor={checkboxId}
      className={cn('inline-flex items-center gap-2 cursor-pointer select-none', className)}
    >
      <input
        ref={ref}
        type="checkbox"
        id={checkboxId}
        className={cn(
          'h-4 w-4 rounded border-slate-300 text-brand-600',
          'focus:ring-2 focus:ring-brand-500 focus:ring-offset-1',
          'dark:border-slate-600 dark:bg-slate-800 dark:checked:bg-brand-600 dark:focus:ring-offset-slate-900'
        )}
        {...props}
      />
      {label && (
        <span className="text-sm text-slate-700 dark:text-slate-200">{label}</span>
      )}
    </label>
  );
});

export default Checkbox;