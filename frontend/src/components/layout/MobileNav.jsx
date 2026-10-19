import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Wallet,
  MoreHorizontal,
  Users,
  BarChart3,
  UserCog,
  Settings as SettingsIcon,
  LogOut
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { ROUTES } from '@/lib/routes';
import { cn } from '@/lib/cn';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/Dialog';

const primaryItems = [
  { to: ROUTES.DASHBOARD, label: 'Home', icon: LayoutDashboard },
  { to: ROUTES.DELIVERIES, label: 'Deliveries', icon: Package },
  { to: ROUTES.PAYMENTS, label: 'Payments', icon: Wallet }
];

export default function MobileNav() {
  const { hasRole, logout } = useAuth();
  const navigate = useNavigate();
  const [moreOpen, setMoreOpen] = useState(false);

  const moreItems = [
    { to: ROUTES.FARMERS, label: 'Farmers', icon: Users, roles: ['ADMIN', 'MANAGER', 'CLERK'] },
    { to: ROUTES.REPORTS, label: 'Reports', icon: BarChart3, roles: ['ADMIN', 'MANAGER'] },
    { to: ROUTES.USERS, label: 'Users', icon: UserCog, roles: ['ADMIN'] },
    { to: ROUTES.SETTINGS, label: 'Settings', icon: SettingsIcon, roles: ['ADMIN'] }
  ].filter((item) => hasRole(...item.roles));

  const handleLogout = async () => {
    setMoreOpen(false);
    await logout();
    navigate(ROUTES.LOGIN, { replace: true });
  };

  const itemClass = ({ isActive }) =>
    cn(
      'flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[11px] transition-colors',
      isActive ? 'text-brand-600 dark:text-brand-400' : 'text-slate-500 dark:text-slate-400'
    );

  return (
    <>
      <nav className="fixed inset-x-0 bottom-0 z-30 flex h-16 items-center border-t border-slate-200 bg-white dark:border-slate-700 dark:bg-surface-darkCard md:hidden">
        {primaryItems.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} className={itemClass}>
            <Icon size={20} />
            <span>{label}</span>
          </NavLink>
        ))}

        <button
          type="button"
          onClick={() => setMoreOpen(true)}
          className="flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[11px] text-slate-500 dark:text-slate-400"
        >
          <MoreHorizontal size={20} />
          <span>More</span>
        </button>
      </nav>

      <Dialog open={moreOpen} onOpenChange={setMoreOpen}>
        <DialogContent className="fixed bottom-0 top-auto translate-y-0 rounded-t-card rounded-b-none md:hidden">
          <DialogHeader>
            <DialogTitle>More</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-1">
            {moreItems.map(({ to, label, icon: Icon }) => (
              <button
                key={to}
                type="button"
                onClick={() => {
                  setMoreOpen(false);
                  navigate(to);
                }}
                className="flex items-center gap-3 rounded-lg px-3 py-3 text-left text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <Icon size={18} /> {label}
              </button>
            ))}

            <button
              type="button"
              onClick={handleLogout}
              className="mt-2 flex items-center gap-3 rounded-lg px-3 py-3 text-left text-sm text-danger hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
            >
              <LogOut size={18} /> Logout
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}