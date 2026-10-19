import { useQuery } from '@tanstack/react-query';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  CartesianGrid
} from 'recharts';
import { Users, Package, Scale, Wallet, RefreshCcw } from 'lucide-react';
import * as reportApi from '@/api/report';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { formatKes, formatKg, formatDateTime } from '@/lib/format';

const PIE_COLORS = ['#1b5e20', '#66bb6a', '#1565c0', '#ef6c00', '#6a1b9a'];

function StatCard({ icon, label, value, accent = 'brand' }) {
  const accentClass = {
    brand: 'bg-brand-100 text-brand-700 dark:bg-brand-800/40 dark:text-brand-300',
    blue: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    orange: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
    purple: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300'
  }[accent];

  return (
    <Card>
      <CardBody className="flex items-center gap-4">
        <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${accentClass}`}>
          {icon}
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
            {label}
          </p>
          <p className="mt-1 text-xl font-semibold text-slate-800 dark:text-slate-100">{value}</p>
        </div>
      </CardBody>
    </Card>
  );
}

export default function DashboardPage() {
  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['reports', 'dashboard'],
    queryFn: reportApi.dashboard
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-72" />
        <Skeleton className="h-52" />
      </div>
    );
  }

  if (isError) {
    return (
      <EmptyState
        title="Could not load dashboard"
        description="Please try again."
        action={
          <Button onClick={() => refetch()} icon={<RefreshCcw size={16} />}>
            Retry
          </Button>
        }
      />
    );
  }

  const stats = data?.data?.stats || {};
  const recent = data?.data?.recentDeliveries || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800 dark:text-slate-100">Dashboard</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Overview of the current operation.</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          isLoading={isFetching}
          icon={<RefreshCcw size={14} />}
        >
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={<Users size={22} />} label="Active Farmers" value={stats.totalFarmers ?? 0} accent="brand" />
        <StatCard icon={<Package size={22} />} label="Deliveries" value={stats.totalDeliveries ?? 0} accent="blue" />
        <StatCard icon={<Scale size={22} />} label="Total Weight" value={formatKg(stats.totalWeightKg ?? 0)} accent="orange" />
        <StatCard icon={<Wallet size={22} />} label="Total Paid" value={formatKes(stats.totalPaidKes ?? 0)} accent="purple" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Deliveries</CardTitle>
        </CardHeader>
        <CardBody>
          {recent.length === 0 ? (
            <EmptyState
              icon={<Package size={22} />}
              title="No deliveries yet"
              description="Once deliveries are recorded they will appear here."
            />
          ) : (
            <ul className="divide-y divide-slate-200 dark:divide-slate-700">
              {recent.map((d) => (
                <li key={d.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
                      {d.farmerSnapshot?.name || 'Unknown'}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {d.code} · {formatDateTime(d.collectedAt)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                      {formatKg(d.weightKg)}
                    </p>
                    <p className="text-xs text-brand-600 dark:text-brand-400">
                      {formatKes(d.totalKes)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>
    </div>
  );
}