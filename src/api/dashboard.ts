import apiClient from './client';

export interface DashboardMetrics {
  patientsToContactToday: number;
  pendingPrescriptions: number;
  readyForPickup: number;
  overduePatients: number;
}

export const dashboardApi = {
  getMetrics: () =>
    apiClient.get<DashboardMetrics>('/dashboard/metrics'),
};
