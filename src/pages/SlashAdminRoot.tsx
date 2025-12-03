/**
 * Slash Admin Root Component
 * Полная интеграция оригинального Slash Admin
 */
import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { SlashAdminAuthGuard } from '@/admin/auth-integration';

// Импортируем стили Slash Admin
import '@/admin/global.css';
import '@/admin/theme/theme.css';

// Импортируем i18n
import '@/admin/locales/i18n';

// Регистрация иконок
import { registerLocalIcons } from '@/admin/components/icon';

// Lazy load Slash Admin pages
import { lazy, Suspense } from 'react';

const DashboardLayout = lazy(() => import('@/admin/layouts/dashboard'));
const Workbench = lazy(() => import('@/admin/pages/dashboard/workbench'));
const Analysis = lazy(() => import('@/admin/pages/dashboard/analysis'));
const UserManagement = lazy(() => import('@/admin/pages/management/system/user'));
const RoleManagement = lazy(() => import('@/admin/pages/management/system/role'));
const PermissionManagement = lazy(() => import('@/admin/pages/management/system/permission'));

// Loading component
const AdminLoading = () => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    background: '#f5f5f5'
  }}>
    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary" style={{
      borderTopColor: 'transparent',
      borderColor: '#6366f1'
    }}></div>
  </div>
);

export default function SlashAdminRoot() {
  useEffect(() => {
    // Регистрируем иконки при монтировании
    registerLocalIcons().catch(console.error);
  }, []);

  return (
    <SlashAdminAuthGuard>
      <Suspense fallback={<AdminLoading />}>
        <Routes>
          <Route path="/" element={<Navigate to="/admin/dashboard/workbench" replace />} />
          <Route element={<DashboardLayout />}>
            <Route path="dashboard/workbench" element={<Workbench />} />
            <Route path="dashboard/analysis" element={<Analysis />} />
            <Route path="management/user" element={<UserManagement />} />
            <Route path="management/role" element={<RoleManagement />} />
            <Route path="management/permission" element={<PermissionManagement />} />
            <Route path="*" element={<Navigate to="/admin/dashboard/workbench" replace />} />
          </Route>
        </Routes>
      </Suspense>
    </SlashAdminAuthGuard>
  );
}
