import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';
import MobileNav from './MobileNav';

export default function Layout() {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-surface-muted dark:bg-surface-darkMuted">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <Header />

        <main className="flex-1 overflow-y-auto p-4 pb-20 md:p-6 md:pb-6">
          <Outlet />
        </main>

        <Footer />
      </div>

      <MobileNav />
    </div>
  );
}