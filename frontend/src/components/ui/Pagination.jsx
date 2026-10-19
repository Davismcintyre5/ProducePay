import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/cn';

function pageWindow(page, totalPages) {
  const range = [];
  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, page + 2);
  for (let i = start; i <= end; i += 1) range.push(i);
  return range;
}

export function Pagination({ page, totalPages, onPageChange, className }) {
  if (!totalPages || totalPages <= 1) return null;

  const pages = pageWindow(page, totalPages);

  const btn =
    'inline-flex h-9 min-w-9 items-center justify-center rounded-md px-3 text-sm transition-colors';

  return (
    <div className={cn('flex items-center justify-center gap-1', className)}>
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        className={cn(
          btn,
          'border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none',
          'dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800'
        )}
        aria-label="Previous page"
      >
        <ChevronLeft size={16} />
      </button>

      {pages[0] > 1 && (
        <>
          <button type="button" onClick={() => onPageChange(1)} className={cn(btn, 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800')}>
            1
          </button>
          {pages[0] > 2 && <span className="px-1 text-slate-400">…</span>}
        </>
      )}

      {pages.map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => onPageChange(p)}
          className={cn(
            btn,
            p === page
              ? 'bg-brand-600 text-white'
              : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800'
          )}
        >
          {p}
        </button>
      ))}

      {pages[pages.length - 1] < totalPages && (
        <>
          {pages[pages.length - 1] < totalPages - 1 && <span className="px-1 text-slate-400">…</span>}
          <button
            type="button"
            onClick={() => onPageChange(totalPages)}
            className={cn(btn, 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800')}
          >
            {totalPages}
          </button>
        </>
      )}

      <button
        type="button"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
        className={cn(
          btn,
          'border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none',
          'dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800'
        )}
        aria-label="Next page"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}

export default Pagination;