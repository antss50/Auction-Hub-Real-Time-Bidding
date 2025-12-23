"use client";

import { Plus, Search } from 'lucide-react';
import { useAdminNews } from '../../../hooks/useAdminArticle'; 
import { NewsTable } from '../../../components/admin/NewsTable';
import { NewsFormModal } from '../../../components/admin/NewsFormModal';
import { ConfirmDeleteModal } from '../../../components/ConfirmDeleteModal';

export default function NewsManagementPage() {
  const { 
    newsList, 
    loading, 
    pagination, 
    setPagination,
    filters,
    setFilters, 
    createNews, 
    updateNews, 
    handleCreateClick,
    handleEditClick,
    handleDeleteClick,
    handleConfirmDelete,
    isModalOpen,
    setIsModalOpen,
    editingItem,
    isDeleteModalOpen,
    setIsDeleteModalOpen,
    isDeleting,
  } = useAdminNews();


  // Handler cho filter

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters(prev => ({ ...prev, type: e.target.value }));
  };

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleFormSubmit = async (formData: any) => {
    const success = editingItem? await updateNews(editingItem.id, formData) : await createNews(formData);
    return success;
  };

  return (
    <>
      {/* Title & Action */}
        <div className="flex justify-between items-center mb-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Quản lý Tin tức</h1>
            <p className="text-sm text-gray-500">Đăng tải và cập nhật các bản tin, thông báo</p>
          </div>
          <button onClick={handleCreateClick} className="flex gap-2 bg-[#FFC107] hover:bg-yellow-500 text-black px-4 py-2 rounded font-medium shadow-sm transition-transform active:scale-95">
            <Plus size={18} /> Viết bài mới
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6 flex gap-4">
          {/* Tìm kiếm */}
          <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Tìm kiếm tiêu đề..." 
                className="w-full pl-10 pr-4 py-2 border rounded-md focus:ring-yellow-500 focus:border-yellow-500 outline-none transition-all" 
                value={filters.title}
                onChange={(e) => setFilters(prev => ({ ...prev, title: e.target.value }))}
              />
          </div>

          {/* Lọc loại tin (Value phải khớp với validTypes trong service) */}
          <select 
            className="border rounded-md px-4 py-2 focus:ring-yellow-500 outline-none cursor-pointer bg-white"
            value={filters.type}
            onChange={handleTypeChange}
          >
              <option value="all">Tất cả thể loại</option>
              <option value="news">Tin tức</option>
              <option value="auction_notice">Thông báo đấu giá</option>
              <option value="auction_report">Điểm tin đấu giá</option>
              <option value="legal_document">Văn bản pháp luật</option>
          </select>
      </div>

        {/* --- TABLE --- */}
        <NewsTable 
            data={newsList} 
            loading={loading} 
            pagination={{
                page: pagination.page,
                totalPages: pagination.totalPages,
                totalItems: pagination.totalItems,
                setPage: handlePageChange // ✅ Truyền handler đúng
            }}
            onEdit={handleEditClick} 
            onDelete={handleDeleteClick} 
        />

        {/* --- MODAL --- */}
        <NewsFormModal 
            isOpen={isModalOpen} 
            onClose={() => setIsModalOpen(false)} 
            onSubmit={handleFormSubmit} 
            initialData={editingItem}
        />

        <ConfirmDeleteModal 
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                isDeleting={isDeleting}
                title="Xóa bài viết?"
                message="Bạn có chắc chắn muốn xóa bài viết này không? Dữ liệu sẽ không thể khôi phục."
            />
    </>
  );
}