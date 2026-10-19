import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { CheckCircle2, XCircle } from 'lucide-react';
import * as paymentApi from '@/api/payment';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { ROUTES } from '@/lib/routes';
import { formatKes, formatDateTime } from '@/lib/format';

function statusVariant(status) {
  return { PAID: 'success', PENDING: 'warning', FAILED: 'danger', CANCELLED: 'neutral' }[status] || 'neutral';
}

export default function VerifyReceiptPage() {
  const { receiptNo } = useParams();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['verify', receiptNo],
    queryFn: () => paymentApi.verify(receiptNo)
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-muted dark:bg-surface-darkMuted">
        <Spinner size="lg" />
      </div>
    );
  }

  const ok = !isError && data?.data?.verified;
  const r = data?.data;

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-muted p-4 dark:bg-surface-darkMuted">
      <div className="w-full max-w-md rounded-card bg-white p-8 shadow-xl dark:bg-slate-900 dark:border dark:border-slate-700">
        <div className="mb-6 text-center">
          <div
            className={`mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full ${
              ok
                ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'
                : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
            }`}
          >
            {ok ? <CheckCircle2 size={28} /> : <XCircle size={28} />}
          </div>
          <h1 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
            {ok ? 'Receipt verified' : 'Receipt not found'}
          </h1>
          <p className="mt-1 font-mono text-xs text-slate-500 dark:text-slate-400">{receiptNo}</p>
        </div>

        {ok && r && (
          <dl className="divide-y divide-slate-200 dark:divide-slate-700">
            <Row label="Farmer" value={r.farmerName} sub={r.farmerCode} />
            <Row label="Amount" value={formatKes(r.amountKes)} strong />
            <Row label="Status">
              <Badge variant={statusVariant(r.status)}>{r.status}</Badge>
            </Row>
            <Row label="Issued" value={formatDateTime(r.date)} />
          </dl>
        )}

        {!ok && (
          <p className="text-center text-sm text-slate-500 dark:text-slate-400">
            This receipt number does not match any record. Contact MOIBEN if you believe this is an error.
          </p>
        )}

        <div className="mt-6 flex justify-center">
          <Link to={ROUTES.LOGIN}>
            <Button variant="outline">Go to login</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, sub, children, strong = false }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <dt className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</dt>
      <dd className={strong ? 'text-base font-semibold text-brand-700 dark:text-brand-400' : 'text-sm text-slate-800 dark:text-slate-100'}>
        {children || value}
        {sub && <span className="block font-mono text-xs text-slate-400">{sub}</span>}
      </dd>
    </div>
  );
}