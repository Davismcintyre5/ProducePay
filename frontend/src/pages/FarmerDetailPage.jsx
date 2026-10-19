import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Phone, Mail, MapPin } from 'lucide-react';
import * as farmerApi from '@/api/farmer';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeaderCell,
  TableCell,
  TableEmpty
} from '@/components/ui/Table';
import { ROUTES } from '@/lib/routes';
import { formatKes, formatKg, formatDate, formatDateTime } from '@/lib/format';

function statusVariant(status) {
  return { PAID: 'success', PENDING: 'warning', FAILED: 'danger', CANCELLED: 'neutral' }[status] || 'neutral';
}

export default function FarmerDetailPage() {
  const { id } = useParams();
  const { data, isLoading, isError } = useQuery({
    queryKey: ['farmers', id, 'statement'],
    queryFn: () => farmerApi.statement(id)
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32" />
        <Skeleton className="h-72" />
      </div>
    );
  }

  if (isError || !data?.data) {
    return <EmptyState title="Farmer not found" description="This farmer may have been removed." />;
  }

  const { farmer, summary, deliveries, payments } = data.data;

  return (
    <div className="space-y-6">
      <Link
        to={ROUTES.FARMERS}
        className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
      >
        <ArrowLeft size={14} /> Back to farmers
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800 dark:text-slate-100">{farmer.name}</h1>
          <p className="font-mono text-xs text-slate-500 dark:text-slate-400">{farmer.code}</p>
        </div>
        <Badge variant={farmer.active ? 'success' : 'neutral'}>
          {farmer.active ? 'Active' : 'Inactive'}
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader><CardTitle>Contact</CardTitle></CardHeader>
          <CardBody className="space-y-3 text-sm">
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
              <Phone size={14} className="text-slate-400" /> {farmer.phone || '—'}
            </div>
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
              <Mail size={14} className="text-slate-400" /> {farmer.email || '—'}
            </div>
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
              <MapPin size={14} className="text-slate-400" /> {farmer.location || '—'}
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader><CardTitle>Produce</CardTitle></CardHeader>
          <CardBody>
            <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Total weight</p>
            <p className="mt-1 text-xl font-semibold text-slate-800 dark:text-slate-100">
              {formatKg(summary.totalWeightKg)}
            </p>
            <p className="mt-3 text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Deliveries
            </p>
            <p className="mt-1 text-lg font-medium text-slate-700 dark:text-slate-200">{deliveries.length}</p>
          </CardBody>
        </Card>

        <Card>
          <CardHeader><CardTitle>Balance</CardTitle></CardHeader>
          <CardBody>
            <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Total paid</p>
            <p className="mt-1 text-xl font-semibold text-brand-700 dark:text-brand-400">
              {formatKes(summary.totalPaidKes)}
            </p>
            <p className="mt-3 text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Outstanding
            </p>
            <p className="mt-1 text-lg font-medium text-orange-600 dark:text-orange-400">
              {formatKes(summary.outstandingKes)}
            </p>
          </CardBody>
        </Card>
      </div>

      <Tabs defaultValue="deliveries">
        <TabsList>
          <TabsTrigger value="deliveries">Deliveries</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
        </TabsList>

        <TabsContent value="deliveries">
          <div className="card-surface overflow-hidden">
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeaderCell>Code</TableHeaderCell>
                  <TableHeaderCell>Date</TableHeaderCell>
                  <TableHeaderCell className="text-right">Weight</TableHeaderCell>
                  <TableHeaderCell className="text-right">Rate</TableHeaderCell>
                  <TableHeaderCell className="text-right">Total</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {deliveries.length === 0 ? (
                  <TableEmpty colSpan={5}>No deliveries recorded yet.</TableEmpty>
                ) : (
                  deliveries.map((d) => (
                    <TableRow key={d.id}>
                      <TableCell className="font-mono text-xs">{d.code}</TableCell>
                      <TableCell>{formatDate(d.collectedAt)}</TableCell>
                      <TableCell className="text-right">{formatKg(d.weightKg)}</TableCell>
                      <TableCell className="text-right">{formatKes(d.ratePerKg)}</TableCell>
                      <TableCell className="text-right font-semibold">{formatKes(d.totalKes)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="payments">
          <div className="card-surface overflow-hidden">
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeaderCell>Receipt</TableHeaderCell>
                  <TableHeaderCell>Date</TableHeaderCell>
                  <TableHeaderCell className="text-right">Amount</TableHeaderCell>
                  <TableHeaderCell>Status</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {payments.length === 0 ? (
                  <TableEmpty colSpan={4}>No payments recorded yet.</TableEmpty>
                ) : (
                  payments.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-mono text-xs">
                        <Link
                          to={ROUTES.PAYMENT_DETAIL(p.id)}
                          className="text-brand-700 hover:underline dark:text-brand-400"
                        >
                          {p.receiptNo}
                        </Link>
                      </TableCell>
                      <TableCell>{formatDateTime(p.createdAt)}</TableCell>
                      <TableCell className="text-right font-semibold">{formatKes(p.amountKes)}</TableCell>
                      <TableCell>
                        <Badge variant={statusVariant(p.status)}>{p.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}