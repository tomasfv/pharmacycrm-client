import apiClient from './client';
import type { ApiResponse } from '@/types/common';
import type { CatalogCategory } from '@/types';

export const catalogCategoriesApi = {
  getAll: () =>
    apiClient.get<ApiResponse<CatalogCategory[]>>('/catalog/categories'),
  create: (data: { name: string; image?: string }) =>
    apiClient.post<ApiResponse<CatalogCategory>>('/catalog/categories', data),
  update: (id: string, data: { name: string; image?: string }) =>
    apiClient.put<ApiResponse<CatalogCategory>>(`/catalog/categories/${id}`, data),
  delete: (id: string) =>
    apiClient.delete(`/catalog/categories/${id}`),
};
