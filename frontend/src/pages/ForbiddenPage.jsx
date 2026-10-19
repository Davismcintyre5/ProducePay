import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ROUTES } from '@/lib/routes';

export default function ForbiddenPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface-muted p-4 text-center dark:bg-surface-darkMuted">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-300">
        <ShieldAlert size={32} />
      </div>
      <h1 className="text-xl font-semibold text-slate-800 dark:text-slate-100">Access denied</h1>
      <p className="mt-2 max-w-sm text-sm text-slate-500 dark:text-slate-400">
        You don't have permission to view this page. If you believe this is a mistake, contact your administrator.
      </p>
      <Link to={ROUTES.DASHBOARD} className="mt-6">
        <Button>Back to Dashboard</Button>
      </Link>
    </div>
  );
}