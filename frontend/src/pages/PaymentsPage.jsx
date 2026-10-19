import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, Wallet, Eye } from 'lucide-react';
import * as paymentApi from '@/api/payment';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeaderCell,
  TableCell,
  TableEmpty
} from '@/components/ui/Table';
import { Pagination } from '@/components/ui/Pagination';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { ROUTES } from '@/lib/routes';
import { formatKes, formatDate } from '@/lib/format';

function statusVariant(status) {
  return { PAID: 'success', PENDING: 'warning', FAILED: 'danger', CANCELLED: 'neutral' }[status] || 'neutral';
}

export default function PaymentsPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['payments', { search, status, page }],
    queryFn: () => paymentApi.list({ q: search, status, page, limit: 20 }),
    keepPreviousData: true
  });

  const rows = data?.data || [];
  const meta = data?.meta || { page: 1, totalPages: 1 };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800 dark:text-slate-100">Payments</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Track and disburse farmer payments.</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative max-w-sm flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search by receipt or farmer…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9"
          />
        </div>

        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="input-base max-w-[180px]"
        >
          <option value="">All statuses</option>
          <option value="PENDING">Pending</option>
          <option value="PAID">Paid</option>
          <option value="FAILED">Failed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      <div className="card-surface overflow-hidden">
        {isLoading ? (
          <div className="space-y-2 p-4">
            {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10" />)}
          </div>
        ) : rows.length === 0 ? (
          <EmptyState
            icon={<Wallet size={22} />}
            title="No payments found"
            description={search || status ? 'Try a different filter.' : 'Payments appear here once deliveries are recorded.'}
          />
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Receipt</TableHeaderCell>
                <TableHeaderCell>Farmer</TableHeaderCell>
                <TableHeaderCell className="text-right">Amount</TableHeaderCell>
                <TableHeaderCell>Status</TableHeaderCell>
                <TableHeaderCell>Method</TableHeaderCell>
                <TableHeaderCell>Date</TableHeaderCell>
                <TableHeaderCell className="text-right">Actions</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-mono text-xs">{p.receiptNo}</TableCell>
                  <TableCell className="font-medium">{p.farmerSnapshot?.name}</TableCell>
                  <TableCell className="text-right font-semibold">{formatKes(p.amountKes)}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant(p.status)}>{p.status}</Badge>
                  </TableCell>
                  <TableCell>{p.method || '—'}</TableCell>
                  <TableCell>{formatDate(p.paidAt || p.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    <Link to={ROUTES.PAYMENT_DETAIL(p.id)}>
                      <Button variant="ghost" size="icon" aria-label="View">
                        <Eye size={16} />
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <Pagination page={meta.page} totalPages={meta.totalPages} onPageChange={setPage} />
    </div>
  );
}