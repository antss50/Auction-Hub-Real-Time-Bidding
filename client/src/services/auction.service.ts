import apiClient from '@auction-hub/axios'; // Hoặc dùng fetch thường

export const AuctionService = {
  // Lấy danh sách (có phân trang/lọc)
  getAll: async (params?: any) => {
    const res = await apiClient.get('/auctions', { params });
    return res.data;
  },

  // Tạo mới
  create: async (data: any) => {
    const res = await apiClient.post('/auctions', data);
    return res.data;
  },

  getOne: async (id: string) => {
    const res = await apiClient.get(`/auctions/${id}`);
    return res.data; 
  },

  // Cập nhật
  update: async (id: string, data: any) => {
    const res = await apiClient.put(`/auctions/${id}`, data);
    return res.data;
  },

  // Xóa
  delete: async (id: string) => {
    const res = await apiClient.delete(`/auctions/${id}`);
    return res.data;
  }
};