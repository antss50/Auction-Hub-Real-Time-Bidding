import apiClient from 'axios';

export const LocationService = {
  getAll: async () => {
    const res = await apiClient.get('/api/locations');
    return res.data && res.data.data ? res.data.data : []; 
  }
};