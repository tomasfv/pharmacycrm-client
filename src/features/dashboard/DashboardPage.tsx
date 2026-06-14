import { useAppSelector } from '@/store/hooks';
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
  const metrics = useAppSelector(selectDashboardMetrics);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Overview of your pharmacy CRM</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Patients To Contact Today"
          value={metrics.patientsToContactToday}
          icon={UserGroupIcon}
          variant="warning"
        />
        <KPICard
          title="Pending Prescriptions"
          value={metrics.pendingPrescriptions}
          icon={BeakerIcon}
          variant="default"
        />
        <KPICard
          title="Ready For Pickup"
          value={metrics.readyForPickup}
          icon={ShoppingBagIcon}
          variant="success"
        />
        <KPICard
          title="Overdue Patients"
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
