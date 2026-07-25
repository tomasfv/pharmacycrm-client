import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchDashboardMetrics } from './dashboardSlice';
import { fetchFollowUps } from '@/features/followups/followupsSlice';
import { fetchOrders } from '@/features/orders/ordersSlice';
import { fetchContacts } from '@/features/contacts/contactsSlice';
import { KPICard } from './KPICard';
import { UpcomingFollowUps } from './UpcomingFollowUps';
import { RecentActivity } from './RecentActivity';
import { FollowUpStatusChart } from './FollowUpStatusChart';
import {
  UserGroupIcon,
  BeakerIcon,
  ShoppingBagIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { selectDashboardMetrics } from './dashboardSlice';

export function DashboardPage() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const metrics = useAppSelector(selectDashboardMetrics);
  const { loading } = useAppSelector((state) => state.dashboard);

  useEffect(() => {
    dispatch(fetchDashboardMetrics());
    dispatch(fetchFollowUps());
    dispatch(fetchOrders());
    dispatch(fetchContacts());
  }, [dispatch]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t('dashboard.title')}</h1>
        <p className="text-sm text-gray-500 mt-1">{t('dashboard.overview')}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title={t('dashboard.patientsToContact')}
          value={metrics.patientsToContactToday}
          icon={UserGroupIcon}
          variant="warning"
        />
        <KPICard
          title={t('dashboard.pendingOrders')}
          value={metrics.pendingOrders}
          icon={BeakerIcon}
          variant="default"
        />
        <KPICard
          title={t('dashboard.readyForPickup')}
          value={metrics.readyForPickup}
          icon={ShoppingBagIcon}
          variant="success"
        />
        <KPICard
          title={t('dashboard.overduePatients')}
          value={metrics.overduePatients}
          icon={ExclamationTriangleIcon}
          variant="danger"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <UpcomingFollowUps />
        <RecentActivity />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <FollowUpStatusChart />
      </div>
    </div>
  );
}
