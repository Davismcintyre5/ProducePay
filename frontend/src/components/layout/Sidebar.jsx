import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Package,
  Wallet,
  BarChart3,
  UserCog,
  Settings as SettingsIcon,
  LogOut
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { ROUTES } from '@/lib/routes';
import { cn } from '@/lib/cn';

const navItems = [
  { to: ROUTES.DASHBOARD, label: 'Dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'MANAGER', 'CLERK'] },
  { to: ROUTES.FARMERS, label: 'Farmers', icon: Users, roles: ['ADMIN', 'MANAGER', 'CLERK'] },
  { to: ROUTES.DELIVERIES, label: 'Deliveries', icon: Package, roles: ['ADMIN', 'MANAGER', 'CLERK'] },
  { to: ROUTES.PAYMENTS, label: 'Payments', icon: Wallet, roles: ['ADMIN', 'MANAGER', 'CLERK'] },
  { to: ROUTES.REPORTS, label: 'Reports', icon: BarChart3, roles: ['ADMIN', 'MANAGER'] },
  { to: ROUTES.USERS, label: 'Users', icon: UserCog, roles: ['ADMIN'] },
  { to: ROUTES.SETTINGS, label: 'Settings', icon: SettingsIcon, roles: ['ADMIN'] }
];

export default function Sidebar() {
  const { user, hasRole, logout } = useAuth();
  const navigate = useNavigate();

  const visible = navItems.filter((item) => hasRole(...item.roles));

  const handleLogout = async () => {
    await logout();
    navigate(ROUTES.LOGIN, { replace: true });
  };

  return (
    <aside className="hidden h-screen w-64 shrink-0 flex-col bg-brand-800 text-white dark:bg-slate-900 md:flex">
      <div className="flex items-center gap-2 border-b border-white/10 px-5 py-4">
        <span className="text-2xl">🌽</span>
        <div>
          <div className="text-sm font-semibold leading-tight">ProducePay</div>
          <div className="text-[11px] text-brand-100/80 dark:text-slate-400">MOIBEN MMP</div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-4">
        {visible.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'mb-1 flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                isActive
                  ? 'bg-brand-600 font-medium text-white dark:bg-slate-800'
                  : 'text-brand-100/80 hover:bg-brand-700 hover:text-white dark:text-slate-300 dark:hover:bg-slate-800'
              )
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-white/10 p-3">
        <div className="mb-3 flex items-center gap-2 px-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-sm font-semibold text-white">
            {(user?.fullName || user?.username || '?').charAt(0).toUpperCase()}
          </span>
          <div className="min-w-0">
            <div className="truncate text-sm font-medium">
              {user?.fullName || user?.username}
            </div>
            <div className="truncate text-[11px] text-brand-100/80 dark:text-slate-400">
              {user?.role}
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-2 rounded-lg bg-red-600 px-3 py-2 text-sm font-medium hover:bg-red-700"
        >
          <LogOut size={16} /> Logout
        </button>
      </div>
    </aside>
  );
}