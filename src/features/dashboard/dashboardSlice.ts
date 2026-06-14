import { createSlice } from '@reduxjs/toolkit';
import { mockFollowUps } from '@/mock';
import { getLocalDateString } from '@/utils';

interface DashboardState {
  metrics: {
    patientsToContactToday: number;
    pendingPrescriptions: number;
    readyForPickup: number;
    overduePatients: number;
  };
  loading: boolean;
}

const calculateMetrics = () => {
  const today = getLocalDateString();
  const patientsToContactToday = mockFollowUps.filter(
    (f) => f.scheduledDate === today && f.status === 'pending_contact',
  ).length;
  const pendingPrescriptions = mockFollowUps.filter(
    (f) => f.status === 'prescription_received',
  ).length;
  const readyForPickup = mockFollowUps.filter(
    (f) => f.status === 'prepared',
  ).length;
  const overduePatients = mockFollowUps.filter(
    (f) => f.scheduledDate < today && f.status !== 'delivered',
  ).length;

  return {
    patientsToContactToday,
    pendingPrescriptions,
    readyForPickup,
    overduePatients,
  };
};

const initialState: DashboardState = {
  metrics: calculateMetrics(),
  loading: false,
};

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {},
});

export const selectDashboardMetrics = (state: { dashboard: DashboardState }) =>
  state.dashboard.metrics;

export default dashboardSlice.reducer;
