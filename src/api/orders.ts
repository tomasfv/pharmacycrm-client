import apiClient from './client';
import type { ApiResponse } from '@/types/common';
import type { Order } from '@/types';

export const ordersApi = {
  getByPatientId: (patientId?: string) =>
    apiClient.get<ApiResponse<Order[]>>('/orders', { params: { patientId } }),
  create: (data: Record<string, unknown>) =>
    apiClient.post<ApiResponse<Order>>('/orders', data),
  update: (id: string, data: Record<string, unknown>) =>
    apiClient.put<ApiResponse<Order>>(`/orders/${id}`, data),
  delete: (id: string) =>
    apiClient.delete(`/orders/${id}`),
};
