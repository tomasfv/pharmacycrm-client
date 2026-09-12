import apiClient from './client';
import type { ApiResponse } from '@/types/common';
import type { CatalogOrder } from '@/types';

export const catalogOrdersApi = {
  getAll: () =>
    apiClient.get<ApiResponse<CatalogOrder[]>>('/catalog/orders'),
  getById: (id: string) =>
    apiClient.get<ApiResponse<CatalogOrder>>(`/catalog/orders/${id}`),
  create: (data: Record<string, unknown>) =>
    apiClient.post<ApiResponse<CatalogOrder>>('/catalog/orders', data),
};
