import apiClient from './client';
import type { ApiResponse } from '@/types/common';
import type { CatalogProduct, CatalogBatchResult } from '@/types';

export const catalogProductsApi = {
  getAll: (params?: { categoryId?: string }) =>
    apiClient.get<ApiResponse<CatalogProduct[]>>('/catalog/products', { params }),
  getById: (id: string) =>
    apiClient.get<ApiResponse<CatalogProduct>>(`/catalog/products/${id}`),
  create: (data: Record<string, unknown>) =>
    apiClient.post<ApiResponse<CatalogProduct>>('/catalog/products', data),
  update: (id: string, data: Record<string, unknown>) =>
    apiClient.put<ApiResponse<CatalogProduct>>(`/catalog/products/${id}`, data),
  delete: (id: string) =>
    apiClient.delete(`/catalog/products/${id}`),
  batchUpsert: (items: Record<string, unknown>[]) =>
    apiClient.post<ApiResponse<CatalogBatchResult>>('/catalog/products/batch', { items }),
};
