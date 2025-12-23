"use client";

import { useState } from 'react';
import { Menu, Search, Bell, Plus } from 'lucide-react';
import { useAdminAuctions } from '../../../hooks/useAdminAuction'; 
import { AuctionsTable } from '../../../components/admin/AuctionTable'; 
import { AuctionFormModal } from '../../../components/admin/AuctionModal'; 
import { ConfirmDeleteModal } from '../../../components/ConfirmDeleteModal';
import Sidebar from '../../../components/admin/Sidebar';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const { 
    auctions, 
    loading, 
    pagination, 
    setPagination, 
    filters, 
    setFilters,
    createAuction, 
    updateAuction, 
    handleEditClick,
    handleCreateClick,
    handleDeleteClick,
    handleConfirmDelete,
    isModalOpen,
    setIsModalOpen,
    editingItem,
    isDeleteModalOpen,
    setIsDeleteModalOpen,
    isDeleting,
  } = useAdminAuctions();
  

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters(prev => ({ ...prev, status: e.target.value }));
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters(prev => ({ ...prev, auctionType: e.target.value }));
  };

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const router = useRouter();
  const handleViewDetail = (item: any) => {
    router.push(`/admin/auctions/${item.id}`);
};

  // Hàm submit chung cho cả Tạo và Sửa
  const handleFormSubmit = async (formData: any) => {
    const success = editingItem ? await updateAuction(editingItem.id, formData) : await createAuction(formData);
    return success;
  };

  return (
    <>
      {/* Title & Action */}
        <div className="flex justify-between items-center mb-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Quản lý Tài sản</h1>
          </div>
          <button onClick={handleCreateClick} className="flex gap-2 bg-[#FFC107] hover:bg-yellow-500 text-black px-4 py-2 rounded font-medium shadow-sm transition-transform active:scale-95">
            <Plus size={18} /> Tạo phiên đấu giá mới
          </button>
        </div>

        {/* --- FILTERS --- */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-col md:flex-row gap-4">
            
            {/* Search Input */}
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                    type="text" 
                    placeholder="Tìm kiếm theo tên tài sản..." 
                    className="w-full pl-10 pr-4 py-2 border rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none transition-all"
                    value={filters.name}
                    onChange={(e) => setFilters(prev => ({ ...prev, name: e.target.value }))}
                />
            </div>

            {/* Filter Status */}
            <div className="w-full md:w-48">
                <select 
                    className="w-full border rounded-md px-4 py-2 focus:ring-2 focus:ring-yellow-500 outline-none bg-white cursor-pointer"
                    value={filters.status}
                    onChange={handleStatusChange}
                >
                    
                    <option value="completed">Đã diễn ra</option>
                    <option value="now">Đang diễn ra</option>
                    <option value="upcoming">Sắp diễn ra</option>
                </select>
            </div>

            {/* Filter Asset Type */}
            <div className="w-full md:w-56">
                <select 
                    className="w-full border rounded-md px-4 py-2 focus:ring-2 focus:ring-yellow-500 outline-none bg-white cursor-pointer"
                    value={filters.auctionType}
                    onChange={handleTypeChange}
                >
                    <option value="all">Tất cả loại tài sản</option>
                    <option value="secured_asset">Tài sản bảo đảm</option>
                    <option value="state_asset">Tài sản công</option>
                    <option value="enforcement_asset">Thi hành án</option> 
                    <option value="land_use_rights">Quyền sử dụng đất</option>
                    <option value="administrative_violation_asset">Vi phạm hành chính</option>
                    <option value="other_asset">Tài sản khác</option>
                </select>
            </div>
        </div>

            {/* --- TABLE & PAGINATION --- */}
            <AuctionsTable 
                auctions={auctions} 
                loading={loading}
                pagination={{
                  ...pagination,
                  setPage: handlePageChange // Map function setPage
                }} 
                onEdit={handleEditClick}
                onDelete={handleDeleteClick} 
                onViewDetail={handleViewDetail}
            />
            
            {/* Modal Form */}
            <AuctionFormModal 
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
                title="Xóa phiên đấu giá?"
                message="Bạn có chắc chắn muốn xóa phiên đấu giá này không? Dữ liệu sẽ không thể khôi phục."
            />
       
    
    </>
  );    
}
