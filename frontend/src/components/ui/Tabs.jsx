import { createContext, useContext, useId, useState } from 'react';
import { cn } from '@/lib/cn';

const TabsCtx = createContext(null);

export function Tabs({ defaultValue, value, onValueChange, className, children }) {
  const [internal, setInternal] = useState(defaultValue);
  const isControlled = value !== undefined;
  const active = isControlled ? value : internal;
  const id = useId();

  const setActive = (v) => {
    if (!isControlled) setInternal(v);
    onValueChange?.(v);
  };

  return (
    <TabsCtx.Provider value={{ active, setActive, id }}>
      <div className={cn('w-full', className)}>{children}</div>
    </TabsCtx.Provider>
  );
}

export function TabsList({ className, children }) {
  return (
    <div
      role="tablist"
      className={cn(
        'inline-flex items-center gap-1 rounded-lg bg-slate-100 p-1',
        'dark:bg-slate-800',
        className
      )}
    >
      {children}
    </div>
  );
}

export function TabsTrigger({ value, className, children }) {
  const { active, setActive, id } = useContext(TabsCtx);
  const isActive = active === value;

  return (
    <button
      type="button"
      role="tab"
      id={`${id}-trigger-${value}`}
      aria-selected={isActive}
      aria-controls={`${id}-panel-${value}`}
      onClick={() => setActive(value)}
      className={cn(
        'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
        isActive
          ? 'bg-white text-slate-800 shadow-sm dark:bg-slate-700 dark:text-slate-100'
          : 'text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200',
        className
      )}
    >
      {children}
    </button>
  );
}

export function TabsContent({ value, className, children }) {
  const { active, id } = useContext(TabsCtx);
  if (active !== value) return null;

  return (
    <div
      role="tabpanel"
      id={`${id}-panel-${value}`}
      aria-labelledby={`${id}-trigger-${value}`}
      className={cn('mt-4', className)}
    >
      {children}
    </div>
  );
}