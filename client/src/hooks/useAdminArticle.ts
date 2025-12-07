import { useState, useEffect, useCallback } from 'react';
import { NewsService } from '../services/article.service'; 
import { Article } from '../types/article'; 

export const useAdminNews = () => {
  const [newsList, setNewsList] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  // --- STATE PHÂN TRANG ---
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const [filters, setFilters] = useState({
    search: '',
    type: 'all || news || article_notice || auction_report || legal_document'
  });

  // --- 1. FETCH DATA ---
  const fetchNews = useCallback(async () => {
    try {
      setLoading(true);
      const params = await NewsService.getAll({ 
        page: page, 
        limit: 10, 
        sortOrder: 'desc',
        sortBy: 'createdAt' // Tin tức thường sort theo ngày tạo
      });

      if (filters.search) params.title = filters.search; // Backend lọc theo title
      // Nếu type khác 'all' thì thêm vào params
      if (filters.type !== 'all') params.type = filters.type;

      const res = await NewsService.getAll(params);

      if (res.success) {
        setNewsList(res.data);
        if (res.meta) {
            setTotalPages(res.meta.totalPages);
            setTotalItems(res.meta.total);
        }
      }
    } catch (error) {
      console.error("Lỗi tải tin tức:", error);
    } finally {
      setLoading(false);
    }
  }, [refreshKey, page, filters]);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  // --- 2. GET DETAIL (Cho Edit) ---
  const getNewsDetail = async (id: string) => {
    try {
      const res = await NewsService.getOne(id);
      if (res.success) return res.data;
      return null;
    } catch (error) {
      console.error("Lỗi lấy chi tiết:", error);
      return null;
    }
  };

  // --- 3. CRUD ACTIONS ---
  const deleteNews = async (id: string) => {
    try {
      await NewsService.delete(id);
      setRefreshKey(prev => prev + 1);
      return true;
    } catch (error) {
      console.error("Lỗi xóa:", error);
      return false;
    }
  };

  const createNews = async (data: any) => {
    try {
      await NewsService.create(data);
      setRefreshKey(prev => prev + 1);
      return true;
    } catch (error) {
      console.error("Lỗi tạo mới:", error);
      return false;
    }
  };

  const updateNews = async (id: string, data: any) => {
    try {
      await NewsService.update(id, data);
      setRefreshKey(prev => prev + 1);
      return true;
    } catch (error) {
      console.error("Lỗi cập nhật:", error);
      return false;
    }
  };

  // --- RETURN ---
  return {
    newsList,
    loading,
    pagination: { page, totalPages, totalItems, setPage },
    filters,
    setFilters,
    getNewsDetail,
    deleteNews,
    createNews,
    updateNews,
    refreshData: () => setRefreshKey(prev => prev + 1)
  };
};