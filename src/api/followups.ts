import apiClient from './client';
import type { FollowUp } from '@/types';
import type { ApiResponse } from '@/types/common';

export const followupsApi = {
  getAll: () => apiClient.get<ApiResponse<FollowUp[]>>('/followups'),
  getById: (id: string) => apiClient.get<ApiResponse<FollowUp>>(`/followups/${id}`),
  update: (id: string, data: Partial<FollowUp>) =>
    apiClient.put<ApiResponse<FollowUp>>(`/followups/${id}`, data),
  create: (data: Omit<FollowUp, 'id' | 'createdAt' | 'updatedAt'>) =>
    apiClient.post<ApiResponse<FollowUp>>('/followups', data),
};
