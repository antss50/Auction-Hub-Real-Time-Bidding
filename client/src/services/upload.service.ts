import apiClient from 'axios'; 

export const UploadService = {
  uploadFiles: async (files: File[]) => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });

    try {
      const res = await apiClient.post('/api/files/uploads', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return res.data.data; 
    } catch (error) {
      console.error("Upload error:", error);
      throw error;
    }
  }
};