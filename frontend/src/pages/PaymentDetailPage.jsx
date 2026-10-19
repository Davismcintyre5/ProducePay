import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Download, CheckCircle2, XCircle, Printer } from 'lucide-react';
import { toast } from 'sonner';
import * as paymentApi from '@/api/payment';
import { useAuth } from '@/context/AuthContext';
import { Card, CardBody, CardHeader, CardTitle, CardFooter } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
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

export default function PaymentDetailPage() {
  const { id } = useParams();
  const { hasRole } = useAuth();
  const qc = useQueryClient();

  const [method, setMethod] = useState('MPESA');
  const [reference, setReference] = useState('');
  const [showCancel, setShowCancel] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [downloading, setDownloading] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['payments', id],
    queryFn: () => paymentApi.get(id)
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['payments'] });
    qc.invalidateQueries({ queryKey: ['payments', id] });
    qc.invalidateQueries({ queryKey: ['reports', 'dashboard'] });
  };

  const markPaidMutation = useMutation({
    mutationFn: () => paymentApi.markPaid(id, { method, reference }),
    onSuccess: () => {
      toast.success('Payment marked as paid');
      invalidate();
    },
    onError: (err) =>
      toast.error(err?.response?.data?.error?.message || 'Failed to mark as paid')
  });

  const cancelMutation = useMutation({
    mutationFn: () => paymentApi.cancel(id, { reason: cancelReason }),
    onSuccess: () => {
      toast.success('Payment cancelled');
      setShowCancel(false);
      setCancelReason('');
      invalidate();
    },
    onError: (err) =>
      toast.error(err?.response?.data?.error?.message || 'Failed to cancel')
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

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-72" />
      </div>
    );
  }

  if (isError || !data?.data?.payment) {
    return <EmptyState title="Payment not found" />;
  }

  const payment = data.data.payment;
  const delivery = payment.delivery || {};
  const weightKg = delivery.weightKg ?? 0;
  const ratePerKg = delivery.ratePerKg ?? 0;

  const canMarkPaid = hasRole('MANAGER', 'ADMIN') && payment.status === 'PENDING';
  const canCancel = hasRole('ADMIN') && payment.status === 'PENDING';

  return (
    <div className="space-y-6">
      <Link
        to={ROUTES.PAYMENTS}
        className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
      >
        <ArrowLeft size={14} /> Back to payments
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800 dark:text-slate-100">
            Receipt {payment.receiptNo}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {payment.farmerSnapshot?.name}
          </p>
        </div>
        <Badge variant={statusVariant(payment.status)}>{payment.status}</Badge>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>

          <CardBody className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Farmer
              </p>
              <p className="mt-1 text-sm font-medium text-slate-800 dark:text-slate-100">
                {payment.farmerSnapshot?.name}
              </p>
              <p className="font-mono text-xs text-slate-500">
                {payment.farmerSnapshot?.code}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Amount
              </p>
              <p className="mt-1 text-xl font-semibold text-brand-700 dark:text-brand-400">
                {formatKes(payment.amountKes)}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Weight
              </p>
              <p className="mt-1 text-sm text-slate-700 dark:text-slate-200">
                {weightKg > 0 ? formatKg(weightKg) : '—'}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Rate
              </p>
              <p className="mt-1 text-sm text-slate-700 dark:text-slate-200">
                {ratePerKg > 0 ? `${formatKes(ratePerKg)}/kg` : '—'}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Delivery
              </p>
              <p className="mt-1 font-mono text-sm text-slate-700 dark:text-slate-200">
                {delivery.code || '—'}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Collected
              </p>
              <p className="mt-1 text-sm text-slate-700 dark:text-slate-200">
                {delivery.collectedAt ? formatDateTime(delivery.collectedAt) : '—'}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Created
              </p>
              <p className="mt-1 text-sm text-slate-700 dark:text-slate-200">
                {formatDateTime(payment.createdAt)}
              </p>
            </div>

            {payment.paidAt && (
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Paid on
                </p>
                <p className="mt-1 text-sm text-slate-700 dark:text-slate-200">
                  {formatDateTime(payment.paidAt)}
                </p>
              </div>
            )}

            {payment.method && (
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Method
                </p>
                <p className="mt-1 text-sm text-slate-700 dark:text-slate-200">
                  {payment.method}
                </p>
              </div>
            )}

            {payment.reference && (
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Reference
                </p>
                <p className="mt-1 font-mono text-xs text-slate-700 dark:text-slate-200">
                  {payment.reference}
                </p>
              </div>
            )}
          </CardBody>

          <CardFooter className="flex-wrap gap-2">
            <Link to={ROUTES.RECEIPT(payment.id)}>
              <Button variant="outline" icon={<Printer size={16} />}>
                Printable view
              </Button>
            </Link>
            <Button
              variant="outline"
              icon={<Download size={16} />}
              isLoading={downloading}
              onClick={handleDownload}
            >
              Download PDF
            </Button>
          </CardFooter>
        </Card>

        {canMarkPaid && (
          <Card>
            <CardHeader>
              <CardTitle>Mark as Paid</CardTitle>
            </CardHeader>
            <CardBody className="space-y-3">
              <Select
                label="Method"
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                options={[
                  { value: 'MPESA', label: 'M-Pesa' },
                  { value: 'CASH', label: 'Cash' },
                  { value: 'BANK', label: 'Bank transfer' }
                ]}
              />
              <Input
                label="Reference"
                placeholder="Transaction code"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
              />
              <Button
                className="w-full"
                isLoading={markPaidMutation.isPending}
                disabled={!reference.trim()}
                onClick={() => markPaidMutation.mutate()}
                icon={<CheckCircle2 size={16} />}
              >
                Confirm payment
              </Button>
            </CardBody>
          </Card>
        )}

        {canCancel && (
          <Card>
            <CardHeader>
              <CardTitle>Cancel Payment</CardTitle>
            </CardHeader>
            <CardBody>
              {showCancel ? (
                <div className="space-y-3">
                  <Input
                    label="Reason"
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <Button
                      variant="danger"
                      className="flex-1"
                      isLoading={cancelMutation.isPending}
                      disabled={!cancelReason.trim()}
                      onClick={() => cancelMutation.mutate()}
                    >
                      Confirm cancel
                    </Button>
                    <Button variant="outline" onClick={() => setShowCancel(false)}>
                      Back
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  variant="outline"
                  icon={<XCircle size={16} />}
                  onClick={() => setShowCancel(true)}
                >
                  Cancel this payment
                </Button>
              )}
            </CardBody>
          </Card>
        )}
      </div>
    </div>
  );
}