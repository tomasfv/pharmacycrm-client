import apiClient from './client';
import type { ApiResponse } from '@/types/common';
import type { Prescription } from '@/types';

export const prescriptionsApi = {
  getByPatientId: (patientId: string) =>
    apiClient.get<ApiResponse<Prescription[]>>('/prescriptions', { params: { patientId } }),
  create: (data: Record<string, unknown>) =>
    apiClient.post<ApiResponse<Prescription>>('/prescriptions', data),
  update: (id: string, data: Record<string, unknown>) =>
    apiClient.put<ApiResponse<Prescription>>(`/prescriptions/${id}`, data),
  delete: (id: string) =>
    apiClient.delete(`/prescriptions/${id}`),
};
