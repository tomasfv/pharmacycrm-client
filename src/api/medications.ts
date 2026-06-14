import apiClient from './client';
import type { ApiResponse } from '@/types/common';
import type { Medication } from '@/types';

export const medicationsApi = {
  getAll: (params?: { search?: string; page?: number; limit?: number }) =>
    apiClient.get<ApiResponse<Medication[]>>('/medications', { params }),
  create: (data: Record<string, unknown>) =>
    apiClient.post<ApiResponse<Medication>>('/medications', data),
  update: (id: string, data: Record<string, unknown>) =>
    apiClient.put<ApiResponse<Medication>>(`/medications/${id}`, data),
  delete: (id: string) =>
    apiClient.delete(`/medications/${id}`),
};
