import apiClient from './client';
import type { Notification } from '@/types';

export const notificationsApi = {
  getAll: () => apiClient.get<Notification[]>('/notifications'),
  markAsRead: (id: string) =>
    apiClient.patch<Notification>(`/notifications/${id}/read`),
  markAllAsRead: () => apiClient.patch('/notifications/read-all'),
};
