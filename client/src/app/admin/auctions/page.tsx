"use client";

import { useState } from 'react';
import { Menu, Search, Bell, Plus } from 'lucide-react';
import { useAdminAuctions } from '../../../hooks/useAdminAuction'; 
import { AuctionsTable } from '../../../components/admin/AuctionTable'; 
import { AuctionFormModal } from '../../../components/admin/AuctionModal'; 
import { ConfirmDeleteModal } from '../../../components/ConfirmDeleteModal';
import Sidebar from '../../../components/admin/Sidebar';

export default function AdminDashboard() {
  const { 
    auctions, 
    loading, 
    createAuction, 
    updateAuction, 
    pagination, 
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
  
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Hàm submit chung cho cả Tạo và Sửa
  const handleFormSubmit = async (formData: any) => {
    const success = editingItem ? await updateAuction(editingItem.id, formData) : await createAuction(formData);
    return success;
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-gray-800">
      <Sidebar sidebarOpen={sidebarOpen} />

      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* Header */}
        <header className="h-16 bg-white border-b flex items-center justify-between px-6 shadow-sm">
            <div className="flex items-center gap-4">
                <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-gray-100 rounded text-gray-600">
                    <Menu size={20} />
                </button>
                <h1 className="text-xl font-bold text-gray-800">Quản lý Đấu giá</h1>
            </div>
            <div className="flex items-center gap-4">
                {/* Search Bar */}
                <div className="relative hidden md:block">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input type="text" placeholder="Tìm kiếm..." className="pl-9 pr-4 py-2 border rounded-full text-sm focus:outline-none focus:ring-1 focus:ring-yellow-500 w-64" />
                </div>
                <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full"><Bell size={20} /></button>
                <div className="w-8 h-8 rounded-full bg-[#FFC107] flex items-center justify-center font-bold text-xs text-black border border-yellow-600">AD</div>
            </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-[#F9FAFB]">
            
            {/* Action Bar */}
            <div className="flex justify-end mb-4">
                <button onClick={handleCreateClick} className="flex items-center gap-2 bg-[#FFC107] hover:bg-yellow-500 text-black font-medium px-4 py-2 rounded shadow-sm transition-colors">
                    <Plus size={18} /> Tạo phiên đấu giá
                </button>
            </div>

            {/* --- TABLE & PAGINATION --- */}
            <AuctionsTable 
                auctions={auctions} 
                loading={loading}
                pagination={pagination} // Truyền props phân trang xuống
                onEdit={handleEditClick}
                onDelete={handleDeleteClick} 
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
        </main> 
      </div>
    </div>
  );    
}
