import { useState, useEffect, useCallback } from 'react';
import { AuctionService } from '../services/auction.service';
import { AuctionItem } from '../types/auction';

export const useAdminAuctions = () => {
  const [auctions, setAuctions] = useState<AuctionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0); // Biến để trigger reload

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDeleteId, setItemToDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Hàm load dữ liệu
  const fetchAuctions = useCallback(async () => {
    try {
      setLoading(true);
      const data = await AuctionService.getAll({ page: page, limit: 10, sortOrder: 'desc' });
      if (data.success) {
        setAuctions(data.data);

        if (data.meta) {
            setTotalPages(data.meta.totalPages);
            setTotalItems(data.meta.total);
        }
      }
    } catch (error) {
      console.error("Lỗi tải danh sách:", error);
    } finally {
      setLoading(false);
    }
  }, [refreshKey, page]);

  // useEffect chỉ gọi hàm fetch
  useEffect(() => {
    fetchAuctions();
  }, [fetchAuctions]);

  // Hàm Wrapper cho các hành động CRUD
  const deleteAuction = async (id: string) => {
    try {
      await AuctionService.delete(id);
      setRefreshKey(prev => prev + 1); // Reload lại list sau khi xóa
      return true;
    } catch (error) {
      alert('Lỗi khi xóa');
      return false;
    }
  };

  const createAuction = async (data: any) => {
    try {
      await AuctionService.create(data);
      setRefreshKey(prev => prev + 1);
      return true; // Trả về true để component biết mà đóng modal
    } catch (error) {
      alert('Lỗi tạo mới');
      return false;
    }
  };

  const updateAuction = async (id: string, data: any) => {
    try {
      await AuctionService.update(id, data);
      setRefreshKey(prev => prev + 1);
      return true;
    } catch (error) {
      alert('Lỗi cập nhật');
      return false;
    }
  };

  const getAuctionDetail = async (id: string) => {
    try {
      
      const res = await AuctionService.getOne(id);
      if (res.success) {
        return res.data; 
      }
      return null;
    } catch (error) {
      console.error("Lỗi lấy chi tiết:", error);
      return null;
    }
  };

  const handleEditClick = async (item: any) => {
    // Gọi API lấy thông tin chi tiết dựa trên ID
    const fullDetail = await getAuctionDetail(item.id);
    console.log("Chi tiết phiên đấu giá:", fullDetail);
    if (fullDetail) {
      setEditingItem(fullDetail); 
      setIsModalOpen(true);      
    } else {
        console.error("Không thể lấy chi tiết phiên đấu giá.");
    }
  };

  const handleCreateClick = () => {
    setEditingItem(null); // Reset item sửa
    setIsModalOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setItemToDeleteId(id); // Lưu lại ID cần xoá
    setIsDeleteModalOpen(true); 
  };

  const handleConfirmDelete = async () => {
    if (!itemToDeleteId) return;

    setIsDeleting(true); 
    const success = await deleteAuction(itemToDeleteId);
    setIsDeleting(false);

    if (success) {
      setIsDeleteModalOpen(false);
      setItemToDeleteId(null);
    }
  };

  return {
    auctions,
    loading,
    pagination: { page, totalPages, totalItems, setPage },
    deleteAuction,
    createAuction,
    updateAuction,
    refreshData: () => setRefreshKey(prev => prev + 1),
    getAuctionDetail,
    handleEditClick,
    handleCreateClick,
    handleDeleteClick,
    handleConfirmDelete,
    isModalOpen,
    setIsModalOpen,
    editingItem,
    setEditingItem,
    isDeleteModalOpen,
    setIsDeleteModalOpen,
    itemToDeleteId,
    setItemToDeleteId,
    isDeleting,
    setIsDeleting,
  };
};