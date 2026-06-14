import apiClient from './client';
import type { Prescription } from '@/types';

export const prescriptionsApi = {
  getAll: () => apiClient.get<Prescription[]>('/prescriptions'),
  getById: (id: string) => apiClient.get<Prescription>(`/prescriptions/${id}`),
  getByPatientId: (patientId: string) =>
    apiClient.get<Prescription[]>(`/prescriptions?patientId=${patientId}`),
  create: (data: Omit<Prescription, 'id' | 'createdAt' | 'updatedAt'>) =>
    apiClient.post<Prescription>('/prescriptions', data),
  update: (id: string, data: Partial<Prescription>) =>
    apiClient.put<Prescription>(`/prescriptions/${id}`, data),
  delete: (id: string) => apiClient.delete(`/prescriptions/${id}`),
};
