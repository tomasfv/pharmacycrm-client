import apiClient from './client';
import type { ApiResponse } from '@/types/common';

export interface DashboardMetrics {
  patientsToContactToday: number;
  pendingPrescriptions: number;
  readyForPickup: number;
  overduePatients: number;
}

export const dashboardApi = {
  getMetrics: () =>
    apiClient.get<ApiResponse<DashboardMetrics>>('/dashboard/metrics'),
};
