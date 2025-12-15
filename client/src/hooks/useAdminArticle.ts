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

  // --- MODAL & EDITING ITEM ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [editingItem, setEditingItem] = useState<any>(null);

  // --- XÓA ---
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [filters, setFilters] = useState({
    search: '',
    type: 'all || news || article_notice || auction_report || legal_document'
  });

  // --- FETCH DATA ---
  const fetchNews = useCallback(async () => {
    try {
      setLoading(true);
      const data = await NewsService.getAll({ 
        page: page, 
        limit: 10, 
        sortOrder: 'desc',
        sortBy: 'createdAt' 
      });

      // if (filters.search) params.title = filters.search; 
      // if (filters.type !== 'all') params.type = filters.type;

      // const res = await NewsService.getAll(params);

      if (data.success) {
        setNewsList(data.data);
        if (data.meta) {
            setTotalPages(data.meta.totalPages);
            setTotalItems(data.meta.total);
        }
      }
    } catch (error) {
      console.error("Lỗi tải tin tức:", error);
    } finally {
      setLoading(false);
    }
  }, [refreshKey, page]);

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

  // Xử lý tìm kiếm (Debounce đơn giản)
  // const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   // Reset về trang 1 khi tìm kiếm
  //   pagination.setPage(1); 
  //   setFilters((prev: any) => ({ ...prev, search: e.target.value }));
  // };

  // const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
  //   pagination.setPage(1);
  //   setFilters((prev: any) => ({ ...prev, type: e.target.value }));
  // };

  // --- RETURN ---
  return {
    newsList,
    loading,
    pagination: { page, totalPages, totalItems, setPage },
    filters,
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
    setFilters,
    getNewsDetail,
    deleteNews,
    createNews,
    updateNews,
    handleCreateClick,
    handleEditClick,
    handleDeleteClick,
    // handleSearchChange,
    // handleTypeChange,
    handleConfirmDelete,
    refreshData: () => setRefreshKey(prev => prev + 1)
  };
};