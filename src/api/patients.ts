import apiClient from './client';

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export const patientsApi = {
  getAll: (params?: { search?: string; status?: string; page?: number; limit?: number }) =>
    apiClient.get<PaginatedResult<any>>('/patients', { params }),
  getById: (id: string) =>
    apiClient.get<any>(`/patients/${id}`),
  create: (data: Record<string, unknown>) =>
    apiClient.post<any>('/patients', data),
  update: (id: string, data: Record<string, unknown>) =>
    apiClient.put<any>(`/patients/${id}`, data),
  delete: (id: string) =>
    apiClient.delete(`/patients/${id}`),
};
