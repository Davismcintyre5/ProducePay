import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Users, Pencil, Trash2, Eye } from 'lucide-react';
import { toast } from 'sonner';
import * as farmerApi from '@/api/farmer';
import { useAuth } from '@/context/AuthContext';
import { ROUTES } from '@/lib/routes';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeaderCell,
  TableCell
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

const EMPTY_FORM = {
  name: '',
  phone: '',
  email: '',
  location: '',
  farmSizeAcres: '',
  notes: ''
};

function FarmerFormDialog({ open, onOpenChange, initial, onSuccess }) {
  const isEdit = Boolean(initial);
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    if (!open) return;
    setForm(
      initial
        ? {
            name: initial.name || '',
            phone: initial.phone || '',
            email: initial.email || '',
            location: initial.location || '',
            farmSizeAcres: initial.farmSizeAcres ?? '',
            notes: initial.notes || ''
          }
        : EMPTY_FORM
    );
  }, [open, initial]);

  const mutation = useMutation({
    mutationFn: (payload) =>
      isEdit ? farmerApi.update(initial.id, payload) : farmerApi.create(payload),
    onSuccess: () => {
      toast.success(isEdit ? 'Farmer updated' : 'Farmer registered');
      onSuccess?.();
    },
    onError: (err) => {
      toast.error(err?.response?.data?.error?.message || 'Failed to save farmer');
    }
  });

  const handleChange = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      name: form.name.trim(),
      phone: form.phone.trim(),
      location: form.location.trim()
    };
    if (form.email.trim()) payload.email = form.email.trim();
    if (form.farmSizeAcres !== '') payload.farmSizeAcres = Number(form.farmSizeAcres);
    if (form.notes.trim()) payload.notes = form.notes.trim();

    mutation.mutate(payload);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Farmer' : 'Register Farmer'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3">
          <Input label="Full name" value={form.name} onChange={handleChange('name')} required />
          <Input
            label="Phone"
            placeholder="07xx xxx xxx"
            value={form.phone}
            onChange={handleChange('phone')}
            required
          />
          <Input
            label="Email (optional)"
            type="email"
            value={form.email}
            onChange={handleChange('email')}
          />
          <Input label="Location" value={form.location} onChange={handleChange('location')} required />
          <Input
            label="Farm size (acres)"
            type="number"
            step="0.1"
            min="0"
            value={form.farmSizeAcres}
            onChange={handleChange('farmSizeAcres')}
          />
          <Input label="Notes (optional)" value={form.notes} onChange={handleChange('notes')} />

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={mutation.isPending}>
              {isEdit ? 'Save changes' : 'Register'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function FarmersPage() {
  const { hasRole } = useAuth();
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['farmers', { search, page }],
    queryFn: () => farmerApi.list({ q: search, page, limit: 20 }),
    keepPreviousData: true
  });

  const removeMutation = useMutation({
    mutationFn: (id) => farmerApi.remove(id),
    onSuccess: () => {
      toast.success('Farmer deactivated');
      qc.invalidateQueries({ queryKey: ['farmers'] });
    },
    onError: (err) => {
      toast.error(err?.response?.data?.error?.message || 'Failed to deactivate');
    }
  });

  const rows = data?.data || [];
  const meta = data?.meta || { page: 1, totalPages: 1 };

  const handleCreate = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const handleEdit = (farmer) => {
    setEditing(farmer);
    setDialogOpen(true);
  };

  const handleDelete = (farmer) => {
    if (window.confirm(`Deactivate ${farmer.name}?`)) {
      removeMutation.mutate(farmer.id);
    }
  };

  const canManage = hasRole('MANAGER', 'ADMIN');
  const canDelete = hasRole('ADMIN');

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800 dark:text-slate-100">Farmers</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Manage registered farmers.</p>
        </div>
        {canManage && (
          <Button icon={<Plus size={16} />} onClick={handleCreate}>
            Register Farmer
          </Button>
        )}
      </div>

      <div className="relative max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <Input
          placeholder="Search by name, code, phone…"
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
            icon={<Users size={22} />}
            title="No farmers found"
            description={
              search ? 'Try a different search.' : 'Register your first farmer to get started.'
            }
          />
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Code</TableHeaderCell>
                <TableHeaderCell>Name</TableHeaderCell>
                <TableHeaderCell>Phone</TableHeaderCell>
                <TableHeaderCell>Location</TableHeaderCell>
                <TableHeaderCell>Farm Size</TableHeaderCell>
                <TableHeaderCell className="text-right">Actions</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((f) => (
                <TableRow key={f.id}>
                  <TableCell className="font-mono text-xs">{f.code}</TableCell>
                  <TableCell className="font-medium">{f.name}</TableCell>
                  <TableCell>{f.phone}</TableCell>
                  <TableCell>{f.location}</TableCell>
                  <TableCell>{f.farmSizeAcres ? `${f.farmSizeAcres} ac` : '—'}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Link to={ROUTES.FARMER_DETAIL(f.id)}>
                        <Button variant="ghost" size="icon" aria-label="View">
                          <Eye size={16} />
                        </Button>
                      </Link>
                      {canManage && (
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Edit"
                          onClick={() => handleEdit(f)}
                        >
                          <Pencil size={16} />
                        </Button>
                      )}
                      {canDelete && (
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Deactivate"
                          onClick={() => handleDelete(f)}
                        >
                          <Trash2 size={16} className="text-danger" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <Pagination page={meta.page} totalPages={meta.totalPages} onPageChange={setPage} />

      <FarmerFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initial={editing}
        onSuccess={() => {
          qc.invalidateQueries({ queryKey: ['farmers'] });
          setDialogOpen(false);
        }}
      />
    </div>
  );
}