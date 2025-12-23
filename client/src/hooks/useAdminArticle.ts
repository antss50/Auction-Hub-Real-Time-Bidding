import { useState, useEffect, useCallback } from 'react';
import { NewsService } from '../services/article.service'; 
import { Article } from '../types/article'; 
import { useDebounce } from './useDebounce';

export const useAdminNews = () => {
  const [newsList, setNewsList] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalPages: 1,
    totalItems: 0,
  });

  const [filters, setFilters] = useState({
    title: '',
    type: 'all'
  });

  const debouncedSearchTerm = useDebounce(filters.title, 500);
  // --- STATE PHÂN TRANG ---

  // --- MODAL & EDITING ITEM ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [editingItem, setEditingItem] = useState<any>(null);

  // --- XÓA ---
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);


  // --- FETCH DATA ---
  const fetchNews = useCallback(async () => {
    try {
      setLoading(true);
      const data = await NewsService.getAll({ 
        page: pagination.page, 
        limit: 10, 
        sortOrder: 'desc',
        sortBy: 'createdAt',
        ...(debouncedSearchTerm && { title: debouncedSearchTerm }),
        ...(filters.type && filters.type !== 'all' && { type: filters.type }),
      });

      if (data.success) {
        setNewsList(data.data);
        if (data.meta) {
            setPagination(prev => ({
                ...prev,
                totalPages: data.meta.totalPages,
                totalItems: data.meta.totalItems
            }));
        }
      }
    } catch (error) {
      console.error("Lỗi tải tin tức:", error);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, debouncedSearchTerm, filters.title, filters.type]);

  useEffect(() => {
    setPagination(prev => ({ ...prev, page: 1 }));
  }, [debouncedSearchTerm, filters.title, filters.type]);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  // --- GET DETAIL (Cho Edit) ---
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

  // --- CRUD ACTIONS ---
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

  const createNews = async (data: Article) => {
    try {
      await NewsService.create(data);
      setRefreshKey(prev => prev + 1);
      return true;
    } catch (error) {
      console.error("Lỗi tạo mới:", error);
      return false;
    }
  };

  const updateNews = async (id: string, data: Article) => {
    try {
      await NewsService.update(id, data);
      setRefreshKey(prev => prev + 1);
      return true;
    } catch (error) {
      console.error("Lỗi cập nhật:", error);
      return false;
    }
  };

  const handleCreateClick = () => { 
    setEditingItem(null); setIsModalOpen(true); 
  };

  const handleEditClick = (item: Article) => { 
    setEditingItem(item); setIsModalOpen(true); 
  };

  const handleDeleteClick = (id: string) => {
    setDeleteId(id);
    setIsDeleteModalOpen(true);
  };

  // Xác nhận xóa
  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    const success = await deleteNews(deleteId);
    setIsDeleting(false);
    if (success) {
        setIsDeleteModalOpen(false);
        setDeleteId(null);
    }
  };


  // --- RETURN ---
  return {
    newsList,
    loading,
    pagination,
    setPagination,
    filters,
    setFilters,
    isModalOpen,
    setIsModalOpen,
    sidebarOpen,
    setSidebarOpen,
    editingItem,
    setEditingItem,
    isDeleteModalOpen,
    setIsDeleteModalOpen,
    deleteId,
    setDeleteId,
    isDeleting,
    setIsDeleting,
    getNewsDetail,
    deleteNews,
    createNews,
    updateNews,
    handleCreateClick,
    handleEditClick,
    handleDeleteClick,
    handleConfirmDelete,
    refreshData: () => setRefreshKey(prev => prev + 1)
  };
};