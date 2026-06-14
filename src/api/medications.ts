import apiClient from './client';

export const medicationsApi = {
  getAll: (params?: { search?: string; page?: number; limit?: number }) =>
    apiClient.get<any>('/medications', { params }),
  create: (data: Record<string, unknown>) =>
    apiClient.post<any>('/medications', data),
  update: (id: string, data: Record<string, unknown>) =>
    apiClient.put<any>(`/medications/${id}`, data),
  delete: (id: string) =>
    apiClient.delete(`/medications/${id}`),
};
