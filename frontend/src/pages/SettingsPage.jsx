import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Save, RotateCcw, Building2, Briefcase, Bell, Receipt } from 'lucide-react';
import { toast } from 'sonner';
import * as settingsApi from '@/api/settings';
import { Card, CardBody, CardHeader, CardTitle, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Checkbox } from '@/components/ui/Checkbox';
import { Select } from '@/components/ui/Select';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/Dialog';

const WEEKDAYS = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' }
];

const HOURS = Array.from({ length: 24 }, (_, i) => ({
  value: i,
  label: `${String(i).padStart(2, '0')}:00`
}));

function emptyForm() {
  return {
    organisation: {
      orgName: '',
      shortName: '',
      phone: '',
      email: '',
      physicalAddress: '',
      postalAddress: ''
    },
    business: {
      ratePerKg: 0,
      currency: 'KES',
      weightUnit: 'kg',
      minDeliveryWeightKg: 0.1,
      maxDeliveryWeightKg: 100000
    },
    notifications: {
      emailEnabled: true,
      smsEnabled: true,
      notifyFarmerOnDelivery: true,
      notifyFarmerOnPayment: true,
      notifyManagersOnWeeklyReport: true,
      weeklyReportDay: 1,
      weeklyReportHour: 8
    },
    receipts: {
      prefix: 'R',
      footerNote: ''
    }
  };
}

export default function SettingsPage() {
  const qc = useQueryClient();
  const [form, setForm] = useState(emptyForm());
  const [resetOpen, setResetOpen] = useState(false);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['settings'],
    queryFn: settingsApi.get
  });

  useEffect(() => {
    if (data?.data?.settings) {
      const s = data.data.settings;
      setForm({
        organisation: { ...emptyForm().organisation, ...s.organisation },
        business: { ...emptyForm().business, ...s.business },
        notifications: { ...emptyForm().notifications, ...s.notifications },
        receipts: { ...emptyForm().receipts, ...s.receipts }
      });
    }
  }, [data]);

  const updateMutation = useMutation({
    mutationFn: (payload) => settingsApi.update(payload),
    onSuccess: () => {
      toast.success('Settings saved');
      qc.invalidateQueries({ queryKey: ['settings'] });
    },
    onError: (err) =>
      toast.error(err?.response?.data?.error?.message || 'Failed to save settings')
  });

  const resetMutation = useMutation({
    mutationFn: () => settingsApi.reset(),
    onSuccess: () => {
      toast.success('Settings reset to defaults');
      setResetOpen(false);
      qc.invalidateQueries({ queryKey: ['settings'] });
    },
    onError: (err) =>
      toast.error(err?.response?.data?.error?.message || 'Failed to reset settings')
  });

  const setGroup = (group, key) => (value) =>
    setForm((f) => ({ ...f, [group]: { ...f[group], [key]: value } }));

  const onSubmit = (e) => {
    e.preventDefault();
    updateMutation.mutate(form);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-72" />
      </div>
    );
  }

  if (isError) {
    return (
      <EmptyState
        title="Could not load settings"
        action={<Button onClick={() => refetch()}>Retry</Button>}
      />
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800 dark:text-slate-100">Settings</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Organisation details, business rules, and preferences.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            icon={<RotateCcw size={16} />}
            onClick={() => setResetOpen(true)}
          >
            Reset defaults
          </Button>
          <Button type="submit" icon={<Save size={16} />} isLoading={updateMutation.isPending}>
            Save changes
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 size={18} /> Organisation
          </CardTitle>
        </CardHeader>
        <CardBody className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input
            label="Organisation name"
            value={form.organisation.orgName}
            onChange={(e) => setGroup('organisation', 'orgName')(e.target.value)}
            required
          />
          <Input
            label="Short name"
            value={form.organisation.shortName}
            onChange={(e) => setGroup('organisation', 'shortName')(e.target.value)}
          />
          <Input
            label="Phone"
            value={form.organisation.phone}
            onChange={(e) => setGroup('organisation', 'phone')(e.target.value)}
          />
          <Input
            label="Email"
            type="email"
            value={form.organisation.email}
            onChange={(e) => setGroup('organisation', 'email')(e.target.value)}
          />
          <Input
            label="Physical address"
            value={form.organisation.physicalAddress}
            onChange={(e) => setGroup('organisation', 'physicalAddress')(e.target.value)}
          />
          <Input
            label="Postal address"
            value={form.organisation.postalAddress}
            onChange={(e) => setGroup('organisation', 'postalAddress')(e.target.value)}
          />
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase size={18} /> Business Rules
          </CardTitle>
        </CardHeader>
        <CardBody className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input
            label="Rate per kg"
            type="number"
            min="0"
            step="0.01"
            value={form.business.ratePerKg}
            onChange={(e) => setGroup('business', 'ratePerKg')(Number(e.target.value))}
            required
          />
          <Input
            label="Currency"
            value={form.business.currency}
            onChange={(e) => setGroup('business', 'currency')(e.target.value)}
          />
          <Input
            label="Weight unit"
            value={form.business.weightUnit}
            onChange={(e) => setGroup('business', 'weightUnit')(e.target.value)}
          />
          <Input
            label="Minimum delivery (kg)"
            type="number"
            min="0"
            step="0.01"
            value={form.business.minDeliveryWeightKg}
            onChange={(e) =>
              setGroup('business', 'minDeliveryWeightKg')(Number(e.target.value))
            }
          />
          <Input
            label="Maximum delivery (kg)"
            type="number"
            min="1"
            step="1"
            value={form.business.maxDeliveryWeightKg}
            onChange={(e) =>
              setGroup('business', 'maxDeliveryWeightKg')(Number(e.target.value))
            }
          />
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell size={18} /> Notifications
          </CardTitle>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <Checkbox
              label="Email channel enabled"
              checked={form.notifications.emailEnabled}
              onChange={(e) =>
                setGroup('notifications', 'emailEnabled')(e.target.checked)
              }
            />
            <Checkbox
              label="SMS channel enabled"
              checked={form.notifications.smsEnabled}
              onChange={(e) =>
                setGroup('notifications', 'smsEnabled')(e.target.checked)
              }
            />
            <Checkbox
              label="Notify farmer on delivery"
              checked={form.notifications.notifyFarmerOnDelivery}
              onChange={(e) =>
                setGroup('notifications', 'notifyFarmerOnDelivery')(e.target.checked)
              }
            />
            <Checkbox
              label="Notify farmer on payment"
              checked={form.notifications.notifyFarmerOnPayment}
              onChange={(e) =>
                setGroup('notifications', 'notifyFarmerOnPayment')(e.target.checked)
              }
            />
            <Checkbox
              label="Send weekly report to managers"
              checked={form.notifications.notifyManagersOnWeeklyReport}
              onChange={(e) =>
                setGroup('notifications', 'notifyManagersOnWeeklyReport')(e.target.checked)
              }
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Select
              label="Weekly report day"
              value={form.notifications.weeklyReportDay}
              onChange={(e) =>
                setGroup('notifications', 'weeklyReportDay')(Number(e.target.value))
              }
              options={WEEKDAYS}
            />
            <Select
              label="Weekly report hour"
              value={form.notifications.weeklyReportHour}
              onChange={(e) =>
                setGroup('notifications', 'weeklyReportHour')(Number(e.target.value))
              }
              options={HOURS}
            />
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt size={18} /> Receipts
          </CardTitle>
        </CardHeader>
        <CardBody className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input
            label="Receipt prefix"
            value={form.receipts.prefix}
            onChange={(e) => setGroup('receipts', 'prefix')(e.target.value)}
          />
          <Input
            label="Footer note"
            value={form.receipts.footerNote}
            onChange={(e) => setGroup('receipts', 'footerNote')(e.target.value)}
          />
        </CardBody>
        <CardFooter>
          <Button type="submit" icon={<Save size={16} />} isLoading={updateMutation.isPending}>
            Save changes
          </Button>
        </CardFooter>
      </Card>

      <Dialog open={resetOpen} onOpenChange={setResetOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset settings to defaults?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            All settings will be reset to their default values. This cannot be undone.
          </p>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setResetOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              isLoading={resetMutation.isPending}
              onClick={() => resetMutation.mutate()}
            >
              Reset
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </form>
  );
}