import { createSlice } from '@reduxjs/toolkit';
import { mockPatients, mockPrescriptions, mockFollowUps } from '@/mock';
import type { FollowUpStatus } from '@/types';

interface ReportsState {
  activePatients: number;
  activePrescriptions: number;
  overduePatients: number;
  monthlyFollowUps: { month: string; count: number }[];
  statusDistribution: { status: FollowUpStatus; count: number }[];
}

const getMonthlyData = () => {
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  ];
  return months.map((month, idx) => {
    const m = String(idx + 1).padStart(2, '0');
    const count = mockFollowUps.filter((f) => {
      const date = new Date(f.createdAt);
      return date.getMonth() === idx;
    }).length;
    return { month, count };
  });
};

const getStatusDistribution = () => {
  const statuses: FollowUpStatus[] = [
    'pending_contact',
    'contacted',
    'prescription_received',
    'prepared',
    'delivered',
  ];
  return statuses.map((status) => ({
    status,
    count: mockFollowUps.filter((f) => f.status === status).length,
  }));
};

const initialState: ReportsState = {
  activePatients: mockPatients.filter((p) => p.status === 'active').length,
  activePrescriptions: mockPrescriptions.length,
  overduePatients: mockFollowUps.filter(
    (f) => f.scheduledDate < new Date().toISOString().split('T')[0] && f.status !== 'delivered',
  ).length,
  monthlyFollowUps: getMonthlyData(),
  statusDistribution: getStatusDistribution(),
};

const reportsSlice = createSlice({
  name: 'reports',
  initialState,
  reducers: {},
});

export const selectReportsData = (state: { reports: ReportsState }) => state.reports;

export default reportsSlice.reducer;
