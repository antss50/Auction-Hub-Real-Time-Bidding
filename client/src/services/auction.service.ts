import apiClient from 'axios'; // Hoặc dùng fetch thường

export const AuctionService = {
  // Lấy danh sách (có phân trang/lọc)
  getAll: async (params?: any) => {
    const res = await apiClient.get('/api/auctions', { params });
    return res.data;
  },

  // Tạo mới
  create: async (data: any) => {
    const res = await apiClient.post('/api/auctions', data);
    return res.data;
  },

  getOne: async (id: string) => {
    const res = await apiClient.get(`/api/auctions/${id}`);
    return res.data; 
  },

  // Cập nhật
  update: async (id: string, data: any) => {
    const res = await apiClient.put(`/api/auctions/${id}`, data);
    return res.data;
  },

  // Xóa
  delete: async (id: string) => {
    const res = await apiClient.delete(`/api/auctions/${id}`);
    return res.data;
  }
};