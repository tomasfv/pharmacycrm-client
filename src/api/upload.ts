import apiClient from './client';

export const uploadApi = {
  uploadImage: (file: File, folder?: string) => {
    const formData = new FormData();
    formData.append('image', file);
    const params = folder ? { folder } : {};
    return apiClient.post<{ success: boolean; data: { url: string } }>(
      '/upload/image',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' }, params },
    );
  },
};
