import apiClient from './client';

export const prescriptionsApi = {
  getByPatientId: (patientId: string) =>
    apiClient.get<any[]>('/prescriptions', { params: { patientId } }),
  create: (data: Record<string, unknown>) =>
    apiClient.post<any>('/prescriptions', data),
  update: (id: string, data: Record<string, unknown>) =>
    apiClient.put<any>(`/prescriptions/${id}`, data),
  delete: (id: string) =>
    apiClient.delete(`/prescriptions/${id}`),
};
