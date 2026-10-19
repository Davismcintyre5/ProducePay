import * as RadixDialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '@/lib/cn';

export const Dialog = RadixDialog.Root;
export const DialogTrigger = RadixDialog.Trigger;
export const DialogClose = RadixDialog.Close;

export function DialogContent({ className, children, ...props }) {
  return (
    <RadixDialog.Portal>
      <RadixDialog.Overlay className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" />
      <RadixDialog.Content
        className={cn(
          'fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2',
          'max-h-[90vh] overflow-y-auto rounded-card bg-white p-6 shadow-xl',
          'dark:bg-slate-900 dark:border dark:border-slate-700',
          className
        )}
        {...props}
      >
        {children}
        <RadixDialog.Close
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          aria-label="Close"
        >
          <X size={18} />
        </RadixDialog.Close>
      </RadixDialog.Content>
    </RadixDialog.Portal>
  );
}

export function DialogHeader({ className, children }) {
  return <div className={cn('mb-4', className)}>{children}</div>;
}

export function DialogTitle({ className, children }) {
  return (
    <RadixDialog.Title
      className={cn('text-lg font-semibold text-slate-800 dark:text-slate-100', className)}
    >
      {children}
    </RadixDialog.Title>
  );
}

export function DialogDescription({ className, children }) {
  return (
    <RadixDialog.Description
      className={cn('mt-1 text-sm text-slate-500 dark:text-slate-400', className)}
    >
      {children}
    </RadixDialog.Description>
  );
}

export function DialogFooter({ className, children }) {
  return (
    <div className={cn('mt-6 flex items-center justify-end gap-2', className)}>
      {children}
    </div>
  );
}