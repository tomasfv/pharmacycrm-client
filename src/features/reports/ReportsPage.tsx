import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchPatients } from '@/features/patients/patientsSlice';
import { fetchOrders } from '@/features/orders/ordersSlice';
import { fetchFollowUps } from '@/features/followups/followupsSlice';
import { selectReportsData } from './reportsSlice';
import { Card, CardHeader, CardTitle } from '@/components/ui';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { statusLabels } from '@/utils';
import { UserGroupIcon, BeakerIcon, ExclamationTriangleIcon, CalendarDaysIcon } from '@heroicons/react/24/outline';

const COLORS = ['#EAB308', '#3B82F6', '#A855F7', '#F97316', '#22C55E'];

function StatCard({ title, value, icon: Icon, color }: { title: string; value: number; icon: React.ElementType; color: string }) {
  return (
    <Card>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-3xl font-bold mt-1">{value}</p>
        </div>
        <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </Card>
  );
}

export function ReportsPage() {
  const dispatch = useAppDispatch();
  const data = useAppSelector(selectReportsData);

  useEffect(() => {
    dispatch(fetchPatients());
    dispatch(fetchOrders());
    dispatch(fetchFollowUps());
  }, [dispatch]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <p className="text-sm text-gray-500 mt-1">Analytics and insights</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Active Patients" value={data.activePatients} icon={UserGroupIcon} color="bg-primary-600" />
        <StatCard title="Active Orders" value={data.activeOrders} icon={BeakerIcon} color="bg-blue-600" />
        <StatCard title="Overdue Patients" value={data.overduePatients} icon={ExclamationTriangleIcon} color="bg-red-600" />
        <StatCard title="Monthly Follow-Ups" value={data.monthlyFollowUps.reduce((a, b) => a + b.count, 0)} icon={CalendarDaysIcon} color="bg-purple-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Follow-Ups</CardTitle>
          </CardHeader>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.monthlyFollowUps}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#22c55e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Follow-Up Status Distribution</CardTitle>
          </CardHeader>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.statusDistribution}
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  dataKey="count"
                  nameKey="status"
                  label={({ status }) => statusLabels[status as keyof typeof statusLabels]}
                >
                  {data.statusDistribution.map((_, idx) => (
                    <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}
