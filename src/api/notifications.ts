import apiClient from './client';
import type { Notification } from '@/types';
import type { ApiResponse } from '@/types/common';

export const notificationsApi = {
  getAll: () => apiClient.get<ApiResponse<Notification[]>>('/notifications'),
  markAsRead: (id: string) =>
    apiClient.patch<ApiResponse<Notification>>(`/notifications/${id}/read`),
  markAllAsRead: () => apiClient.patch('/notifications/read-all'),
};
