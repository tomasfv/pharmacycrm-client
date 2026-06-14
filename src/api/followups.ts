import apiClient from './client';
import type { FollowUp } from '@/types';

export const followupsApi = {
  getAll: () => apiClient.get<FollowUp[]>('/followups'),
  getById: (id: string) => apiClient.get<FollowUp>(`/followups/${id}`),
  update: (id: string, data: Partial<FollowUp>) =>
    apiClient.put<FollowUp>(`/followups/${id}`, data),
  create: (data: Omit<FollowUp, 'id' | 'createdAt' | 'updatedAt'>) =>
    apiClient.post<FollowUp>('/followups', data),
};
