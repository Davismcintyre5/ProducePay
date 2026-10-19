import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Package, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import * as deliveryApi from '@/api/delivery';
import * as farmerApi from '@/api/farmer';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/Dialog';
import { formatKes, formatKg, formatDate } from '@/lib/format';

function DeliveryFormDialog({ open, onOpenChange, onSuccess }) {
  const today = new Date().toISOString().slice(0, 10);

  const [farmerId, setFarmerId] = useState('');
  const [weightKg, setWeightKg] = useState('');
  const [collectedAt, setCollectedAt] = useState(today);
  const [notes, setNotes] = useState('');
  const [farmerSearch, setFarmerSearch] = useState('');

  const { data: farmersData } = useQuery({
    queryKey: ['farmers', 'picker', farmerSearch],
    queryFn: () => farmerApi.list({ q: farmerSearch, limit: 20 }),
    enabled: open
  });

  const farmerOptions = (farmersData?.data || []).map((f) => ({
    value: f.id,
    label: `${f.code} — ${f.name}`
  }));

  const mutation = useMutation({
    mutationFn: (payload) => deliveryApi.create(payload),
    onSuccess: (res) => {
      toast.success(`Delivery recorded. Payment: ${formatKes(res.data.payment.amountKes)}`);
      setFarmerId('');
      setWeightKg('');
      setNotes('');
      setCollectedAt(today);
      onSuccess?.();
    },
    onError: (err) => {
      toast.error(err?.response?.data?.error?.message || 'Failed to record delivery');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      farmerId,
      weightKg: Number(weightKg),
      collectedAt: new Date(collectedAt).toISOString(),
      clientRequestId: crypto.randomUUID()
    };
    if (notes.trim()) payload.notes = notes.trim();
    mutation.mutate(payload);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Record Delivery</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3">
          <Input
            label="Search farmer"
            placeholder="Name, code, or phone"
            value={farmerSearch}
            onChange={(e) => setFarmerSearch(e.target.value)}
          />
          <Select
            label="Farmer"
            placeholder="Select farmer"
            value={farmerId}
            onChange={(e) => setFarmerId(e.target.value)}
            options={farmerOptions}
            required
          />
          <Input
            label="Weight (kg)"
            type="number"
            step="0.1"
            min="0.1"
            value={weightKg}
            onChange={(e) => setWeightKg(e.target.value)}
            required
          />
          <Input
            label="Date"
            type="date"
            value={collectedAt}
            onChange={(e) => setCollectedAt(e.target.value)}
            required
          />
          <Input label="Notes (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} />

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={mutation.isPending} disabled={!farmerId}>
              Record
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function DeliveriesPage() {
  const { hasRole } = useAuth();
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['deliveries', { search, page }],
    queryFn: () => deliveryApi.list({ q: search, page, limit: 20 }),
    keepPreviousData: true
  });

  const removeMutation = useMutation({
    mutationFn: (id) => deliveryApi.remove(id),
    onSuccess: () => {
      toast.success('Delivery removed');
      qc.invalidateQueries({ queryKey: ['deliveries'] });
    },
    onError: (err) => toast.error(err?.response?.data?.error?.message || 'Failed to remove')
  });

  const rows = data?.data || [];
  const meta = data?.meta || { page: 1, totalPages: 1 };

  const canDelete = hasRole('ADMIN');

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800 dark:text-slate-100">Deliveries</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Record and track produce collection.</p>
        </div>
        <Button icon={<Plus size={16} />} onClick={() => setDialogOpen(true)}>
          Record Delivery
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <Input
          placeholder="Search by code or farmer…"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="pl-9"
        />
      </div>

      <div className="card-surface overflow-hidden">
        {isLoading ? (
          <div className="space-y-2 p-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10" />
            ))}
          </div>
        ) : rows.length === 0 ? (
          <EmptyState
            icon={<Package size={22} />}
            title="No deliveries yet"
            description={search ? 'Try a different search.' : 'Record your first delivery to get started.'}
          />
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Code</TableHeaderCell>
                <TableHeaderCell>Farmer</TableHeaderCell>
                <TableHeaderCell className="text-right">Weight</TableHeaderCell>
                <TableHeaderCell className="text-right">Rate</TableHeaderCell>
                <TableHeaderCell className="text-right">Total</TableHeaderCell>
                <TableHeaderCell>Date</TableHeaderCell>
                {canDelete && <TableHeaderCell className="text-right">Actions</TableHeaderCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((d) => (
                <TableRow key={d.id}>
                  <TableCell className="font-mono text-xs">{d.code}</TableCell>
                  <TableCell className="font-medium">{d.farmerSnapshot?.name}</TableCell>
                  <TableCell className="text-right">{formatKg(d.weightKg)}</TableCell>
                  <TableCell className="text-right">{formatKes(d.ratePerKg)}</TableCell>
                  <TableCell className="text-right font-semibold">{formatKes(d.totalKes)}</TableCell>
                  <TableCell>{formatDate(d.collectedAt)}</TableCell>
                  {canDelete && (
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Delete"
                        onClick={() => {
                          if (window.confirm(`Remove delivery ${d.code}?`)) {
                            removeMutation.mutate(d.id);
                          }
                        }}
                      >
                        <Trash2 size={16} className="text-danger" />
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <Pagination page={meta.page} totalPages={meta.totalPages} onPageChange={setPage} />

      <DeliveryFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={() => {
          qc.invalidateQueries({ queryKey: ['deliveries'] });
          qc.invalidateQueries({ queryKey: ['payments'] });
          qc.invalidateQueries({ queryKey: ['reports', 'dashboard'] });
          setDialogOpen(false);
        }}
      />
    </div>
  );
}