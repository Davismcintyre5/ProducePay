import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Download, RefreshCcw, FileText } from 'lucide-react';
import { toast } from 'sonner';
import * as reportApi from '@/api/report';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatKes, formatKg, formatDate } from '@/lib/format';

export default function ReportsPage() {
  const [exporting, setExporting] = useState(false);

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['reports', 'weekly'],
    queryFn: reportApi.weekly
  });

  const handleExport = async () => {
    setExporting(true);
    try {
      await reportApi.downloadCsv();
      toast.success('Export downloaded');
    } catch (err) {
      toast.error(err?.response?.data?.error?.message || 'Export failed');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800 dark:text-slate-100">Reports</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Weekly and exportable summaries.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            icon={<RefreshCcw size={16} />}
            isLoading={isFetching}
            onClick={() => refetch()}
          >
            Refresh
          </Button>
          <Button
            icon={<Download size={16} />}
            isLoading={exporting}
            onClick={handleExport}
          >
            Export CSV
          </Button>
        </div>
      </div>

      {isLoading ? (
        <Skeleton className="h-64" />
      ) : isError ? (
        <EmptyState
          title="Could not load report"
          action={<Button onClick={() => refetch()}>Retry</Button>}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Deliveries</CardTitle>
            </CardHeader>
            <CardBody>
              <p className="text-3xl font-semibold text-slate-800 dark:text-slate-100">
                {data?.data?.deliveries ?? 0}
              </p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {formatDate(data?.data?.weekFrom)} – {formatDate(data?.data?.weekTo)}
              </p>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Total Weight</CardTitle>
            </CardHeader>
            <CardBody>
              <p className="text-3xl font-semibold text-slate-800 dark:text-slate-100">
                {formatKg(data?.data?.weightKg ?? 0)}
              </p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Current week</p>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payments</CardTitle>
            </CardHeader>
            <CardBody>
              <p className="text-3xl font-semibold text-brand-700 dark:text-brand-400">
                {formatKes(data?.data?.totalKes ?? 0)}
              </p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Current week</p>
            </CardBody>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>CSV Export</CardTitle>
        </CardHeader>
        <CardBody className="flex flex-wrap items-center justify-between gap-3">
          <p className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <FileText size={16} /> Download the full delivery ledger as CSV.
          </p>
          <Button
            variant="outline"
            icon={<Download size={16} />}
            isLoading={exporting}
            onClick={handleExport}
          >
            Download
          </Button>
        </CardBody>
      </Card>
    </div>
  );
}