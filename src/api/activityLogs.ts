import apiClient from './client';
import type { ActivityLog } from '@/types/activityLog';
import type { ApiResponse } from '@/types/common';

export const activityLogsApi = {
  getByPatient: (patientId: string) =>
    apiClient.get<ApiResponse<ActivityLog[]>>(`/activity-logs/${patientId}`),
  create: (data: Omit<ActivityLog, 'id' | 'createdAt'>) =>
    apiClient.post<ApiResponse<ActivityLog>>('/activity-logs', data),
};
