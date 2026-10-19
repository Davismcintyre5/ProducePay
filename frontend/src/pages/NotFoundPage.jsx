import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ROUTES } from '@/lib/routes';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface-muted p-4 text-center dark:bg-surface-darkMuted">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
        <Compass size={32} />
      </div>
      <h1 className="text-xl font-semibold text-slate-800 dark:text-slate-100">Page not found</h1>
      <p className="mt-2 max-w-sm text-sm text-slate-500 dark:text-slate-400">
        The page you were looking for doesn't exist or has been moved.
      </p>
      <Link to={ROUTES.DASHBOARD} className="mt-6">
        <Button>Back to Dashboard</Button>
      </Link>
    </div>
  );
}