export default function Footer() {
  return (
    <footer className="hidden h-10 shrink-0 items-center justify-between border-t border-slate-200 bg-white px-6 text-xs text-slate-500 dark:border-slate-700 dark:bg-surface-darkCard dark:text-slate-400 md:flex">
      <span>© {new Date().getFullYear()} MOIBEN Maize Produce Collection &amp; Marketing</span>
      <span>v1.0.0</span>
    </footer>
  );
}