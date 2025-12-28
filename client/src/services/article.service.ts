import apiClient from '@auction-hub/axios';

export const NewsService = {
  // Lấy danh sách (có phân trang, search, sort)
  getAll: async (params?: any) => {
    // Lọc và chuẩn hóa params trước khi gửi
    const cleanParams: any = {
      page: params?.page || 1,
      limit: params?.limit || 10,
      sortBy: params?.sortBy || 'createdAt',
      sortOrder: params?.sortOrder || 'desc',
    };

    // Chỉ thêm 'title' nếu có giá trị
    if (params?.title) {
        cleanParams.title = params.title;
    }

    // Chỉ thêm 'type' nếu nó HỢP LỆ (Backend yêu cầu type cụ thể)
    const validTypes = ['news', 'auction_notice', 'auction_report', 'legal_document'];
    
    if (params?.type && validTypes.includes(params.type)) {
        cleanParams.type = params.type;
    } else {
        // Nếu type là 'all' hoặc rỗng, KHÔNG gửi tham số type lên server
        // (Server sẽ tự hiểu là lấy tất cả)
    }

    try {
      // 4. Gửi request với params sạch
      const res = await apiClient.get('/articles', { params: cleanParams });
      return res.data;
    } catch (error: any) {
      console.error("API Error:", error.response?.data || error.message);
      // Trả về data rỗng để không crash app
      return { success: false, data: [], meta: { total: 0, totalPages: 0 } };
    }
  },

  // Lấy chi tiết 1 bài
  getOne: async (id: string) => {
    const res = await apiClient.get(`/articles/${id}`);
    return res.data;
  },

  // Tạo mới
  create: async (data: any) => {
    const res = await apiClient.post('/articles', data);
    return res.data;
  },

  // Cập nhật
  update: async (id: string, data: any) => {
    const res = await apiClient.put(`/articles/${id}`, data);
    return res.data;
  },

  // Xóa
  delete: async (id: string) => {
    const res = await apiClient.delete(`/articles/${id}`);
    return res.data;
  }
};