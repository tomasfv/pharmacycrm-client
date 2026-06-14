import apiClient from './client';
import type { Contact } from '@/types';

export const contactsApi = {
  getAll: () => apiClient.get<Contact[]>('/contacts'),
  getById: (id: string) => apiClient.get<Contact>(`/contacts/${id}`),
  create: (data: Omit<Contact, 'id' | 'createdAt'>) =>
    apiClient.post<Contact>('/contacts', data),
  update: (id: string, data: Partial<Contact>) =>
    apiClient.put<Contact>(`/contacts/${id}`, data),
  delete: (id: string) => apiClient.delete(`/contacts/${id}`),
};
