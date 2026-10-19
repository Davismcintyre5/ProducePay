import * as RadixDropdown from '@radix-ui/react-dropdown-menu';
import { cn } from '@/lib/cn';

export const Dropdown = RadixDropdown.Root;
export const DropdownTrigger = RadixDropdown.Trigger;

export function DropdownContent({ className, children, align = 'end', sideOffset = 6, ...props }) {
  return (
    <RadixDropdown.Portal>
      <RadixDropdown.Content
        align={align}
        sideOffset={sideOffset}
        className={cn(
          'z-50 min-w-[180px] rounded-lg border border-slate-200 bg-white p-1 shadow-lg',
          'dark:border-slate-700 dark:bg-slate-900',
          className
        )}
        {...props}
      >
        {children}
      </RadixDropdown.Content>
    </RadixDropdown.Portal>
  );
}

export function DropdownItem({ className, children, ...props }) {
  return (
    <RadixDropdown.Item
      className={cn(
        'flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm outline-none',
        'text-slate-700 hover:bg-slate-100 focus:bg-slate-100',
        'dark:text-slate-200 dark:hover:bg-slate-800 dark:focus:bg-slate-800',
        className
      )}
      {...props}
    >
      {children}
    </RadixDropdown.Item>
  );
}

export function DropdownSeparator() {
  return <RadixDropdown.Separator className="my-1 h-px bg-slate-200 dark:bg-slate-700" />;
}