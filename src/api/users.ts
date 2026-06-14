import apiClient from './client';
import type { User } from '@/types';
import type { ApiResponse } from '@/types/common';

export const usersApi = {
  getAll: () => apiClient.get<ApiResponse<User[]>>('/users'),
  getById: (id: string) => apiClient.get<ApiResponse<User>>(`/users/${id}`),
  create: (data: { name: string; email: string; password: string; role?: string }) =>
    apiClient.post<ApiResponse<User>>('/users', data),
  update: (id: string, data: Partial<User> & { password?: string }) =>
    apiClient.put<ApiResponse<User>>(`/users/${id}`, data),
  delete: (id: string) => apiClient.delete(`/users/${id}`),
};
