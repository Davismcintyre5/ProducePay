import { cn } from '@/lib/cn';

const variants = {
  success:
    'bg-success-light text-success-dark dark:bg-green-900/40 dark:text-green-300',
  warning:
    'bg-warning-light text-warning-dark dark:bg-orange-900/40 dark:text-orange-300',
  danger:
    'bg-danger-light text-danger-dark dark:bg-red-900/40 dark:text-red-300',
  info: 'bg-info-light text-info-dark dark:bg-blue-900/40 dark:text-blue-300',
  neutral:
    'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200',
  brand: 'bg-brand-100 text-brand-800 dark:bg-brand-800/40 dark:text-brand-100'
};

export function Badge({ variant = 'neutral', className, children }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

export default Badge;