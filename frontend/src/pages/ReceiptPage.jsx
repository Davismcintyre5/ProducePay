import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Download, Printer } from 'lucide-react';
import { toast } from 'sonner';
import * as paymentApi from '@/api/payment';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { ROUTES } from '@/lib/routes';
import { formatKes, formatKg, formatDateTime } from '@/lib/format';

function statusVariant(status) {
  return {
    PAID: 'success',
    PENDING: 'warning',
    FAILED: 'danger',
    CANCELLED: 'neutral'
  }[status] || 'neutral';
}

export default function ReceiptPage() {
  const { id } = useParams();
  const [downloading, setDownloading] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['payments', id],
    queryFn: () => paymentApi.get(id)
  });

  const handleDownload = async () => {
    if (!data?.data?.payment) return;
    setDownloading(true);
    try {
      await paymentApi.downloadReceipt(id, data.data.payment.receiptNo);
    } catch (err) {
      toast.error(err?.response?.data?.error?.message || 'Failed to download receipt');
    } finally {
      setDownloading(false);
    }
  };

  if (isLoading) return <Skeleton className="h-64" />;

  if (isError || !data?.data?.payment) {
    return (
      <div className="p-6">
        <EmptyState
          title="Receipt not found"
          description="The payment may have been removed."
          action={
            <Link to={ROUTES.PAYMENTS}>
              <Button variant="outline">Back to Payments</Button>
            </Link>
          }
        />
      </div>
    );
  }

  const payment = data.data.payment;
  const delivery = payment.delivery || {};
  const weightKg = delivery.weightKg ?? 0;
  const ratePerKg = delivery.ratePerKg ?? 0;

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-4 md:p-6">
      <div className="no-print flex items-center justify-between">
        <Link
          to={ROUTES.PAYMENT_DETAIL(payment.id)}
          className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
        >
          <ArrowLeft size={14} /> Back to payment
        </Link>
        <div className="flex gap-2">
          <Button
            variant="outline"
            icon={<Printer size={16} />}
            onClick={() => window.print()}
          >
            Print
          </Button>
          <Button
            icon={<Download size={16} />}
            isLoading={downloading}
            onClick={handleDownload}
          >
            Download PDF
          </Button>
        </div>
      </div>

      <div className="card-surface p-6 print:border-0 print:shadow-none">
        <div className="mb-6 border-b border-slate-200 pb-4 text-center dark:border-slate-700">
          <div className="text-3xl">🌽</div>
          <h1 className="mt-2 text-lg font-semibold text-brand-700 dark:text-brand-400">
            ProducePay
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            MOIBEN Maize Management — Official Receipt
          </p>
        </div>

        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Receipt No
            </p>
            <p className="font-mono text-sm font-semibold text-slate-800 dark:text-slate-100">
              {payment.receiptNo}
            </p>
          </div>
          <Badge variant={statusVariant(payment.status)}>{payment.status}</Badge>
        </div>

        <dl className="divide-y divide-slate-200 dark:divide-slate-700">
          <Row
            label="Farmer"
            value={payment.farmerSnapshot?.name}
            sub={payment.farmerSnapshot?.code}
          />
          <Row label="Weight" value={weightKg ? formatKg(weightKg) : '—'} />
          <Row label="Rate" value={ratePerKg ? `${formatKes(ratePerKg)}/kg` : '—'} />
          <Row label="Amount" value={formatKes(payment.amountKes)} strong />
          <Row
            label="Collected"
            value={delivery.collectedAt ? formatDateTime(delivery.collectedAt) : '—'}
          />
          {payment.paidAt && (
            <>
              <Row label="Paid On" value={formatDateTime(payment.paidAt)} />
              {payment.method && <Row label="Method" value={payment.method} />}
              {payment.reference && <Row label="Reference" value={payment.reference} />}
            </>
          )}
        </dl>

        <p className="mt-6 text-center text-xs text-slate-400 dark:text-slate-500">
          Thank you for your delivery.
        </p>
      </div>
    </div>
  );
}

function Row({ label, value, sub, strong = false }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <dt className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {label}
      </dt>
      <dd
        className={
          strong
            ? 'text-base font-semibold text-brand-700 dark:text-brand-400'
            : 'text-sm text-slate-800 dark:text-slate-100'
        }
      >
        {value}
        {sub && <span className="block font-mono text-xs text-slate-400">{sub}</span>}
      </dd>
    </div>
  );
}