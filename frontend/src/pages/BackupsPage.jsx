import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Download, Upload, Mail, Trash2, Database, RefreshCcw, Settings } from 'lucide-react';
import { toast } from 'sonner';
import * as backupApi from '@/api/backup';
import * as settingsApi from '@/api/settings';
import { useAuth } from '@/context/AuthContext';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Checkbox } from '@/components/ui/Checkbox';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell
} from '@/components/ui/Table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from '@/components/ui/Dialog';
import { formatDateTime } from '@/lib/format';

export default function BackupsPage() {
  const { hasRole } = useAuth();
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);

  const [emailModal, setEmailModal] = useState({ open: false, id: null, email: '' });
  const [settingsOpen, setSettingsOpen] = useState(false);
  
  const [backupForm, setBackupForm] = useState({
    enabled: false,
    frequency: 'daily',
    time: '02:00',
    emailOnCompletion: false,
    emailRecipient: ''
  });

  const { data: backupsData, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['backups'],
    queryFn: backupApi.list
  });

  const { data: settingsData } = useQuery({
    queryKey: ['settings'],
    queryFn: settingsApi.get
  });

  useEffect(() => {
    if (settingsData?.data?.settings?.backups) {
      setBackupForm(settingsData.data.settings.backups);
    }
  }, [settingsData]);

  const createMutation = useMutation({
    mutationFn: backupApi.create,
    onSuccess: () => {
      toast.success('Backup created and uploaded successfully');
      queryClient.invalidateQueries({ queryKey: ['backups'] });
    },
    onError: (err) => toast.error(err?.response?.data?.error?.message || 'Failed to create backup')
  });

  const restoreMutation = useMutation({
    mutationFn: backupApi.restore,
    onSuccess: () => {
      toast.success('Database restored successfully');
      refetch();
    },
    onError: (err) => toast.error(err?.response?.data?.error?.message || 'Failed to restore database')
  });

  const deleteMutation = useMutation({
    mutationFn: backupApi.remove,
    onSuccess: () => {
      toast.success('Backup deleted');
      queryClient.invalidateQueries({ queryKey: ['backups'] });
    },
    onError: (err) => toast.error(err?.response?.data?.error?.message || 'Failed to delete backup')
  });

  const emailMutation = useMutation({
    mutationFn: (payload) => backupApi.sendToEmail(payload.id, payload.email),
    onSuccess: () => {
      toast.success('Email sent successfully');
      setEmailModal({ open: false, id: null, email: '' });
    },
    onError: (err) => toast.error(err?.response?.data?.error?.message || 'Failed to send email')
  });

  const settingsMutation = useMutation({
    mutationFn: (payload) => settingsApi.update({ backups: payload }),
    onSuccess: () => {
      toast.success('Backup settings saved');
      setSettingsOpen(false);
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
    onError: (err) => toast.error(err?.response?.data?.error?.message || 'Failed to save settings')
  });

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.endsWith('.json')) {
      toast.error('Only .json backup files are allowed');
      return;
    }
    if (window.confirm('WARNING: This will overwrite all current data. Are you sure?')) {
      restoreMutation.mutate(file);
    }
    e.target.value = null;
  };

  if (!hasRole('ADMIN')) {
    return <EmptyState title="Access Denied" description="Only administrators can access backups." />;
  }

  const backups = backupsData?.data?.backups || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800 dark:text-slate-100">Database Backups</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Manage manual and automatic snapshots of the system.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline" 
            icon={<Settings size={16} />} 
            onClick={() => setSettingsOpen(true)}
          >
            Settings
          </Button>
          <Button 
            variant="outline" 
            icon={<RefreshCcw size={16} />} 
            isLoading={isFetching} 
            onClick={() => refetch()}
          >
            Refresh
          </Button>
          <Button 
            variant="outline" 
            icon={<Upload size={16} />} 
            onClick={() => fileInputRef.current?.click()}
            disabled={restoreMutation.isPending}
          >
            {restoreMutation.isPending ? 'Restoring...' : 'Restore (.json)'}
          </Button>
          <input 
            type="file" 
            accept=".json" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            className="hidden" 
          />
          <Button 
            icon={<Database size={16} />} 
            isLoading={createMutation.isPending}
            onClick={() => createMutation.mutate()}
          >
            Create Now
          </Button>
        </div>
      </div>

      <div className="card-surface overflow-hidden">
        {isLoading ? (
          <div className="space-y-2 p-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-12" />
            ))}
          </div>
        ) : backups.length === 0 ? (
          <EmptyState
            icon={<Database size={24} />}
            title="No backups found"
            description="Create your first backup to secure your data."
          />
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Filename</TableHeaderCell>
                <TableHeaderCell>Type</TableHeaderCell>
                <TableHeaderCell>Size</TableHeaderCell>
                <TableHeaderCell>Date</TableHeaderCell>
                <TableHeaderCell className="text-right">Actions</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {backups.map((b) => (
                <TableRow key={b.id}>
                  <TableCell className="font-mono text-xs max-w-[200px] truncate" title={b.filename}>
                    {b.filename}
                  </TableCell>
                  <TableCell>
                    <Badge variant={b.type === 'auto' ? 'info' : 'brand'}>
                      {b.type.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>{(b.sizeBytes / 1024 / 1024).toFixed(2)} MB</TableCell>
                  <TableCell>{formatDateTime(b.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <a href={b.cloudinaryUrl} target="_blank" rel="noreferrer" download>
                        <Button variant="ghost" size="icon" title="Download">
                          <Download size={16} className="text-primary-600 dark:text-primary-400" />
                        </Button>
                      </a>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        title="Send to Email"
                        onClick={() => setEmailModal({ open: true, id: b.id, email: '' })}
                      >
                        <Mail size={16} />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        title="Delete"
                        onClick={() => {
                          if (window.confirm('Delete this backup permanently?')) {
                            deleteMutation.mutate(b.id);
                          }
                        }}
                      >
                        <Trash2 size={16} className="text-danger" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* EMAIL MODAL */}
      <Dialog open={emailModal.open} onOpenChange={(open) => !open && setEmailModal({ open: false, id: null, email: '' })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Backup to Email</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input 
              label="Email Address" 
              type="email" 
              value={emailModal.email} 
              onChange={(e) => setEmailModal(prev => ({ ...prev, email: e.target.value }))}
              placeholder="admin@moiben.co.ke"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEmailModal({ open: false, id: null, email: '' })}>
              Cancel
            </Button>
            <Button 
              isLoading={emailMutation.isPending} 
              onClick={() => emailMutation.mutate(emailModal)}
              disabled={!emailModal.email}
            >
              Send
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* SETTINGS MODAL */}
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Automatic Backup Settings</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <Checkbox
              label="Enable Automatic Backups"
              checked={backupForm.enabled}
              onChange={(e) => setBackupForm(prev => ({ ...prev, enabled: e.target.checked }))}
            />
            
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Select
                label="Frequency"
                value={backupForm.frequency}
                onChange={(e) => setBackupForm(prev => ({ ...prev, frequency: e.target.value }))}
                options={[
                  { value: 'daily', label: 'Daily' },
                  { value: 'weekly', label: 'Weekly' },
                  { value: 'monthly', label: 'Monthly' }
                ]}
              />
              <Input
                label="Time (Nairobi)"
                type="time"
                value={backupForm.time}
                onChange={(e) => setBackupForm(prev => ({ ...prev, time: e.target.value }))}
              />
            </div>

            <Checkbox
              label="Email me when backup completes"
              checked={backupForm.emailOnCompletion}
              onChange={(e) => setBackupForm(prev => ({ ...prev, emailOnCompletion: e.target.checked }))}
            />

            {backupForm.emailOnCompletion && (
              <Input
                label="Email Address for Reports"
                type="email"
                value={backupForm.emailRecipient}
                onChange={(e) => setBackupForm(prev => ({ ...prev, emailRecipient: e.target.value }))}
              />
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSettingsOpen(false)}>
              Cancel
            </Button>
            <Button 
              isLoading={settingsMutation.isPending}
              onClick={() => settingsMutation.mutate(backupForm)}
            >
              Save Settings
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}