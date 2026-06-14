import { getLocalDateString } from '@/utils';
import type { FollowUpStatus } from '@/types';

interface ReportsData {
  activePatients: number;
  activePrescriptions: number;
  overduePatients: number;
  monthlyFollowUps: { month: string; count: number }[];
  statusDistribution: { status: FollowUpStatus; count: number }[];
}

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const selectReportsData = (state: any): ReportsData => {
  const patients = state.patients?.patients || [];
  const prescriptions = state.prescriptions?.prescriptions || [];
  const followUps = state.followups?.followUps || [];
  const today = getLocalDateString();

  const activePatients = patients.filter((p: any) => p.status === 'active').length;
  const activePrescriptions = prescriptions.length;
  const overduePatients = followUps.filter(
    (f: any) => f.scheduledDate < today && f.status !== 'delivered',
  ).length;

  const monthlyFollowUps = months.slice(0, 6).map((month, idx) => {
    const m = String(idx + 1).padStart(2, '0');
    const count = followUps.filter((f: any) => {
      const d = new Date(f.createdAt);
      return d.getMonth() === idx;
    }).length;
    return { month, count };
  });

  const statuses: FollowUpStatus[] = [
    'pending_contact', 'contacted', 'prescription_received', 'prepared', 'delivered',
  ];
  const statusDistribution = statuses.map((status) => ({
    status,
    count: followUps.filter((f: any) => f.status === status).length,
  }));

  return { activePatients, activePrescriptions, overduePatients, monthlyFollowUps, statusDistribution };
};

const reportsSlice: any = {
  name: 'reports',
  reducer: (state = {}) => state,
};

export default reportsSlice;
