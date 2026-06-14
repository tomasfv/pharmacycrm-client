import apiClient from './client';
import type { Contact } from '@/types';
import type { ApiResponse } from '@/types/common';

export const contactsApi = {
  getAll: () => apiClient.get<ApiResponse<Contact[]>>('/contacts'),
  getById: (id: string) => apiClient.get<ApiResponse<Contact>>(`/contacts/${id}`),
  create: (data: Omit<Contact, 'id' | 'createdAt'>) =>
    apiClient.post<ApiResponse<Contact>>('/contacts', data),
  update: (id: string, data: Partial<Contact>) =>
    apiClient.put<ApiResponse<Contact>>(`/contacts/${id}`, data),
  delete: (id: string) => apiClient.delete(`/contacts/${id}`),
};
