import { Sun, Moon, Menu, LogOut, User as UserIcon, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { ROUTES } from '@/lib/routes';
import { Button } from '@/components/ui/Button';
import {
  Dropdown,
  DropdownTrigger,
  DropdownContent,
  DropdownItem,
  DropdownSeparator
} from '@/components/ui/Dropdown';

export default function Header() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate(ROUTES.LOGIN, { replace: true });
  };

  const initials = (user?.fullName || user?.username || '?').charAt(0).toUpperCase();

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 dark:border-slate-700 dark:bg-surface-darkCard md:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="rounded-md p-1.5 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 md:hidden"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
        <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
          {user?.role === 'ADMIN' ? 'Administrator' : user?.role === 'MANAGER' ? 'Manager' : 'Collection Clerk'}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </Button>

        <Dropdown>
          <DropdownTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-2 rounded-full p-1 pr-3 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-sm font-semibold text-white">
                {initials}
              </span>
              <span className="hidden text-sm font-medium text-slate-700 dark:text-slate-200 sm:inline">
                {user?.fullName || user?.username}
              </span>
            </button>
          </DropdownTrigger>

          <DropdownContent>
            <DropdownItem onSelect={() => navigate(ROUTES.DASHBOARD)}>
              <UserIcon size={14} /> Profile
            </DropdownItem>
            <DropdownItem onSelect={() => navigate(ROUTES.DASHBOARD)}>
              <Lock size={14} /> Change Password
            </DropdownItem>
            <DropdownSeparator />
            <DropdownItem onSelect={handleLogout} className="text-danger dark:text-red-400">
              <LogOut size={14} /> Logout
            </DropdownItem>
          </DropdownContent>
        </Dropdown>
      </div>
    </header>
  );
}