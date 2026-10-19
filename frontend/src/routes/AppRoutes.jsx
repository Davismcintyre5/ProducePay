import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { ROUTES } from '@/lib/routes';
import { Spinner } from '@/components/ui/Spinner';

const LoginPage = lazy(() => import('@/pages/LoginPage'));
const DashboardPage = lazy(() => import('@/pages/DashboardPage'));
const FarmersPage = lazy(() => import('@/pages/FarmersPage'));
const FarmerDetailPage = lazy(() => import('@/pages/FarmerDetailPage'));
const DeliveriesPage = lazy(() => import('@/pages/DeliveriesPage'));
const PaymentsPage = lazy(() => import('@/pages/PaymentsPage'));
const PaymentDetailPage = lazy(() => import('@/pages/PaymentDetailPage'));
const ReceiptPage = lazy(() => import('@/pages/ReceiptPage'));
const ReportsPage = lazy(() => import('@/pages/ReportsPage'));
const UsersPage = lazy(() => import('@/pages/UsersPage'));
const SettingsPage = lazy(() => import('@/pages/SettingsPage'));
const ForbiddenPage = lazy(() => import('@/pages/ForbiddenPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));

const Layout = lazy(() => import('@/components/layout/Layout'));

function FullScreenLoader() {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-surface-muted dark:bg-surface-darkMuted">
      <Spinner size="lg" />
    </div>
  );
}

function ProtectedRoute() {
  const { status } = useAuth();

  if (status === 'loading') return <FullScreenLoader />;
  if (status === 'anonymous') return <Navigate to={ROUTES.LOGIN} replace />;

  return <Outlet />;
}

function RoleRoute({ roles }) {
  const { hasRole } = useAuth();
  if (!hasRole(...roles)) return <Navigate to={ROUTES.FORBIDDEN} replace />;
  return <Outlet />;
}

function PublicOnlyRoute() {
  const { status } = useAuth();
  if (status === 'loading') return <FullScreenLoader />;
  if (status === 'authenticated') return <Navigate to={ROUTES.DASHBOARD} replace />;
  return <Outlet />;
}

export default function AppRoutes() {
  return (
    <Suspense fallback={<FullScreenLoader />}>
      <Routes>
        <Route element={<PublicOnlyRoute />}>
          <Route path={ROUTES.LOGIN} element={<LoginPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route index element={<Navigate to={ROUTES.DASHBOARD} replace />} />
            <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />
            <Route path={ROUTES.FARMERS} element={<FarmersPage />} />
            <Route path={ROUTES.FARMER_DETAIL(':id')} element={<FarmerDetailPage />} />
            <Route path={ROUTES.DELIVERIES} element={<DeliveriesPage />} />
            <Route path={ROUTES.PAYMENTS} element={<PaymentsPage />} />
            <Route path={ROUTES.PAYMENT_DETAIL(':id')} element={<PaymentDetailPage />} />
            <Route path={ROUTES.RECEIPT(':id')} element={<ReceiptPage />} />

            <Route element={<RoleRoute roles={['MANAGER', 'ADMIN']} />}>
              <Route path={ROUTES.REPORTS} element={<ReportsPage />} />
            </Route>

            <Route element={<RoleRoute roles={['ADMIN']} />}>
              <Route path={ROUTES.USERS} element={<UsersPage />} />
              <Route path={ROUTES.SETTINGS} element={<SettingsPage />} />
            </Route>
          </Route>

          <Route path={ROUTES.FORBIDDEN} element={<ForbiddenPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}