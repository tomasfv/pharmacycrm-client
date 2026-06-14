import apiClient from './client';
import type { ApiResponse } from '@/types/common';

export const patientsApi = {
  getAll: (params?: { search?: string; status?: string; page?: number; limit?: number }) =>
    apiClient.get<ApiResponse<any>>('/patients', { params }),
  getById: (id: string) =>
    apiClient.get<ApiResponse<any>>(`/patients/${id}`),
  create: (data: Record<string, unknown>) =>
    apiClient.post<ApiResponse<any>>('/patients', data),
  update: (id: string, data: Record<string, unknown>) =>
    apiClient.put<ApiResponse<any>>(`/patients/${id}`, data),
  delete: (id: string) =>
    apiClient.delete(`/patients/${id}`),
};
