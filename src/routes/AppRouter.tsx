import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { LoginPage } from '@/features/auth/LoginPage';
import { DashboardPage } from '@/features/dashboard/DashboardPage';
import { PatientsListPage } from '@/features/patients/PatientsListPage';
import { PatientDetailPage } from '@/features/patients/PatientDetailPage';
import { FollowUpsPage } from '@/features/followups/FollowUpsPage';
import { ContactsPage } from '@/features/contacts/ContactsPage';
import { ReportsPage } from '@/features/reports/ReportsPage';
import { NotificationsPage } from '@/features/notifications/NotificationsPage';
import { SettingsPage } from '@/features/settings/SettingsPage';
import { MedicationsPage } from '@/features/medications/MedicationsPage';
import { UsersPage } from '@/features/users/UsersPage';
import { CatalogCategoriesPage } from '@/features/catalog/categories/CatalogCategoriesPage';
import { CatalogProductsPage } from '@/features/catalog/products/CatalogProductsPage';
import { CatalogOrdersPage } from '@/features/catalog/orders/CatalogOrdersPage';

export function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<AppLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="patients" element={<PatientsListPage />} />
        <Route path="patients/:id" element={<PatientDetailPage />} />
        <Route path="followups" element={<FollowUpsPage />} />
        <Route path="contacts" element={<ContactsPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="medications" element={<MedicationsPage />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="catalog/categories" element={<CatalogCategoriesPage />} />
        <Route path="catalog/products" element={<CatalogProductsPage />} />
        <Route path="catalog/orders" element={<CatalogOrdersPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
