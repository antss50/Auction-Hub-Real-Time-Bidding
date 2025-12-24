import { useState, useEffect, useCallback } from 'react';
import { AuctionService } from '../services/auction.service';
import { AuctionItem } from '../types/auction';
import { useDebounce } from './useDebounce';
import { useToast } from '@auction-hub/shacdn-ui/hooks/use-toast';

export const useAdminAuctions = () => {
  const [auctions, setAuctions] = useState<AuctionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0); 
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalPages: 1,
    totalItems: 0,
  });

  const [filters, setFilters] = useState({
    name: '',       
    status: 'upcoming',     
    auctionType: 'all',  
  });

  // Debounce search để tránh gọi API liên tục khi gõ
  const debouncedSearchTerm = useDebounce(filters.name, 500);

  const [page, setPage] = useState(1);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const { toast } = useToast();
  const [editingItem, setEditingItem] = useState<any>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDeleteId, setItemToDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Hàm load dữ liệu
  const fetchAuctions = useCallback(async () => {
    try {
      setLoading(true);

      const params = {
        page: pagination.page,
        limit: pagination.limit,
        sortBy: 'createdAt',
        sortOrder: 'desc',
        // Merge filters vào params
        ...(debouncedSearchTerm && { name: debouncedSearchTerm }),
        ...(filters.status && filters.status !== 'all' && { status: filters.status }),
        ...(filters.auctionType && filters.auctionType !== 'all' && { auctionType: filters.auctionType }),
      };

      const data = await AuctionService.getAll(params);
      if (data && data.success) {
        setAuctions(data.data);

        if (data.meta) {
            setPagination(prev => ({
                ...prev,
                totalPages: data.meta.totalPages,
                totalItems: data.meta.totalItems
            }));
        }
      }
    } catch (error) {
      console.error("Lỗi tải danh sách:", error);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, debouncedSearchTerm, filters.status, filters.auctionType]);

  // Reset về trang 1 khi thay đổi filter
  useEffect(() => {
    setPagination(prev => ({ ...prev, page: 1 }));
  }, [debouncedSearchTerm, filters.status, filters.auctionType]);

  useEffect(() => {
    fetchAuctions();
  }, [fetchAuctions]);

  // Hàm Wrapper cho các hành động CRUD
  const deleteAuction = async (id: string) => {
    try {
      await AuctionService.delete(id);
      setRefreshKey(prev => prev + 1); // Reload lại list sau khi xóa
      toast({ title: 'Xóa phiên đấu giá', description: 'Phiên đấu giá đã được xóa.' });
      return true;
    } catch (error) {
      toast({ title: 'Không thể xóa phiên đấu giá', description: 'Phiên đấu giá chỉ có thể bị xoá khi chưa diễn ra', variant: 'destructive' });
      return false;
    }
  }; 

  const createAuction = async (data: AuctionItem) => {
    try {
      await AuctionService.create(data);
      setRefreshKey(prev => prev + 1);
      toast({ title: 'Tạo phiên đấu giá', description: 'Tạo phiên đấu giá thành công' });
      return true; 
    } catch (error) {
      toast({ title: 'Lỗi tạo mới', description: 'Không thể tạo phiên đấu giá. Vui lòng thử lại.', variant: 'destructive' });
      return false;
    }
  }; 

  const updateAuction = async (id: string, data: AuctionItem) => {
    try {
      await AuctionService.update(id, data);
      setRefreshKey(prev => prev + 1);
      toast({ title: 'Cập nhật phiên đấu giá', description: 'Cập nhật phiên đấu giá thành công' });
      return true;
    } catch (error) {
      toast({ title: 'Lỗi cập nhật', description: 'Không thể cập nhật phiên đấu giá. Vui lòng thử lại.', variant: 'destructive' });
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

  const handleEditClick = async (item: AuctionItem) => {
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
    pagination,
    setPagination, 
    filters,
    setFilters,
    refresh: fetchAuctions,
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
    setIsDeleting
  };
};