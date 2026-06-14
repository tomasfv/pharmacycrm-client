import apiClient from './client';
import type { Patient } from '@/types';

export const patientsApi = {
  getAll: () => apiClient.get<Patient[]>('/patients'),
  getById: (id: string) => apiClient.get<Patient>(`/patients/${id}`),
  create: (data: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>) =>
    apiClient.post<Patient>('/patients', data),
  update: (id: string, data: Partial<Patient>) =>
    apiClient.put<Patient>(`/patients/${id}`, data),
  delete: (id: string) => apiClient.delete(`/patients/${id}`),
};
