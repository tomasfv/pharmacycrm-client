import { getLocalDateString } from '@/utils';
import type { FollowUpStatus } from '@/types';

interface ReportsData {
  activePatients: number;
  activeOrders: number;
  overduePatients: number;
  monthlyPatients: { month: string; count: number }[];
  statusDistribution: { status: FollowUpStatus; count: number }[];
}

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const selectReportsData = (state: any): ReportsData => {
  const patients = state.patients?.patients || [];
  const orders = state.orders?.orders || [];
  const followUps = state.followups?.followUps || [];
  const today = getLocalDateString();

  const activePatients = patients.filter((p: any) => p.status === 'active').length;
  const cancelledOrderIds = new Set(
    followUps
      .filter((f: any) => f.status === 'cancelled' && f.orderId)
      .map((f: any) => f.orderId),
  );
  const activeOrders = orders.filter((o: any) => !cancelledOrderIds.has(o.id)).length;
  const overduePatients = followUps.filter(
    (f: any) => f.scheduledDate < today && f.status !== 'delivered' && f.status !== 'cancelled',
  ).length;

  const monthlyPatients = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() - (5 - i));
    const year = d.getFullYear();
    const monthIdx = d.getMonth();
    const month = months[monthIdx];
    const count = patients.filter((p: any) => {
      const pd = new Date(p.createdAt);
      return pd.getFullYear() === year && pd.getMonth() === monthIdx;
    }).length;
    return { month, count };
  });

  const statuses: FollowUpStatus[] = [
    'pending_contact', 'contacted', 'order_received', 'prepared', 'delivered', 'cancelled',
  ];
  const statusDistribution = statuses.map((status) => ({
    status,
    count: followUps.filter((f: any) => f.status === status).length,
  }));

  return { activePatients, activeOrders, overduePatients, monthlyPatients, statusDistribution };
};

const reportsSlice: any = {
  name: 'reports',
  reducer: (state = {}) => state,
};

export default reportsSlice;
