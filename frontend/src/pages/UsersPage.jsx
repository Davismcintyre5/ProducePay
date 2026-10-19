import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, UserCog, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import * as userApi from '@/api/user';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/Dialog';
import { formatPhone, formatDate } from '@/lib/format';

function roleVariant(role) {
  return { ADMIN: 'brand', MANAGER: 'info', CLERK: 'neutral' }[role] || 'neutral';
}

function UserFormDialog({ open, onOpenChange, onSuccess }) {
  const [form, setForm] = useState({
    username: '',
    password: '',
    fullName: '',
    phone: '',
    email: '',
    role: 'CLERK'
  });

  const mutation = useMutation({
    mutationFn: (payload) => userApi.create(payload),
    onSuccess: () => {
      toast.success('User created');
      setForm({ username: '', password: '', fullName: '', phone: '', email: '', role: 'CLERK' });
      onSuccess?.();
    },
    onError: (err) => {
      toast.error(err?.response?.data?.error?.message || 'Failed to create user');
    }
  });

  const handleChange = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate({
      username: form.username.trim(),
      password: form.password,
      fullName: form.fullName.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      role: form.role
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add User</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3">
          <Input label="Full name" value={form.fullName} onChange={handleChange('fullName')} required />
          <Input label="Username" value={form.username} onChange={handleChange('username')} required />
          <Input
            label="Password"
            type="password"
            value={form.password}
            onChange={handleChange('password')}
            minLength={8}
            required
          />
          <Input
            label="Phone"
            placeholder="07xx xxx xxx"
            value={form.phone}
            onChange={handleChange('phone')}
            required
          />
          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={handleChange('email')}
            required
          />
          <Select
            label="Role"
            value={form.role}
            onChange={handleChange('role')}
            options={[
              { value: 'CLERK', label: 'Collection Clerk' },
              { value: 'MANAGER', label: 'Manager' },
              { value: 'ADMIN', label: 'Administrator' }
            ]}
          />

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={mutation.isPending}>
              Create user
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function UsersPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['users', { page }],
    queryFn: () => userApi.list({ page, limit: 20 }),
    keepPreviousData: true
  });

  const removeMutation = useMutation({
    mutationFn: (id) => userApi.remove(id),
    onSuccess: () => {
      toast.success('User deactivated');
      qc.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (err) => toast.error(err?.response?.data?.error?.message || 'Failed')
  });

  const rows = data?.data || [];
  const meta = data?.meta || { page: 1, totalPages: 1 };

  const filtered = rows.filter(
    (u) =>
      !search ||
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      (u.fullName || '').toLowerCase().includes(search.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800 dark:text-slate-100">Users</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Manage staff accounts.</p>
        </div>
        <Button icon={<Plus size={16} />} onClick={() => setDialogOpen(true)}>
          Add User
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <Input
          placeholder="Search users…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
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
        ) : filtered.length === 0 ? (
          <EmptyState icon={<UserCog size={22} />} title="No users found" />
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Name</TableHeaderCell>
                <TableHeaderCell>Username</TableHeaderCell>
                <TableHeaderCell>Contact</TableHeaderCell>
                <TableHeaderCell>Role</TableHeaderCell>
                <TableHeaderCell>Last Login</TableHeaderCell>
                <TableHeaderCell className="text-right">Actions</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.fullName}</TableCell>
                  <TableCell className="font-mono text-xs">{u.username}</TableCell>
                  <TableCell>
                    <div className="text-sm">{formatPhone(u.phone)}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">{u.email}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={roleVariant(u.role)}>{u.role}</Badge>
                  </TableCell>
                  <TableCell>{u.lastLoginAt ? formatDate(u.lastLoginAt) : '—'}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Deactivate"
                      onClick={() => {
                        if (window.confirm(`Deactivate ${u.username}?`)) {
                          removeMutation.mutate(u.id);
                        }
                      }}
                    >
                      <Trash2 size={16} className="text-danger" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <Pagination page={meta.page} totalPages={meta.totalPages} onPageChange={setPage} />

      <UserFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={() => {
          qc.invalidateQueries({ queryKey: ['users'] });
          setDialogOpen(false);
        }}
      />
    </div>
  );
}